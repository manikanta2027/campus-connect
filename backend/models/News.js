// Import mongoose for database operations
const mongoose = require('mongoose');

// Define News Schema for storing campus news
const newsSchema = new mongoose.Schema({
  // Title of the news
  title: {
    type: String,
    required: true,
    trim: true
  },

  // Description/content of the news
  description: {
    type: String,
    required: true,
    trim: true
  },

  // Category of news (e.g., Academic, Placement, Sports, etc.)
  category: {
    type: String,
    required: true,
    enum: ['Academic', 'Placement', 'Sports', 'Cultural', 'Infrastructure', 'Announcement', 'Other']
  },

  // News image/thumbnail URL from Cloudinary
  newsImage: {
    type: String,
    default: null
  },

  // Email of the admin who created the news
  createdBy: {
    type: String,
    required: true
  },

  // When the news was created
  createdAt: {
    type: Date,
    default: Date.now
  },

  // When the news was last updated
  updatedAt: {
    type: Date,
    default: Date.now
  },

  // Whether the news is still active/visible
  isActive: {
    type: Boolean,
    default: true
  },

  // Number of days after creation when news should auto-delete (default: 7 days)
  deleteAfterDays: {
    type: Number,
    default: 7,
    min: 1,
    max: 365
  },

  // Calculated datetime when news will be auto-deleted
  expiresAt: {
    type: Date,
    required: true,
    index: true // Add index for faster queries
  }
});

// Create and export the News model
module.exports = mongoose.model('News', newsSchema);
