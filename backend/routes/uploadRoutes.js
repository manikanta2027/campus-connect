// Import express framework for routing
const express = require('express')
// Create a new router instance
const router = express.Router()
// Import multer for handling file uploads
const multer = require('multer')
// Import upload controller functions
const { uploadImage, uploadProfileImage } = require('../controllers/uploadController')
// Import authentication middleware
const authMiddleware = require('../middleware/authMiddleware')
// Import User model to save profile image URL to database
const User = require('../models/User')

// Configure multer for file uploads
// memoryStorage stores files in memory before uploading to Cloudinary
const storage = multer.memoryStorage()

// Create multer instance with storage configuration
const upload = multer({
  storage: storage,
  // Limit file size to 20MB
  limits: { fileSize: 20 * 1024 * 1024 },
  // Filter to only accept image files
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      // Accept the file
      cb(null, true)
    } else {
      // Reject file with error message
      cb(new Error('Only image files are allowed'))
    }
  }
})

// Route to upload post images
// POST request to /api/upload/post
// User must be authenticated (have valid token)
// Accepts single image file in 'image' field
router.post('/post', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      })
    }

    // Generate unique file name using timestamp and random string
    const fileName = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Upload image buffer to Cloudinary
    const result = await uploadImage(req.file.buffer, fileName)

    // Return success response with image URL
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
      publicId: result.public_id
    })
  } catch (error) {
    // Log error for debugging
    console.error('Upload post image error:', error.message)
    
    // Return error response
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    })
  }
})

// Route to upload profile images
// POST request to /api/upload/profile
// User must be authenticated
// Accepts single image file in 'image' field
router.post('/profile', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      })
    }

    // Get user ID from authenticated token (added by middleware)
    const userId = req.userId

    // Upload profile image to Cloudinary
    const result = await uploadProfileImage(req.file.buffer, userId)

    // Save image URL to User model in MongoDB
    await User.findByIdAndUpdate(userId, {
      profileImage: result.secure_url
    }, { new: true })

    // Return success response with image URL
    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      imageUrl: result.secure_url,
      publicId: result.public_id
    })
  } catch (error) {
    // Log error for debugging
    console.error('Upload profile image error:', error.message)
    
    // Return error response
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image',
      error: error.message
    })
  }
})

// Export router to use in main server file
module.exports = router
