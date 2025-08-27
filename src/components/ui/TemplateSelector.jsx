/**
 * Template Selector Component
 * Clean template selection UI using the new template hook system
 * Replaces database template selection with code-based templates
 * Follows glassmorphism design system
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Sparkles } from 'lucide-react';
import { useTemplateManager } from '../../hooks/templates/useTemplateManager';

const TemplateSelector = ({ 
  selectedTemplate = 'knee', 
  onTemplateChange, 
  transcript = '',
  showSuggestion = true,
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const templateManager = useTemplateManager(selectedTemplate);

  // Get all available templates
  const availableTemplates = templateManager.getAvailableTemplates();

  // Auto-suggest template if transcript is provided
  const suggestion = transcript && showSuggestion ? 
    templateManager.suggestTemplate(transcript) : null;

  const handleTemplateSelect = (templateKey) => {
    onTemplateChange(templateKey);
    setIsOpen(false);
  };

  const selectedTemplateData = availableTemplates.find(t => t.key === selectedTemplate);

  return (
    <div className={`template-selector relative ${className}`}>
      {/* Suggestion Banner */}
      <AnimatePresence>
        {suggestion && suggestion.suggested !== selectedTemplate && suggestion.confidence > 0.3 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mb-3 p-3 bg-gradient-to-r from-blue-primary/10 to-purple-600/10 backdrop-blur-8 border border-blue-primary/20 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-blue-primary/20 rounded-lg">
                <Sparkles className="w-4 h-4 text-blue-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-grey-900">
                  AI suggests: {availableTemplates.find(t => t.key === suggestion.suggested)?.name}
                </p>
                <p className="text-xs text-grey-600">
                  Based on your session content ({Math.round(suggestion.confidence * 100)}% confidence)
                </p>
              </div>
              <button
                onClick={() => handleTemplateSelect(suggestion.suggested)}
                className="px-3 py-1.5 bg-blue-primary text-white text-xs font-medium rounded-lg hover:bg-blue-dark transition-colors"
              >
                Use This
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Selector */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 bg-white/25 backdrop-blur-16 border border-white/20 rounded-xl hover:bg-white/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-primary/20 rounded-lg flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-primary">
                {selectedTemplateData?.bodyRegion?.charAt(0).toUpperCase() || 'K'}
              </span>
            </div>
            <div className="text-left">
              <p className="font-medium text-grey-900">
                {selectedTemplateData?.name || 'Select Template'}
              </p>
              <p className="text-sm text-grey-600">
                {selectedTemplateData?.description || 'Choose evaluation type'}
              </p>
            </div>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-grey-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-20 border border-white/30 rounded-xl shadow-lg z-20 overflow-hidden"
            >
              <div className="py-2">
                {availableTemplates.map((template) => (
                  <button
                    key={template.key}
                    onClick={() => handleTemplateSelect(template.key)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-light/20 transition-colors
                      ${selectedTemplate === template.key ? 'bg-blue-light/30' : ''}
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold
                      ${selectedTemplate === template.key 
                        ? 'bg-blue-primary text-white' 
                        : 'bg-grey-100 text-grey-600'
                      }
                    `}>
                      {template.bodyRegion?.charAt(0).toUpperCase() || 'T'}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-grey-900">{template.name}</p>
                      <p className="text-xs text-grey-600">{template.description}</p>
                    </div>
                    {selectedTemplate === template.key && (
                      <Check className="w-4 h-4 text-blue-primary" />
                    )}
                    {suggestion && suggestion.suggested === template.key && suggestion.confidence > 0.3 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-primary/10 rounded-full">
                        <Sparkles className="w-3 h-3 text-blue-primary" />
                        <span className="text-xs text-blue-primary font-medium">AI</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TemplateSelector;
