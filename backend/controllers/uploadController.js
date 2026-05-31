// Import cloudinary for image upload
const cloudinary = require('../config/cloudinary')

// Function to upload image to Cloudinary
// This function receives file data and uploads it to the cloud
const uploadImage = async (fileBuffer, fileName) => {
  try {
    // Return promise that uploads the image
    return new Promise((resolve, reject) => {
      // Create upload stream to send image to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          // Set folder in Cloudinary to organize images
          folder: 'campus-connect/posts',
          // Set public ID (name) for the uploaded image
          public_id: fileName,
          // Set resource type as image
          resource_type: 'auto'
        },
        // Callback function after upload completes
        (error, result) => {
          // If error occurs during upload, reject the promise
          if (error) {
            reject(error)
          } else {
            // If successful, resolve with upload result
            resolve(result)
          }
        }
      )

      // Write file buffer to upload stream
      uploadStream.end(fileBuffer)
    })
  } catch (error) {
    // Log error for debugging
    console.error('Image upload error:', error)
    throw new Error('Failed to upload image to Cloudinary')
  }
}

// Function to upload profile image
// Similar to uploadImage but with different folder structure
const uploadProfileImage = async (fileBuffer, userId) => {
  try {
    return new Promise((resolve, reject) => {
      // Upload to profile folder using user ID as identifier
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'campus-connect/profiles',
          public_id: `profile_${userId}`,
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      )

      uploadStream.end(fileBuffer)
    })
  } catch (error) {
    console.error('Profile image upload error:', error)
    throw new Error('Failed to upload profile image')
  }
}

// Function to delete image from Cloudinary
// Useful when user wants to remove an image
const deleteImage = async (publicId) => {
  try {
    // Call Cloudinary API to destroy (delete) the image
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error('Image delete error:', error)
    throw new Error('Failed to delete image from Cloudinary')
  }
}

// Export all upload functions for use in routes
module.exports = {
  uploadImage,
  uploadProfileImage,
  deleteImage
}
