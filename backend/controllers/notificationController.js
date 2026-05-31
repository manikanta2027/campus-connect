// Import Notification model for database operations
const Notification = require('../models/Notification');

// ============================================================
// Helper function to get IO instance (lazy require to avoid circular dependency)
// ============================================================
const getIO = () => {
  return require('../server').getIO();
};

// ============================================================
// CREATE NOTIFICATION - Create and emit real-time notification
// ============================================================
exports.createNotification = async (req, res) => {
  try {
    const { recipientEmail, type, senderEmail, senderName, entityId, message } = req.body;

    // Validate required fields
    if (!recipientEmail || !type || !senderEmail || !senderName || !entityId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create notification document in database
    const notification = new Notification({
      recipientEmail,
      type,
      senderEmail,
      senderName,
      entityId,
      message,
      isRead: false
    });

    await notification.save();

    // Get io instance and emit real-time notification
    const io = getIO();
    if (io) {
      io.to(`notifications-${recipientEmail}`).emit('receive-notification', {
        _id: notification._id,
        type,
        senderName,
        message,
        createdAt: notification.createdAt,
        isRead: false
      });

      console.log(`📬 Real-time notification sent to ${recipientEmail}: ${message}`);
    }

    return res.status(201).json({
      success: true,
      message: 'Notification created and sent',
      notification
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// GET USER NOTIFICATIONS - Fetch all notifications for a user
// ============================================================
exports.getUserNotifications = async (req, res) => {
  try {
    const { userEmail } = req.params;
    const { unreadOnly } = req.query;

    // Build query filter
    const query = { recipientEmail: userEmail };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    // Fetch notifications sorted by newest first
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 latest notifications

    // Count unread notifications
    const unreadCount = await Notification.countDocuments({
      recipientEmail: userEmail,
      isRead: false
    });

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// MARK AS READ - Mark a notification as read
// ============================================================
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// MARK ALL AS READ - Mark all notifications as read for a user
// ============================================================
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const { userEmail } = req.params;

    const result = await Notification.updateMany(
      { recipientEmail: userEmail, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// DELETE NOTIFICATION - Delete a specific notification
// ============================================================
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const result = await Notification.findByIdAndDelete(notificationId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to send notifications from other controllers
// ============================================================
const sendNotification = async (recipientEmail, type, senderEmail, senderName, entityId, message) => {
  try {
    console.log(`\n📬 Sending notification...`);
    console.log(`   To: ${recipientEmail}`);
    console.log(`   From: ${senderName} (${senderEmail})`);
    console.log(`   Message: ${message}`);
    
    const notification = new Notification({
      recipientEmail,
      type,
      senderEmail,
      senderName,
      entityId,
      message,
      isRead: false
    });

    await notification.save();
    console.log(`✅ Notification saved to database`);

    // Get io instance and emit real-time notification
    const io = getIO();
    console.log(`🔍 Checking io instance...`);
    
    if (io) {
      console.log(`✅ io instance exists`);
      const room = `notifications-${recipientEmail}`;
      console.log(`📡 Emitting to room: ${room}`);
      
      io.to(room).emit('receive-notification', {
        _id: notification._id,
        type,
        senderName,
        message,
        createdAt: notification.createdAt,
        isRead: false
      });

      console.log(`✅ Real-time notification emitted to ${recipientEmail}: ${message}\n`);
    } else {
      console.log(`❌ io instance is NULL - Socket.io not available\n`);
    }

    return notification;
  } catch (error) {
    console.error('❌ Error sending notification:', error.message);
  }
};

// Export sendNotification function so other controllers can use it
exports.sendNotification = sendNotification;
