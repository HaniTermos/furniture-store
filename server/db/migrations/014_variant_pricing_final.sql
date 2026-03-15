-- Migration: Variant Pricing Final
-- Adds has_variants flag, variant_id to carts and orders, and price range function

-- 1. Add has_variants to products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS has_variants BOOLEAN DEFAULT false;

-- 2. Add variant_id to cart_items
ALTER TABLE cart_items
ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE;

-- 3. Add variant_id to order_items
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL;

-- 4. Create function to get product price range
CREATE OR REPLACE FUNCTION get_product_price_range(p_id UUID)
RETURNS json AS $$
DECLARE
    min_p DECIMAL(10,2);
    max_p DECIMAL(10,2);
BEGIN
    SELECT MIN(price), MAX(price) INTO min_p, max_p
    FROM product_variants
    WHERE product_id = p_id AND is_active = true;
    
    RETURN json_build_object('min', min_p, 'max', max_p);
END;
$$ LANGUAGE plpgsql;
