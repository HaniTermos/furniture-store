-- 007_site_settings.sql
CREATE TABLE IF NOT EXISTS site_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Seed initial settings
INSERT INTO site_settings (key, value, description)
VALUES (
        'store_info',
        '{"name": "HTW Furniture", "url": "https://htwfurniture.com", "email": "support@htwfurniture.com", "phone": "+1 (555) 000-0000", "address": "123 Furniture Lane, Design District"}',
        'Basic store identification and contact details'
    ),
    (
        'shipping',
        '{"free_threshold": 100, "default_rate": 9.99}',
        'Default shipping rules'
    ),
    (
        'security',
        '{"account_lockout": true, "email_verification": true, "max_failed_attempts": 5, "lockout_duration_mins": 15}',
        'Security and authentication policies'
    ) ON CONFLICT (key) DO NOTHING;