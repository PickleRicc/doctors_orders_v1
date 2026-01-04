/**
 * Server-Side Transcription Endpoint
 * SECURITY: Moves OpenAI API calls to server-side
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { transcriptionRateLimit } from '../../middleware/rateLimit';
import { validateTranscriptionRequest } from '../../lib/validation';
import logger from '../../lib/logger';

// Initialize Supabase for auth verification
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Initialize OpenAI (server-side only)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function getCurrentUser(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    logger.error('transcribe-api', 'Auth error', { error: error.message });
    return null;
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb', // OpenAI limit
    },
  },
};

// Wrap handler with rate limiting
const rateLimitedHandler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const user = await getCurrentUser(req);
    if (!user) {
      logger.warn('transcribe-api', 'Unauthorized access attempt');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate input
    const validation = validateTranscriptionRequest(req.body);
    if (!validation.isValid) {
      logger.warn('transcribe-api', 'Invalid request', { errors: validation.errors });
      return res.status(400).json({ error: 'Invalid request', details: validation.errors });
    }

    const { audioData, audioType = 'audio/webm' } = req.body;

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioData, 'base64');

    logger.info('transcribe-api', 'Starting transcription', { 
      userId: user.id,
      audioSize: audioBuffer.length 
    });

    // Create File object for OpenAI
    const audioFile = new File([audioBuffer], 'recording.webm', { type: audioType });

    // Transcribe with OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      response_format: 'text'
    });

    if (!transcription || transcription.trim().length === 0) {
      logger.warn('transcribe-api', 'No speech detected', { userId: user.id });
      return res.status(400).json({ error: 'No speech detected in audio' });
    }

    logger.info('transcribe-api', 'Transcription successful', { 
      userId: user.id,
      length: transcription.length 
    });

    res.status(200).json({ 
      transcription,
      length: transcription.length,
      userId: user.id
    });

  } catch (error) {
    logger.error('transcribe-api', 'Transcription failed', { 
      error: error.message,
      stack: error.stack 
    });
    res.status(500).json({ 
      error: 'Transcription failed',
      message: error.message 
    });
  }
};

export default function handler(req, res) {
  return transcriptionRateLimit(req, res, rateLimitedHandler);
}

