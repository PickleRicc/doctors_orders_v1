-- Migration: Create Templates Table
-- Description: Sets up the initial templates table for storing SOAP note templates
-- Each template is associated with a user and contains SOAP sections

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create Templates Table
CREATE TABLE IF NOT EXISTS templates (
  id BIGSERIAL PRIMARY KEY,
  template_key UUID NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  body_region VARCHAR(100) NOT NULL,
  session_type VARCHAR(100) NOT NULL,
  subjective TEXT NOT NULL,
  objective TEXT NOT NULL,
  assessment TEXT NOT NULL,
  plan TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_example BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Add search capabilities
  CONSTRAINT templates_name_check CHECK (char_length(name) > 0)
);

-- Create index for faster querying by user_id
CREATE INDEX templates_user_id_idx ON templates(user_id);
CREATE INDEX templates_body_region_idx ON templates(body_region);
CREATE INDEX templates_session_type_idx ON templates(session_type);

-- Enable Row Level Security
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Create policies for row level security
-- Users can only see their own templates and default templates
CREATE POLICY templates_select_policy ON templates 
  FOR SELECT 
  USING (user_id = auth.uid() OR is_default = true);

-- Users can only insert their own templates
CREATE POLICY templates_insert_policy ON templates 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Users can only update their own templates, not default templates
CREATE POLICY templates_update_policy ON templates 
  FOR UPDATE 
  USING (user_id = auth.uid() AND is_default = false);

-- Users can only delete their own templates, not default templates
CREATE POLICY templates_delete_policy ON templates 
  FOR DELETE 
  USING (user_id = auth.uid() AND is_default = false);

-- Add default templates (optional, can be done in application code)
-- INSERT INTO templates (template_key, user_id, name, body_region, session_type, subjective, objective, assessment, plan, is_default)
-- VALUES (...);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update the updated_at timestamp
CREATE TRIGGER templates_updated_at
BEFORE UPDATE ON templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Add a comment to the table
COMMENT ON TABLE templates IS 'Stores SOAP note templates for physical therapy documentation';
