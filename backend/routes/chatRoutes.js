const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/authMiddleware');

// Route for sending messages
// Note: 'authenticate' middleware is used for now assuming internal testing by logged-in user.
// For public widget, we would need a different strategy (API Key or specialized middleware).
router.post('/message', authenticate, chatController.sendMessage);

// Route for fetching history
router.get('/history/:conversationId', authenticate, chatController.getHistory);

module.exports = router;
