const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');
const { auth, adminOnly } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const Joi = require('joi');

const inviteSchema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    role: Joi.string().valid('admin', 'manager', 'user').default('user')
});

const acceptSchema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required()
});

// Admin only: Send invitation
router.post('/invite', auth, adminOnly, validate(inviteSchema), invitationController.invite);

// Public: Verify token
router.get('/verify/:token', invitationController.verify);

// Public: Accept invitation (create account)
router.post('/accept', validate(acceptSchema), invitationController.accept);

module.exports = router;
