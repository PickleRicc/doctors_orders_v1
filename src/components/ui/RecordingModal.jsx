import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic } from 'lucide-react';
import { useRouter } from 'next/router';
import { Button } from '@mui/material';

/**
 * Modal component that provides options to start a new recording
 * Uses framer-motion for smooth enter/exit animations
 * Handles backdrop clicks and escape key for dismissal
 * Redirects to the dedicated recording page
 */
const RecordingModal = ({ isOpen, onClose }) => {
  const router = useRouter();

  // Handle escape key press
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Navigate to the recording page
  const handleStartRecording = () => {
    onClose();
    router.push('/record');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Modal content */}
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Prevent clicks from closing modal
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-[60] w-8 h-8 rounded-full bg-[rgba(0,0,0,0.05)] hover:bg-[rgba(0,0,0,0.1)] flex items-center justify-center transition-colors"
              aria-label="Close modal"
            >
              <X size={18} className="text-[#454440]" />
            </button>
            
            {/* Record button and description */}
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Mic size={32} color="white" />
              </div>
              
              <h2 className="text-2xl font-semibold mb-2">New Recording Session</h2>
              
              <p className="text-gray-600 mb-6">
                Start a new recording to generate a SOAP note for your physical therapy session.
              </p>
              
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<Mic size={18} />}
                onClick={handleStartRecording}
                sx={{
                  borderRadius: 8,
                  py: 1.5,
                  px: 4,
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                }}
              >
                Start Recording
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RecordingModal;
