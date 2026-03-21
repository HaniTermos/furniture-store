-- Migration: Add image_alt to product_variants
-- Note: image_url already exists in product_variants from 011_variants_system.sql

ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS image_alt VARCHAR(255);
