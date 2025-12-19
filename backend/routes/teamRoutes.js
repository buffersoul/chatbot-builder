const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected Routes (require login)
router.get('/', authMiddleware.authenticate, teamController.getTeam);
router.post('/invite', authMiddleware.authenticate, teamController.createInvitation);
router.delete('/invitations/:id', authMiddleware.authenticate, teamController.revokeInvitation);

// Public Routes (for accepting invites)
router.get('/verify-invite', teamController.verifyInvitation);
router.post('/accept-invite', teamController.acceptInvitation);

module.exports = router;
