import React from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

/**
 * Floating Action Button (FAB) component for quick recording access
 * Positioned at the bottom of the screen and persists across the app
 * Styled with glassmorphism effect and blue accent color
 */
const FloatingActionButton = ({ onClick }) => {
  return (
    <motion.button
      className="fixed right-6 bottom-6 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full bg-[rgba(37,99,235,0.9)] backdrop-blur-md shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: 0.2
      }}
    >
      {/* Inner glow ring */}
      <div className="absolute inset-0 rounded-full bg-[rgba(255,255,255,0.15)] scale-[0.85] blur-[2px]"></div>
      
      {/* Mic icon */}
      <Mic className="text-white w-6 h-6 md:w-7 md:h-7 relative z-10" />
      
      {/* Accessibility label for screen readers */}
      <span className="sr-only">Start new recording</span>
      
      {/* Pulse animation for attention */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-[rgba(37,99,235,0.3)]"
        animate={{ 
          scale: [0.85, 1.2, 0.85],
          opacity: [0.7, 0, 0.7]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatType: "loop"
        }}
      />
    </motion.button>
  );
};

export default FloatingActionButton;
