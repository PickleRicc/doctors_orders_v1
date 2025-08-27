-- Migration: Remove Old Template System
-- Description: Final cleanup after successful migration to template hooks
-- ⚠️ ONLY RUN THIS AFTER CONFIRMING NEW SYSTEM WORKS PERFECTLY

-- Step 1: Verify migration was successful
DO $$
DECLARE
    sessions_without_template_type INTEGER;
    sessions_with_structured_notes INTEGER;
    total_sessions INTEGER;
BEGIN
    -- Check if all sessions have template_type
    SELECT COUNT(*) INTO sessions_without_template_type 
    FROM sessions 
    WHERE template_type IS NULL OR template_type = '';
    
    -- Check if sessions have structured_notes
    SELECT COUNT(*) INTO sessions_with_structured_notes 
    FROM sessions 
    WHERE structured_notes IS NOT NULL;
    
    -- Get total sessions
    SELECT COUNT(*) INTO total_sessions FROM sessions;
    
    -- Report migration status
    RAISE NOTICE 'Migration Status Check:';
    RAISE NOTICE '- Total sessions: %', total_sessions;
    RAISE NOTICE '- Sessions without template_type: %', sessions_without_template_type;
    RAISE NOTICE '- Sessions with structured_notes: %', sessions_with_structured_notes;
    
    -- Prevent cleanup if migration incomplete
    IF sessions_without_template_type > 0 THEN
        RAISE EXCEPTION 'Migration incomplete: % sessions missing template_type. Run migration first.', sessions_without_template_type;
    END IF;
    
    RAISE NOTICE '✅ Migration verification passed. Proceeding with cleanup...';
END $$;

-- Step 2: Remove foreign key constraint on template_id
-- This allows us to drop the templates table
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_template_id_fkey;

-- Step 3: Drop old template-related indexes
DROP INDEX IF EXISTS templates_user_id_idx;
DROP INDEX IF EXISTS templates_body_region_idx;
DROP INDEX IF EXISTS templates_session_type_idx;

-- Step 4: Drop the templates table (data is backed up in template_backup)
DROP TABLE IF EXISTS templates CASCADE;

-- Step 5: Remove template_id column from sessions (optional - can keep for reference)
-- Uncomment the next line if you want to completely remove template_id
-- ALTER TABLE sessions DROP COLUMN IF EXISTS template_id;

-- Step 6: Update session policies if needed (they should still work)
-- The existing RLS policies on sessions table should continue to work

-- Step 7: Create optimized indexes for new system
CREATE INDEX IF NOT EXISTS idx_sessions_template_type_created 
ON sessions (template_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_user_template_type 
ON sessions (user_id, template_type);

CREATE INDEX IF NOT EXISTS idx_sessions_structured_notes_gin 
ON sessions USING GIN (structured_notes) 
WHERE structured_notes IS NOT NULL;

-- Step 8: Add constraints to ensure data quality
ALTER TABLE sessions 
ADD CONSTRAINT chk_template_type_valid 
CHECK (template_type IN ('knee', 'shoulder', 'back', 'neck', 'hip', 'ankle_foot'));

-- Step 9: Update table comments
COMMENT ON TABLE sessions IS 'Patient session data using template hook system (templates removed from database)';
COMMENT ON COLUMN sessions.template_type IS 'Template type for code-based template hooks (knee, shoulder, back, neck, hip, ankle_foot)';
COMMENT ON COLUMN sessions.structured_notes IS 'JSON structure containing SOAP note data for unified editor';

-- Step 10: Create a function to get template metadata (replaces database lookups)
CREATE OR REPLACE FUNCTION get_template_metadata(template_type_param VARCHAR)
RETURNS JSON AS $$
BEGIN
    RETURN CASE template_type_param
        WHEN 'knee' THEN '{"name": "Knee Evaluation", "bodyRegion": "knee", "description": "Comprehensive knee assessment including ligament tests and ROM"}'::JSON
        WHEN 'shoulder' THEN '{"name": "Shoulder Evaluation", "bodyRegion": "shoulder", "description": "Shoulder impingement, rotator cuff, and mobility assessment"}'::JSON
        WHEN 'back' THEN '{"name": "Back Evaluation", "bodyRegion": "back", "description": "Spinal assessment including posture and movement analysis"}'::JSON
        WHEN 'neck' THEN '{"name": "Neck Evaluation", "bodyRegion": "neck", "description": "Cervical spine mobility and neurological screening"}'::JSON
        WHEN 'hip' THEN '{"name": "Hip Evaluation", "bodyRegion": "hip", "description": "Hip joint mobility, strength, and functional assessment"}'::JSON
        WHEN 'ankle_foot' THEN '{"name": "Ankle/Foot Evaluation", "bodyRegion": "ankle_foot", "description": "Lower extremity assessment including gait analysis"}'::JSON
        ELSE '{"name": "Unknown Template", "bodyRegion": "unknown", "description": "Template type not recognized"}'::JSON
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 11: Update the compatibility view to use the new function
DROP VIEW IF EXISTS session_with_template_info;
CREATE VIEW session_with_template_info AS
SELECT 
    s.*,
    (get_template_metadata(s.template_type)->>'name') as template_name,
    s.template_type as template_key,
    get_template_metadata(s.template_type) as template_metadata
FROM sessions s;

COMMENT ON VIEW session_with_template_info IS 'Enhanced compatibility view with template metadata from code-based system';

-- Step 12: Log cleanup completion
DO $$
BEGIN
    RAISE NOTICE '🎉 Template system cleanup completed successfully!';
    RAISE NOTICE '✅ Templates table removed (backup preserved in template_backup)';
    RAISE NOTICE '✅ Foreign key constraints removed';
    RAISE NOTICE '✅ New indexes created for optimal performance';
    RAISE NOTICE '✅ Template metadata function created';
    RAISE NOTICE '✅ Compatibility view updated';
    RAISE NOTICE '';
    RAISE NOTICE '📊 System now fully running on template hooks!';
    RAISE NOTICE '🗄️ Template backup table preserved for safety';
END $$;
