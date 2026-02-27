/**
 * Generate a human-readable order number
 * Format: ORD-YYYYMMDD-XXXX (random 4 digits)
 */
const generateOrderNumber = () => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${date}-${random}`;
};

module.exports = generateOrderNumber;
