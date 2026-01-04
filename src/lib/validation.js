/**
 * Input Validation Utilities
 * SECURITY: Validates and sanitizes all user inputs
 */

/**
 * Validate email format
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitize string input
 */
export function sanitizeString(input, maxLength = 1000) {
  if (!input) return '';
  if (typeof input !== 'string') return String(input);
  
  // Remove any potential XSS vectors
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  // Trim to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized.trim();
}

/**
 * Validate encounter data
 */
export function validateEncounter(data) {
  const errors = [];
  
  if (!data.user_id || !isValidUUID(data.user_id)) {
    errors.push('Invalid user_id');
  }
  
  if (data.template_type && typeof data.template_type !== 'string') {
    errors.push('Invalid template_type');
  }
  
  if (data.session_title) {
    if (typeof data.session_title !== 'string') {
      errors.push('Invalid session_title');
    } else if (data.session_title.length > 255) {
      errors.push('session_title too long (max 255 characters)');
    }
  }
  
  if (data.transcript) {
    if (typeof data.transcript !== 'string') {
      errors.push('Invalid transcript');
    } else if (data.transcript.length > 50000) {
      errors.push('transcript too long (max 50000 characters)');
    }
  }
  
  if (data.soap_data) {
    if (typeof data.soap_data !== 'object') {
      errors.push('Invalid soap_data format');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate custom template data
 */
export function validateCustomTemplate(data) {
  const errors = [];
  
  if (!data.user_id || !isValidUUID(data.user_id)) {
    errors.push('Invalid user_id');
  }
  
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Template name is required');
  } else if (data.name.length > 255) {
    errors.push('Template name too long (max 255 characters)');
  }
  
  if (data.template_type && typeof data.template_type !== 'string') {
    errors.push('Invalid template_type');
  }
  
  if (data.config) {
    if (typeof data.config !== 'object') {
      errors.push('Invalid config format');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate transcription request
 */
export function validateTranscriptionRequest(data) {
  const errors = [];
  
  if (!data.audioData || typeof data.audioData !== 'string') {
    errors.push('Audio data is required');
  } else if (data.audioData.length > 35000000) { // ~25MB base64
    errors.push('Audio file too large (max 25MB)');
  }
  
  if (data.audioType && typeof data.audioType !== 'string') {
    errors.push('Invalid audio type');
  }
  
  const validAudioTypes = ['audio/webm', 'audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/m4a', 'audio/wav', 'audio/flac'];
  if (data.audioType && !validAudioTypes.includes(data.audioType)) {
    errors.push('Unsupported audio type');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate SOAP generation request
 */
export function validateSOAPRequest(data) {
  const errors = [];
  
  if (!data.transcript || typeof data.transcript !== 'string') {
    errors.push('Transcript is required');
  } else if (data.transcript.length > 50000) {
    errors.push('Transcript too long (max 50000 characters)');
  } else if (data.transcript.length < 10) {
    errors.push('Transcript too short (min 10 characters)');
  }
  
  if (!data.prompt || typeof data.prompt !== 'string') {
    errors.push('Prompt is required');
  } else if (data.prompt.length > 100000) {
    errors.push('Prompt too long');
  }
  
  if (data.templateType && typeof data.templateType !== 'string') {
    errors.push('Invalid template type');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate pagination parameters
 */
export function validatePagination(limit, offset) {
  const errors = [];
  
  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push('Limit must be between 1 and 100');
    }
  }
  
  if (offset !== undefined) {
    const offsetNum = parseInt(offset);
    if (isNaN(offsetNum) || offsetNum < 0) {
      errors.push('Offset must be non-negative');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export default {
  isValidEmail,
  isValidUUID,
  sanitizeString,
  validateEncounter,
  validateCustomTemplate,
  validateTranscriptionRequest,
  validateSOAPRequest,
  validatePagination
};

