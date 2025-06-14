import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, HelpCircle } from 'lucide-react';
import useTemplates from '@/hooks/useTemplates';

/**
 * Template Editor Component
 * Allows users to create and edit SOAP note templates
 * Handles validation and saving of templates
 */
const TemplateEditor = ({ template = null, onClose, onSave }) => {
  const { bodyRegions, sessionTypes, createTemplate, updateTemplate } = useTemplates();
  
  // Initialize form state
  const [formData, setFormData] = useState({
    id: template?.id || '',
    name: template?.name || '',
    bodyRegion: template?.bodyRegion || bodyRegions[0],
    sessionType: template?.sessionType || sessionTypes[0],
    subjective: template?.subjective || '',
    objective: template?.objective || '',
    assessment: template?.assessment || '',
    plan: template?.plan || '',
    isDefault: template?.isDefault || false,
  });
  
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('subjective');
  
  // SOAP section explanations for tooltips
  const sectionExplanations = {
    subjective: "Patient's reported symptoms, feelings, and history. Use [patient_name] as placeholder.",
    objective: "Measurable observations from your assessment. Use [measurement] as placeholder.",
    assessment: "Your professional evaluation of the patient's condition.",
    plan: "Treatment plan and future steps. Use [next_appointment] as placeholder."
  };
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }
    
    if (!formData.bodyRegion) {
      newErrors.bodyRegion = 'Body region is required';
    }
    
    if (!formData.sessionType) {
      newErrors.sessionType = 'Session type is required';
    }
    
    // Ensure at least minimal content in each SOAP section
    if (!formData.subjective.trim()) {
      newErrors.subjective = 'Subjective section cannot be empty';
    }
    
    if (!formData.objective.trim()) {
      newErrors.objective = 'Objective section cannot be empty';
    }
    
    if (!formData.assessment.trim()) {
      newErrors.assessment = 'Assessment section cannot be empty';
    }
    
    if (!formData.plan.trim()) {
      newErrors.plan = 'Plan section cannot be empty';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // If we have an ID, update existing template, otherwise create new one
      const savedTemplate = formData.id
        ? await updateTemplate(formData)
        : await createTemplate(formData);
      
      onSave(savedTemplate);
    } catch (error) {
      console.error('Error saving template:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to save template'
      }));
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-xl shadow-xl overflow-hidden border border-[#e9e9e7] w-full max-h-[90vh] sm:max-h-none overflow-y-auto"
    >
      {/* Header - Fixed at the top */}
      <div className="border-b border-[#e9e9e7] bg-[#f9fafb] px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-lg sm:text-xl font-medium text-[#111827]">
          {template ? 'Edit Template' : 'Create Template'}
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-[#f3f4f6] transition-colors"
          aria-label="Close"
        >
          <X size={20} className="text-[#4b5563]" />
        </button>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6">
        <div className="space-y-5 sm:space-y-6">
          {/* Template Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#4b5563] mb-1">
              Template Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-[#e9e9e7]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]`}
              placeholder="Enter template name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          
          {/* Body Region & Session Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Body Region */}
            <div>
              <label htmlFor="bodyRegion" className="block text-sm font-medium text-[#4b5563] mb-1">
                Body Region
              </label>
              <select
                id="bodyRegion"
                name="bodyRegion"
                value={formData.bodyRegion}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2 border ${errors.bodyRegion ? 'border-red-500' : 'border-[#e9e9e7]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] bg-white`}
              >
                {bodyRegions.map((region) => (
                  <option key={region} value={region}>
                    {region.charAt(0).toUpperCase() + region.slice(1)}
                  </option>
                ))}
              </select>
              {errors.bodyRegion && (
                <p className="mt-1 text-sm text-red-500">{errors.bodyRegion}</p>
              )}
            </div>
            
            {/* Session Type */}
            <div>
              <label htmlFor="sessionType" className="block text-sm font-medium text-[#4b5563] mb-1">
                Session Type
              </label>
              <select
                id="sessionType"
                name="sessionType"
                value={formData.sessionType}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2 border ${errors.sessionType ? 'border-red-500' : 'border-[#e9e9e7]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] bg-white`}
              >
                {sessionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              {errors.sessionType && (
                <p className="mt-1 text-sm text-red-500">{errors.sessionType}</p>
              )}
            </div>
          </div>
          
          {/* SOAP Section Tabs */}
          <div className="border-b border-[#e9e9e7] overflow-x-auto">
            <div className="flex min-w-full">
              {['subjective', 'objective', 'assessment', 'plan'].map((section) => (
                <button
                  key={section}
                  type="button"
                  className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap flex-1 ${
                    activeSection === section 
                      ? 'border-[#2563eb] text-[#2563eb]' 
                      : 'border-transparent text-[#4b5563] hover:text-[#111827] hover:border-[#e9e9e7]'
                  }`}
                  onClick={() => setActiveSection(section)}
                >
                  {section === 'subjective' || section === 'objective' 
                    ? section.charAt(0).toUpperCase() + section.slice(1, 3) + '.'
                    : section.charAt(0).toUpperCase() + section.slice(1, 4) + '.'}
                  <span className="hidden sm:inline">{section.slice(section === 'subjective' || section === 'objective' ? 3 : 4)}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Active SOAP Section Editor */}
          <div className="mt-3 sm:mt-4">
            <div className="flex justify-between items-center mb-2">
              <label 
                htmlFor={activeSection}
                className="block text-sm font-medium text-[#4b5563]"
              >
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Section
              </label>
              
              {/* Help tooltip with mobile support */}
              <div className="relative group">
                <button 
                  type="button" 
                  className="flex items-center justify-center p-1 rounded-full hover:bg-[#f3f4f6]"
                  onClick={(e) => {
                    e.preventDefault();
                    // For mobile, we could implement a modal tooltip instead of hover
                    // but for now we'll use the same hover logic
                  }}
                  aria-label="Template help"
                >
                  <HelpCircle size={16} className="text-[#9ca3af] hover:text-[#4b5563]" />
                </button>
                <div className="absolute right-0 w-64 p-2 bg-white border border-[#e9e9e7] rounded-lg shadow-lg text-xs text-[#4b5563] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                  {sectionExplanations[activeSection]}
                </div>
              </div>
            </div>
            
            <textarea
              id={activeSection}
              name={activeSection}
              value={formData[activeSection]}
              onChange={handleChange}
              rows={6}
              className={`w-full px-3 sm:px-4 py-3 rounded-lg border ${
                errors[activeSection] ? 'border-red-500' : 'border-[#e9e9e7]'
              } focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]`}
              placeholder={`Enter ${activeSection} template content...`}
            />
            
            {errors[activeSection] && (
              <p className="mt-1 text-sm text-red-500">{errors[activeSection]}</p>
            )}
          </div>
          
          {/* Error message */}
          {errors.submit && (
            <div className="p-3 sm:p-4 my-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
          
          {/* Form Actions - Sticky footer on mobile */}
          <div className="flex justify-end space-x-3 pt-4 mt-2 sm:mt-4 sticky sm:static bottom-0 bg-white px-4 py-3 sm:p-0 -mx-4 sm:mx-0 border-t sm:border-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 border border-[#e9e9e7] text-[#4b5563] rounded-lg hover:bg-[#f9fafb] transition-colors flex-1 sm:flex-none"
              disabled={isSaving}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="px-3 sm:px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors flex items-center justify-center gap-2 flex-1 sm:flex-none"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Template</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default TemplateEditor;
