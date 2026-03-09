const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { validate } = require('../middleware/validator');
const Joi = require('joi');

const contactSchema = Joi.object({
    name: Joi.string().max(255).required(),
    email: Joi.string().email().required(),
    department: Joi.string().allow('', null),
    subject: Joi.string().max(255).allow('', null),
    message: Joi.string().max(5000).required(),
});

router.post('/', validate(contactSchema), contactController.submit);

module.exports = router;
