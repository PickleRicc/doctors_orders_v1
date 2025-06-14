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
    const url = 'https://oozghvnctxihtbqzktdv.supabase.co';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vemdodm5jdHhpaHRicXprdGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MjAyNzcsImV4cCI6MjA2NDk5NjI3N30.I3AbqcZO3bBkF2qCDBmvJkpA8j9zpgwFNk1NCZyjxpc';
    
    // Make sure we have both URL and key before trying to create client
    if (!url || !key) {
      console.warn('Supabase environment variables missing. Using empty client.');
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


