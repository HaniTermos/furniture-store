-- server/db/migrations/008_update_attribute_type_check.sql
-- First, drop the existing constraint
ALTER TABLE attributes DROP CONSTRAINT IF EXISTS attributes_type_check;
-- Add the new constraint with 'radio' and 'button' included
ALTER TABLE attributes
ADD CONSTRAINT attributes_type_check CHECK (
        type IN (
            'color',
            'text',
            'image',
            'select',
            'radio',
            'button'
        )
    );