const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { protect, admin } = require('../middleware/auth');
const generateInvoice = require('../utils/invoiceGenerator');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    // Verify stock and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      // Calculate price after discount
      const discountedPrice = product.price * (1 - (product.discount || 0) / 100);
      totalAmount += discountedPrice * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: discountedPrice
      });

      // Decrement stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create Order
    const order = await Order.create({
      farmerId: req.user._id,
      items: orderItems,
      totalAmount: Math.round(totalAmount),
      shippingAddress
    });

    // Create associated Payment record
    const payment = await Payment.create({
      orderId: order._id,
      farmerId: req.user._id,
      totalAmount: order.totalAmount,
      paidAmount: 0,
      pendingAmount: order.totalAmount,
      status: 'Pending',
      paymentMethod: paymentMethod || 'COD'
    });

    // Populate order items product for invoice generation
    const populatedOrder = await Order.findById(order._id).populate('items.product');

    // Generate Invoice PDF
    let invoiceFileName = '';
    try {
      invoiceFileName = await generateInvoice(populatedOrder, req.user, payment);
      order.invoiceFileName = invoiceFileName;
      await order.save();
    } catch (invoiceErr) {
      console.error('Invoice PDF generation failed:', invoiceErr.message);
    }

    // Create success notification for user
    await Notification.create({
      userId: req.user._id,
      title: 'Order Placed Successfully',
      message: `Thank you for shopping with NSH Agro Traders! Your Order ID is ${order._id.toString().substring(0, 8)}. A PDF invoice has been generated.`,
      type: 'Order Update'
    });

    // Setup Razorpay if requested
    let razorpayOrder = null;
    if (paymentMethod === 'Razorpay') {
      const Razorpay = require('razorpay');
      const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey12345';
      const key_secret = process.env.RAZORPAY_KEY_SECRET || 'mocksecret12345';
      const razorpayInstance = new Razorpay({
        key_id,
        key_secret
      });

      const options = {
        amount: order.totalAmount * 100, // paise
        currency: "INR",
        receipt: order._id.toString()
      };

      try {
        razorpayOrder = await razorpayInstance.orders.create(options);
      } catch (err) {
        console.error('Razorpay order creation failed, generating local fallback mock order:', err.message);
        if (key_id.startsWith('rzp_test_mock') || err.statusCode === 401) {
          razorpayOrder = {
            id: `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            entity: "order",
            amount: options.amount,
            amount_paid: 0,
            amount_due: options.amount,
            currency: options.currency,
            receipt: options.receipt,
            status: "created",
            attempts: 0,
            notes: [],
            created_at: Math.floor(Date.now() / 1000)
          };
        }
      }
    }

    res.status(201).json({
      success: true,
      order,
      payment,
      razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey12345'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get logged in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
router.get('/my-orders', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ farmerId: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
});

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('farmerId', 'name email mobile')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Farmers can only view their own orders. Admin can view any order.
    if (order.farmerId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    const payment = await Payment.findOne({ orderId: order._id });

    res.json({ success: true, order, payment });
  } catch (error) {
    next(error);
  }
});

// @desc    Download generated Invoice PDF
// @route   GET /api/orders/:id/invoice
// @access  Private
router.get('/:id/invoice', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to access this invoice' });
    }

    if (!order.invoiceFileName) {
      return res.status(404).json({ success: false, message: 'Invoice file not found for this order' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', 'invoices', order.invoiceFileName);

    if (fs.existsSync(filePath)) {
      res.download(filePath, order.invoiceFileName);
    } else {
      res.status(404).json({ success: false, message: 'Invoice PDF file does not exist on disk' });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('farmerId', 'name email mobile')
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const { status } = req.body;
    order.status = status;
    await order.save();

    // Create status update notification for farmer
    await Notification.create({
      userId: order.farmerId,
      title: 'Order Status Updated',
      message: `Your Order ID ${order._id.toString().substring(0, 8)} status has been updated to ${status}.`,
      type: 'Order Update'
    });

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
