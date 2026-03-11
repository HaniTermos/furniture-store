const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    // Log the error
    logger.error(`${req.method} ${req.originalUrl} — ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
        logger.error(err.stack);
    }

    // ─── Multer file size / type errors ────────────────────────
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    if (err.message && err.message.includes('Only image files')) {
        return res.status(400).json({ error: err.message });
    }

    // ─── PostgreSQL error codes ────────────────────────────────
    if (err.code === '23505') {
        // Unique violation — DO NOT leak err.detail in production
        return res.status(409).json({
            error: 'A record with this value already exists.',
        });
    }
    if (err.code === '23503') {
        return res.status(400).json({
            error: 'Referenced record does not exist.',
        });
    }
    if (err.code === '22P02') {
        return res.status(400).json({
            error: 'Invalid ID format.',
        });
    }

    // ─── Joi / Validation errors ───────────────────────────────
    if (err.name === 'ValidationError' || err.isJoi) {
        return res.status(400).json({
            error: 'Validation failed.',
            details: err.details,
        });
    }

    // ─── JWT errors (fallback, normally caught in auth middleware) ─
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired.' });
    }

    // ─── CORS errors ──────────────────────────────────────────
    if (err.message && err.message.includes('not allowed by CORS')) {
        return res.status(403).json({ error: 'Not allowed by CORS.' });
    }

    // ─── Default error ────────────────────────────────────────
    const statusCode = err.statusCode || err.status || 500;
    if (statusCode === 500) {
        console.error('INTERNAL SERVER ERROR DETAILS:', err);
    }
    res.status(statusCode).json({
        error: process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred.'
            : err.message,
    });
};

module.exports = errorHandler;
