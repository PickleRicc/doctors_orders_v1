/**
 * Migration: Enhance Audit Logging
 * Phase 3 - Database & Session Security
 * 
 * Adds enhanced audit logging fields for HIPAA compliance
 * - IP address tracking
 * - User agent logging
 * - Change tracking
 * - Resource type
 */

-- Add new columns to audit_events table
ALTER TABLE phi.audit_events 
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45) NULL,
ADD COLUMN IF NOT EXISTS user_agent TEXT NULL,
ADD COLUMN IF NOT EXISTS changes JSONB NULL,
ADD COLUMN IF NOT EXISTS resource VARCHAR(50) NOT NULL DEFAULT 'encounter';

-- Add comment for documentation
COMMENT ON COLUMN phi.audit_events.ip_address IS 'IP address of the client making the request';
COMMENT ON COLUMN phi.audit_events.user_agent IS 'User agent string from the client browser';
COMMENT ON COLUMN phi.audit_events.changes IS 'JSON object tracking what changed (for UPDATE events)';
COMMENT ON COLUMN phi.audit_events.resource IS 'Type of resource accessed (encounter, template, etc.)';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_events_resource 
ON phi.audit_events(resource);

CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp 
ON phi.audit_events(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_events_actor_timestamp 
ON phi.audit_events(actor_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_events_ip 
ON phi.audit_events(ip_address) 
WHERE ip_address IS NOT NULL;

-- Create a view for easy audit log querying
CREATE OR REPLACE VIEW phi.audit_log_summary AS
SELECT 
    ae.id,
    ae.encounter_id,
    ae.actor_id,
    ae.event,
    ae.resource,
    ae.ip_address,
    ae.user_agent,
    ae.changes,
    ae.timestamp,
    ae.created_at,
    e.session_title,
    e.template_type
FROM phi.audit_events ae
LEFT JOIN phi.encounters e ON ae.encounter_id = e.id
ORDER BY ae.timestamp DESC;

-- Grant appropriate permissions
GRANT SELECT ON phi.audit_log_summary TO authenticated;

-- Add trigger to prevent audit log modification
CREATE OR REPLACE FUNCTION phi.protect_audit_logs()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Audit logs cannot be modified or deleted';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_modification
    BEFORE UPDATE OR DELETE ON phi.audit_events
    FOR EACH ROW
    EXECUTE FUNCTION phi.protect_audit_logs();

-- Verify migration
DO $$
BEGIN
    -- Check if all columns exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'phi' 
        AND table_name = 'audit_events' 
        AND column_name = 'ip_address'
    ) THEN
        RAISE EXCEPTION 'Migration failed: ip_address column not found';
    END IF;
    
    RAISE NOTICE 'Migration completed successfully!';
END $$;


