// Email service — SKIPPED for now (no nodemailer)
// All email calls will log to console instead of sending

const logger = require('../utils/logger');

const emailService = {
    async send({ to, subject, html, text }) {
        logger.info(`[EMAIL STUB] To: ${to} | Subject: ${subject}`);
        return null;
    },

    async sendOrderConfirmation(order, userEmail) {
        logger.info(`[EMAIL STUB] Order confirmation to ${userEmail} for ${order.order_number}`);
        return null;
    },

    async sendWelcome(user) {
        logger.info(`[EMAIL STUB] Welcome email to ${user.email}`);
        return null;
    },
};

module.exports = emailService;
