-- server/db/migrations/add_product_fields.sql
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'products'
        AND column_name = 'is_featured'
) THEN
ALTER TABLE products
ADD COLUMN is_featured BOOLEAN DEFAULT false;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'products'
        AND column_name = 'is_new'
) THEN
ALTER TABLE products
ADD COLUMN is_new BOOLEAN DEFAULT false;
END IF;
END $$;