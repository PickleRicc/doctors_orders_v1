/**
 * InterventionsList Component
 * Reusable bullet list for interventions, progressions, and regressions
 * Supports inline editing with add/remove functionality
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, GripVertical } from 'lucide-react';

const InterventionsList = ({ 
  items = [], 
  onChange, 
  placeholder = 'Add an item...',
  emptyMessage = 'No items added yet.',
  className = '' 
}) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemText, setNewItemText] = useState('');

  const handleAddItem = () => {
    if (newItemText.trim()) {
      onChange([...items, newItemText.trim()]);
      setNewItemText('');
      setIsAddingNew(false);
    }
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const handleEditItem = (index) => {
    setEditingIndex(index);
    setEditValue(items[index]);
  };

  const handleSaveEdit = (index) => {
    if (editValue.trim()) {
      const newItems = [...items];
      newItems[index] = editValue.trim();
      onChange(newItems);
    }
    setEditingIndex(null);
    setEditValue('');
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    } else if (e.key === 'Escape') {
      if (editingIndex !== null) {
        setEditingIndex(null);
        setEditValue('');
      } else {
        setIsAddingNew(false);
        setNewItemText('');
      }
    }
  };

  return (
    <div className={`interventions-list ${className}`}>
      {/* Existing Items */}
      <AnimatePresence>
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-start gap-2 mb-2 group"
          >
            {/* Drag Handle (visual only for now) */}
            <div className="mt-2 opacity-0 group-hover:opacity-50 transition-opacity">
              <GripVertical className="w-4 h-4 text-grey-400" />
            </div>
            
            {/* Bullet Point */}
            <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-blue-primary flex-shrink-0" />
            
            {/* Item Content */}
            <div className="flex-1">
              {editingIndex === index ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, () => handleSaveEdit(index))}
                    className="flex-1 px-3 py-1.5 text-sm bg-white/50 backdrop-blur-8 border border-blue-primary/50 
                               rounded-lg text-grey-900 focus:outline-none focus:ring-2 focus:ring-blue-primary/30"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(index)}
                    className="p-1.5 bg-blue-primary text-white rounded-lg hover:bg-blue-dark transition-colors"
                    title="Save"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => handleEditItem(index)}
                  className="px-2 py-1 rounded-lg hover:bg-white/30 cursor-pointer transition-colors"
                >
                  <p className="text-grey-900 text-sm">{item}</p>
                </div>
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={() => handleRemoveItem(index)}
              className="opacity-0 group-hover:opacity-100 p-1 text-grey-500 hover:text-red-500 
                         hover:bg-red-50 rounded transition-all mt-1"
              title="Remove item"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add New Item */}
      {isAddingNew ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-2"
        >
          <div className="w-4 h-4" /> {/* Spacer for drag handle */}
          <div className="w-1.5 h-1.5 rounded-full bg-blue-primary/50 flex-shrink-0 mt-2" />
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, handleAddItem)}
            placeholder={placeholder}
            className="flex-1 px-3 py-1.5 text-sm bg-white/50 backdrop-blur-8 border border-blue-primary/50 
                       rounded-lg text-grey-900 placeholder-grey-500 focus:outline-none focus:ring-2 
                       focus:ring-blue-primary/30"
            autoFocus
          />
          <button
            onClick={handleAddItem}
            className="p-1.5 bg-blue-primary text-white rounded-lg hover:bg-blue-dark transition-colors"
            title="Add item"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setIsAddingNew(false);
              setNewItemText('');
            }}
            className="p-1.5 text-grey-500 hover:text-grey-700 hover:bg-grey-100 rounded-lg transition-colors"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      ) : (
        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-blue-primary hover:bg-blue-light/30 
                     rounded-lg transition-colors text-sm font-medium ml-6"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </button>
      )}

      {/* Empty State */}
      {items.length === 0 && !isAddingNew && (
        <p className="text-grey-500 text-sm italic py-2 ml-6">{emptyMessage}</p>
      )}
    </div>
  );
};

export default InterventionsList;
