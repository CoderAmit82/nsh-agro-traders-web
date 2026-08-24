const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// ==========================================
//           MESSAGING ENDPOINTS
// ==========================================

// @desc    Get all conversations list (Admin only)
// @route   GET /api/messages/conversations
// @access  Private/Admin
router.get('/conversations', protect, admin, async (req, res, next) => {
  try {
    // Find all messages involving farmers
    // We group messages by farmer to show unique conversation threads.
    // A thread is defined by the non-admin user involved in the message.
    const messages = await Message.find().sort({ createdAt: -1 });

    const conversationsMap = {};
    for (const msg of messages) {
      const isSenderAdmin = await checkIfAdmin(msg.senderId);
      const isReceiverAdmin = await checkIfAdmin(msg.receiverId);

      // Identify the farmer in this transaction
      let farmerId = null;
      if (!isSenderAdmin) farmerId = msg.senderId.toString();
      else if (!isReceiverAdmin) farmerId = msg.receiverId.toString();

      if (farmerId && !conversationsMap[farmerId]) {
        const farmerUser = await User.findById(farmerId).select('name email mobile');
        if (farmerUser) {
          conversationsMap[farmerId] = {
            farmer: farmerUser,
            lastMessage: msg.messageText,
            timestamp: msg.createdAt,
            isRead: msg.isRead || false,
            senderId: msg.senderId
          };
        }
      }
    }

    const conversations = Object.values(conversationsMap);
    res.json({ success: true, count: conversations.length, conversations });
  } catch (error) {
    next(error);
  }
});

// Helper function to check if a user ID is an admin
async function checkIfAdmin(userId) {
  const user = await User.findById(userId);
  return user ? user.role === 'admin' : false;
}

// @desc    Get message history with a user
// @route   GET /api/messages/:userId
// @access  Private
router.get('/history/:userId', protect, async (req, res, next) => {
  try {
    const currentUserId = req.user._id.toString();
    const otherUserId = req.params.userId;

    // Authorization check: Farmers can only check their own history. Admin can check anyone's history.
    if (req.user.role !== 'admin' && otherUserId !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized message request' });
    }

    let query = {};
    if (req.user.role === 'admin') {
      // Admin requested history with farmer `otherUserId`
      query = {
        $or: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId }
        ]
      };

      // Mark incoming messages as read
      await Message.updateMany(
        { senderId: otherUserId, receiverId: currentUserId, isRead: false },
        { isRead: true }
      );
    } else {
      // Farmer requested history with admin.
      // Since there could be multiple admins, we query messages where
      // sender is farmer and receiver is ANY admin OR sender is ANY admin and receiver is farmer.
      const admins = await User.find({ role: 'admin' }).select('_id');
      const adminIds = admins.map(a => a._id.toString());

      query = {
        $or: [
          { senderId: currentUserId, receiverId: { $in: adminIds } },
          { senderId: { $in: adminIds }, receiverId: currentUserId }
        ]
      };

      // Mark incoming admin messages as read
      await Message.updateMany(
        { senderId: { $in: adminIds }, receiverId: currentUserId, isRead: false },
        { isRead: true }
      );
    }

    const messages = await Message.find(query).sort({ createdAt: 1 });
    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    next(error);
  }
});

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { messageText, receiverId } = req.body;
    const senderId = req.user._id;

    let finalReceiverId = receiverId;

    if (req.user.role === 'farmer') {
      // Farmer sending message: Route it to the first available admin
      const adminUser = await User.findOne({ role: 'admin' });
      if (!adminUser) {
        return res.status(404).json({ success: false, message: 'No support administrators available' });
      }
      finalReceiverId = adminUser._id;
    } else {
      // Admin sending message: Must specify a farmer recipient
      if (!receiverId) {
        return res.status(400).json({ success: false, message: 'Recipient user ID is required' });
      }
    }

    const message = await Message.create({
      senderId,
      receiverId: finalReceiverId,
      messageText
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
});


// ==========================================
//         NOTIFICATIONS ENDPOINTS
// ==========================================

// @desc    Get all notifications for logged in user
// @route   GET /api/messages/notifications
// @access  Private
router.get('/notifications/all', protect, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark notification as read
// @route   PUT /api/messages/notifications/:id/read
// @access  Private
router.put('/notifications/:id/read', protect, async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized operation' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, notification });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
