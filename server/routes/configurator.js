const express = require('express');
const router = express.Router();
const configuratorController = require('../controllers/configuratorController');
const { auth } = require('../middleware/auth');
const admin = require('../middleware/admin');
const { validate } = require('../middleware/validator');
const { optionSchema, optionUpdateSchema, valueSchema, valueUpdateSchema } = require('../validation/configuratorSchemas');

// Public routes
router.get('/:productId/options', configuratorController.getOptions);
router.post('/calculate-price', configuratorController.calculatePrice);

// Admin routes
router.post('/options', auth, admin, validate(optionSchema), configuratorController.createOption);
router.put('/options/:id', auth, admin, validate(optionUpdateSchema), configuratorController.updateOption);
router.delete('/options/:id', auth, admin, configuratorController.deleteOption);

router.post('/values', auth, admin, validate(valueSchema), configuratorController.createValue);
router.put('/values/:id', auth, admin, validate(valueUpdateSchema), configuratorController.updateValue);
router.delete('/values/:id', auth, admin, configuratorController.deleteValue);

module.exports = router;
