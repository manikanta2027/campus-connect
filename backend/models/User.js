// Import mongoose to create schema and model
const mongoose = require('mongoose'); //mongoose is a ODM library for MongoDB that allows us to define schemas and interact with the database using models.

// Create User Schema - defines the structure of user data in MongoDB
const userSchema = new mongoose.Schema({
  // User's full name - required field
  name: {
    type: String,
    required: true,
  },

  // User's email - must be SRKREC email and unique
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  // User's register number - unique identifier for each student (e.g., 23B91A6129)
  registerNumber: {
    type: String,
    required: true,
    unique: true,
  },

  // User's password - stored as hashed value
  password: {
    type: String,
    required: true,
    select: false, // Don't return password when fetching user data
  },

  // User's department
  department: {
    type: String,
    required: true,
  },

  // User's year of study (1, 2, 3, or 4)
  year: {
    type: Number,
    required: true,
  },

  // Array of user's skills
  skills: {
    type: [String],
    default: [],
  },

  // User's bio/description
  bio: {
    type: String,
    default: '',
  },

  // Is email verified?
  isVerified: {
    type: Boolean,
    default: false,
  },

  // OTP for email verification
  otp: {
    type: String,
    select: false,
  },

  // When does OTP expire?
  otpExpiry: {
    type: Date,
    select: false,
  },

  // Profile image URL
  profileImage: {
    type: String,
    default: null,
  },

  // Is this user a mentor?
  isMentor: {
    type: Boolean,
    default: false,
  },

  // Is this user an admin?
  isAdmin: {
    type: Boolean,
    default: false,
  },

  // Password reset token (generated when forgot password is requested)
  resetToken: {
    type: String,
    default: null,
    select: false,
  },

  // Reset token expiry time (valid for 1 hour)
  resetTokenExpiry: {
    type: Date,
    default: null,
    select: false,
  },

  // When was account created?
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // When was user last active?
  lastLogin: {
    type: Date,
    default: Date.now,
  },
});

// ============================================================
// DATABASE INDEXES - Optimize query performance
// ============================================================
// These indexes speed up queries that filter by these fields
// Index on email: Used in login, forgot password, verify OTP
userSchema.index({ email: 1 });

// Index on resetTokenExpiry: Used to find valid/expired reset tokens
userSchema.index({ resetTokenExpiry: 1 });

// Index on registerNumber: Used in student searches
userSchema.index({ registerNumber: 1 });

// Index on createdAt: Used for sorting/filtering by date
userSchema.index({ createdAt: -1 });

// Create model from schema
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;
