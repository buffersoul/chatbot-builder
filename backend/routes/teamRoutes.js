const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Protected Routes (require login)
router.get('/', authenticate, authorize(['owner', 'admin']), teamController.getTeam);
router.post('/invite', authenticate, authorize(['owner', 'admin']), teamController.createInvitation);
router.delete('/invitations/:id', authenticate, authorize(['owner', 'admin']), teamController.revokeInvitation);

// Public Routes (for accepting invites)
router.get('/verify-invite', teamController.verifyInvitation);
router.post('/accept-invite', teamController.acceptInvitation);

// User Management Routes
router.delete('/users/:id', authenticate, authorize(['owner', 'admin']), teamController.removeUser);
router.patch('/users/:id/role', authenticate, authorize(['owner', 'admin']), teamController.updateMemberRole);

module.exports = router;
