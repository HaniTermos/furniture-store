-- Fix: Add missing sort_order column to product_attributes if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'product_attributes' AND column_name = 'sort_order'
    ) THEN
        ALTER TABLE product_attributes ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
END $$;
