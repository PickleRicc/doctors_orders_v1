import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Reusable confirmation dialog component
 * Used for confirming potentially destructive actions like deletion
 */
const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?', 
  confirmText = 'Confirm',
  cancelText = 'Cancel', 
  confirmButtonClass = 'bg-red-500 hover:bg-red-600' 
}) => {
  if (!isOpen) return null;

  // Keyboard handlers for accessibility
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      onConfirm();
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-labelledby="confirmation-title"
      aria-describedby="confirmation-message"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog Content */}
      <motion.div 
        className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden z-10"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h2 
            id="confirmation-title" 
            className="text-lg font-semibold text-gray-900"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <p id="confirmation-message" className="text-gray-600">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            aria-label={cancelText}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md text-white transition-colors ${confirmButtonClass}`}
            autoFocus
            aria-label={confirmText}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationDialog;
