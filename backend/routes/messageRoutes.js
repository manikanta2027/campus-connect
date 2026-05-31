// Import express
const express = require('express');

// Create router
const router = express.Router();

// Import middleware
const authMiddleware = require('../middleware/authMiddleware');

// Import controller
const messageController = require('../controllers/messageController');

// Get all conversations for current user
router.get('/conversations', authMiddleware, messageController.getUserConversations);

// Start a new conversation with a mentor
router.post('/conversations/start', authMiddleware, messageController.startConversation);

// Get messages from a specific conversation
router.get('/conversations/:conversationId/messages', authMiddleware, messageController.getConversationMessages);

// Send a message in a conversation
router.post('/send', authMiddleware, messageController.sendMessage);

// Delete a specific message
router.delete('/messages/:messageId', authMiddleware, messageController.deleteMessage);

// Edit a specific message
router.put('/messages/:messageId', authMiddleware, messageController.editMessage);

// Close/delete a conversation
router.delete('/conversations/:conversationId', authMiddleware, messageController.closeConversation);

// Export router
module.exports = router;
