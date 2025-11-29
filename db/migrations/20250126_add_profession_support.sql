-- Migration: Add Profession Support to Azure PostgreSQL (PHI Database)
-- Description: Adds profession column to phi.encounters table to track which profession created each encounter
-- This enables complete separation between Physical Therapy and Chiropractic templates/sessions
-- 
-- DATABASE: Azure PostgreSQL (PHI database)
-- SCHEMA: phi
-- NOT Supabase (Supabase is for auth/non-PHI only)

-- Add profession column to encounters table
-- Default to 'physical_therapy' for backward compatibility with existing data
ALTER TABLE phi.encounters 
ADD COLUMN IF NOT EXISTS profession VARCHAR(50) DEFAULT 'physical_therapy';

-- Create index for faster querying by profession
CREATE INDEX IF NOT EXISTS encounters_profession_idx ON phi.encounters(profession);

-- Update any NULL values to default (in case of partial migration)
UPDATE phi.encounters 
SET profession = 'physical_therapy' 
WHERE profession IS NULL;

-- Add check constraint to ensure valid profession values
-- First drop if exists (in case re-running migration)
ALTER TABLE phi.encounters 
DROP CONSTRAINT IF EXISTS encounters_profession_check;

ALTER TABLE phi.encounters 
ADD CONSTRAINT encounters_profession_check 
CHECK (profession IN ('physical_therapy', 'chiropractic'));

-- Comment on the column for documentation
COMMENT ON COLUMN phi.encounters.profession IS 'The profession type that created this encounter: physical_therapy or chiropractic';

-- =====================================================
-- Also add profession to custom_templates table
-- =====================================================

ALTER TABLE phi.custom_templates 
ADD COLUMN IF NOT EXISTS profession VARCHAR(50) DEFAULT 'physical_therapy';

CREATE INDEX IF NOT EXISTS custom_templates_profession_idx ON phi.custom_templates(profession);

UPDATE phi.custom_templates 
SET profession = 'physical_therapy' 
WHERE profession IS NULL;

ALTER TABLE phi.custom_templates 
DROP CONSTRAINT IF EXISTS custom_templates_profession_check;

ALTER TABLE phi.custom_templates 
ADD CONSTRAINT custom_templates_profession_check 
CHECK (profession IN ('physical_therapy', 'chiropractic'));

COMMENT ON COLUMN phi.custom_templates.profession IS 'The profession type this template belongs to: physical_therapy or chiropractic';

-- =====================================================
-- Template Types Reference:
-- =====================================================
-- PT templates: knee, shoulder, back, neck, hip, ankle_foot, daily-note, discharge
-- Chiro templates: cervical-adjustment, thoracic-adjustment, lumbar-adjustment, 
--                  full-spine-adjustment, extremity-adjustment, maintenance-care
-- Custom templates: custom-{uuid} (filtered by profession column)
