// Import mongoose to create schema and model
const mongoose = require('mongoose');

// Create Notification Schema - for storing real-time notifications
const notificationSchema = new mongoose.Schema({
  // The user who receives the notification
  recipientEmail: {
    type: String,
    required: true,
    index: true
  },

  // Type of notification: 'like', 'comment', 'message', 'mention'
  type: {
    type: String,
    enum: ['like', 'comment', 'message', 'mention', 'mentor_request'],
    required: true
  },

  // The user who triggered the notification
  senderEmail: {
    type: String,
    required: true
  },

  senderName: {
    type: String,
    required: true
  },

  // Related entity ID (post ID, message ID, etc)
  entityId: {
    type: String,
    required: true
  },

  // Brief message to display
  message: {
    type: String,
    required: true
  },

  // Has the notification been read?
  isRead: {
    type: Boolean,
    default: false
  },

  // When was it created?
  createdAt: {
    type: Date,
    default: Date.now,
    // Auto-delete notifications after 30 days
    expires: 2592000
  }
});

// Index for faster queries
notificationSchema.index({ recipientEmail: 1, isRead: 1 });
notificationSchema.index({ recipientEmail: 1, createdAt: -1 });

// Create model from schema
const Notification = mongoose.model('Notification', notificationSchema);

// Export the Notification model
module.exports = Notification;
