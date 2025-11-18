-- Migration: Add Custom Templates System
-- Description: Creates custom_templates table for doctor-specific SOAP note templates
-- Date: 2025-01-18

-- Create custom_templates table in phi schema
CREATE TABLE IF NOT EXISTS phi.custom_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinician_id UUID NOT NULL,
  org_id UUID NOT NULL,
  
  -- Template Metadata
  name VARCHAR(255) NOT NULL,
  template_type VARCHAR(50) NOT NULL,
  body_region VARCHAR(100),
  session_type VARCHAR(100),
  description TEXT,
  
  -- SOAP Structure Configuration (JSONB)
  template_config JSONB NOT NULL,
  
  -- AI Configuration (for future Phase 2)
  ai_prompts JSONB,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  is_favorite BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT custom_templates_name_check CHECK (char_length(name) > 0),
  CONSTRAINT custom_templates_template_type_check CHECK (char_length(template_type) > 0)
);

-- Create indexes for performance
CREATE INDEX idx_custom_templates_clinician ON phi.custom_templates(clinician_id);
CREATE INDEX idx_custom_templates_clinician_active ON phi.custom_templates(clinician_id, is_active);
CREATE INDEX idx_custom_templates_favorite ON phi.custom_templates(clinician_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_custom_templates_org ON phi.custom_templates(org_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION phi.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to auto-update updated_at
CREATE TRIGGER update_custom_templates_updated_at
  BEFORE UPDATE ON phi.custom_templates
  FOR EACH ROW
  EXECUTE FUNCTION phi.update_updated_at_column();

-- Add custom_template_id column to encounters table
ALTER TABLE phi.encounters
ADD COLUMN IF NOT EXISTS custom_template_id UUID REFERENCES phi.custom_templates(id);

-- Create index on encounters.custom_template_id
CREATE INDEX IF NOT EXISTS idx_encounters_custom_template ON phi.encounters(custom_template_id);

-- Comments for documentation
COMMENT ON TABLE phi.custom_templates IS 'Stores doctor-specific custom SOAP note templates';
COMMENT ON COLUMN phi.custom_templates.template_config IS 'JSONB structure defining S/O/A/P sections and fields';
COMMENT ON COLUMN phi.custom_templates.ai_prompts IS 'Custom AI prompt overrides for advanced customization (Phase 2)';
COMMENT ON COLUMN phi.custom_templates.usage_count IS 'Tracks how many times this template has been used';

