/**
 * Transcription Service for PT SOAP Generator
 * SECURITY: Now uses server-side endpoint instead of client-side OpenAI
 * Provides audio processing and transcription functionality
 */

import { supabase } from '../lib/supabase.js';

/**
 * Transcribe audio file using server-side API
 * @param {File|Blob} audioBlob - Audio file to transcribe
 * @returns {Promise<string>} - Transcription text
 */
export const transcribeAudio = async (audioBlob) => {
  console.log('🎤 Starting audio transcription...', {
    audioSize: audioBlob.size,
    audioType: audioBlob.type,
    timestamp: new Date().toISOString()
  });
  
  try {
    // Validate audio input
    if (!audioBlob || audioBlob.size === 0) {
      throw new Error('Invalid audio file: empty or missing audio data');
    }
    
    // Convert audio to base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64Audio = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    // Get auth token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }
    
    // Call server-side transcription endpoint
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        audioData: base64Audio,
        audioType: audioBlob.type || 'audio/webm'
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Transcription failed');
    }
    
    const { transcription } = await response.json();
    
    // Validate transcription result
    if (!transcription || typeof transcription !== 'string') {
      throw new Error('Invalid transcription response');
    }
    
    if (transcription.trim().length === 0) {
      throw new Error('Empty transcription - no speech detected in audio. Please ensure you speak clearly during recording.');
    }
    
    // Check for very short transcriptions (likely just noise)
    if (transcription.trim().length < 10) {
      console.warn('⚠️ Very short transcription detected:', transcription);
      throw new Error('Insufficient audio content - no clear speech detected. Please record a longer session.');
    }
    
    console.log('✅ Transcription successful!', {
      transcriptionLength: transcription.length,
      previewText: transcription.substring(0, 100) + '...',
      timestamp: new Date().toISOString()
    });
    
    return transcription;
  } catch (error) {
    console.error('❌ Error transcribing audio:', error);
    
    // Provide more specific error messages
    if (error.message.includes('file size')) {
      throw new Error('Audio file is too large. Please record a shorter session.');
    } else if (error.message.includes('format')) {
      throw new Error('Unsupported audio format. Please try recording again.');
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      throw new Error('Network error during transcription. Please check your connection and try again.');
    }
    
    throw error;
  }
};

/**
 * Validate audio file before transcription
 * @param {File|Blob} audioBlob - Audio file to validate
 * @returns {boolean} - Whether the audio file is valid
 */
export const validateAudioFile = (audioBlob) => {
  if (!audioBlob) {
    console.error('❌ No audio file provided');
    return false;
  }
  
  if (audioBlob.size === 0) {
    console.error('❌ Audio file is empty');
    return false;
  }
  
  // Check file size (OpenAI has a 25MB limit)
  const maxSize = 25 * 1024 * 1024; // 25MB in bytes
  if (audioBlob.size > maxSize) {
    console.error('❌ Audio file too large:', audioBlob.size, 'bytes');
    return false;
  }
  
  // Check if it's a supported audio type
  const supportedTypes = [
    'audio/webm',
    'audio/mp3',
    'audio/mp4',
    'audio/mpeg',
    'audio/m4a',
    'audio/wav',
    'audio/flac'
  ];
  
  if (audioBlob.type && !supportedTypes.includes(audioBlob.type)) {
    console.warn('⚠️ Potentially unsupported audio type:', audioBlob.type);
  }
  
  console.log('✅ Audio file validation passed:', {
    size: audioBlob.size,
    type: audioBlob.type
  });
  
  return true;
};

/**
 * Get audio file information
 * @param {File|Blob} audioBlob - Audio file to analyze
 * @returns {Object} - Audio file information
 */
export const getAudioInfo = (audioBlob) => {
  return {
    size: audioBlob.size,
    type: audioBlob.type,
    sizeInMB: (audioBlob.size / (1024 * 1024)).toFixed(2),
    isValid: validateAudioFile(audioBlob)
  };
};

export default {
  transcribeAudio,
  validateAudioFile,
  getAudioInfo
};
