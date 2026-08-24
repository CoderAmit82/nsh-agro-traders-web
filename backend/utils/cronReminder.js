const cron = require('node-cron');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Function that runs the payment reminder logic
const runPaymentReminders = async () => {
  console.log('[Cron Job] Executing payment reminder checks...');
  try {
    const unpaidPayments = await Payment.find({
      status: { $in: ['Pending', 'Partially Paid'] }
    });

    console.log(`[Cron Job] Found ${unpaidPayments.length} unpaid/partially paid balances.`);

    for (const payment of unpaidPayments) {
      const user = await User.findById(payment.farmerId);
      if (!user) continue;

      const reminderTitle = 'Payment Reminder - NSH Agro Traders';
      const reminderMsg = `Dear ${user.name}, this is a friendly reminder that you have a pending payment of Rs. ${payment.pendingAmount.toFixed(2)} for your Order ID: ${payment.orderId.toString().substring(0, 8)}. Please complete your payment from your Dashboard.`;

      // Check if we already created a reminder notification today to prevent spam
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const existingNotification = await Notification.findOne({
        userId: user._id,
        type: 'Payment Reminder',
        createdAt: { $gte: todayStart, $lte: todayEnd }
      });

      if (!existingNotification) {
        // Save notification to MongoDB
        await Notification.create({
          userId: user._id,
          title: reminderTitle,
          message: reminderMsg,
          type: 'Payment Reminder'
        });

        console.log(`[Cron Job] Sent payment reminder notification to ${user.name} (Mobile: ${user.mobile})`);
      } else {
        console.log(`[Cron Job] Notification already sent to ${user.name} today. Skipping.`);
      }
    }
  } catch (error) {
    console.error(`[Cron Job] Error running payment reminders: ${error.message}`);
  }
};

// Start the daily cron job (runs at midnight 00:00 every day)
const startCronJob = () => {
  cron.schedule('0 0 * * *', runPaymentReminders);
  console.log('[Cron Job] Payment reminder schedule initialized (Daily at 00:00).');
};

module.exports = { startCronJob, runPaymentReminders };
