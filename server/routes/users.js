const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const admin = require('../middleware/admin');

// All user management routes are admin-only
router.get('/', auth, admin, userController.getAllUsers);
router.get('/:id', auth, admin, userController.getUser);
router.put('/:id/status', auth, admin, userController.toggleStatus);
router.put('/:id/role', auth, admin, userController.updateRole);
router.delete('/:id', auth, admin, userController.deleteUser);

module.exports = router;
