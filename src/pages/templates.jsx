import React, { useState } from 'react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import TemplateList from '../components/templates/TemplateList';
import TemplateEditor from '../components/templates/TemplateEditor';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText } from 'lucide-react';

/**
 * Templates Page
 * Main page for managing SOAP note templates
 * Allows viewing, creating, editing, and deleting templates
 */
const Templates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Handle opening the editor for creating a new template
  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setIsCreating(true);
    setIsEditorOpen(true);
  };
  
  // Handle opening the editor for editing an existing template
  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setIsCreating(false);
    setIsEditorOpen(true);
  };
  
  // Handle closing the template editor
  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    // Wait for exit animation before clearing selected template
    setTimeout(() => {
      setSelectedTemplate(null);
      setIsCreating(false);
    }, 300);
  };
  
  // Handle saving a template (create or update)
  const handleSaveTemplate = (savedTemplate) => {
    console.log('Template saved:', savedTemplate);
    setIsEditorOpen(false);
    
    // Optional: Show success message toast
    // Wait for exit animation before clearing selected template
    setTimeout(() => {
      setSelectedTemplate(null);
      setIsCreating(false);
    }, 300);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-[#111827]">Templates</h1>
                <p className="text-[#4b5563] mt-1 text-sm sm:text-base">
                  Create and manage SOAP note templates for your sessions
                </p>
              </div>
              
              <div className="hidden sm:flex h-12 w-12 rounded-full bg-[#2563eb]/10 items-center justify-center text-[#2563eb]">
                <FileText size={24} />
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="relative">
            {/* Template List */}
            <TemplateList 
              onSelectTemplate={handleEditTemplate}
              onEditTemplate={handleEditTemplate}
              onNewTemplate={handleNewTemplate}
            />
            
            {/* Template Editor Modal */}
            <AnimatePresence>
              {isEditorOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/30 backdrop-blur-sm overflow-y-auto"
                  onClick={handleCloseEditor}
                >
                  <motion.div 
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    exit={{ y: 20 }}
                    className="w-full max-w-4xl my-4 sm:my-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TemplateEditor 
                      template={selectedTemplate}
                      onClose={handleCloseEditor}
                      onSave={handleSaveTemplate}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Templates;
