const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const { authenticate } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// List conversations
router.get('/', conversationController.listConversations);

// Get single conversation
router.get('/:id', conversationController.getConversation);

// Send reply
router.post('/:id/send', conversationController.replyToConversation);

module.exports = router;
