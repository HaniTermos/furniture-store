-- Migration 010: Add stock_quantity and stock_status to products table
-- For non-configurable products that don't use configuration_values for stock tracking

ALTER TABLE products
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS stock_status VARCHAR(20) DEFAULT 'in_stock';

-- Add CHECK constraint for stock_status (only if not already present)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'products_stock_status_check'
    ) THEN
        ALTER TABLE products
        ADD CONSTRAINT products_stock_status_check
        CHECK (stock_status IN ('in_stock', 'out_of_stock', 'low_stock'));
    END IF;
END $$;

-- Set sensible defaults for existing non-configurable products
UPDATE products
SET stock_quantity = 50, stock_status = 'in_stock'
WHERE is_configurable = false AND stock_quantity = 0;
