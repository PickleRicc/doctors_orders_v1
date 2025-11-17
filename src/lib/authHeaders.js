/**
 * Authentication Helper - Get auth headers for API requests
 */

import { supabase } from '../services/supabase';

// Token cache to avoid repeated session calls
let tokenCache = { token: null, expiresAt: 0 };

/**
 * Get authorization headers with current access token (cached for performance)
 * @returns {Promise<{Authorization: string} | {}>} Headers object with Bearer token or empty object if not authenticated
 */
export async function getAuthHeaders() {
  try {
    // Check cache first (valid for 5 minutes)
    const now = Date.now();
    if (tokenCache.token && tokenCache.expiresAt > now) {
      return {
        'Authorization': `Bearer ${tokenCache.token}`
      };
    }
    
    // Get fresh token from Supabase (reads from localStorage, very fast)
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.access_token) {
      tokenCache = { token: null, expiresAt: 0 };
      return {};
    }
    
    // Cache token for 5 minutes
    tokenCache = {
      token: session.access_token,
      expiresAt: now + (5 * 60 * 1000)
    };
    
    return {
      'Authorization': `Bearer ${session.access_token}`
    };
  } catch (error) {
    console.error('Error getting auth headers:', error);
    tokenCache = { token: null, expiresAt: 0 };
    return {};
  }
}

/**
 * Clear the token cache (useful when logging out or token expires)
 */
export function clearTokenCache() {
  tokenCache = { token: null, expiresAt: 0 };
}

/**
 * Make an authenticated fetch request
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Response>} Fetch response
 */
export async function authenticatedFetch(url, options = {}) {
  const authHeaders = await getAuthHeaders();
  
  const headers = {
    'Content-Type': 'application/json',
    ...authHeaders,
    ...options.headers
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // If unauthorized, clear cache (token may have expired)
  if (response.status === 401) {
    clearTokenCache();
  }
  
  return response;
}

