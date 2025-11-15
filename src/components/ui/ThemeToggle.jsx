'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { motion } from 'framer-motion';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`p-2 text-grey-600 hover:text-grey-900 hover:bg-grey-50 dark:text-grey-400 dark:hover:text-grey-100 dark:hover:bg-grey-800 rounded-lg transition-colors ${className}`}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </motion.button>
  );
}

