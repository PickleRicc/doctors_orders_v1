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
    // Get current authenticated user
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized - Please log in' });
    }

    switch (req.method) {
      case 'GET': {
        const { id } = req.query;
        
        // If ID provided, get single template
        if (id) {
          console.log('📥 API GET: Fetching template with id:', id);
          const result = await query(
            `SELECT * FROM phi.custom_templates 
             WHERE id = $1 AND clinician_id = $2 AND is_active = true`,
            [id, user.id]
          );
          
          if (result.rows.length === 0) {
            console.error('❌ Template not found');
            return res.status(404).json({ error: 'Template not found' });
          }
          
          const template = result.rows[0];
          console.log('📄 Raw template from DB:', template);
          
          // Parse JSONB fields
          if (typeof template.template_config === 'string') {
            template.template_config = JSON.parse(template.template_config);
          }
          if (template.ai_prompts && typeof template.ai_prompts === 'string') {
            template.ai_prompts = JSON.parse(template.ai_prompts);
          }
          
          console.log('✅ Parsed template being returned:', template);
          console.log('Template config:', JSON.stringify(template.template_config, null, 2));
          return res.json(template);
        }
        
        // Otherwise list all templates for current user
        console.log('📥 API GET: Fetching all templates for user:', user.id);
        const result = await query(
          `SELECT id, name, template_type, body_region, session_type, 
                  description, is_favorite, usage_count, created_at, updated_at, template_config
           FROM phi.custom_templates 
           WHERE clinician_id = $1 AND is_active = true 
           ORDER BY is_favorite DESC, updated_at DESC`,
          [user.id]
        );
        
        console.log('✅ Found', result.rows.length, 'templates');
        return res.json({
          success: true,
          templates: result.rows,
          count: result.rows.length
        });
      }
      
      case 'POST': {
        const { 
          name, 
          template_type, 
          body_region, 
          session_type, 
          description,
          template_config,
          ai_prompts 
        } = req.body;
        
        console.log('📥 API: Received POST request');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('template_config:', template_config);
        
        // Validation
        if (!name || !template_type || !template_config) {
          console.error('❌ Validation failed - missing required fields');
          return res.status(400).json({ 
            error: 'Missing required fields: name, template_type, template_config' 
          });
        }
        
        // For now, use a placeholder org_id (same as encounters)
        const testOrgId = '00000000-0000-0000-0000-000000000002';
        
        console.log('💾 Inserting into database...');
        const result = await query(
          `INSERT INTO phi.custom_templates 
           (org_id, clinician_id, name, template_type, body_region, session_type, 
            description, template_config, ai_prompts)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
           RETURNING *`,
          [
            testOrgId, 
            user.id, 
            name, 
            template_type, 
            body_region || null, 
            session_type || null,
            description || null,
            JSON.stringify(template_config),
            ai_prompts ? JSON.stringify(ai_prompts) : null
          ]
        );
        
        console.log('✅ Database insert successful');
        const newTemplate = result.rows[0];
        console.log('Returned from DB:', newTemplate);
        
        // Parse JSONB fields for response
        if (typeof newTemplate.template_config === 'string') {
          newTemplate.template_config = JSON.parse(newTemplate.template_config);
        }
        if (newTemplate.ai_prompts && typeof newTemplate.ai_prompts === 'string') {
          newTemplate.ai_prompts = JSON.parse(newTemplate.ai_prompts);
        }
        
        console.log('Final template being returned:', newTemplate);
        return res.status(201).json(newTemplate);
      }
      
      case 'PUT': {
        const { 
          id, 
          name, 
          template_type,
          body_region, 
          session_type, 
          description,
          template_config,
          ai_prompts,
          is_favorite
        } = req.body;
        
        console.log('📥 API PUT: Updating template', id);
        console.log('Update data:', JSON.stringify(req.body, null, 2));
        console.log('template_config to save:', template_config);
        
        if (!id) {
          return res.status(400).json({ error: 'Template ID required' });
        }
        
        // Verify user owns this template
        const ownerCheck = await query(
          'SELECT id FROM phi.custom_templates WHERE id = $1 AND clinician_id = $2',
          [id, user.id]
        );
        
        if (ownerCheck.rows.length === 0) {
          return res.status(403).json({ 
            error: 'Forbidden - You do not own this template' 
          });
        }
        
        // Build dynamic update query
        const updates = ['updated_at = NOW()'];
        const values = [];
        let paramCount = 1;
        
        if (name !== undefined) {
          updates.push(`name = $${paramCount}`);
          values.push(name);
          paramCount++;
        }
        
        if (template_type !== undefined) {
          updates.push(`template_type = $${paramCount}`);
          values.push(template_type);
          paramCount++;
        }
        
        if (body_region !== undefined) {
          updates.push(`body_region = $${paramCount}`);
          values.push(body_region);
          paramCount++;
        }
        
        if (session_type !== undefined) {
          updates.push(`session_type = $${paramCount}`);
          values.push(session_type);
          paramCount++;
        }
        
        if (description !== undefined) {
          updates.push(`description = $${paramCount}`);
          values.push(description);
          paramCount++;
        }
        
        if (template_config !== undefined) {
          console.log('💾 Updating template_config');
          updates.push(`template_config = $${paramCount}`);
          values.push(JSON.stringify(template_config));
          paramCount++;
        }
        
        if (ai_prompts !== undefined) {
          updates.push(`ai_prompts = $${paramCount}`);
          values.push(ai_prompts ? JSON.stringify(ai_prompts) : null);
          paramCount++;
        }
        
        if (is_favorite !== undefined) {
          updates.push(`is_favorite = $${paramCount}`);
          values.push(is_favorite);
          paramCount++;
        }
        
        values.push(id);
        
        console.log('SQL Query:', `UPDATE phi.custom_templates SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`);
        console.log('Values:', values);
        
        const result = await query(
          `UPDATE phi.custom_templates 
           SET ${updates.join(', ')} 
           WHERE id = $${paramCount} 
           RETURNING *`,
          values
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Template not found' });
        }
        
        const updatedTemplate = result.rows[0];
        console.log('📄 Raw updated template from DB:', updatedTemplate);
        
        // Parse JSONB fields for response
        if (typeof updatedTemplate.template_config === 'string') {
          updatedTemplate.template_config = JSON.parse(updatedTemplate.template_config);
        }
        if (updatedTemplate.ai_prompts && typeof updatedTemplate.ai_prompts === 'string') {
          updatedTemplate.ai_prompts = JSON.parse(updatedTemplate.ai_prompts);
        }
        
        console.log('✅ Updated template being returned:', updatedTemplate);
        console.log('Final template_config:', JSON.stringify(updatedTemplate.template_config, null, 2));
        return res.json(updatedTemplate);
      }
      
      case 'DELETE': {
        const { id } = req.body;
        
        if (!id) {
          return res.status(400).json({ error: 'Template ID required' });
        }
        
        // Verify user owns this template
        const ownerCheck = await query(
          'SELECT id FROM phi.custom_templates WHERE id = $1 AND clinician_id = $2',
          [id, user.id]
        );
        
        if (ownerCheck.rows.length === 0) {
          return res.status(403).json({ 
            error: 'Forbidden - You do not own this template' 
          });
        }
        
        // Soft delete by setting is_active to false
        const result = await query(
          `UPDATE phi.custom_templates 
           SET is_active = false, updated_at = NOW() 
           WHERE id = $1 
           RETURNING id, name`,
          [id]
        );
        
        return res.json({
          success: true,
          message: 'Template deleted successfully',
          template: result.rows[0]
        });
      }
      
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Custom templates API error:', error);
    return res.status(500).json({ 
      error: 'Database error',
      message: error.message 
    });
  }
}

