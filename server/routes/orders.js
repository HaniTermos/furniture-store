const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { orderSchema } = require('../validation/orderSchemas');

router.post('/', auth, validate(orderSchema), orderController.createOrder);
router.get('/', auth, orderController.getUserOrders);
router.get('/:id', auth, orderController.getOrder);
router.put('/:id/cancel', auth, orderController.cancelOrder);

module.exports = router;
