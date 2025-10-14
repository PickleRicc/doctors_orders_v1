/**
 * PHI API - Encounters Endpoint
 * HIPAA-compliant encounter management
 */

import { v4 as uuidv4 } from 'uuid';
import { query, logAudit } from '../../../lib/db';

export default async function handler(req, res) {
  // Enable CORS for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Check if database environment variables are set
  if (!process.env.PGHOST || !process.env.PGUSER || !process.env.PGPASSWORD) {
    console.error('❌ Missing database environment variables:', {
      PGHOST: !!process.env.PGHOST,
      PGUSER: !!process.env.PGUSER,
      PGPASSWORD: !!process.env.PGPASSWORD,
      PGDATABASE: !!process.env.PGDATABASE,
      PGPORT: !!process.env.PGPORT
    });
    return res.status(500).json({ 
      error: 'Database not configured',
      details: 'Missing required environment variables. Please check PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT in Vercel settings.'
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('PHI API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// GET /api/phi/encounters - List encounters
async function handleGet(req, res) {
  const { limit = '10', id } = req.query;
  
  // If ID is provided, get specific encounter
  if (id) {
    try {
      const result = await query(
        `SELECT * FROM phi.encounters WHERE id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Encounter not found' });
      }
      
      const encounter = result.rows[0];
      
      // Parse SOAP JSON if it's a string
      if (typeof encounter.soap === 'string') {
        encounter.soap = JSON.parse(encounter.soap);
      }
      
      // Log audit event
      await logAudit(id, '00000000-0000-0000-0000-000000000001', 'READ');
      
      return res.json(encounter);
    } catch (error) {
      console.error('Error fetching single encounter:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch encounter',
        message: error.message 
      });
    }
  }
  
  // Otherwise list encounters
  try {
    const limitNum = parseInt(limit) || 10;
    
    console.log('📋 Fetching encounters with limit:', limitNum);
    
    const result = await query(
      `SELECT id, template_type, session_title, status, created_at, updated_at
       FROM phi.encounters 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limitNum]
    );
    
    console.log('✅ Fetched encounters:', result.rows.length);
    
    return res.json({
      success: true,
      encounters: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching encounters list:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch encounters',
      message: error.message,
      details: error.stack
    });
  }
}

// POST /api/phi/encounters - Create new encounter
async function handlePost(req, res) {
  const { templateType = 'knee', sessionTitle = 'New Session' } = req.body;
  
  // Use test UUIDs for now (replace with actual auth later)
  const testUserId = '00000000-0000-0000-0000-000000000001';
  const testOrgId = '00000000-0000-0000-0000-000000000002';
  
  const result = await query(
    `INSERT INTO phi.encounters (org_id, clinician_id, status, template_type, session_title, soap)
     VALUES ($1, $2, 'draft', $3, $4, $5) RETURNING *`,
    [testOrgId, testUserId, templateType, sessionTitle, '{}']
  );
  
  const encounter = result.rows[0];
  
  // Log audit event
  await logAudit(encounter.id, testUserId, 'CREATE');
  
  res.status(201).json(encounter);
}

// PUT /api/phi/encounters - Update encounter
async function handlePut(req, res) {
  const { id, soap, status = 'draft', session_title } = req.body;
  
  console.log('📥 PUT /encounters - Received data:', {
    id,
    hasSoap: !!soap,
    hasSessionTitle: !!session_title,
    soapKeys: soap ? Object.keys(soap) : [],
    soapPreview: JSON.stringify(soap).substring(0, 300)
  });
  
  if (!id) {
    return res.status(400).json({ error: 'Encounter ID required' });
  }
  
  // Build dynamic update query
  const updates = ['updated_at = NOW()'];
  const values = [];
  let paramCount = 1;
  
  if (soap !== undefined) {
    updates.push(`soap = $${paramCount}`);
    values.push(JSON.stringify(soap));
    paramCount++;
  }
  
  if (status !== undefined) {
    updates.push(`status = $${paramCount}`);
    values.push(status);
    paramCount++;
  }
  
  if (session_title !== undefined) {
    updates.push(`session_title = $${paramCount}`);
    values.push(session_title);
    paramCount++;
  }
  
  values.push(id);
  
  const result = await query(
    `UPDATE phi.encounters 
     SET ${updates.join(', ')}
     WHERE id = $${paramCount}
     RETURNING *`,
    values
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Encounter not found' });
  }
  
  const encounter = result.rows[0];
  
  // Log audit event
  await logAudit(encounter.id, '00000000-0000-0000-0000-000000000001', 'UPDATE');
  
  res.json(encounter);
}
