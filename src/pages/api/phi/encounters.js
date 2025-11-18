import { query } from '../../../lib/db';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for verifying JWT tokens
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Get the current authenticated user from the request
 * Extracts and verifies the JWT token from the Authorization header
 */
async function getCurrentUser(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Failed to verify token:', error?.message);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error.message);
    return null;
  }
}

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET': {
        const { limit = '50', id } = req.query;
        
        // Get current authenticated user
        const user = await getCurrentUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - Please log in' });
        }
        
        // If ID provided, get single encounter - verify user owns it
        if (id) {
          const result = await query(
            'SELECT * FROM phi.encounters WHERE id = $1 AND clinician_id = $2',
            [id, user.id]
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
        
        // Otherwise list encounters for current user only
        // Join with custom_templates to get template name for custom templates
        const result = await query(
          `SELECT 
            e.id, 
            e.template_type, 
            e.session_title, 
            e.status, 
            e.created_at,
            e.custom_template_id,
            ct.name as custom_template_name
          FROM phi.encounters e
          LEFT JOIN phi.custom_templates ct ON e.custom_template_id = ct.id
          WHERE e.clinician_id = $1 
          ORDER BY e.created_at DESC 
          LIMIT $2`,
          [user.id, parseInt(limit)]
        );
        
        return res.json({
          success: true,
          encounters: result.rows,
          count: result.rows.length
        });
      }
      
      case 'POST': {
        const { templateType = 'knee', sessionTitle = 'New Session', customTemplateId } = req.body;
        
        // Get current authenticated user
        const user = await getCurrentUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - Please log in' });
        }
        
        // For now, use a placeholder org_id. In production, this would be fetched from user profile
        const testOrgId = '00000000-0000-0000-0000-000000000002';
        
        const result = await query(
          `INSERT INTO phi.encounters (org_id, clinician_id, status, template_type, session_title, soap, custom_template_id)
           VALUES ($1, $2, 'draft', $3, $4, $5, $6) RETURNING *`,
          [testOrgId, user.id, templateType, sessionTitle, '{}', customTemplateId || null]
        );
        
        return res.status(201).json(result.rows[0]);
      }
      
      case 'PUT': {
        const { id, soap, status = 'draft', session_title } = req.body;
        
        if (!id) {
          return res.status(400).json({ error: 'Encounter ID required' });
        }
        
        // Get current authenticated user
        const user = await getCurrentUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - Please log in' });
        }
        
        // Verify user owns this encounter
        const ownerCheck = await query(
          'SELECT id FROM phi.encounters WHERE id = $1 AND clinician_id = $2',
          [id, user.id]
        );
        
        if (ownerCheck.rows.length === 0) {
          return res.status(403).json({ error: 'Forbidden - You do not own this encounter' });
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
        
        const result = await query(
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
  }
}
