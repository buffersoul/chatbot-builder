const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticate } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All routes here are protected
router.use(authenticate);

// Upload a generic document
router.post('/upload', upload.single('file'), documentController.upload);

// List documents
router.get('/', documentController.list);

// Delete document
router.delete('/:id', documentController.remove);

module.exports = router;
