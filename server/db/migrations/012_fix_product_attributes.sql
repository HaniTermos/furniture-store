-- Fix: Add missing is_required column to product_attributes if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'product_attributes' AND column_name = 'is_required'
    ) THEN
        ALTER TABLE product_attributes ADD COLUMN is_required BOOLEAN DEFAULT true;
    END IF;
END $$;
