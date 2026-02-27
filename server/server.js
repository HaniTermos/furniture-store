// ═══════════════════════════════════════════════════════════════
//  server.js — Hardened Server Entry Point
// ═══════════════════════════════════════════════════════════════

require('dotenv').config();

const app = require('./app');
const pool = require('./db/pool');
const logger = require('./utils/logger');

const PORT = parseInt(process.env.PORT, 10) || 5000;

// ─── Validate Critical Environment Variables ────────────────
const requiredEnvVars = [
    'JWT_SECRET',
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD'
];

if (process.env.NODE_ENV === 'production') {
    requiredEnvVars.push('CLIENT_URL');
}

const missing = requiredEnvVars.filter(v => !process.env[v]);
if (missing.length > 0) {
    logger.error('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
}

// Warn about weak JWT secret in production
if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
    logger.error('❌ JWT_SECRET must be at least 32 characters in production');
    process.exit(1);
}

// ─── Start Sequence ─────────────────────────────────────────
async function startServer() {
    let server;

    try {
        // 1. Test database connection
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
        client.release();

        logger.info('✅ Database connected');
        logger.info(`   PostgreSQL version: ${result.rows[0].pg_version}`);
        logger.info(`   Server time: ${result.rows[0].current_time}`);

        // 2. Start HTTP server
        server = app.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
            logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🌐 Allowed origins: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
            logger.info(`❤️  Health check: http://localhost:${PORT}/health`);
        });

        // 3. Graceful shutdown handlers
        const shutdown = async (signal) => {
            logger.info(`\n${signal} received. Starting graceful shutdown...`);

            // Stop accepting new connections
            server.close(async () => {
                logger.info('🔌 HTTP server closed');

                try {
                    await pool.end();
                    logger.info('✅ Database pool closed');
                } catch (err) {
                    logger.error('Error closing database pool:', err.message);
                }

                logger.info('👋 Shutdown complete');
                process.exit(0);
            });

            // Force shutdown after timeout
            setTimeout(() => {
                logger.error('⚠️  Forced shutdown: timeout exceeded');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

    } catch (err) {
        logger.error('❌ Failed to start server:', err.message);
        if (err.code === 'ECONNREFUSED') {
            logger.error('   Could not connect to PostgreSQL. Check:');
            logger.error('   - Is PostgreSQL running?');
            logger.error('   - Are DB_HOST/DB_PORT correct?');
            logger.error('   - Is the database created?');
        }
        process.exit(1);
    }
}

// ─── Global Error Handlers ──────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
    // Don't exit immediately, let ongoing requests finish
    setTimeout(() => process.exit(1), 1000);
});

process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err.message);
    logger.error(err.stack);
    process.exit(1);
});

// ─── Run ─────────────────────────────────────────────────────
startServer();
