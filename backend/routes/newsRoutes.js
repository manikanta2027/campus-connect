// Import express framework for routing
const express = require('express');

// Create a new router instance
const router = express.Router();

// Import news controller functions
const {
  createNews,
  getAllNews,
  getNewsByAdmin,
  getNewsById,
  updateNews,
  deleteNews,
  getNewsByCategory
} = require('../controllers/newsController');

// Route to create a new news item
// POST request to /api/news
// Body should contain: id, title, description, category, newsImage, createdBy
router.post('/', async (req, res) => {
  await createNews(req, res);
});

// Route to get all news items
// GET request to /api/news
router.get('/', async (req, res) => {
  await getAllNews(req, res);
});

// Route to get news by category
// GET request to /api/news/category/:category
// IMPORTANT: This must come BEFORE /:newsId
router.get('/category/:category', async (req, res) => {
  await getNewsByCategory(req, res);
});

// Route to get news by admin
// GET request to /api/news/admin/:adminEmail
// IMPORTANT: This must come BEFORE /:newsId
router.get('/admin/:adminEmail', async (req, res) => {
  await getNewsByAdmin(req, res);
});

// Route to get a specific news item
// GET request to /api/news/:newsId
// IMPORTANT: This must come LAST because it's the most generic pattern
router.get('/:newsId', async (req, res) => {
  await getNewsById(req, res);
});

// Route to update a news item
// PUT request to /api/news/:newsId
// Body can contain: title, description, category, newsImage
router.put('/:newsId', async (req, res) => {
  await updateNews(req, res);
});

// Route to delete a news item
// DELETE request to /api/news/:newsId
router.delete('/:newsId', async (req, res) => {
  await deleteNews(req, res);
});

// Export router to use in main server file
module.exports = router;
