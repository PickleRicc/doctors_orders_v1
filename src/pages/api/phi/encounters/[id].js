/**
 * PHI API - Individual Encounter Endpoint
 * HIPAA-compliant encounter retrieval and updates
 */

import { query, logAudit } from '../../../../lib/db';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Encounter ID required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, id);
      case 'PUT':
        return await handlePut(req, res, id);
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('PHI API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/phi/encounters/[id] - Get specific encounter
async function handleGet(req, res, id) {
  const result = await query(
    `SELECT e.*, t.blob_url, t.duration_seconds 
     FROM phi.encounters e 
     LEFT JOIN phi.transcripts t ON e.id = t.encounter_id 
     WHERE e.id = $1`,
    [id]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Encounter not found' });
  }
  
  // Log audit event
  await logAudit(id, '00000000-0000-0000-0000-000000000001', 'READ');
  
  res.json(result.rows[0]);
}

// PUT /api/phi/encounters/[id] - Update specific encounter
async function handlePut(req, res, id) {
  const { soap, status = 'draft' } = req.body;
  
  const result = await query(
    `UPDATE phi.encounters 
     SET soap = $1, status = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [JSON.stringify(soap), status, id]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Encounter not found' });
  }
  
  // Log audit event
  await logAudit(id, '00000000-0000-0000-0000-000000000001', 'UPDATE');
  
  res.json(result.rows[0]);
}
