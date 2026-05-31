// Import cloudinary library for image upload and management
const cloudinary = require('cloudinary').v2

// Configure cloudinary with API credentials from .env file
cloudinary.config({
  // Cloud name - unique identifier for cloudinary account
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  // API key - used for authentication
  api_key: process.env.CLOUDINARY_API_KEY,
  // API secret - used for secure operations
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Export configured cloudinary instance to use in other files
module.exports = cloudinary
