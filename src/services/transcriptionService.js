/**
 * Transcription Service for PT SOAP Generator
 * Handles audio transcription using OpenAI's Whisper API
 * Provides audio processing and transcription functionality
 */

import { getOpenAIClient } from './aiClient.js';

/**
 * Transcribe audio file using OpenAI's Whisper API
 * @param {File|Blob} audioBlob - Audio file to transcribe
 * @returns {Promise<string>} - Transcription text
 */
export const transcribeAudio = async (audioBlob) => {
  const openai = getOpenAIClient();
  
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
    
    // Ensure we have a proper File object for the OpenAI API
    // The OpenAI SDK expects a proper File object, not just a blob
    const audioFile = new File(
      [audioBlob], 
      'recording.webm', 
      { type: audioBlob.type || 'audio/webm' }
    );
    
    console.log('📁 Creating proper File object for API:', {
      fileName: 'recording.webm',
      fileSize: audioFile.size,
      fileType: audioFile.type
    });
    
    // Make the transcription request with a proper File object
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en", // Specify English for better accuracy
      response_format: "text" // Get plain text response
    });
    
    // Validate transcription result
    if (!transcription || typeof transcription !== 'string') {
      throw new Error('Invalid transcription response from Whisper API');
    }
    
    if (transcription.trim().length === 0) {
      throw new Error('Empty transcription - no speech detected in audio');
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
