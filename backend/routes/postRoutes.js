// Import express framework for routing
const express = require('express');
// Create a new router instance
const router = express.Router();
// Import post controller functions
const { createPost, getAllPosts, getUserPosts, updatePost, deletePost, updateLikes, fixOldPostEmails, syncPostEmails, searchPostsByTag, syncCommentCounts } = require('../controllers/postController');

// Route to create a new post
// POST request to /api/posts
// Body should contain: id, authorName, authorDept, authorAvatar, authorEmail, content, images
router.post('/', async (req, res) => {
  // Call the createPost function from controller
  await createPost(req, res);
});

// Route to get all posts from all users
// GET request to /api/posts
// Returns all posts sorted by newest first
router.get('/', async (req, res) => {
  // Call the getAllPosts function from controller
  await getAllPosts(req, res);
});

// Route to search posts by tag (MUST be before /user/:authorEmail to avoid conflict)
// GET request to /api/posts/search/tag/:tagName
// Returns all posts that have the specified tag
router.get('/search/tag/:tagName', async (req, res) => {
  // Call the searchPostsByTag function from controller
  await searchPostsByTag(req, res);
});

// Route to get posts by a specific user
// GET request to /api/posts/user/:authorEmail
// Returns all posts created by that user
router.get('/user/:authorEmail', async (req, res) => {
  // Call the getUserPosts function from controller
  await getUserPosts(req, res);
});

// Route to fix old posts with placeholder email
// POST request to /api/posts/fix-emails
// Body should contain: authorName, correctEmail
router.post('/fix-emails', async (req, res) => {
  // Call the fixOldPostEmails function from controller
  await fixOldPostEmails(req, res);
});

// Route to sync and normalize all post emails
// POST request to /api/posts/sync-emails
// Normalizes all emails and checks for missing users
router.post('/sync/emails', async (req, res) => {
  // Call the syncPostEmails function from controller
  await syncPostEmails(req, res);
});

// Route to update a specific post
// PUT request to /api/posts/:postId
// Body can contain: content, images, profileImage
router.put('/:postId', async (req, res) => {
  // Call the updatePost function from controller
  await updatePost(req, res);
});

// Route to delete a specific post
// DELETE request to /api/posts/:postId
router.delete('/:postId', async (req, res) => {
  // Call the deletePost function from controller
  await deletePost(req, res);
});

// Route to update likes on a specific post
// POST request to /api/posts/:postId/like
// Body should contain: increment (1 for like, -1 for unlike)
router.post('/:postId/like', async (req, res) => {
  // Call the updateLikes function from controller
  await updateLikes(req, res);
});

// Route to sync and fix comment counts for all posts
// POST request to /api/posts/sync/comments
// Recalculates actual comment counts from Comment collection and updates posts
router.post('/sync/comments', async (req, res) => {
  // Call the syncCommentCounts function from controller
  await syncCommentCounts(req, res);
});

// Export router to use in main server file
module.exports = router;
