// Import mongoose to create schema and model
const mongoose = require('mongoose');

// Create Conversation Schema - tracks mentorship conversations between students and seniors
const conversationSchema = new mongoose.Schema({
  // Reference to the senior/mentor
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Reference to the student
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Department - ensures mentors and students are from same college/department
  department: {
    type: String,
    required: true,
  },

  // Last message preview for quick view
  lastMessage: {
    type: String,
    default: null,
  },

  // Timestamp of last message
  lastMessageAt: {
    type: Date,
    default: null,
  },

  // Track creation time
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // Track last update time
  updatedAt: {
    type: Date,
    default: Date.now,
  },

  // Flag if conversation is active
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Index for faster queries
conversationSchema.index({ mentorId: 1, studentId: 1 }, { unique: true });
conversationSchema.index({ mentorId: 1 });
conversationSchema.index({ studentId: 1 });

// Update updatedAt before saving
conversationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create and export Conversation model
const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
