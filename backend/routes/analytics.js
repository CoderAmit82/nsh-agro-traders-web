const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

// @desc    Get admin dashboard metrics & graphs data
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
router.get('/dashboard', protect, admin, async (req, res, next) => {
  try {
    // 1. Total Farmers count
    const totalFarmers = await User.countDocuments({ role: 'farmer' });

    // 2. Total Orders count
    const totalOrders = await Order.countDocuments();

    // 3. Completed vs Pending Payments aggregates
    const payments = await Payment.find();
    let totalCompletedPaymentsVal = 0;
    let totalPendingPaymentsVal = 0;

    payments.forEach(pay => {
      totalCompletedPaymentsVal += pay.paidAmount || 0;
      totalPendingPaymentsVal += pay.pendingAmount || 0;
    });

    // 4. Total Sales Revenue (all orders not cancelled)
    const validOrders = await Order.find({ status: { $ne: 'Cancelled' } });
    const totalRevenueVal = validOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // 5. Stock Status (Low stock warning - products with stock < 5)
    const lowStockAlerts = await Product.find({ stock: { $lt: 5 } }).select('name stock category price');

    // 6. Category breakdown calculations
    const allProducts = await Product.find().select('category price');
    const categoryTotals = {};
    validOrders.forEach(order => {
      order.items.forEach(item => {
        // Find category from populated product if available
        const product = allProducts.find(p => p._id.toString() === item.product.toString());
        const category = product ? product.category : 'General';
        const subtotal = item.quantity * item.priceAtPurchase;
        categoryTotals[category] = (categoryTotals[category] || 0) + subtotal;
      });
    });

    const categoryBreakdown = Object.keys(categoryTotals).map(cat => ({
      name: cat,
      value: Math.round(categoryTotals[cat])
    }));

    // 7. Recent Orders list
    const recentOrders = await Order.find()
      .populate('farmerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      stats: {
        totalFarmers,
        totalOrders,
        totalRevenue: Math.round(totalRevenueVal),
        completedPayments: Math.round(totalCompletedPaymentsVal),
        pendingPayments: Math.round(totalPendingPaymentsVal),
        lowStockCount: lowStockAlerts.length
      },
      lowStockAlerts,
      categoryBreakdown,
      recentOrders
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
