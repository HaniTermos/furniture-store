<<<<<<< HEAD
/**
 * Generate a human-readable order number
 * Format: ORD-YYYYMMDD-XXXX (random 4 digits)
=======
const { randomBytes } = require('crypto');

/**
 * Generate a cryptographically secure, human-readable order number.
 * Format: ORD-YYYYMMDD-XXXXXXXX (8 hex chars = 4 random bytes)
 * Collision probability: ~1 in 4 billion per day — safe for production scale.
>>>>>>> d1d77d0 (dashboard and variants edits)
 */
const generateOrderNumber = () => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
<<<<<<< HEAD
    const random = Math.floor(1000 + Math.random() * 9000);
=======
    const random = randomBytes(4).toString('hex').toUpperCase();
>>>>>>> d1d77d0 (dashboard and variants edits)
    return `ORD-${date}-${random}`;
};

module.exports = generateOrderNumber;
