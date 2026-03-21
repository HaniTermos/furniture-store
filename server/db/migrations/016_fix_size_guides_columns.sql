-- 016_fix_size_guides_columns.sql
ALTER TABLE size_guides ADD COLUMN IF NOT EXISTS content_html TEXT;
ALTER TABLE size_guides ADD COLUMN IF NOT EXISTS content_json JSONB;
ALTER TABLE size_guides ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
