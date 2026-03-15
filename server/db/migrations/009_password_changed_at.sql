-- Migration 009: Add password_changed_at column for JWT token invalidation
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP;
