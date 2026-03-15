-- Migration: Variant Matrix System
-- Replaces configuration_options with full variant support (SKU, price, stock per combination)

-- 1. Global Attribute Pool
CREATE TABLE IF NOT EXISTS attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(20) CHECK (type IN ('select', 'color', 'image')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Attribute Options (Red, Blue, 100cm, etc.)
CREATE TABLE IF NOT EXISTS attribute_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attribute_id UUID REFERENCES attributes(id) ON DELETE CASCADE,
    value VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    color_hex VARCHAR(7),
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    UNIQUE(attribute_id, slug)
);

-- 3. Product Variants (the matrix)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_threshold INTEGER DEFAULT 5,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Variant Composition (which options make this variant)
CREATE TABLE IF NOT EXISTS variant_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    attribute_id UUID REFERENCES attributes(id),
    option_id UUID REFERENCES attribute_options(id),
    UNIQUE(variant_id, attribute_id)
);

-- 5. Product-Attribute Link (which attrs this product uses)
CREATE TABLE IF NOT EXISTS product_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    attribute_id UUID REFERENCES attributes(id),
    is_required BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    UNIQUE(product_id, attribute_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id, is_active);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_variant_attrs_lookup ON variant_attributes(variant_id, attribute_id);
CREATE INDEX IF NOT EXISTS idx_attr_options ON attribute_options(attribute_id);
CREATE INDEX IF NOT EXISTS idx_product_attrs ON product_attributes(product_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
CREATE TRIGGER update_product_variants_updated_at
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample attributes for testing
INSERT INTO attributes (name, slug, type, sort_order) VALUES
    ('Color', 'color', 'color', 1),
    ('Size', 'size', 'select', 2),
    ('Material', 'material', 'select', 3)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample options
INSERT INTO attribute_options (attribute_id, value, slug, color_hex, sort_order)
SELECT a.id, 'Red', 'red', '#FF0000', 1
FROM attributes a WHERE a.slug = 'color'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_id, value, slug, color_hex, sort_order)
SELECT a.id, 'Blue', 'blue', '#0000FF', 2
FROM attributes a WHERE a.slug = 'color'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_id, value, slug, sort_order)
SELECT a.id, 'Small', 'small', 1
FROM attributes a WHERE a.slug = 'size'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_id, value, slug, sort_order)
SELECT a.id, 'Large', 'large', 2
FROM attributes a WHERE a.slug = 'size'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_id, value, slug, sort_order)
SELECT a.id, 'Oak', 'oak', 1
FROM attributes a WHERE a.slug = 'material'
ON CONFLICT DO NOTHING;

INSERT INTO attribute_options (attribute_id, value, slug, sort_order)
SELECT a.id, 'Walnut', 'walnut', 2
FROM attributes a WHERE a.slug = 'material'
ON CONFLICT DO NOTHING;

