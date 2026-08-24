const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['Payment Reminder', 'Order Update'],
      default: 'Order Update'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
