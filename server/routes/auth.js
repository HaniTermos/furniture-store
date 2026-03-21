const express = require('express');
const router = express.Router();
const passport = require('passport');
const rateLimit = require('express-rate-limit');

const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const Joi = require('joi');

// ─── Rate limiters for sensitive auth endpoints ──────────────
const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many password reset requests. Please try again in 15 minutes.' },
    // Use default IP-based key generator (safe for IPv6)
    // Email-based keying removed to avoid ERR_ERL_KEY_GEN_IPV6
});

const verifyEmailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many verification requests. Please try again in 15 minutes.' },
});


// ─── Validation Schemas ─────────────────────────────────────
const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .messages({
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',

        }),
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
    newPassword: Joi.string().min(8).max(128).required(),

});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).max(128).required(),

});

// ─── Public Routes ──────────────────────────────────────────
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

// Email verification (rate limited)
router.get('/verify-email', verifyEmailLimiter, authController.verifyEmail);
router.post('/resend-verification', verifyEmailLimiter, authController.resendVerification);

// Password reset (rate limited)
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, validate(resetPasswordSchema), authController.resetPassword);


// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', authController.googleCallback);

// ─── Protected Routes ───────────────────────────────────────
router.get('/me', auth, authController.getProfile);
router.put('/profile', auth, validate(updateProfileSchema), authController.updateProfile);
router.put('/password', auth, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
