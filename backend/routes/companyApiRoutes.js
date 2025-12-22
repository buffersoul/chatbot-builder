const express = require('express');
const router = express.Router();
const companyApiController = require('../controllers/companyApiController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// All routes require owner or admin role
router.use(authenticate);
router.use(authorize(['owner', 'admin']));

router.get('/', companyApiController.listApis);
router.get('/:id', companyApiController.getApi);
router.post('/', companyApiController.createApi);
router.put('/:id', companyApiController.updateApi);
router.delete('/:id', companyApiController.deleteApi);

module.exports = router;
