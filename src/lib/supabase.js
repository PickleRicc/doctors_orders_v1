import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client configuration
 * Creates and exports a supabase client instance for use throughout the app
 * Uses environment variables for the API URL and anonymous key
 * 
 * For privacy and security, we ensure that NO patient data is stored in our system
 * All session data auto-deletes after 12 hours per project requirements
 */

// Default empty client with API stubs to prevent runtime errors if environment variables aren't set
const createEmptyClient = () => {
  return {
    from: () => ({
      select: () => ({
        order: () => ({ async: async () => ({ data: [], error: null }) }),
        eq: () => ({
          single: async () => ({ data: null, error: new Error('Supabase configuration missing') }),
          async: async () => ({ data: [], error: new Error('Supabase configuration missing') })
        }),
        gte: () => ({
          lte: () => ({
            order: () => ({ async: async () => ({ data: [], error: null }) })
          })
        })
      }),
      insert: () => ({ async: async () => ({ data: null, error: new Error('Supabase configuration missing') }) }),
      update: () => ({
        eq: () => ({ async: async () => ({ data: null, error: new Error('Supabase configuration missing') }) })
      }),
      delete: () => ({
        eq: () => ({ async: async () => ({ data: null, error: new Error('Supabase configuration missing') }) })
      })
    }),
    auth: {
      getUser: async () => ({ data: { user: null }, error: new Error('Supabase configuration missing') }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase configuration missing') }),
      signUp: async () => ({ data: null, error: new Error('Supabase configuration missing') })
    }
  };
};

// Initialize Supabase client based on environment variables if available
export const supabase = (() => {
  try {
    // SECURITY FIX: Use environment variables instead of hardcoded credentials
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    // Make sure we have both URL and key before trying to create client
    if (!url || !key) {
      console.warn('Supabase environment variables missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
      return createEmptyClient();
    }
    
    // Validate URL format
    if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
      console.error('Invalid Supabase URL format');
      return createEmptyClient();
    }
    
    // Create the actual Supabase client
    return createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        flowType: 'pkce',
        detectSessionInUrl: true,
        sessionExpirySeconds: 3600, // 1 hour session expiry for security
      }
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return createEmptyClient();
  }
})();


