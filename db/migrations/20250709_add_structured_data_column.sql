-- Add structured_data column to templates table
ALTER TABLE templates ADD COLUMN structured_data JSONB DEFAULT '{}'::jsonb;

-- Add comment explaining the purpose of the structured_data column
COMMENT ON COLUMN templates.structured_data IS 'JSON structure containing structured representation of all SOAP note sections for programmatic rendering';
