/**
 * Session Timeout Provider
 * Wraps the app to provide session timeout functionality
 */

import React from 'react';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import SessionTimeoutWarning from './SessionTimeoutWarning';

export const SessionTimeoutProvider = ({ children }) => {
  const { 
    showWarning, 
    timeRemaining, 
    extendSession, 
    handleLogout 
  } = useSessionTimeout();

  return (
    <>
      {children}
      <SessionTimeoutWarning
        isOpen={showWarning}
        timeRemaining={timeRemaining}
        onExtend={extendSession}
        onLogout={handleLogout}
      />
    </>
  );
};

export default SessionTimeoutProvider;

