const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All routes here are protected
router.use(authenticate);

// Upload a generic document
router.post('/upload', authorize(['owner', 'admin']), upload.single('file'), documentController.upload);

// List documents (All authenticated users can list)
router.get('/', documentController.list);

// Delete document
router.delete('/:id', authorize(['owner', 'admin']), documentController.remove);

module.exports = router;
