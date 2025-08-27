-- Migration to fix template schema inconsistencies
-- This migration:
-- 1. Adds structured_data column to templates table
-- 2. Creates a new templates table with UUID as primary key
-- 3. Migrates existing data to the new schema
-- 4. Updates sessions references
-- 5. Replaces the old table with the new one

-- Start a transaction to ensure all operations succeed or fail together
BEGIN;

-- First, add structured_data column to the existing templates table if it doesn't exist
ALTER TABLE templates ADD COLUMN IF NOT EXISTS structured_data JSONB;

-- Create a temporary table for the new templates structure with UUIDs
CREATE TABLE templates_new (
  id UUID PRIMARY KEY,
  template_key UUID NOT NULL,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  body_region TEXT NOT NULL,
  session_type TEXT NOT NULL,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  structured_data JSONB,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Copy data from the old table to the new one, generating UUIDs for the primary key
INSERT INTO templates_new (
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
)
SELECT 
  gen_random_uuid(), -- New UUID primary key
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

-- Create a mapping table to track old IDs to new UUIDs (for updating sessions)
CREATE TEMP TABLE template_id_mapping AS
SELECT t.id AS old_id, tn.id AS new_id
FROM templates t
JOIN templates_new tn ON t.name = tn.name AND t.body_region = tn.body_region AND t.session_type = tn.session_type;

-- Drop existing foreign key constraint from sessions
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_template_id_fkey;

-- Create a new column in sessions for the UUID foreign key
ALTER TABLE sessions ADD COLUMN template_id_new UUID;

-- Update the new column with mapped UUIDs
UPDATE sessions s
SET template_id_new = m.new_id
FROM template_id_mapping m
WHERE s.template_id::text = m.old_id::text;

-- Drop the old template_id column and rename the new one
ALTER TABLE sessions DROP COLUMN template_id;
ALTER TABLE sessions RENAME COLUMN template_id_new TO template_id;

-- Add the foreign key constraint back
ALTER TABLE sessions ADD CONSTRAINT sessions_template_id_fkey
FOREIGN KEY (template_id) REFERENCES templates_new(id) ON DELETE SET NULL;

-- Swap the tables
ALTER TABLE templates RENAME TO templates_old;
ALTER TABLE templates_new RENAME TO templates;

-- Create indexes that existed on the original table
CREATE INDEX IF NOT EXISTS templates_user_id_idx ON templates(user_id);
CREATE INDEX IF NOT EXISTS templates_template_key_idx ON templates(template_key);

-- If you're comfortable, drop the old table
-- DROP TABLE templates_old;
-- If not comfortable yet, comment the line above and uncomment this one:
-- You can drop it later with: DROP TABLE templates_old;

COMMIT;
