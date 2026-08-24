const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Success', 'Failed'], default: 'Success' },
  date: { type: Date, default: Date.now }
});

const PaymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    pendingAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Partially Paid', 'Paid'],
      default: 'Pending'
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Mock UPI', 'Bank Transfer', 'Razorpay'],
      default: 'COD'
    },
    transactions: [TransactionSchema]
  },
  { timestamps: true }
);

// Pre-save middleware to verify pending and paid amount alignment
PaymentSchema.pre('save', function (next) {
  this.pendingAmount = this.totalAmount - this.paidAmount;
  if (this.pendingAmount <= 0) {
    this.status = 'Paid';
    this.pendingAmount = 0;
  } else if (this.paidAmount > 0) {
    this.status = 'Partially Paid';
  } else {
    this.status = 'Pending';
  }
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
