const rateLimit = require('express-rate-limit');

// General rate limiter for admin endpoints
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: { error: 'Too many requests to admin endpoints, please try again later.' },
    standardHeaders: true, 
    legacyHeaders: false, 
});

module.exports = { adminLimiter };
