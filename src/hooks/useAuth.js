import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import authService from '../services/supabase';

// Create auth context
const AuthContext = createContext(null);

/**
 * Auth provider component for managing authentication state
 * @param {Object} props - Component props
 * @returns {JSX.Element} AuthProvider component
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Set up auth state listener
  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      try {
        const { session } = await authService.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error checking session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth state changes
    const { data: authListener } = authService.onAuthStateChange((event, session) => {
      setUser(session?.user || null);

      // Handle auth events
      switch (event) {
        case 'SIGNED_OUT':
          // Redirect to auth page when signed out
          router.push('/auth');
          break;
        case 'SIGNED_IN':
          // Additional signed in handling if needed
          break;
        case 'TOKEN_REFRESHED':
          console.log('Auth token refreshed');
          break;
        case 'USER_UPDATED':
          console.log('User profile updated');
          break;
        default:
          break;
      }
    });
    
    // Setup session expiration check (runs every minute)
    const sessionCheckInterval = setInterval(async () => {
      const { session } = await authService.getSession();
      if (!session && user) {
        // Session expired, force sign out
        console.log('Session expired, logging out...');
        authService.signOut();
        setUser(null);
        router.push('/auth');
      }
    }, 60000); // Check every minute

    // Clean up subscription on unmount
    return () => {
      if (authListener && authListener.unsubscribe) {
        authListener.unsubscribe();
      }
    };
  }, []);

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Sign in result
   */
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.signIn(email, password);
      if (!response.error) {
        return { success: true };
      }
      return { success: false, error: response.error.message };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign up with email, password and user details
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} metadata - User metadata like name
   * @returns {Promise} Sign up result
   */
  const signUp = async (email, password, metadata = {}) => {
    setLoading(true);
    try {
      const response = await authService.signUp(email, password, metadata);
      if (!response.error) {
        return { success: true };
      }
      return { success: false, error: response.error.message };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out the current user
   * @returns {Promise} Sign out result
   */
  const signOut = async () => {
    try {
      await authService.signOut();
      router.push('/auth');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  /**
   * Reset password for a user
   * @param {string} email - User email
   * @returns {Promise} Password reset result
   */
  const resetPassword = async (email) => {
    try {
      const response = await authService.resetPassword(email);
      if (!response.error) {
        return { success: true };
      }
      return { success: false, error: response.error.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Auth context value
  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
  };

  // Provider component
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook for accessing authentication context
 * @returns {Object} Authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;