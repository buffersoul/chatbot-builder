const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// All dashboard routes are protected
router.use(authMiddleware.authenticate);

router.get('/stats', dashboardController.getStats);
router.get('/recent', dashboardController.getRecentActivity);

module.exports = router;
