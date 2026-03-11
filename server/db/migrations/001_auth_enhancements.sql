-- ═══════════════════════════════════════════════════════════════
-- Migration 001: Auth Enhancements
-- Adds Google OAuth, email verification, password reset,
-- account lockout, 2FA preparedness, and super_admin role.
-- ═══════════════════════════════════════════════════════════════
-- 1. Update role CHECK constraint to include super_admin
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
ADD CONSTRAINT users_role_check CHECK (
        role IN ('super_admin', 'admin', 'manager', 'user')
    );
-- 2. Add new columns
ALTER TABLE users
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login_ip INET;
ALTER TABLE users
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;
ALTER TABLE users
ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);
ALTER TABLE users
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE users
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
-- 3. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);