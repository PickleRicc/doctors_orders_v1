import React from 'react';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Tutorial Button Component
 * Displays a button in the sidebar to open the tutorial
 */
const TutorialButton = ({ onClick, collapsed }) => {
  return (
    <motion.button
      onClick={onClick}
      className={`flex items-center w-full px-3 py-2.5 rounded-lg transition-colors ${collapsed ? 'justify-center' : ''} hover:bg-blue-50 group`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div 
        className="flex items-center justify-center bg-blue-50 rounded-full p-1.5 group-hover:bg-blue-100 transition-colors"
        whileHover={{ rotate: [0, -10, 10, -5, 0] }}
        transition={{ duration: 0.5 }}
      >
        <BookOpen size={collapsed ? 20 : 18} className="text-blue-primary" />
      </motion.div>
      
      {!collapsed && (
        <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-blue-primary transition-colors">Tutorial</span>
      )}
    </motion.button>
  );
};

export default TutorialButton;
