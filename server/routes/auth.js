const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const Joi = require('joi');

// Validation schemas
const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
    name: Joi.string().max(255).required(),
    phone: Joi.string().max(50).allow('', null),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
    name: Joi.string().max(255),
    phone: Joi.string().max(50).allow('', null),
    avatar_url: Joi.string().uri().allow('', null),
});

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(128).required(),
});

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Protected routes
router.get('/me', auth, authController.getProfile);
router.put('/profile', auth, validate(updateProfileSchema), authController.updateProfile);
router.put('/password', auth, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
