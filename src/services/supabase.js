import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with the project URL and anonymous key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  );
}

// Create a single instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    flowType: 'pkce',
    detectSessionInUrl: true,
    /**
     * Set session expiry to 1 hour (3600 seconds) for security
     * This ensures users are logged out after inactivity
     */
    sessionExpirySeconds: 3600,
  },
});

/**
 * Authentication service for PT SOAP Generator
 * Handles therapist authentication while ensuring NO patient data is stored
 */
const authService = {
  /**
   * Sign up a new therapist
   * @param {string} email - Therapist's email
   * @param {string} password - Therapist's password
   * @param {Object} metadata - Optional metadata (e.g., name, role)
   * @returns {Promise} - Sign up result
   */
  signUp: async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...metadata,
            role: 'therapist', // Always set role to therapist
            created_at: new Date().toISOString(),
          },
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Sign in an existing therapist
   * @param {string} email - Therapist's email
   * @param {string} password - Therapist's password
   * @returns {Promise} - Sign in result
   */
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Sign out the current therapist
   * @returns {Promise} - Sign out result
   */
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error.message);
      return { error };
    }
  },

  /**
   * Get the current session
   * @returns {Object|null} - Current session or null if not authenticated
   */
  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session: data.session, error: null };
    } catch (error) {
      console.error('Error getting session:', error.message);
      return { session: null, error };
    }
  },

  /**
   * Get the current authenticated therapist
   * @returns {Object|null} - Current user or null if not authenticated
   */
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      console.error('Error getting current user:', error.message);
      return { user: null, error };
    }
  },

  /**
   * Reset password for a therapist
   * @param {string} email - Therapist's email
   * @returns {Promise} - Reset password result
   */
  resetPassword: async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error resetting password:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Update therapist password
   * @param {string} newPassword - New password
   * @returns {Promise} - Update password result
   */
  updatePassword: async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating password:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Set up auth state change listener
   * @param {Function} callback - Function to call when auth state changes
   * @returns {Function} - Unsubscribe function
   */
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

export default authService;