-- Migration: Add template_type to sessions table
-- Description: Adds template_type column to replace template_id foreign key dependency
-- This supports the refactor from database templates to code-based template hooks

-- Add template_type column to sessions table
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS template_type VARCHAR(50);

-- Set default template_type based on body_region for existing sessions
UPDATE sessions 
SET template_type = body_region 
WHERE template_type IS NULL;

-- Add index for efficient querying by template_type
CREATE INDEX IF NOT EXISTS idx_sessions_template_type 
ON sessions (template_type);

-- Add comment to document the column purpose
COMMENT ON COLUMN sessions.template_type IS 'Template type identifier (knee, shoulder, back, etc.) for code-based template system';

-- Update the sessions table to make template_id nullable (prepare for removal)
-- We'll keep it for now to avoid breaking existing functionality during transition
ALTER TABLE sessions 
ALTER COLUMN template_id DROP NOT NULL;
