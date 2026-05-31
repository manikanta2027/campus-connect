// Import express framework for routing
const express = require('express');
// Create a new router instance
const router = express.Router();
// Import comment controller functions
const { addComment, getComments, deleteComment } = require('../controllers/commentController');

// Route to add a new comment
// POST request to /api/comments
// Body should contain: postId, text, author, userEmail
router.post('/', async (req, res) => {
  // Call the addComment function from controller
  await addComment(req, res);
});

// Route to get all comments for a specific post
// GET request to /api/comments/:postId
// Returns all comments for the post with the given postId
router.get('/:postId', async (req, res) => {
  // Call the getComments function from controller
  await getComments(req, res);
});

// Route to delete a specific comment
// DELETE request to /api/comments/:commentId
// Only the comment creator should be able to delete their comment
router.delete('/:commentId', async (req, res) => {
  // Call the deleteComment function from controller
  await deleteComment(req, res);
});

// Export router to use in main server file
module.exports = router;
