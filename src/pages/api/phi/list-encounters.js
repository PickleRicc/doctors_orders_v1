import { Pool } from 'pg';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pool = new Pool({
      host: process.env.PGHOST,
      port: parseInt(process.env.PGPORT) || 5432,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      ssl: { rejectUnauthorized: false }
    });

    const { limit = '50' } = req.query;
    const result = await pool.query(
      'SELECT id, template_type, session_title, status, created_at FROM phi.encounters ORDER BY created_at DESC LIMIT $1',
      [parseInt(limit)]
    );
    
    await pool.end();
    
    return res.status(200).json({
      success: true,
      encounters: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Database error',
      message: error.message 
    });
  }
}
