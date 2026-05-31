// Import express router
const express = require('express');
const router = express.Router();

// Import notification controller functions
const {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} = require('../controllers/notificationController');

// ============================================================
// NOTIFICATION ROUTES
// ============================================================

// POST - Create a new notification
// Route: POST /api/notifications/create
// Body: { recipientEmail, type, senderEmail, senderName, entityId, message }
router.post('/create', createNotification);

// GET - Get all notifications for a user
// Route: GET /api/notifications/:userEmail?unreadOnly=true
// Params: userEmail
// Query: unreadOnly (optional - filter only unread)
router.get('/:userEmail', getUserNotifications);

// PUT - Mark a notification as read
// Route: PUT /api/notifications/read/:notificationId
router.put('/read/:notificationId', markNotificationAsRead);

// PUT - Mark all notifications as read for a user
// Route: PUT /api/notifications/read-all/:userEmail
router.put('/read-all/:userEmail', markAllNotificationsAsRead);

// DELETE - Delete a notification
// Route: DELETE /api/notifications/:notificationId
router.delete('/:notificationId', deleteNotification);

// Export router
module.exports = router;
