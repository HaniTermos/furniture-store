const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

const authController = {
    /**
     * POST /api/auth/register
     */
    async register(req, res, next) {
        try {
            const { email, password, name, phone } = req.body;

            // Check if user exists
            const existing = await User.findByEmail(email);
            if (existing) {
                return res.status(409).json({ error: 'Email already registered.' });
            }

            // Create user
            const user = await User.create({ email, password, name, phone });

            // Generate token
            const token = generateToken(user);

            // Send welcome email (non-blocking)
            emailService.sendWelcome(user).catch(() => { });

            res.status(201).json({
                message: 'Registration successful.',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/auth/login
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // Find user (with password hash)
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }

            if (!user.is_active) {
                return res.status(403).json({ error: 'Account has been deactivated.' });
            }

            // Compare password
            const isMatch = await User.comparePassword(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }

            // Generate token
            const token = generateToken(user);

            res.json({
                message: 'Login successful.',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar_url: user.avatar_url,
                },
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/auth/me
     */
    async getProfile(req, res, next) {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            res.json({ user });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/auth/profile
     */
    async updateProfile(req, res, next) {
        try {
            const { name, phone, avatar_url } = req.body;
            const fields = {};
            if (name !== undefined) fields.name = name;
            if (phone !== undefined) fields.phone = phone;
            if (avatar_url !== undefined) fields.avatar_url = avatar_url;

            const user = await User.update(req.user.id, fields);
            res.json({ message: 'Profile updated.', user });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/auth/password
     */
    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;

            const user = await User.findByEmail(req.user.email);
            const isMatch = await User.comparePassword(currentPassword, user.password_hash);
            if (!isMatch) {
                return res.status(400).json({ error: 'Current password is incorrect.' });
            }

            await User.updatePassword(req.user.id, newPassword);
            res.json({ message: 'Password changed successfully.' });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = authController;
