// Import express
const express = require('express');

// Create router
const router = express.Router();

// Import middleware
const authMiddleware = require('../middleware/authMiddleware');

// Import controller
const mentorController = require('../controllers/mentorController');

// Static routes (must come before dynamic :id route)
// Get all mentors
router.get('/', authMiddleware, mentorController.getMentors);

// Get mentors by specific skill
router.get('/skill/:skill', authMiddleware, mentorController.getMentorsBySkill);

// Get mentors filtered by skill
router.get('/search/filter', authMiddleware, mentorController.getMentorsByDepartmentAndSkill);

// Add a user as mentor (Admin only)
router.post('/add', authMiddleware, mentorController.addMentor);

// Remove a user as mentor (Admin only)
router.post('/remove', authMiddleware, mentorController.removeMentor);

// Dynamic route (must come after static routes)
// Get mentor by ID
router.get('/:id', authMiddleware, mentorController.getMentorById);

// Export router
module.exports = router;
