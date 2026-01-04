/**
 * Feature Flags System for Safe Rollout
 * Allows instant rollback of features without code deployment
 * 
 * Usage:
 *   import { isFeatureEnabled } from '@/lib/featureFlags';
 *   if (isFeatureEnabled('SERVER_SIDE_OPENAI')) { ... }
 */

/**
 * Available feature flags with descriptions
 */
export const FEATURE_FLAGS = {
  // Authentication & Credentials
  NEW_AUTH_FLOW: 'ENABLE_NEW_AUTH_FLOW',
  
  // AI Operations
  SERVER_SIDE_OPENAI: 'ENABLE_SERVER_SIDE_OPENAI',
  
  // Security Features
  RATE_LIMITING: 'ENABLE_RATE_LIMITING',
  INPUT_VALIDATION: 'ENABLE_INPUT_VALIDATION',
  
  // Logging & Monitoring
  NEW_LOGGING: 'ENABLE_NEW_LOGGING',
  PHI_SAFE_LOGGING: 'ENABLE_PHI_SAFE_LOGGING',
  
  // Session Management
  SESSION_TIMEOUT: 'ENABLE_SESSION_TIMEOUT',
  
  // Database
  SSL_VALIDATION: 'ENABLE_SSL_VALIDATION',
};

/**
 * Check if a feature flag is enabled
 * @param {string} flagName - Name of the feature flag
 * @returns {boolean} - Whether the feature is enabled
 */
export function isFeatureEnabled(flagName) {
  // In production, check environment variable
  if (typeof window === 'undefined') {
    // Server-side
    return process.env[flagName] === 'true';
  } else {
    // Client-side - check public env vars
    const publicFlagName = `NEXT_PUBLIC_${flagName}`;
    return process.env[publicFlagName] === 'true';
  }
}

/**
 * Get all feature flags status (for debugging/admin)
 * @returns {Object} - Object with all flags and their status
 */
export function getAllFeatureFlags() {
  const flags = {};
  Object.entries(FEATURE_FLAGS).forEach(([key, flagName]) => {
    flags[key] = isFeatureEnabled(flagName);
  });
  return flags;
}

/**
 * Feature flag middleware for API routes
 * @param {string} flagName - Required feature flag
 * @returns {Function} - Middleware function
 */
export function requireFeatureFlag(flagName) {
  return (req, res, next) => {
    if (!isFeatureEnabled(flagName)) {
      return res.status(503).json({
        error: 'Feature temporarily unavailable',
        message: 'This feature is currently disabled. Please try again later.'
      });
    }
    
    if (next) {
      next();
    }
  };
}

/**
 * React Hook for feature flags
 * @param {string} flagName - Feature flag to check
 * @returns {boolean} - Whether feature is enabled
 */
export function useFeatureFlag(flagName) {
  // For client-side React components
  if (typeof window !== 'undefined') {
    return isFeatureEnabled(flagName);
  }
  return false;
}

export default {
  FEATURE_FLAGS,
  isFeatureEnabled,
  getAllFeatureFlags,
  requireFeatureFlag,
  useFeatureFlag
};

