const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { cartItemSchema, cartUpdateSchema } = require('../validation/cartSchemas');

// All cart routes require authentication
router.get('/', auth, cartController.getCart);
router.post('/', auth, validate(cartItemSchema), cartController.addItem);
router.put('/:id', auth, validate(cartUpdateSchema), cartController.updateItem);
router.delete('/:id', auth, cartController.removeItem);
router.post('/sync', auth, cartController.syncCart);
router.delete('/', auth, cartController.clearCart);

module.exports = router;
