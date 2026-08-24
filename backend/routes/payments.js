const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const generateInvoice = require('../utils/invoiceGenerator');

// @desc    Get logged in user's payments
// @route   GET /api/payments/my-payments
// @access  Private
router.get('/my-payments', protect, async (req, res, next) => {
  try {
    const payments = await Payment.find({ farmerId: req.user._id })
      .populate('orderId')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    next(error);
  }
});

// @desc    Record a mock payment transaction
// @route   POST /api/payments/pay/:id
// @access  Private
router.post('/pay/:id', protect, async (req, res, next) => {
  try {
    const { amount, paymentMethod } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to make this payment' });
    }

    if (payment.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'This payment is already fully paid' });
    }

    const payAmount = Number(amount);
    if (payAmount <= 0 || payAmount > payment.pendingAmount) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment amount. Must be between 1 and ${payment.pendingAmount}`
      });
    }

    // Add transaction record
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    payment.transactions.push({
      transactionId,
      amount: payAmount,
      status: 'Success',
      date: new Date()
    });

    payment.paidAmount += payAmount;
    payment.paymentMethod = paymentMethod || payment.paymentMethod;

    // Save triggers pre-save hooks to recalculate status and pendingAmount
    await payment.save();

    // Regenerate invoice with updated payments
    const order = await Order.findById(payment.orderId).populate('items.product');
    const user = await User.findById(payment.farmerId);
    if (order && user) {
      await generateInvoice(order, user, payment);
    }

    res.json({ success: true, payment, transactionId });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all payment records (Admin)
// @route   GET /api/payments
// @access  Private/Admin
router.get('/', protect, admin, async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('farmerId', 'name email mobile')
      .populate('orderId')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    next(error);
  }
});

// @desc    Admin manually adjust/override payment
// @route   PUT /api/payments/:id/adjust
// @access  Private/Admin
router.put('/:id/adjust', protect, admin, async (req, res, next) => {
  try {
    const { paidAmount, paymentMethod } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (paidAmount !== undefined) {
      payment.paidAmount = Number(paidAmount);
    }
    if (paymentMethod !== undefined) {
      payment.paymentMethod = paymentMethod;
    }

    // Pre-save triggers recalculations
    await payment.save();

    // Regenerate invoice
    const order = await Order.findById(payment.orderId).populate('items.product');
    const user = await User.findById(payment.farmerId);
    if (order && user) {
      await generateInvoice(order, user, payment);
    }

    res.json({ success: true, payment });
  } catch (error) {
    next(error);
  }
});

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify-razorpay
// @access  Private
router.post('/verify-razorpay', protect, async (req, res, next) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId, paymentId } = req.body;
    const crypto = require('crypto');

    // 1. Verify signature
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'mocksecret12345';
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // 2. Find payment record
    let payment = await Payment.findOne({ orderId });
    if (!payment && paymentId) {
      payment = await Payment.findById(paymentId);
    }

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // Check if transaction already processed
    const isAlreadyProcessed = payment.transactions.some(t => t.transactionId === razorpay_payment_id);
    if (isAlreadyProcessed) {
      return res.json({ success: true, payment, message: 'Payment already processed' });
    }

    // 3. Record transaction and update payment
    payment.transactions.push({
      transactionId: razorpay_payment_id,
      amount: payment.pendingAmount,
      status: 'Success',
      date: new Date()
    });

    payment.paidAmount = payment.totalAmount;
    payment.paymentMethod = 'Razorpay';

    await payment.save();

    // 4. Regenerate invoice
    const order = await Order.findById(payment.orderId).populate('items.product');
    const user = await User.findById(payment.farmerId);
    if (order && user) {
      try {
        await generateInvoice(order, user, payment);
      } catch (invErr) {
        console.error('Invoice regeneration failed:', invErr.message);
      }
    }

    res.json({ success: true, payment, transactionId: razorpay_payment_id });
  } catch (error) {
    next(error);
  }
});

// @desc    Create Razorpay Order for existing pending payment
// @route   POST /api/payments/razorpay-order/:id
// @access  Private
router.post('/razorpay-order/:id', protect, async (req, res, next) => {
  try {
    const { amount } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const payAmount = Number(amount);
    if (payAmount <= 0 || payAmount > payment.pendingAmount) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment amount. Must be between 1 and ${payment.pendingAmount}`
      });
    }

    const Razorpay = require('razorpay');
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey12345';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'mocksecret12345';
    const razorpayInstance = new Razorpay({
      key_id,
      key_secret
    });

    const options = {
      amount: payAmount * 100, // paise
      currency: "INR",
      receipt: payment.orderId.toString()
    };

    let razorpayOrder = null;
    try {
      razorpayOrder = await razorpayInstance.orders.create(options);
    } catch (err) {
      console.error('Razorpay balance order creation failed, generating local fallback mock order:', err.message);
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

    res.json({
      success: true,
      razorpayOrder,
      amount: payAmount,
      keyId: key_id
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
