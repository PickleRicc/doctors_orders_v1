/**
 * PHI API Server - HIPAA Compliant Backend
 * Simplified version using existing project dependencies
 */

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Load environment from parent directory
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Database connection with correct credentials
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false }
});

// Test database connection on startup
pool.connect()
  .then(client => {
    console.log('✅ Database connected successfully');
    return client.query('SELECT version()');
  })
  .then(result => {
    console.log('📊 Database version:', result.rows[0].version.split(' ').slice(0, 2).join(' '));
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.error('🔍 Connection details:');
    console.error(`   Host: ${process.env.PGHOST}`);
    console.error(`   User: ${process.env.PGUSER}`);
    console.error(`   Database: ${process.env.PGDATABASE}`);
  });

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'PHI API'
  });
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as encounter_count FROM phi.encounters');
    res.json({
      database_status: 'connected',
      encounter_count: parseInt(result.rows[0].encounter_count),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      database_status: 'error',
      error: error.message
    });
  }
});

// Create new encounter (simplified for testing)
app.post('/encounters', async (req, res) => {
  try {
    const { templateType = 'knee', sessionTitle = 'Test Session' } = req.body;
    
    // Use test UUIDs for now
    const testUserId = '00000000-0000-0000-0000-000000000001';
    const testOrgId = '00000000-0000-0000-0000-000000000002';
    
    const result = await pool.query(
      `INSERT INTO phi.encounters (org_id, clinician_id, status, template_type, session_title, soap)
       VALUES ($1, $2, 'draft', $3, $4, $5) RETURNING *`,
      [testOrgId, testUserId, templateType, sessionTitle, '{}']
    );
    
    // Log audit event
    await pool.query(
      'INSERT INTO phi.audit_events (encounter_id, actor_id, event) VALUES ($1, $2, $3)',
      [result.rows[0].id, testUserId, 'CREATE']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create encounter error:', error);
    res.status(500).json({ error: 'Failed to create encounter' });
  }
});

// Get encounter
app.get('/encounters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
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
    await pool.query(
      'INSERT INTO phi.audit_events (encounter_id, actor_id, event) VALUES ($1, $2, $3)',
      [id, '00000000-0000-0000-0000-000000000001', 'READ']
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get encounter error:', error);
    res.status(500).json({ error: 'Failed to retrieve encounter' });
  }
});

// Update encounter SOAP data
app.put('/encounters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { soap, status = 'draft' } = req.body;
    
    const result = await pool.query(
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
    await pool.query(
      'INSERT INTO phi.audit_events (encounter_id, actor_id, event) VALUES ($1, $2, $3)',
      [id, '00000000-0000-0000-0000-000000000001', 'UPDATE']
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update encounter error:', error);
    res.status(500).json({ error: 'Failed to update encounter' });
  }
});

// List encounters
app.get('/encounters', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const result = await pool.query(
      `SELECT id, template_type, session_title, status, created_at, updated_at
       FROM phi.encounters 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    );
    
    res.json({
      encounters: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('List encounters error:', error);
    res.status(500).json({ error: 'Failed to list encounters' });
  }
});

// Generate SAS URL for audio upload (placeholder)
app.post('/encounters/:id/upload-url', async (req, res) => {
  try {
    const { id } = req.params;
    const { filename = 'audio.wav' } = req.body;
    
    // For now, return a placeholder response
    // TODO: Implement actual SAS token generation
    res.json({
      sasUrl: `https://dophi2025.blob.core.windows.net/audio/${id}/${filename}?placeholder=true`,
      blobName: `${id}/${filename}`,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    });
  } catch (error) {
    console.error('SAS URL generation error:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔒 PHI API Server running on http://localhost:${PORT}`);
  console.log(`🏥 HIPAA-compliant backend ready`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️  Database test: http://localhost:${PORT}/test-db`);
});
