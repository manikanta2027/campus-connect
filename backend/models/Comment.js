// Import mongoose for database operations
const mongoose = require('mongoose');

// Define comment schema for storing comments on posts
const commentSchema = new mongoose.Schema({
  // ID of the post this comment belongs to
  postId: {
    type: Number,
    required: true,
    index: true
  },
  // Name of the user who commented
  author: {
    type: String,
    required: true
  },
  // The comment text content
  text: {
    type: String,
    required: true,
    trim: true
  },
  // When the comment was created
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Email of the person who commented (for identification)
  userEmail: {
    type: String,
    required: true
  }
});

// Create and export the Comment model based on the schema
module.exports = mongoose.model('Comment', commentSchema);
