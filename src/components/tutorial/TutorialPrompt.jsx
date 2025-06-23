import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, X, ArrowRight } from 'lucide-react';

/**
 * Tutorial Prompt Component
 * Displays a prompt for new users to start the tutorial
 */
const TutorialPrompt = ({ onStart, onDismiss }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed bottom-6 right-6 bg-white rounded-xl shadow-lg overflow-hidden z-40 border border-gray-100 max-w-xs"
      style={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
    >
      {/* Blue header accent */}
      <div className="h-1 bg-gradient-to-r from-blue-primary to-blue-600"></div>
      
      <div className="p-5">
        <div className="flex items-start">
          <div className="bg-blue-50 p-3 rounded-full mr-4 flex-shrink-0">
            <BookOpen size={22} className="text-blue-primary" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1.5">New to PT SOAP Generator?</h4>
            <p className="text-sm text-gray-600 mb-4">
              Take a quick tour to learn how the app works and get started quickly.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={onDismiss}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 transition-colors"
              >
                Maybe Later
              </button>
              <motion.button 
                onClick={onStart}
                className="text-sm bg-blue-primary text-white px-4 py-1.5 rounded-lg hover:bg-blue-600 flex items-center transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Tour
                <ArrowRight size={14} className="ml-1.5" />
              </motion.button>
            </div>
          </div>
          
          <button 
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-500 ml-2 p-1"
            aria-label="Dismiss tutorial prompt"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TutorialPrompt;
