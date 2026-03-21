// ═══════════════════════════════════════════════════════════════
//  app.js — Hardened Express Application
//  Furniture Store E-Commerce API
//  With Passport.js + Session + JWT Hybrid Auth
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
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./db/pool');

// ─── Passport Configuration ─────────────────────────────────
const passport = require('./config/passport');

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
const attributeRoutes = require('./routes/attributes');
const productVariantRoutes = require('./routes/productVariants');
const currenciesPublicRoutes = require('./routes/currencies');
const publicSettingsRoutes = require('./routes/publicSettings');

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
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://res.cloudinary.com"],
            connectSrc: ["'self'", process.env.CLIENT_URL || 'http://localhost:3000'],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            frameSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
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
    return ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
};

app.use(cors({
    origin: (origin, callback) => {
        const allowed = getAllowedOrigins();
        if (!origin) return callback(null, true);
        if (allowed.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Total-Count', 'X-Request-ID'],
    maxAge: 600,
}));

// ═══════════════════════════════════════════════════════════════
//  5. BODY PARSERS & COOKIE PARSER
// ═══════════════════════════════════════════════════════════════
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// ═══════════════════════════════════════════════════════════════
//  6. SESSION (PostgreSQL-backed via connect-pg-simple)
// ═══════════════════════════════════════════════════════════════
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session',
        createTableIfMissing: true,
    }),
    name: 'fs.sid',
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'fallback-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax', // CSRF protection: prevents cross-site cookie sending
        domain: process.env.COOKIE_DOMAIN || undefined,
    },
}));

// ═══════════════════════════════════════════════════════════════
//  7. PASSPORT INITIALIZATION
// ═══════════════════════════════════════════════════════════════
app.use(passport.initialize());
app.use(passport.session());

// ═══════════════════════════════════════════════════════════════
//  8. RATE LIMITING
// ═══════════════════════════════════════════════════════════════

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many requests. Please try again later.',
            requestId: req.id
        });
    }
});
app.use('/api/', globalLimiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts. Please try again later.' },
});

const configuratorLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    message: { error: 'Too many configuration requests.' }
});

// ═══════════════════════════════════════════════════════════════
//  9. LOGGING
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
//  10. STATIC FILES (local uploads fallback)
// ═══════════════════════════════════════════════════════════════
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '7d',
    etag: true,
    index: false,
    dotfiles: 'deny'
}));

// ═══════════════════════════════════════════════════════════════
//  11. API ROUTES
// ═══════════════════════════════════════════════════════════════

// Health check
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

// Invitations
app.use('/api/invitations', invitationRoutes);

// Contact Form
app.use('/api/contact', contactRoutes);

// Admin-only routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Variant system routes
app.use('/api/attributes', attributeRoutes);
app.use('/api/products/:productId/variants', productVariantRoutes);
app.use('/api/currencies', currenciesPublicRoutes);
app.use('/api/settings', publicSettingsRoutes);

// Migration routes (admin only)
const migrationsRoutes = require('./routes/migrations');
app.use('/api/admin', migrationsRoutes);

// ═══════════════════════════════════════════════════════════════
//  12. 404 HANDLER
// ═══════════════════════════════════════════════════════════════
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.`, requestId: req.id });
});

// ═══════════════════════════════════════════════════════════════
//  13. GLOBAL ERROR HANDLER
// ═══════════════════════════════════════════════════════════════
app.use(errorHandler);

module.exports = app;
