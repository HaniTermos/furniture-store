const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth } = require('../middleware/auth');
const admin = require('../middleware/admin');
const { validate } = require('../middleware/validator');
const { categorySchema, categoryUpdateSchema } = require('../validation/categorySchemas');
const { orderStatusSchema } = require('../validation/orderSchemas');

// All admin routes require auth + admin role
router.use(auth, admin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Orders management
router.get('/orders', adminController.getOrders);
router.put('/orders/:id/status', validate(orderStatusSchema), adminController.updateOrderStatus);

// Customers
router.get('/customers', adminController.getCustomers);

// Reviews moderation
router.get('/reviews', adminController.getReviews);
router.put('/reviews/:id/approve', adminController.approveReview);
router.delete('/reviews/:id', adminController.deleteReview);

// Categories
router.post('/categories', validate(categorySchema), adminController.createCategory);
router.put('/categories/:id', validate(categoryUpdateSchema), adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Configuration Options & Values
router.post('/config-options', adminController.createConfigurationOption);
router.post('/config-values', adminController.createConfigurationValue);

module.exports = router;
