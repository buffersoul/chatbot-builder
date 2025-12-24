const express = require('express');
const router = express.Router();
const botController = require('../controllers/botController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

router.get('/', botController.listBots);
router.post('/', authorize(['owner', 'admin']), botController.createBot);
router.put('/:id', authorize(['owner', 'admin']), botController.updateBot);
router.delete('/:id', authorize(['owner', 'admin']), botController.deleteBot);

module.exports = router;
