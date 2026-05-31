// Import mongoose for database operations
const mongoose = require('mongoose');

// Define post schema for storing user posts in database
const postSchema = new mongoose.Schema({
  // Unique ID for the post
  id: {
    type: Number,
    required: true,
    unique: true
  },
  // Name of the person who created the post
  authorName: {
    type: String,
    required: true
  },
  // Department of the author
  authorDept: {
    type: String,
    required: true
  },
  // Avatar letter of the author
  authorAvatar: {
    type: String,
    required: true
  },
  // Email of the author
  authorEmail: {
    type: String,
    required: true
  },
  // When the post was created
  timestamp: {
    type: Date,
    default: Date.now
  },
  // The post content/text
  content: {
    type: String,
    required: true,
    trim: true
  },
  // Array of image URLs from Cloudinary
  images: {
    type: [String],
    default: []
  },
  // Post reactions (likes, comments, shares)
  reactions: {
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  },
  // Profile image URL of the author
  profileImage: {
    type: String,
    default: null
  },
  // Auto-generated tags from AI (for categorization and search)
  tags: {
    type: [String],
    default: []
  }
});

// ============================================================
// DATABASE INDEXES - Optimize query performance for searches
// ============================================================
// Index on content: Used for text search on posts
postSchema.index({ content: 'text' });

// Index on authorEmail: Used to quickly find posts by author
postSchema.index({ authorEmail: 1 });

// Index on timestamp: Used to sort posts by date
postSchema.index({ timestamp: -1 });

// Compound index: Find recent posts by specific author
postSchema.index({ authorEmail: 1, timestamp: -1 });

// Create and export the Post model
module.exports = mongoose.model('Post', postSchema);
