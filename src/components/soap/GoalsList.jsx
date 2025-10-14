/**
 * GoalsList Component
 * Editable list for short-term and long-term goals
 * Clean, inline editing with add/remove functionality
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check } from 'lucide-react';

const GoalsList = ({ 
  goals = [], 
  onChange, 
  placeholder = 'Add a goal...',
  className = '' 
}) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');

  const handleAddGoal = () => {
    if (newGoalText.trim()) {
      onChange([...goals, newGoalText.trim()]);
      setNewGoalText('');
      setIsAddingNew(false);
    }
  };

  const handleRemoveGoal = (index) => {
    const newGoals = goals.filter((_, i) => i !== index);
    onChange(newGoals);
  };

  const handleEditGoal = (index) => {
    setEditingIndex(index);
    setEditValue(goals[index]);
  };

  const handleSaveEdit = (index) => {
    if (editValue.trim()) {
      const newGoals = [...goals];
      newGoals[index] = editValue.trim();
      onChange(newGoals);
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
        setNewGoalText('');
      }
    }
  };

  return (
    <div className={`goals-list ${className}`}>
      {/* Existing Goals */}
      <AnimatePresence>
        {goals.map((goal, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-start gap-3 mb-3 group"
          >
            {/* Bullet Point */}
            <div className="mt-2 w-2 h-2 rounded-full bg-blue-primary flex-shrink-0" />
            
            {/* Goal Content */}
            <div className="flex-1">
              {editingIndex === index ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, () => handleSaveEdit(index))}
                    className="flex-1 px-3 py-2 bg-white/50 backdrop-blur-8 border border-blue-primary/50 
                               rounded-lg text-grey-900 focus:outline-none focus:ring-2 focus:ring-blue-primary/30"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(index)}
                    className="p-2 bg-blue-primary text-white rounded-lg hover:bg-blue-dark transition-colors"
                    title="Save"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => handleEditGoal(index)}
                  className="px-3 py-2 rounded-lg hover:bg-white/30 cursor-pointer transition-colors"
                >
                  <p className="text-grey-900">{goal}</p>
                </div>
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={() => handleRemoveGoal(index)}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-grey-500 hover:text-red-500 
                         hover:bg-red-50 rounded-lg transition-all"
              title="Remove goal"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add New Goal */}
      {isAddingNew ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-3"
        >
          <div className="w-2 h-2 rounded-full bg-blue-primary/50 flex-shrink-0 mt-2" />
          <input
            type="text"
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, handleAddGoal)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 bg-white/50 backdrop-blur-8 border border-blue-primary/50 
                       rounded-lg text-grey-900 placeholder-grey-500 focus:outline-none focus:ring-2 
                       focus:ring-blue-primary/30"
            autoFocus
          />
          <button
            onClick={handleAddGoal}
            className="p-2 bg-blue-primary text-white rounded-lg hover:bg-blue-dark transition-colors"
            title="Add goal"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsAddingNew(false);
              setNewGoalText('');
            }}
            className="p-2 text-grey-500 hover:text-grey-700 hover:bg-grey-100 rounded-lg transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      ) : (
        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center gap-2 px-3 py-2 text-blue-primary hover:bg-blue-light/30 
                     rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      )}

      {/* Empty State */}
      {goals.length === 0 && !isAddingNew && (
        <p className="text-grey-500 text-sm italic py-2">No goals added yet. Click "Add Goal" to start.</p>
      )}
    </div>
  );
};

export default GoalsList;
