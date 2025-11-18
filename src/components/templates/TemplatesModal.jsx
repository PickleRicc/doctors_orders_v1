/**
 * Templates Modal Component
 * Modal overlay for managing custom templates from the main page
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import CustomTemplatesList from './CustomTemplatesList';

export default function TemplatesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl flex flex-col"
          style={{ maxHeight: '90vh' }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-grey-100 dark:bg-grey-800 hover:bg-grey-200 dark:hover:bg-grey-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-grey-700 dark:text-grey-300" />
          </button>

          {/* Templates List Content - Scrollable */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ minHeight: 0 }}>
            <CustomTemplatesList onClose={onClose} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

