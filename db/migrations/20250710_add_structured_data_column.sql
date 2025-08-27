-- Migration: Add structured_data column to sessions table
-- This column will store the structured data extracted from SOAP notes
-- The data will be stored as JSONB for efficient querying and flexibility

-- Add the column
ALTER TABLE sessions ADD COLUMN structured_data JSONB;

-- Add an index for more efficient querying (optional)
CREATE INDEX idx_sessions_structured_data ON sessions USING GIN (structured_data);

-- Comment explaining the column
COMMENT ON COLUMN sessions.structured_data IS 'Structured data extracted from SOAP notes including ROM values, MMT scores, and other measurements in JSON format.';
