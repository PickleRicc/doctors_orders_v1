-- Migration: Transition from database templates to template hooks
-- Description: Safely migrates existing data and prepares for template system removal
-- This migration supports the refactor from database templates to code-based template hooks

-- Step 1: Ensure all sessions have template_type set
-- Update any sessions that don't have template_type based on their body_region
UPDATE sessions 
SET template_type = CASE 
  WHEN body_region = 'knee' THEN 'knee'
  WHEN body_region = 'shoulder' THEN 'shoulder'
  WHEN body_region = 'back' THEN 'back'
  WHEN body_region = 'neck' THEN 'neck'
  WHEN body_region = 'hip' THEN 'hip'
  WHEN body_region = 'ankle' OR body_region = 'foot' OR body_region = 'ankle_foot' THEN 'ankle_foot'
  ELSE body_region -- fallback to body_region value
END
WHERE template_type IS NULL OR template_type = '';

-- Step 2: Create a backup of all existing templates before making any changes
-- This creates a JSON backup of all template data in a new table
CREATE TABLE IF NOT EXISTS template_backup AS
SELECT 
  id,
  template_key,
  user_id,
  name,
  body_region,
  session_type,
  subjective,
  objective,
  assessment,
  plan,
  structured_data,
  is_default,
  created_at,
  updated_at
FROM templates;

-- Add comment to backup table
COMMENT ON TABLE template_backup IS 'Backup of templates table before migration to template hooks system';

-- Step 3: Update any existing structured_notes to ensure they have the correct format
-- This is a safety measure to ensure data consistency
UPDATE sessions 
SET structured_notes = jsonb_build_object(
  'subjective', jsonb_build_object('type', 'wysiwyg', 'content', COALESCE(subjective, '')),
  'objective', jsonb_build_object('type', 'table', 'headers', jsonb_build_array('Test/Measurement', 'Result', 'Notes'), 'rows', jsonb_build_array()),
  'assessment', jsonb_build_object('type', 'wysiwyg', 'content', COALESCE(assessment, '')),
  'plan', jsonb_build_object('type', 'wysiwyg', 'content', COALESCE(plan, ''))
)
WHERE structured_notes IS NULL 
  AND (subjective IS NOT NULL OR objective IS NOT NULL OR assessment IS NOT NULL OR plan IS NOT NULL);

-- Step 4: Add indexes for the new template system
CREATE INDEX IF NOT EXISTS idx_sessions_template_type_user 
ON sessions (template_type, user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_created_template_type 
ON sessions (created_at DESC, template_type);

-- Step 5: Create a view that provides backward compatibility for any remaining code
-- that might still reference the old template system
CREATE OR REPLACE VIEW session_with_template_info AS
SELECT 
  s.*,
  CASE 
    WHEN s.template_type = 'knee' THEN 'Knee Evaluation'
    WHEN s.template_type = 'shoulder' THEN 'Shoulder Evaluation'
    WHEN s.template_type = 'back' THEN 'Back Evaluation'
    WHEN s.template_type = 'neck' THEN 'Neck Evaluation'
    WHEN s.template_type = 'hip' THEN 'Hip Evaluation'
    WHEN s.template_type = 'ankle_foot' THEN 'Ankle/Foot Evaluation'
    ELSE INITCAP(s.template_type) || ' Evaluation'
  END as template_name,
  s.template_type as template_key
FROM sessions s;

-- Add comment to view
COMMENT ON VIEW session_with_template_info IS 'Compatibility view providing template info for sessions using new template hook system';

-- Step 6: Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Template hook migration completed successfully';
  RAISE NOTICE 'Sessions updated: %', (SELECT COUNT(*) FROM sessions WHERE template_type IS NOT NULL);
  RAISE NOTICE 'Template backup created with % records', (SELECT COUNT(*) FROM template_backup);
END $$;
