import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic } from 'lucide-react';
import { useRouter } from 'next/router';
import MagneticButton from './MagneticButton';

/**
 * Modal component that provides options to start a new recording
 * Uses framer-motion for smooth enter/exit animations
 * Handles backdrop clicks and escape key for dismissal
 * Redirects to the dedicated recording page
 * Refactored to use Glassmorphism and MagneticButton
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Modal content */}
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()} // Prevent clicks from closing modal
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-[60] w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Close modal"
            >
              <X size={18} className="text-gray-600 dark:text-gray-300" />
            </button>

            {/* Record button and description */}
            <div className="p-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Mic size={32} className="text-white" />
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">New Recording Session</h2>

              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Start a new recording to generate a SOAP note for your physical therapy session.
              </p>

              <MagneticButton
                onClick={handleStartRecording}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium shadow-lg shadow-blue-600/30 transition-all hover:shadow-blue-600/50"
              >
                <Mic size={18} />
                Start Recording
              </MagneticButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RecordingModal;
