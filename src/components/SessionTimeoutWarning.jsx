/**
 * Session Timeout Warning Modal
 * SECURITY: Warns users before auto-logout
 */

import React, { useEffect, useState } from 'react';

export const SessionTimeoutWarning = ({ 
  isOpen, 
  timeRemaining, 
  onExtend, 
  onLogout 
}) => {
  const [countdown, setCountdown] = useState(timeRemaining);

  useEffect(() => {
    setCountdown(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    if (!isOpen || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, countdown, onLogout]);

  if (!isOpen) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        {/* Warning Icon */}
        <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-4">
          <svg 
            className="w-6 h-6 text-yellow-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          Session Timeout Warning
        </h3>

        {/* Message */}
        <p className="text-gray-600 text-center mb-4">
          Your session will expire due to inactivity. You will be automatically logged out in:
        </p>

        {/* Countdown */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-red-600">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            minutes remaining
          </div>
        </div>

        {/* Security Message */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Security Notice:</strong> This timeout protects your sensitive patient data (PHI) from unauthorized access.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onLogout}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Logout Now
          </button>
          <button
            onClick={onExtend}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Stay Logged In
          </button>
        </div>

        {/* Info Text */}
        <p className="text-xs text-gray-500 text-center mt-4">
          For security, sessions expire after 1 hour of inactivity
        </p>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;

