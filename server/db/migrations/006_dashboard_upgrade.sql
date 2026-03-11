-- 006_dashboard_upgrade.sql
-- 1. CATEGORIES TABLE (Enhance Existing)
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS meta_description TEXT;
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
-- 2. TAGS TABLE
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS product_tags (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);
-- 3. ATTRIBUTES & ATTRIBUTE VALUES
CREATE TABLE IF NOT EXISTS attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(20) CHECK (type IN ('color', 'text', 'image', 'select')),
    is_visible_on_product BOOLEAN DEFAULT true,
    is_used_for_variations BOOLEAN DEFAULT false,
    is_filterable BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS attribute_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attribute_id UUID REFERENCES attributes(id) ON DELETE CASCADE,
    value VARCHAR(255) NOT NULL,
    color_hex VARCHAR(7),
    image_url TEXT,
    slug VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    UNIQUE(attribute_id, value)
);
CREATE TABLE IF NOT EXISTS product_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    attribute_id UUID REFERENCES attributes(id) ON DELETE CASCADE,
    value_id UUID REFERENCES attribute_values(id) ON DELETE
    SET NULL,
        custom_value TEXT,
        UNIQUE(product_id, attribute_id)
);
-- 4. SIZE GUIDES
CREATE TABLE IF NOT EXISTS size_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    content JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 5. ENHANCED PRODUCTS TABLE
ALTER TABLE products
ADD COLUMN IF NOT EXISTS size_guide_id UUID REFERENCES size_guides(id) ON DELETE
SET NULL;
ALTER TABLE products
ADD COLUMN IF NOT EXISTS material VARCHAR(255);
ALTER TABLE products
ADD COLUMN IF NOT EXISTS warranty VARCHAR(255);
ALTER TABLE products
ADD COLUMN IF NOT EXISTS warranty_period INTEGER;
ALTER TABLE products
ADD COLUMN IF NOT EXISTS care_instructions TEXT;
ALTER TABLE products
ADD COLUMN IF NOT EXISTS shipping_info TEXT;
ALTER TABLE products
ADD COLUMN IF NOT EXISTS meta_keywords TEXT;
ALTER TABLE products
ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE products
ADD COLUMN IF NOT EXISTS sku_prefix VARCHAR(50);
ALTER TABLE products
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;
-- 6. PRODUCT GALLERY
CREATE TABLE IF NOT EXISTS product_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 7. REVIEWS TABLE (Enhance existing)
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS admin_reply TEXT;
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS admin_reply_at TIMESTAMP;
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS images JSONB;
-- 8. CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'unread' CHECK (
        status IN ('unread', 'read', 'replied', 'archived')
    ),
    admin_reply TEXT,
    replied_at TIMESTAMP,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages(status);
-- 9. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at);
-- 10. CURRENCIES
CREATE TABLE IF NOT EXISTS currencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    exchange_rate DECIMAL(15, 6) NOT NULL,
    is_base BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    decimal_places INTEGER DEFAULT 2,
    symbol_position VARCHAR(10) DEFAULT 'before',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO currencies (code, name, symbol, exchange_rate, is_base)
VALUES ('USD', 'US Dollar', '$', 1.000000, true),
    ('EUR', 'Euro', '€', 0.920000, false),
    ('GBP', 'British Pound', '£', 0.790000, false),
    ('CAD', 'Canadian Dollar', 'C$', 1.350000, false),
    (
        'AUD',
        'Australian Dollar',
        'A$',
        1.520000,
        false
    ) ON CONFLICT (code) DO NOTHING;
-- 11. EXPORT LOGS
CREATE TABLE IF NOT EXISTS export_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE
    SET NULL,
        type VARCHAR(50) NOT NULL,
        format VARCHAR(10) NOT NULL,
        filters JSONB,
        file_url TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
);