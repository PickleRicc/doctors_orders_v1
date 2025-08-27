/**
 * Logging utility for PT SOAP Generator
 * Handles structured logging for development and production environments
 */

// Log levels
const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

// Development mode detection
const isDev = process.env.NODE_ENV !== 'production';

/**
 * Log structured data with timestamps and context
 * 
 * @param {string} level - Log level (debug, info, warn, error)
 * @param {string} context - Context for the log (e.g., 'AI Generation', 'Template Processing')
 * @param {string} message - Main log message
 * @param {object} [data] - Additional structured data to log
 */
export const logEvent = (level, context, message, data = {}) => {
  const timestamp = new Date().toISOString();
  
  const logObj = {
    timestamp,
    level,
    context,
    message,
    ...data
  };
  
  // Always log errors regardless of environment
  if (level === LOG_LEVELS.ERROR) {
    console.error(logObj);
    // In a real app, we might send this to a logging service
    return;
  }
  
  // In development, log everything; in production only log warnings and above
  if (isDev || level === LOG_LEVELS.WARN) {
    if (level === LOG_LEVELS.DEBUG) console.debug(logObj);
    if (level === LOG_LEVELS.INFO) console.info(logObj);
    if (level === LOG_LEVELS.WARN) console.warn(logObj);
  }
};

// Convenience methods
export const logDebug = (context, message, data) => 
  logEvent(LOG_LEVELS.DEBUG, context, message, data);

export const logInfo = (context, message, data) => 
  logEvent(LOG_LEVELS.INFO, context, message, data);

export const logWarning = (context, message, data) => 
  logEvent(LOG_LEVELS.WARN, context, message, data);

export const logError = (context, message, data) => 
  logEvent(LOG_LEVELS.ERROR, context, message, data);

/**
 * Special logger for AI processing steps
 * 
 * @param {string} step - The AI processing step name
 * @param {string} message - Description of what's happening
 * @param {object} [data] - Additional data about the processing
 */
export const logAIProcess = (step, message, data = {}) => {
  logInfo('AI Processing', `${step}: ${message}`, {
    aiProcessingStep: step,
    ...data
  });
};

export default {
  logDebug,
  logInfo,
  logWarning,
  logError,
  logAIProcess
};
