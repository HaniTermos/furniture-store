-- ═══════════════════════════════════════════════════════════════
-- Migration 004: Email Templates
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables JSONB DEFAULT '[]',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at BEFORE
UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Seed default templates
INSERT INTO email_templates (
        name,
        subject,
        body_html,
        body_text,
        variables,
        is_default
    )
VALUES (
        'welcome',
        'Welcome to HTW Furniture!',
        '<h1>Welcome, {{name}}!</h1><p>Thank you for joining HTW Furniture. Please verify your email by clicking the link below:</p><a href="{{verification_url}}">Verify Email</a>',
        'Welcome, {{name}}! Verify your email: {{verification_url}}',
        '["name", "verification_url"]',
        true
    ),
    (
        'password_reset',
        'Reset Your Password',
        '<h1>Password Reset</h1><p>Hi {{name}}, you requested a password reset. Click the link below (expires in 1 hour):</p><a href="{{reset_url}}">Reset Password</a><p>If you did not request this, please ignore this email.</p>',
        'Hi {{name}}, reset your password: {{reset_url}}',
        '["name", "reset_url"]',
        true
    ),
    (
        'order_confirmation',
        'Order #{{order_number}} Confirmed',
        '<h1>Order Confirmed!</h1><p>Hi {{name}}, your order #{{order_number}} has been placed successfully.</p><p>Total: ${{total}}</p>',
        'Hi {{name}}, your order #{{order_number}} has been placed. Total: ${{total}}',
        '["name", "order_number", "total"]',
        true
    ),
    (
        'admin_invite',
        'You''ve been invited to HTW Admin',
        '<h1>Admin Invitation</h1><p>Hi {{name}}, you''ve been invited as a {{role}} at HTW Furniture.</p><a href="{{invite_url}}">Set Up Your Account</a>',
        'Hi {{name}}, you''ve been invited as {{role}}. Set up: {{invite_url}}',
        '["name", "role", "invite_url"]',
        true
    ) ON CONFLICT (name) DO NOTHING;