// Import mongoose to create schema and model
const mongoose = require('mongoose');

// Create Message Schema - stores individual messages in a conversation
const messageSchema = new mongoose.Schema({
  // Reference to the conversation
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },

  // ID of the message sender
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Role of sender - "mentor" or "student"
  senderRole: {
    type: String,
    enum: ['mentor', 'student'],
    required: true,
  },

  // Sender's name (for quick display without DB lookup)
  senderName: {
    type: String,
    required: true,
  },

  // Message content
  content: {
    type: String,
    required: true,
    trim: true,
  },

  // Message type - text, image, etc (extendable)
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text',
  },

  // For image/file messages - URL or reference
  fileUrl: {
    type: String,
    default: null,
  },

  // Message read status
  isRead: {
    type: Boolean,
    default: false,
  },

  // Timestamp of message
  timestamp: {
    type: Date,
    default: Date.now,
  },

  // Allow message editing
  editedAt: {
    type: Date,
    default: null,
  },
});

// Index for faster queries
messageSchema.index({ conversationId: 1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ timestamp: -1 });

// Create and export Message model
const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
