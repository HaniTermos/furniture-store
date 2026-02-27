const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    // Connection pool settings
    max: 20,                         // max simultaneous connections
    idleTimeoutMillis: 30000,        // close idle connections after 30s
    connectionTimeoutMillis: 5000,   // fail if can't connect within 5s

    // SSL for production (Hostinger VPS, etc.)
    ...(isProduction && {
        ssl: {
            rejectUnauthorized: false,   // set to true with proper CA cert
        },
    }),
});

// Log pool errors (don't crash the server for transient issues)
pool.on('error', (err) => {
    console.error('[DB POOL] Unexpected idle client error:', err.message);
});

module.exports = pool;