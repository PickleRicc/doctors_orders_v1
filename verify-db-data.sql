-- ============================================
-- Azure PostgreSQL Database Verification Script
-- Verify SOAP notes are being saved correctly
-- ============================================

-- 1. Check total number of encounters
SELECT 
    COUNT(*) as total_encounters,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
    COUNT(CASE WHEN status = 'final' THEN 1 END) as final_count
FROM phi.encounters;

-- 2. View recent encounters with basic info
SELECT 
    id,
    template_type,
    session_title,
    status,
    created_at,
    updated_at,
    CASE 
        WHEN soap IS NOT NULL THEN 'Yes'
        ELSE 'No'
    END as has_soap_data,
    CASE 
        WHEN transcript_text IS NOT NULL THEN 'Yes'
        ELSE 'No'
    END as has_transcript
FROM phi.encounters
ORDER BY created_at DESC
LIMIT 10;

-- 3. View SOAP data structure (prettified JSON)
SELECT 
    id,
    template_type,
    session_title,
    jsonb_pretty(soap) as soap_data_formatted
FROM phi.encounters
WHERE soap IS NOT NULL
ORDER BY created_at DESC
LIMIT 3;

-- 4. Check what keys exist in SOAP data
SELECT 
    id,
    template_type,
    jsonb_object_keys(soap) as soap_sections
FROM phi.encounters
WHERE soap IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- 5. Extract specific SOAP sections
SELECT 
    id,
    template_type,
    session_title,
    soap->'subjective' as subjective_data,
    soap->'objective' as objective_data,
    soap->'assessment' as assessment_data,
    soap->'plan' as plan_data
FROM phi.encounters
WHERE soap IS NOT NULL
ORDER BY created_at DESC
LIMIT 3;

-- 6. Check objective table structure
SELECT 
    id,
    template_type,
    jsonb_array_length(soap->'objective'->'rows') as objective_row_count,
    soap->'objective'->'rows' as objective_rows
FROM phi.encounters
WHERE soap->'objective'->'rows' IS NOT NULL
ORDER BY created_at DESC
LIMIT 3;

-- 7. View transcript data
SELECT 
    id,
    template_type,
    LEFT(transcript_text, 200) as transcript_preview,
    LENGTH(transcript_text) as transcript_length
FROM phi.encounters
WHERE transcript_text IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- 8. Check audit trail
SELECT 
    ae.id,
    ae.encounter_id,
    ae.event,
    ae.created_at,
    e.template_type,
    e.session_title
FROM phi.audit_events ae
LEFT JOIN phi.encounters e ON ae.encounter_id = e.id
ORDER BY ae.created_at DESC
LIMIT 10;

-- 9. Find most recent encounter with full details
SELECT 
    id,
    org_id,
    clinician_id,
    template_type,
    session_title,
    status,
    created_at,
    updated_at,
    finalized_at,
    jsonb_pretty(soap) as soap_data
FROM phi.encounters
ORDER BY created_at DESC
LIMIT 1;

-- 10. Check for any encounters missing SOAP data
SELECT 
    id,
    template_type,
    session_title,
    status,
    created_at
FROM phi.encounters
WHERE soap IS NULL OR soap = '{}'::jsonb
ORDER BY created_at DESC;

-- 11. Verify data types and structure
SELECT 
    id,
    template_type,
    jsonb_typeof(soap) as soap_type,
    jsonb_typeof(soap->'subjective') as subjective_type,
    jsonb_typeof(soap->'objective') as objective_type,
    jsonb_typeof(soap->'assessment') as assessment_type,
    jsonb_typeof(soap->'plan') as plan_type
FROM phi.encounters
WHERE soap IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- 12. Count encounters by template type
SELECT 
    template_type,
    COUNT(*) as count,
    COUNT(CASE WHEN soap IS NOT NULL THEN 1 END) as with_soap_data
FROM phi.encounters
GROUP BY template_type
ORDER BY count DESC;

-- 13. Check for the test encounter from test-full-flow.js
-- (Look for "Test Knee Evaluation" in session_title)
SELECT 
    id,
    template_type,
    session_title,
    status,
    created_at,
    jsonb_pretty(soap) as soap_data
FROM phi.encounters
WHERE session_title LIKE '%Test%'
ORDER BY created_at DESC
LIMIT 3;
