'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import authService, { PROFESSIONS } from '../services/supabase';
import { useAuth } from './useAuth';

// Re-export PROFESSIONS constant for convenience
export { PROFESSIONS };

// Create profession context
const ProfessionContext = createContext(null);

/**
 * Profession provider component for managing profession state
 * Tracks whether user is a Physical Therapist or Chiropractor
 * @param {Object} props - Component props
 * @returns {JSX.Element} ProfessionProvider component
 */
export function ProfessionProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [profession, setProfession] = useState(PROFESSIONS.PHYSICAL_THERAPY);
  const [loading, setLoading] = useState(true);

  // Load profession from user metadata on mount or auth change
  useEffect(() => {
    const loadProfession = async () => {
      if (isAuthenticated && user) {
        try {
          // Get profession from user metadata
          const userProfession = user.user_metadata?.profession || PROFESSIONS.PHYSICAL_THERAPY;
          setProfession(userProfession);
        } catch (error) {
          console.error('Error loading profession:', error);
          setProfession(PROFESSIONS.PHYSICAL_THERAPY);
        }
      } else {
        setProfession(PROFESSIONS.PHYSICAL_THERAPY);
      }
      setLoading(false);
    };

    loadProfession();
  }, [isAuthenticated, user]);

  /**
   * Update user's profession
   * @param {string} newProfession - New profession value
   * @returns {Promise} Update result
   */
  const updateProfession = useCallback(async (newProfession) => {
    if (!Object.values(PROFESSIONS).includes(newProfession)) {
      return { success: false, error: `Invalid profession: ${newProfession}` };
    }

    try {
      const result = await authService.updateProfession(newProfession);
      if (!result.error) {
        setProfession(newProfession);
        return { success: true };
      }
      return { success: false, error: result.error.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Check if user is a Physical Therapist
   * @returns {boolean}
   */
  const isPT = useCallback(() => {
    return profession === PROFESSIONS.PHYSICAL_THERAPY;
  }, [profession]);

  /**
   * Check if user is a Chiropractor
   * @returns {boolean}
   */
  const isChiro = useCallback(() => {
    return profession === PROFESSIONS.CHIROPRACTIC;
  }, [profession]);

  /**
   * Get display name for current profession
   * @returns {string}
   */
  const getProfessionDisplayName = useCallback(() => {
    return profession === PROFESSIONS.CHIROPRACTIC ? 'Chiropractor' : 'Physical Therapist';
  }, [profession]);

  /**
   * Get short display name for current profession
   * @returns {string}
   */
  const getProfessionShortName = useCallback(() => {
    return profession === PROFESSIONS.CHIROPRACTIC ? 'Chiro' : 'PT';
  }, [profession]);

  /**
   * Get app title based on profession
   * @returns {string}
   */
  const getAppTitle = useCallback(() => {
    return profession === PROFESSIONS.CHIROPRACTIC 
      ? 'Chiropractic SOAP Generator' 
      : 'PT SOAP Generator';
  }, [profession]);

  // Context value
  const value = {
    profession,
    loading,
    updateProfession,
    isPT,
    isChiro,
    getProfessionDisplayName,
    getProfessionShortName,
    getAppTitle,
    PROFESSIONS,
  };

  return (
    <ProfessionContext.Provider value={value}>
      {children}
    </ProfessionContext.Provider>
  );
}

/**
 * Custom hook for accessing profession context
 * @returns {Object} Profession context
 */
export function useProfession() {
  const context = useContext(ProfessionContext);
  if (context === undefined || context === null) {
    // Return default values if used outside provider (for backward compatibility)
    return {
      profession: PROFESSIONS.PHYSICAL_THERAPY,
      loading: false,
      updateProfession: async () => ({ success: false, error: 'ProfessionProvider not found' }),
      isPT: () => true,
      isChiro: () => false,
      getProfessionDisplayName: () => 'Physical Therapist',
      getProfessionShortName: () => 'PT',
      getAppTitle: () => 'PT SOAP Generator',
      PROFESSIONS,
    };
  }
  return context;
}

export default useProfession;


