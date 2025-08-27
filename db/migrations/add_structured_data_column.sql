-- Add structured_data column to templates table
ALTER TABLE templates ADD COLUMN IF NOT EXISTS structured_data JSONB;

-- Comment on the structured_data column
COMMENT ON COLUMN templates.structured_data IS 'Structured JSON data for the template with consistent schema across templates';
