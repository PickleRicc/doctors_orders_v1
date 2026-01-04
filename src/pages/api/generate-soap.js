/**
 * Server-Side SOAP Generation Endpoint  
 * SECURITY: Moves OpenAI API calls to server-side
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { apiRateLimit } from '../../middleware/rateLimit';
import { validateSOAPRequest } from '../../lib/validation';
import logger from '../../lib/logger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function getCurrentUser(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    
    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    return error || !user ? null : user;
  } catch (error) {
    logger.error('generate-soap-api', 'Auth error', { error: error.message });
    return null;
  }
}

const rateLimitedHandler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getCurrentUser(req);
    if (!user) {
      logger.warn('generate-soap-api', 'Unauthorized access attempt');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate input
    const validation = validateSOAPRequest(req.body);
    if (!validation.isValid) {
      logger.warn('generate-soap-api', 'Invalid request', { errors: validation.errors });
      return res.status(400).json({ error: 'Invalid request', details: validation.errors });
    }

    const { transcript, templateType, prompt } = req.body;

    logger.info('generate-soap-api', 'Starting SOAP generation', { 
      userId: user.id,
      templateType,
      transcriptLength: transcript.length 
    });

    // Call OpenAI to generate SOAP note
    // Using gpt-4o which supports JSON mode
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // gpt-4o supports response_format
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: transcript }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const soapData = JSON.parse(completion.choices[0].message.content);

    logger.info('generate-soap-api', 'SOAP generation successful', { 
      userId: user.id,
      templateType 
    });

    res.status(200).json({ 
      soap: soapData,
      templateType,
      userId: user.id
    });

  } catch (error) {
    logger.error('generate-soap-api', 'SOAP generation failed', { 
      error: error.message,
      stack: error.stack 
    });
    res.status(500).json({ 
      error: 'SOAP generation failed',
      message: error.message 
    });
  }
};

export default function handler(req, res) {
  return apiRateLimit(req, res, rateLimitedHandler);
}

