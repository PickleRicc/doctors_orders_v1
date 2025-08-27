-- Add title column to sessions table
ALTER TABLE sessions ADD COLUMN title TEXT;

-- Add comment explaining the purpose and PHI considerations
COMMENT ON COLUMN sessions.title IS 'User-defined session name. Should NOT contain PHI (patient names, identifiers, etc.)';

-- Update existing sessions to have NULL title (default behavior)
-- No action needed as new columns default to NULL in PostgreSQL
