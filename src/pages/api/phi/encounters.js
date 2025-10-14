import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = '50' } = req.query;
    const limitNum = parseInt(limit) || 50;
    
    const result = await query(
      'SELECT id, template_type, session_title, status, created_at FROM phi.encounters ORDER BY created_at DESC LIMIT $1',
      [limitNum]
    );
    
    return res.status(200).json({
      success: true,
      encounters: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Database error',
      message: error.message 
    });
  }
}
