/**
 * Session Timeout Hook
 * SECURITY: Auto-logout users after 1 hour of inactivity
 * Shows warning 5 minutes before logout
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const SESSION_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_SECONDS) || 3600; // 1 hour
const WARNING_TIME = parseInt(process.env.NEXT_PUBLIC_SESSION_WARNING_SECONDS) || 300; // 5 minutes
const CHECK_INTERVAL = 5000; // Check every 5 seconds

export const useSessionTimeout = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const lastActivityRef = useRef(Date.now());
  const warningShownRef = useRef(false);
  const checkIntervalRef = useRef(null);

  // Reset activity timer
  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
    setShowWarning(false);
    setTimeRemaining(null);
  }, []);

  // Handle logout
  const handleLogout = useCallback(async () => {
    console.log('🔒 Session timeout - logging out');
    try {
      await supabase.auth.signOut();
      // Redirect will be handled by auth state change
    } catch (error) {
      console.error('Error during timeout logout:', error);
      // Force redirect even if signOut fails
      window.location.href = '/landing';
    }
  }, []);

  // Extend session
  const extendSession = useCallback(async () => {
    try {
      // Refresh the session
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Failed to refresh session:', error);
        await handleLogout();
        return false;
      }

      if (data?.session) {
        resetActivity();
        console.log('✅ Session extended');
        return true;
      } else {
        await handleLogout();
        return false;
      }
    } catch (error) {
      console.error('Error extending session:', error);
      await handleLogout();
      return false;
    }
  }, [handleLogout, resetActivity]);

  // Check session timeout
  const checkTimeout = useCallback(async () => {
    const now = Date.now();
    const timeSinceActivity = now - lastActivityRef.current;
    const timeUntilTimeout = SESSION_TIMEOUT * 1000 - timeSinceActivity;

    // Session expired - logout
    if (timeUntilTimeout <= 0) {
      console.log('⏰ Session expired');
      await handleLogout();
      return;
    }

    // Show warning if approaching timeout
    if (timeUntilTimeout <= WARNING_TIME * 1000 && !warningShownRef.current) {
      console.log('⚠️ Session timeout warning');
      warningShownRef.current = true;
      setShowWarning(true);
      setTimeRemaining(Math.ceil(timeUntilTimeout / 1000));
    }

    // Update remaining time if warning is shown
    if (showWarning) {
      setTimeRemaining(Math.ceil(timeUntilTimeout / 1000));
    }
  }, [handleLogout, showWarning]);

  // Set up activity listeners
  useEffect(() => {
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      // Only reset if not in warning state, or user explicitly interacts
      if (!showWarning) {
        resetActivity();
      }
    };

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Start checking for timeout
    checkIntervalRef.current = setInterval(checkTimeout, CHECK_INTERVAL);

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [resetActivity, checkTimeout, showWarning]);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // No active session, let auth flow handle it
        return;
      }
      
      // Initialize activity timer
      resetActivity();
    };

    checkSession();
  }, [resetActivity]);

  return {
    showWarning,
    timeRemaining,
    extendSession,
    handleLogout
  };
};

export default useSessionTimeout;

