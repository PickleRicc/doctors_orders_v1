/**
 * PHI API - Create New Encounter
 * POST /api/phi/encounters/create
 */

import { query, logAudit } from '../../../../lib/db';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      template_type, 
      session_title, 
      soap = {}, 
      transcript_text = null,
      org_id = '00000000-0000-0000-0000-000000000001',
      clinician_id = 'test-user'
    } = req.body;

    if (!template_type) {
      return res.status(400).json({ error: 'template_type is required' });
    }

    // Insert new encounter into Azure PostgreSQL
    const result = await query(
      `INSERT INTO phi.encounters 
       (org_id, clinician_id, status, soap, transcript_text, template_type, session_title, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [
        org_id,
        clinician_id,
        'draft',
        JSON.stringify(soap),
        transcript_text,
        template_type,
        session_title || `${template_type} Evaluation`
      ]
    );

    const newEncounter = result.rows[0];

    // Log audit event
    await logAudit(newEncounter.id, clinician_id, 'CREATE');

    return res.status(201).json({
      success: true,
      encounter: newEncounter
    });

  } catch (error) {
    console.error('Error creating encounter:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create encounter',
      details: error.message
    });
  }
}
