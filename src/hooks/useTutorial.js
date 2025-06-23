import { useState, useEffect, createContext, useContext } from 'react';

// Create context for tutorial state
const TutorialContext = createContext();

/**
 * Provider component for tutorial state
 */
export const TutorialProvider = ({ children }) => {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false);
  const [shouldShowTutorialPrompt, setShouldShowTutorialPrompt] = useState(false);

  // Check local storage for tutorial completion status on initial load
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('tutorialCompleted') === 'true';
    setHasCompletedTutorial(tutorialCompleted);
    
    // Show tutorial prompt for new users after a short delay
    if (!tutorialCompleted) {
      const timer = setTimeout(() => {
        setShouldShowTutorialPrompt(true);
      }, 5000); // 5 seconds delay
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Open the tutorial
  const openTutorial = () => {
    setIsTutorialOpen(true);
    setShouldShowTutorialPrompt(false);
  };

  // Close the tutorial and mark as completed
  const closeTutorial = (markCompleted = false) => {
    setIsTutorialOpen(false);
    
    if (markCompleted) {
      setHasCompletedTutorial(true);
      localStorage.setItem('tutorialCompleted', 'true');
    }
  };

  // Reset tutorial completion status (for testing or user preference)
  const resetTutorial = () => {
    setHasCompletedTutorial(false);
    localStorage.removeItem('tutorialCompleted');
  };

  // Dismiss the tutorial prompt without opening tutorial
  const dismissTutorialPrompt = () => {
    setShouldShowTutorialPrompt(false);
  };

  return (
    <TutorialContext.Provider
      value={{
        isTutorialOpen,
        hasCompletedTutorial,
        shouldShowTutorialPrompt,
        openTutorial,
        closeTutorial,
        resetTutorial,
        dismissTutorialPrompt
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

/**
 * Custom hook for accessing tutorial state and functions
 */
const useTutorial = () => {
  const context = useContext(TutorialContext);
  
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  
  return context;
};

export default useTutorial;
