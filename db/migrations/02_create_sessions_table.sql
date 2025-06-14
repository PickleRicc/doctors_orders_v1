-- Migration: Create Sessions Table
-- Description: Sets up the sessions table for storing anonymous session data
-- Each session has a TTL of 12 hours for privacy

-- Create Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id BIGSERIAL PRIMARY KEY,
  session_key UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  body_region VARCHAR(100) NOT NULL,
  session_type VARCHAR(100) NOT NULL,
  template_id UUID REFERENCES templates(template_key),
  audio_url TEXT,
  transcript TEXT,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, completed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '12 hours')
);

-- Create index for faster querying by user_id
CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE INDEX sessions_expires_at_idx ON sessions(expires_at);
CREATE INDEX sessions_body_region_idx ON sessions(body_region);
CREATE INDEX sessions_session_type_idx ON sessions(session_type);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for row level security
-- Users can only see their own sessions
CREATE POLICY sessions_select_policy ON sessions 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Users can only insert their own sessions
CREATE POLICY sessions_insert_policy ON sessions 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Users can only update their own sessions
CREATE POLICY sessions_update_policy ON sessions 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Users can only delete their own sessions
CREATE POLICY sessions_delete_policy ON sessions 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update the updated_at timestamp
CREATE TRIGGER sessions_updated_at
BEFORE UPDATE ON sessions
FOR EACH ROW
EXECUTE FUNCTION update_session_updated_at();

-- Create a function to delete expired sessions
CREATE OR REPLACE FUNCTION delete_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule the function to run every hour
SELECT cron.schedule('0 * * * *', $$
  SELECT delete_expired_sessions();
$$);

-- Add a comment to the table
COMMENT ON TABLE sessions IS 'Stores anonymous PT session data with 12-hour TTL for privacy';
