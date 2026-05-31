// Import express framework for routing
const express = require('express');
// Create a new router instance
const router = express.Router();
// Import event controller functions
const { createEvent, getAllEvents, getEventsByAdmin, updateEvent, deleteEvent } = require('../controllers/eventController');
// Import authentication middleware
const authMiddleware = require('../middleware/authMiddleware');

// Route to create a new event
// POST request to /api/events
// User must be authenticated
// Body should contain: title, description, startDate, endDate, category, createdBy, and optional fields
router.post('/', authMiddleware, async (req, res) => {
  // Call the createEvent function from controller
  await createEvent(req, res);
});

// Route to get all events
// GET request to /api/events
// Returns all events sorted by newest first
router.get('/', async (req, res) => {
  // Call the getAllEvents function from controller
  await getAllEvents(req, res);
});

// Route to get events by a specific admin
// GET request to /api/events/admin/:adminEmail
// Returns all events created by that admin
router.get('/admin/:adminEmail', async (req, res) => {
  // Call the getEventsByAdmin function from controller
  await getEventsByAdmin(req, res);
});

// Route to update a specific event
// PUT request to /api/events/:eventId
// User must be authenticated
// Body can contain: title, description, startDate, endDate, location, category, eventUrl, eventImage
router.put('/:eventId', authMiddleware, async (req, res) => {
  // Call the updateEvent function from controller
  await updateEvent(req, res);
});

// Route to delete a specific event
// DELETE request to /api/events/:eventId
// User must be authenticated
router.delete('/:eventId', authMiddleware, async (req, res) => {
  // Call the deleteEvent function from controller
  await deleteEvent(req, res);
});

// Export router to use in main server file
module.exports = router;
