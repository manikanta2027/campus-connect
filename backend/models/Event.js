// Import mongoose for database operations
const mongoose = require('mongoose');

// Define event schema for storing college events in database
const eventSchema = new mongoose.Schema({
  // Unique ID for the event
  id: {
    type: Number,
    required: true,
    unique: true
  },
  // Event title
  title: {
    type: String,
    required: true,
    trim: true
  },
  // Event description
  description: {
    type: String,
    required: true,
    trim: true
  },
  // Event start date
  startDate: {
    type: String,
    required: true
  },
  // Event end date
  endDate: {
    type: String,
    required: true
  },
  // Event location (optional)
  location: {
    type: String,
    default: ''
  },
  // Event category (Workshop, Sports, Tech Talk, etc.)
  category: {
    type: String,
    required: true
  },
  // Event URL/registration link (optional)
  eventUrl: {
    type: String,
    default: ''
  },
  // Event poster/image URL from Cloudinary (optional)
  eventImage: {
    type: String,
    default: ''
  },
  // Number of registrations
  registrations: {
    type: Number,
    default: 0
  },
  // Email of the admin who created the event
  createdBy: {
    type: String,
    required: true
  },
  // When the event was created
  createdAt: {
    type: Date,
    default: Date.now
  },
  // When the event was last updated
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Event model
module.exports = mongoose.model('Event', eventSchema);
