// ═══════════════════════════════════════════════════════════════
//  app.js — Hardened Express Application
//  Furniture Store E-Commerce API (Security-Reviewed)
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const compression = require('compression');
const { v4: uuidv4 } = require('uuid');

// ─── Middleware ───────────────────────────────────────────────
const errorHandler = require('./middleware/errorHandler');

// ─── Route Imports ───────────────────────────────────────────
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const configuratorRoutes = require('./routes/configurator');
const designRoutes = require('./routes/designs');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');
const categoryRoutes = require('./routes/categories');
const invitationRoutes = require('./routes/invitations');
const contactRoutes = require('./routes/contact');

// ─── Create Express App ─────────────────────────────────────
const app = express();

// ═══════════════════════════════════════════════════════════════
//  0. REQUEST ID (for tracing)
// ═══════════════════════════════════════════════════════════════
app.use((req, res, next) => {
    req.id = req.headers['x-request-id'] || uuidv4();
    res.setHeader('X-Request-ID', req.id);
    next();
});

// ═══════════════════════════════════════════════════════════════
//  1. TRUST PROXY (required behind Nginx / load balancer)
// ═══════════════════════════════════════════════════════════════
app.set('trust proxy', 1);

// ═══════════════════════════════════════════════════════════════
//  2. SECURITY HEADERS (Helmet)
// ═══════════════════════════════════════════════════════════════
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },   // allow images to load cross-origin
    contentSecurityPolicy: false,                             // tweak later if serving HTML
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// ═══════════════════════════════════════════════════════════════
//  3. COMPRESSION
// ═══════════════════════════════════════════════════════════════
app.use(compression());

// ═══════════════════════════════════════════════════════════════
//  4. CORS
// ═══════════════════════════════════════════════════════════════
const getAllowedOrigins = () => {
    if (process.env.NODE_ENV === 'production') {
        const origins = (process.env.CLIENT_URL || '')
            .split(',')
            .map(o => o.trim())
            .filter(Boolean);
        if (origins.length === 0) {
            console.error('WARNING: CLIENT_URL not set in production. CORS will block all requests.');
            return [];
        }
        return origins;
    }
    return ['http://localhost:5173', 'http://localhost:3000'];
};

app.use(cors({
    origin: (origin, callback) => {
        const allowed = getAllowedOrigins();
        // Allow requests with no origin (mobile apps, Postman, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowed.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Total-Count', 'X-Request-ID'],                        // useful for pagination
    maxAge: 600,                                              // preflight cache 10 min
}));

// ═══════════════════════════════════════════════════════════════
//  5. BODY PARSERS & COOKIE PARSER
// ═══════════════════════════════════════════════════════════════
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// ═══════════════════════════════════════════════════════════════
//  6. RATE LIMITING
// ═══════════════════════════════════════════════════════════════

// Global limiter: 100 requests per 15 min per IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,       // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,        // Disable `X-RateLimit-*` headers
    // keyGenerator: (req) => req.ip,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many requests. Please try again later.',
            requestId: req.id
        });
    }
});
app.use('/api/', globalLimiter);

// Strict limiter for auth: 5 attempts per 15 min per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true, // Don't count successful logins
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts. Please try again later.' },
});

// Configurator limiter (prevent price enumeration)
const configuratorLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    message: { error: 'Too many configuration requests.' }
});

// ═══════════════════════════════════════════════════════════════
//  7. LOGGING (before parsers so we log even malformed requests)
// ═══════════════════════════════════════════════════════════════
app.use(morgan((tokens, req, res) => {
    return [
        `[${new Date().toISOString()}]`,
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens['response-time'](req, res), 'ms',
        '| RequestID:', req.id
    ].join(' ');
}));



// ═══════════════════════════════════════════════════════════════
//  8. STATIC FILES (local uploads fallback)
// ═══════════════════════════════════════════════════════════════
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '7d',                // browser cache for static images
    etag: true,
    index: false,
    dotfiles: 'deny'
}));

// ═══════════════════════════════════════════════════════════════
//  9. API ROUTES
// ═══════════════════════════════════════════════════════════════

// Health check (before rate limiting for monitoring)
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        requestId: req.id
    });
});

// Auth gets its own stricter rate limiter
app.use('/api/auth', authLimiter, authRoutes);

// Public + protected routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);

// Protected routes (require auth)
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/designs', designRoutes);

// Configurator with specific limiting
app.use('/api/configurator', configuratorLimiter, configuratorRoutes);

// Invitations (Public verify/accept + Admin invite)
app.use('/api/invitations', invitationRoutes);

// Contact Form
app.use('/api/contact', contactRoutes);

// Admin-only routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);


// ═══════════════════════════════════════════════════════════════
//  10. 404 HANDLER — must be AFTER all routes
// ═══════════════════════════════════════════════════════════════
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.`, requestId: req.id });
});

// ═══════════════════════════════════════════════════════════════
//  11. GLOBAL ERROR HANDLER — must be the LAST middleware
// ═══════════════════════════════════════════════════════════════
app.use(errorHandler);

module.exports = app;
