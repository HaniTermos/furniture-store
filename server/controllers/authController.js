// ═══════════════════════════════════════════════════════════════
//  controllers/authController.js — Enhanced Authentication
//  Supports: Local login, Google OAuth, email verification,
//  password reset, account lockout, session + JWT hybrid
// ═══════════════════════════════════════════════════════════════

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const emailService = require('../services/emailService');

// ─── JWT Token Generation ───────────────────────────────────
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

const authController = {
    // ═══════════════════════════════════════════════════════════
    //  REGISTER — with email verification
    // ═══════════════════════════════════════════════════════════
    async register(req, res, next) {
        try {
            const { email, password, name, phone } = req.body;

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({ error: 'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.' });
            }

            const existing = await User.findByEmail(email);
            if (existing) {
                return res.status(409).json({ error: 'Email already registered.' });
            }

            const user = await User.create({ email, password, name, phone });

            // Generate verification token
            const verificationToken = crypto.randomBytes(32).toString('hex');
            await User.setVerificationToken(user.id, verificationToken);

            // Send welcome email with verification link (non-blocking)
            emailService.sendWelcome(user, verificationToken).catch(() => { });

            // Generate JWT
            const token = generateToken(user);

            // Log activity
            ActivityLog.create({
                userId: user.id,
                action: 'register',
                entityType: 'user',
                entityId: user.id,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            }).catch(() => { });

            res.status(201).json({
                message: 'Registration successful. Please check your email to verify your account.',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    email_verified: false,
                },
            });
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  LOGIN — Passport local with lockout + session + JWT
    // ═══════════════════════════════════════════════════════════
    async login(req, res, next) {
        passport.authenticate('local', async (err, user, info) => {
            try {
                if (err) return next(err);

                if (!user) {
                    return res.status(401).json({ error: info?.message || 'Invalid email or password.' });
                }

                // Establish session
                req.logIn(user, async (loginErr) => {
                    if (loginErr) return next(loginErr);

                    // Track login
                    await User.updateLastLogin(user.id, req.ip);

                    // Log activity
                    ActivityLog.create({
                        userId: user.id,
                        action: 'login',
                        entityType: 'user',
                        entityId: user.id,
                        ipAddress: req.ip,
                        userAgent: req.headers['user-agent'],
                    }).catch(() => { });

                    // Generate JWT for API compatibility
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
                            email_verified: user.email_verified,
                        },
                    });
                });
            } catch (error) {
                next(error);
            }
        })(req, res, next);
    },

    // ═══════════════════════════════════════════════════════════
    //  LOGOUT — Destroy session + clear cookie
    // ═══════════════════════════════════════════════════════════
    async logout(req, res, next) {
        try {
            const userId = req.user?.id;

            if (userId) {
                ActivityLog.create({
                    userId,
                    action: 'logout',
                    entityType: 'user',
                    entityId: userId,
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                }).catch(() => { });
            }

            req.logout((err) => {
                if (err) return next(err);
                req.session?.destroy((destroyErr) => {
                    if (destroyErr) return next(destroyErr);
                    res.clearCookie('fs.sid');
                    res.json({ message: 'Logged out successfully.' });
                });
            });
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  EMAIL VERIFICATION
    // ═══════════════════════════════════════════════════════════
    async verifyEmail(req, res, next) {
        try {
            const { token } = req.query;
            if (!token) {
                return res.status(400).json({ error: 'Verification token is required.' });
            }

            const user = await User.findByVerificationToken(token);
            if (!user) {
                return res.status(400).json({ error: 'Invalid or expired verification token.' });
            }

            await User.setEmailVerified(user.id);

            ActivityLog.create({
                userId: user.id,
                action: 'verify_email',
                entityType: 'user',
                entityId: user.id,
            }).catch(() => { });

            res.json({ message: 'Email verified successfully. You can now log in.' });
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  RESEND VERIFICATION
    // ═══════════════════════════════════════════════════════════
    async resendVerification(req, res, next) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ error: 'Email is required.' });
            }

            const user = await User.findByEmail(email);
            if (!user) {
                // Don't reveal if email exists
                return res.json({ message: 'If the email exists, a verification link has been sent.' });
            }

            if (user.email_verified) {
                return res.json({ message: 'Email is already verified.' });
            }

            const verificationToken = crypto.randomBytes(32).toString('hex');
            await User.setVerificationToken(user.id, verificationToken);
            emailService.sendVerification(user, verificationToken).catch(() => { });

            res.json({ message: 'If the email exists, a verification link has been sent.' });
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  FORGOT PASSWORD — Send reset link
    // ═══════════════════════════════════════════════════════════
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ error: 'Email is required.' });
            }

            const user = await User.findByEmail(email);
            // Don't reveal if email exists (security)
            if (!user) {
                return res.json({ message: 'If the email exists, a reset link has been sent.' });
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            await User.setResetToken(user.id, resetToken, 60); // 1 hour

            emailService.sendPasswordReset(user, resetToken).catch(() => { });

            res.json({ message: 'If the email exists, a reset link has been sent.' });
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  RESET PASSWORD — Validate token + update password
    // ═══════════════════════════════════════════════════════════
    async resetPassword(req, res, next) {
        try {
            const { token, password } = req.body;
            if (!token || !password) {
                return res.status(400).json({ error: 'Token and new password are required.' });
            }

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({ error: 'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.' });
            }

            const user = await User.findByResetToken(token);
            if (!user) {
                return res.status(400).json({ error: 'Invalid or expired reset token.' });
            }

            await User.updatePassword(user.id, password);

            ActivityLog.create({
                userId: user.id,
                action: 'password_reset',
                entityType: 'user',
                entityId: user.id,
            }).catch(() => { });

            res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  GOOGLE OAuth CALLBACK
    // ═══════════════════════════════════════════════════════════
    googleCallback(req, res, next) {
        passport.authenticate('google', { failureRedirect: '/login?error=google_failed' }, async (err, user, info) => {
            if (err) return next(err);
            if (!user) {
                return res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
            }

            req.logIn(user, async (loginErr) => {
                if (loginErr) return next(loginErr);

                await User.updateLastLogin(user.id, req.ip);

                ActivityLog.create({
                    userId: user.id,
                    action: 'google_login',
                    entityType: 'user',
                    entityId: user.id,
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                }).catch(() => { });

                // Generate JWT and redirect to frontend with token
                const token = generateToken(user);
                res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
            });
        })(req, res, next);
    },

    // ═══════════════════════════════════════════════════════════
    //  GET PROFILE — /api/auth/me
    // ═══════════════════════════════════════════════════════════
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

    // ═══════════════════════════════════════════════════════════
    //  UPDATE PROFILE — PUT /api/auth/profile
    // ═══════════════════════════════════════════════════════════
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

    // ═══════════════════════════════════════════════════════════
    //  CHANGE PASSWORD — PUT /api/auth/password
    // ═══════════════════════════════════════════════════════════
    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;

            const user = await User.findByEmail(req.user.email);
            const isMatch = await User.comparePassword(currentPassword, user.password_hash);
            if (!isMatch) {
                return res.status(400).json({ error: 'Current password is incorrect.' });
            }

            await User.updatePassword(req.user.id, newPassword);

            ActivityLog.create({
                userId: req.user.id,
                action: 'password_change',
                entityType: 'user',
                entityId: req.user.id,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            }).catch(() => { });

            res.json({ message: 'Password changed successfully.' });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = authController;
