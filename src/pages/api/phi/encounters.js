import { Pool } from 'pg';

export default async function handler(req, res) {
  const pool = new Pool({
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT) || 5432,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    switch (req.method) {
      case 'GET': {
        const { limit = '50', id } = req.query;
        
        // If ID provided, get single encounter
        if (id) {
          const result = await pool.query(
            'SELECT * FROM phi.encounters WHERE id = $1',
            [id]
          );
          
          if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Encounter not found' });
          }
          
          const encounter = result.rows[0];
          if (typeof encounter.soap === 'string') {
            encounter.soap = JSON.parse(encounter.soap);
          }
          
          return res.json(encounter);
        }
        
        // Otherwise list encounters
        const result = await pool.query(
          'SELECT id, template_type, session_title, status, created_at FROM phi.encounters ORDER BY created_at DESC LIMIT $1',
          [parseInt(limit)]
        );
        
        return res.json({
          success: true,
          encounters: result.rows,
          count: result.rows.length
        });
      }
      
      case 'POST': {
        const { templateType = 'knee', sessionTitle = 'New Session' } = req.body;
        const testUserId = '00000000-0000-0000-0000-000000000001';
        const testOrgId = '00000000-0000-0000-0000-000000000002';
        
        const result = await pool.query(
          `INSERT INTO phi.encounters (org_id, clinician_id, status, template_type, session_title, soap)
           VALUES ($1, $2, 'draft', $3, $4, $5) RETURNING *`,
          [testOrgId, testUserId, templateType, sessionTitle, '{}']
        );
        
        return res.status(201).json(result.rows[0]);
      }
      
      case 'PUT': {
        const { id, soap, status = 'draft', session_title } = req.body;
        
        if (!id) {
          return res.status(400).json({ error: 'Encounter ID required' });
        }
        
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
        
        const result = await pool.query(
          `UPDATE phi.encounters SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
          values
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Encounter not found' });
        }
        
        return res.json(result.rows[0]);
      }
      
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Database error',
      message: error.message 
    });
  } finally {
    await pool.end();
  }
}
