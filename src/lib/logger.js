/**
 * PHI-Safe Logging Utility
 * SECURITY: Redacts PHI from all log outputs
 */

const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info', 
  WARN: 'warn',
  ERROR: 'error'
};

const isDev = process.env.NODE_ENV !== 'production';
const isLoggingEnabled = process.env.ENABLE_PHI_SAFE_LOGGING !== 'false';

// Patterns that might contain PHI
const PHI_PATTERNS = [
  { pattern: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, replacement: '[REDACTED_NAME]' }, // Names
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[REDACTED_SSN]' }, // SSN
  { pattern: /\b\d{10}\b/g, replacement: '[REDACTED_PHONE]' }, // Phone
  { pattern: /\b\d{5}(?:-\d{4})?\b/g, replacement: '[REDACTED_ZIP]' }, // ZIP
  { pattern: /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, replacement: '[REDACTED_DATE]' }, // Dates
];

function redactPHI(message) {
  if (typeof message !== 'string') {
    return message;
  }
  
  let redacted = message;
  
  PHI_PATTERNS.forEach(({ pattern, replacement }) => {
    redacted = redacted.replace(pattern, replacement);
  });
  
  return redacted;
}

function formatLogMessage(level, context, message, data = {}) {
  const timestamp = new Date().toISOString();
  
  // Redact PHI from message and data
  const safeMessage = redactPHI(String(message));
  const safeData = {};
  
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      safeData[key] = redactPHI(data[key]);
    } else if (key.toLowerCase().includes('transcript') || 
               key.toLowerCase().includes('soap') ||
               key.toLowerCase().includes('note')) {
      safeData[key] = '[REDACTED_PHI]';
    } else {
      safeData[key] = data[key];
    }
  });
  
  return {
    timestamp,
    level,
    context,
    message: safeMessage,
    ...safeData
  };
}

export function logDebug(context, message, data) {
  if (!isLoggingEnabled || !isDev) return;
  const log = formatLogMessage(LOG_LEVELS.DEBUG, context, message, data);
  console.debug(log);
}

export function logInfo(context, message, data) {
  if (!isLoggingEnabled) return;
  const log = formatLogMessage(LOG_LEVELS.INFO, context, message, data);
  console.info(log);
}

export function logWarn(context, message, data) {
  if (!isLoggingEnabled) return;
  const log = formatLogMessage(LOG_LEVELS.WARN, context, message, data);
  console.warn(log);
}

export function logError(context, message, data) {
  // Always log errors
  const log = formatLogMessage(LOG_LEVELS.ERROR, context, message, data);
  console.error(log);
}

export default {
  debug: logDebug,
  info: logInfo,
  warn: logWarn,
  error: logError
};

