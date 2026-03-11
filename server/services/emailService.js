// ═══════════════════════════════════════════════════════════════
//  services/emailService.js — Nodemailer Email Service
//  Falls back to console logging when SMTP is not configured
// ═══════════════════════════════════════════════════════════════

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// ─── Transporter Setup ──────────────────────────────────────
let transporter = null;

const isSmtpConfigured = () => {
    return process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
};

const getTransporter = () => {
    if (transporter) return transporter;
    if (!isSmtpConfigured()) return null;

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: parseInt(process.env.SMTP_PORT || '587') === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    return transporter;
};

// ─── HTML Template Wrapper ──────────────────────────────────
const wrapInTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: #1a1a1a; padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; margin: 0; }
    .header .logo { color: #F97316; font-weight: 800; font-size: 28px; letter-spacing: 2px; }
    .body { padding: 40px 32px; }
    .body h2 { color: #1a1a1a; font-size: 22px; margin: 0 0 16px; }
    .body p { color: #4a4a4a; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
    .btn { display: inline-block; background: #F97316; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0; }
    .btn:hover { background: #ea6807; }
    .footer { padding: 24px 32px; background: #fafafa; border-top: 1px solid #eee; text-align: center; }
    .footer p { color: #999; font-size: 12px; margin: 0; }
    .warning { background: #fef3cd; border: 1px solid #ffeeba; border-radius: 8px; padding: 12px 16px; margin: 16px 0; }
    .warning p { color: #856404; font-size: 13px; margin: 0; }
  </style>
</head>
<body>
  <div style="padding: 24px;">
    <div class="container">
      <div class="header">
        <div class="logo">HTW</div>
        <h1>Furniture Store</h1>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} HTW Furniture. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

// ─── Email Service ──────────────────────────────────────────
const emailService = {
    /**
     * Send an email. Falls back to console logging if SMTP is not configured.
     */
    async send({ to, subject, html, text }) {
        const transport = getTransporter();
        if (!transport) {
            logger.info(`[EMAIL STUB] To: ${to} | Subject: ${subject}`);
            return { stubbed: true };
        }

        try {
            const result = await transport.sendMail({
                from: `"${process.env.FROM_NAME || 'HTW Furniture'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
                to,
                subject,
                html,
                text: text || subject,
            });
            logger.info(`[EMAIL SENT] To: ${to} | Subject: ${subject} | MessageId: ${result.messageId}`);
            return result;
        } catch (error) {
            logger.error(`[EMAIL ERROR] To: ${to} | Subject: ${subject} | Error: ${error.message}`);
            throw error;
        }
    },

    /**
     * Welcome / Email Verification
     */
    async sendWelcome(user, verificationToken) {
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
        const html = wrapInTemplate(`
            <h2>Welcome, ${user.name || 'there'}! 👋</h2>
            <p>Thank you for joining HTW Furniture. We're excited to have you!</p>
            <p>Please verify your email address to unlock all features:</p>
            <p style="text-align: center;">
                <a href="${verificationUrl}" class="btn">Verify My Email</a>
            </p>
            <p style="font-size: 13px; color: #999;">
                Or copy this link: <a href="${verificationUrl}">${verificationUrl}</a>
            </p>
        `);

        return this.send({
            to: user.email,
            subject: 'Welcome to HTW Furniture — Please Verify Your Email',
            html,
        });
    },

    /**
     * Email Verification (standalone, without welcome message)
     */
    async sendVerification(user, verificationToken) {
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
        const html = wrapInTemplate(`
            <h2>Verify Your Email</h2>
            <p>Hi ${user.name || 'there'}, please click the button below to verify your email address:</p>
            <p style="text-align: center;">
                <a href="${verificationUrl}" class="btn">Verify Email</a>
            </p>
            <p style="font-size: 13px; color: #999;">
                Or copy this link: <a href="${verificationUrl}">${verificationUrl}</a>
            </p>
        `);

        return this.send({
            to: user.email,
            subject: 'Verify Your Email — HTW Furniture',
            html,
        });
    },

    /**
     * Password Reset
     */
    async sendPasswordReset(user, resetToken) {
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        const html = wrapInTemplate(`
            <h2>Password Reset Request</h2>
            <p>Hi ${user.name || 'there'}, we received a request to reset your password.</p>
            <p style="text-align: center;">
                <a href="${resetUrl}" class="btn">Reset Password</a>
            </p>
            <div class="warning">
                <p>⏱ This link expires in <strong>1 hour</strong>.</p>
            </div>
            <p style="font-size: 13px; color: #999;">
                If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
            </p>
        `);

        return this.send({
            to: user.email,
            subject: 'Reset Your Password — HTW Furniture',
            html,
        });
    },

    /**
     * Order Confirmation
     */
    async sendOrderConfirmation(order, userEmail, userName) {
        const html = wrapInTemplate(`
            <h2>Order Confirmed! ✅</h2>
            <p>Hi ${userName || 'there'}, your order <strong>#${order.order_number}</strong> has been placed successfully.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 8px 0; color: #999;">Order Number</td>
                    <td style="padding: 8px 0; font-weight: 600; text-align: right;">#${order.order_number}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 8px 0; color: #999;">Total</td>
                    <td style="padding: 8px 0; font-weight: 600; text-align: right;">$${Number(order.total_amount).toFixed(2)}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #999;">Status</td>
                    <td style="padding: 8px 0; font-weight: 600; text-align: right; text-transform: capitalize;">${order.status}</td>
                </tr>
            </table>
            <p style="text-align: center;">
                <a href="${process.env.CLIENT_URL}/dashboard/orders" class="btn">View Order</a>
            </p>
        `);

        return this.send({
            to: userEmail,
            subject: `Order #${order.order_number} Confirmed — HTW Furniture`,
            html,
        });
    },

    /**
     * Admin/Staff Invitation
     */
    async sendAdminInvite({ email, name, role, inviteUrl }) {
        const html = wrapInTemplate(`
            <h2>You're Invited! 🎉</h2>
            <p>Hi ${name || 'there'}, you've been invited to join the HTW Furniture admin team as <strong>${role}</strong>.</p>
            <p style="text-align: center;">
                <a href="${inviteUrl}" class="btn">Set Up Your Account</a>
            </p>
            <div class="warning">
                <p>⏱ This invitation expires in <strong>48 hours</strong>.</p>
            </div>
        `);

        return this.send({
            to: email,
            subject: "You've been invited to HTW Furniture Admin",
            html,
        });
    },

    /**
     * Low Stock Alert (Admin Notification)
     */
    async sendLowStockAlert({ adminEmail, products }) {
        const items = products
            .map(
                (p) =>
                    `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${p.name}</td><td style="padding:8px;border-bottom:1px solid #eee;">${p.sku}</td><td style="padding:8px;border-bottom:1px solid #eee;color:#dc3545;font-weight:600;">${p.stock}</td></tr>`
            )
            .join('');

        const html = wrapInTemplate(`
            <h2>⚠️ Low Stock Alert</h2>
            <p>The following products are running low on stock:</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                <thead>
                    <tr style="background:#f8f9fa;">
                        <th style="padding:10px 8px;text-align:left;font-size:13px;">Product</th>
                        <th style="padding:10px 8px;text-align:left;font-size:13px;">SKU</th>
                        <th style="padding:10px 8px;text-align:left;font-size:13px;">Stock</th>
                    </tr>
                </thead>
                <tbody>${items}</tbody>
            </table>
            <p style="text-align: center;">
                <a href="${process.env.CLIENT_URL}/admin/inventory" class="btn">Manage Inventory</a>
            </p>
        `);

        return this.send({
            to: adminEmail,
            subject: '⚠️ Low Stock Alert — HTW Furniture',
            html,
        });
    },

    /**
     * Order Status Update
     */
    async sendOrderStatusUpdate({ email, name, orderNumber, status, trackingNumber }) {
        const statusMessages = {
            confirmed: 'Your order has been confirmed and is being prepared.',
            processing: 'Your order is now being processed.',
            shipped: `Your order has been shipped!${trackingNumber ? ` Tracking number: <strong>${trackingNumber}</strong>` : ''}`,
            delivered: 'Your order has been delivered. We hope you love it!',
            cancelled: 'Your order has been cancelled.',
            refunded: 'Your order has been refunded. The amount will be returned to your payment method.',
        };

        const html = wrapInTemplate(`
            <h2>Order Update</h2>
            <p>Hi ${name || 'there'}, here's an update on your order <strong>#${orderNumber}</strong>:</p>
            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
                <p style="margin: 0; font-size: 18px; font-weight: 600; text-transform: capitalize; color: #0369a1;">${status}</p>
            </div>
            <p>${statusMessages[status] || `Your order status has been updated to: ${status}.`}</p>
            <p style="text-align: center;">
                <a href="${process.env.CLIENT_URL}/dashboard/orders" class="btn">View Order</a>
            </p>
        `);

        return this.send({
            to: email,
            subject: `Order #${orderNumber} — ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            html,
        });
    },
};

module.exports = emailService;
