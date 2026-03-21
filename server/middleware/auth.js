// ═══════════════════════════════════════════════════════════════
//  middleware/auth.js — Authentication & Authorization
//  Supports both Session (Passport) and JWT (Bearer token)
// ═══════════════════════════════════════════════════════════════

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const passport = require('passport');

// ─── Hybrid Auth: checks session first, then JWT ────────────
const auth = async (req, res, next) => {
    try {
        // 1. If Passport session exists, use it
        if (req.isAuthenticated && req.isAuthenticated() && req.user) {
            return next();
        }

        // 2. Fall back to JWT from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'Invalid token. User not found.' });
        }

        if (!user.is_active) {
            return res.status(403).json({ error: 'Account has been deactivated.' });
        }

        // Invalidate tokens issued before a password change
        if (user.password_changed_at) {
            const passwordChangedAt = Math.floor(new Date(user.password_changed_at).getTime() / 1000);
            if (decoded.iat < passwordChangedAt) {
                return res.status(401).json({ error: 'Password was recently changed. Please log in again.' });
            }
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired.' });
        }
        next(error);
    }
};

// ─── Optional Auth (for public routes with optional user context) ──
const optionalAuth = async (req, res, next) => {
    try {
        if (req.isAuthenticated && req.isAuthenticated() && req.user) {
            return next();
        }

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (user && user.is_active) {
                req.user = user;
            }
        }
        next();
    } catch {
        next();
    }
};

// ─── Email Verified Check ───────────────────────────────────
const isEmailVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated.' });
    }
    if (req.user.email_verified === false) {
        return res.status(403).json({ error: 'Email not verified. Please verify your email first.' });
    }
    next();
};

// ─── Role-based Access Control ──────────────────────────────
const hasRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated.' });
        }
        // super_admin has access to everything
        if (req.user.role === 'super_admin') {
            return next();
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
        }
        next();
    };
};

// ─── Convenience Shortcuts ──────────────────────────────────
const adminOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
        return next();
    }
    return res.status(403).json({ error: 'Access denied. Admin rights required.' });
};

const managerOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin' || req.user.role === 'manager')) {
        return next();
    }
    return res.status(403).json({ error: 'Access denied. Manager or Admin rights required.' });
};

module.exports = { auth, optionalAuth, isEmailVerified, hasRole, adminOnly, managerOnly };
