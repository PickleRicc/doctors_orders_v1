-- Add structured_notes JSONB column to sessions table
-- This will store the filled structured data from templates

ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS structured_notes JSONB;

-- Add an index for efficient querying of structured notes
CREATE INDEX IF NOT EXISTS idx_sessions_structured_notes 
ON sessions USING GIN (structured_notes);

-- Add a comment to document the column purpose
COMMENT ON COLUMN sessions.structured_notes IS 'Stores filled structured data from templates as JSON for dynamic rendering';
