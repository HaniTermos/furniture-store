const { randomBytes } = require('crypto');

/**
 * Generate a cryptographically secure, human-readable order number.
 * Format: ORD-YYYYMMDD-XXXXXXXX (8 hex chars = 4 random bytes)
 * Collision probability: ~1 in 4 billion per day — safe for production scale.

 */
const generateOrderNumber = () => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random = randomBytes(4).toString('hex').toUpperCase();

    return `ORD-${date}-${random}`;
};

module.exports = generateOrderNumber;
