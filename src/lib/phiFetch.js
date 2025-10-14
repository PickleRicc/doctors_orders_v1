/**
 * PHI Fetch Client - HIPAA Compliant API Wrapper
 * Handles all PHI data operations with proper authentication and error handling
 */

import { supabase } from './supabase';

// PHI API configuration
const PHI_API_BASE = process.env.NEXT_PUBLIC_PHI_API || '/api/phi';
const USE_MOCK = false; // Using real database now

/**
 * Fetch wrapper for PHI API calls
 * Automatically includes Supabase JWT token for authentication
 */
export async function phiFetch(path, options = {}) {
  try {
    // Get current session from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Authentication required');
    }

    const token = session.access_token;
    
    // Build full URL
    const url = `${PHI_API_BASE}${path}`;
    
    // Merge headers with auth token
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };
    
    // Make the request
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'omit', // Don't send cookies to PHI API
      cache: 'no-store' // Never cache PHI data
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    }

    // Parse JSON response
    const data = await response.json();

    // Handle API errors
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('PHI API Error:', error);
    throw error;
  }
}

/**
 * PHI API Client - Higher-level interface for common operations
 */
export class PHIClient {
  /**
   * Create a new encounter
   */
  static async createEncounter(templateType, sessionTitle) {
    return phiFetch('/encounters', {
      method: 'POST',
      body: JSON.stringify({ templateType, sessionTitle })
    });
  }

  /**
   * Get encounter by ID
   */
  static async getEncounter(id) {
    return phiFetch(`/encounters/${id}`);
  }

  /**
   * Update encounter SOAP data
   */
  static async updateEncounter(id, soapData, status = 'draft') {
    return phiFetch(`/encounters/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ soap: soapData, status })
    });
  }

  /**
   * List user's encounters
   */
  static async listEncounters(limit = 10) {
    return phiFetch(`/encounters?limit=${limit}`);
  }

  /**
   * Finalize encounter (mark as complete)
   */
  static async finalizeEncounter(id) {
    return phiFetch(`/encounters/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'final' })
    });
  }

  /**
   * Generate SAS URL for audio upload
   */
  static async getUploadUrl(encounterId, filename) {
    return phiFetch(`/encounters/${encounterId}/upload-url`, {
      method: 'POST',
      body: JSON.stringify({ filename })
    });
  }

  /**
   * Record transcript metadata
   */
  static async recordTranscript(encounterId, blobUrl, transcriptText, durationSeconds) {
    return phiFetch(`/encounters/${encounterId}/transcript`, {
      method: 'POST',
      body: JSON.stringify({ 
        blobUrl, 
        transcriptText, 
        durationSeconds 
      })
    });
  }
}

/**
 * React Hook for PHI operations
 * Provides loading states and error handling
 */
export function usePHI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (operation) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    execute,
    // Convenience methods
    createEncounter: (templateType, sessionTitle) => 
      execute(() => PHIClient.createEncounter(templateType, sessionTitle)),
    getEncounter: (id) => 
      execute(() => PHIClient.getEncounter(id)),
    updateEncounter: (id, soapData, status) => 
      execute(() => PHIClient.updateEncounter(id, soapData, status)),
    listEncounters: (limit) => 
      execute(() => PHIClient.listEncounters(limit)),
    finalizeEncounter: (id) => 
      execute(() => PHIClient.finalizeEncounter(id))
  };
}

export default phiFetch;
