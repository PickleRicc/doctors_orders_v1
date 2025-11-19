/**
 * Template Builder Component
 * UI for creating and editing custom SOAP note templates
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, X, Star, GripVertical } from 'lucide-react';

const BODY_REGIONS = [
  'knee', 'shoulder', 'back', 'hip', 'ankle-foot', 'neck',
  'elbow', 'wrist', 'hand', 'other'
];

const SESSION_TYPES = [
  'evaluation', 'daily-note', 'progress', 'discharge', 'reassessment'
];

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' }
];

export default function TemplateBuilder({
  initialTemplate = null,
  onSave,
  onCancel
}) {
  const getDefaultTemplate = () => ({
    name: '',
    template_type: '',
    body_region: '',
    session_type: '',
    description: '',
    template_config: {
      subjective: { fields: [] },
      objective: { measurements: [] },
      assessment: { prompts: [] },
      plan: { sections: [] }
    }
  });

  const [template, setTemplate] = useState(getDefaultTemplate());

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Load initial template if editing
  useEffect(() => {
    if (initialTemplate) {
      // Ensure template_config has all required sections
      const loadedTemplate = {
        ...initialTemplate,
        template_config: {
          subjective: initialTemplate.template_config?.subjective || { fields: [] },
          objective: initialTemplate.template_config?.objective || { measurements: [] },
          assessment: initialTemplate.template_config?.assessment || { prompts: [] },
          plan: initialTemplate.template_config?.plan || { sections: [] }
        }
      };
      setTemplate(loadedTemplate);
    }
  }, [initialTemplate]);

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!template.name.trim()) {
      newErrors.name = 'Template name is required';
    }

    if (!template.template_type.trim()) {
      newErrors.template_type = 'Template type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setIsSaving(true);
    try {
      console.log('💾 Saving template:', template);
      console.log('Template config:', JSON.stringify(template.template_config, null, 2));

      // Ensure template_config is properly structured
      const templateToSave = {
        ...template,
        template_config: {
          subjective: template.template_config?.subjective || { fields: [] },
          objective: template.template_config?.objective || { measurements: [] },
          assessment: template.template_config?.assessment || { prompts: [] },
          plan: template.template_config?.plan || { sections: [] }
        }
      };

      console.log('Cleaned template to save:', templateToSave);
      await onSave(templateToSave);
    } catch (error) {
      console.error('Error saving template:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  // Add field to subjective
  const addSubjectiveField = () => {
    setTemplate(prev => ({
      ...prev,
      template_config: {
        ...prev.template_config,
        subjective: {
          fields: [
            ...(prev.template_config?.subjective?.fields || []),
            { id: `field_${Date.now()}`, label: '', type: 'text' }
          ]
        }
      }
    }));
  };

  // Update subjective field
  const updateSubjectiveField = (index, updates) => {
    setTemplate(prev => {
      const currentFields = prev.template_config?.subjective?.fields || [];
      const newFields = [...currentFields];
      newFields[index] = { ...newFields[index], ...updates };
      return {
        ...prev,
        template_config: {
          ...prev.template_config,
          subjective: { fields: newFields }
        }
      };
    });
  };

  // Remove subjective field
  const removeSubjectiveField = (index) => {
    setTemplate(prev => ({
      ...prev,
      template_config: {
        ...prev.template_config,
        subjective: {
          fields: (prev.template_config?.subjective?.fields || []).filter((_, i) => i !== index)
        }
      }
    }));
  };

  // Add objective measurement
  const addObjectiveMeasurement = () => {
    setTemplate(prev => ({
      ...prev,
      template_config: {
        ...prev.template_config,
        objective: {
          measurements: [
            ...(prev.template_config?.objective?.measurements || []),
            { id: `measurement_${Date.now()}`, label: '', unit: '', type: 'text' }
          ]
        }
      }
    }));
  };

  // Update objective measurement
  const updateObjectiveMeasurement = (index, updates) => {
    setTemplate(prev => {
      const currentMeasurements = prev.template_config?.objective?.measurements || [];
      const newMeasurements = [...currentMeasurements];
      newMeasurements[index] = { ...newMeasurements[index], ...updates };
      return {
        ...prev,
        template_config: {
          ...prev.template_config,
          objective: { measurements: newMeasurements }
        }
      };
    });
  };

  // Remove objective measurement
  const removeObjectiveMeasurement = (index) => {
    setTemplate(prev => ({
      ...prev,
      template_config: {
        ...prev.template_config,
        objective: {
          measurements: (prev.template_config?.objective?.measurements || []).filter((_, i) => i !== index)
        }
      }
    }));
  };

  // Add assessment prompt
  const addAssessmentPrompt = () => {
    setTemplate(prev => ({
      ...prev,
      template_config: {
        ...prev.template_config,
        assessment: {
          prompts: [...(prev.template_config?.assessment?.prompts || []), '']
        }
      }
    }));
  };

  // Update assessment prompt
  const updateAssessmentPrompt = (index, value) => {
    setTemplate(prev => {
      const currentPrompts = prev.template_config?.assessment?.prompts || [];
      const newPrompts = [...currentPrompts];
      newPrompts[index] = value;
      return {
        ...prev,
        template_config: {
          ...prev.template_config,
          assessment: { prompts: newPrompts }
        }
      };
    });
  };

  // Remove assessment prompt
  const removeAssessmentPrompt = (index) => {
    setTemplate(prev => ({
      ...prev,
      template_config: {
        ...prev.template_config,
        assessment: {
          prompts: (prev.template_config?.assessment?.prompts || []).filter((_, i) => i !== index)
        }
      }
    }));
  };

  // Add plan section
  const addPlanSection = () => {
    setTemplate(prev => ({
      ...prev,
      template_config: {
        ...prev.template_config,
        plan: {
          sections: [
            ...(prev.template_config?.plan?.sections || []),
            { id: `section_${Date.now()}`, label: '' }
          ]
        }
      }
    }));
  };

  // Update plan section
  const updatePlanSection = (index, updates) => {
    setTemplate(prev => {
      const currentSections = prev.template_config?.plan?.sections || [];
      const newSections = [...currentSections];
      newSections[index] = { ...newSections[index], ...updates };
      return {
        ...prev,
        template_config: {
          ...prev.template_config,
          plan: { sections: newSections }
        }
      };
    });
  };

  // Remove plan section
  const removePlanSection = (index) => {
    setTemplate(prev => ({
      ...prev,
      template_config: {
        ...prev.template_config,
        plan: {
          sections: (prev.template_config?.plan?.sections || []).filter((_, i) => i !== index)
        }
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-grey-900 dark:text-grey-100 mb-2">
          {initialTemplate ? 'Edit Template' : 'Create New Template'}
        </h1>
        <p className="text-grey-600 dark:text-grey-400">
          Design a custom SOAP note template for your specific needs
        </p>
      </div>

      {/* Basic Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/50 dark:bg-white/5 rounded-xl p-6 mb-6 border border-grey-200 dark:border-white/10 backdrop-blur-sm"
      >
        <h2 className="text-xl font-semibold text-grey-900 dark:text-grey-100 mb-4">
          Basic Information
        </h2>

        <div className="space-y-4">
          {/* Template Name */}
          <div>
            <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              className="w-full px-4 py-2 bg-white/50 dark:bg-black/20 border border-grey-200 dark:border-white/10 rounded-lg text-grey-900 dark:text-grey-100 focus:outline-none focus:ring-2 focus:ring-blue-primary transition-all"
              placeholder="e.g., Post-Surgical Knee Protocol"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Template Type */}
          <div>
            <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
              Template Type *
            </label>
            <input
              type="text"
              value={template.template_type}
              onChange={(e) => setTemplate({ ...template, template_type: e.target.value })}
              className="w-full px-4 py-2 bg-white/50 dark:bg-black/20 border border-grey-200 dark:border-white/10 rounded-lg text-grey-900 dark:text-grey-100 focus:outline-none focus:ring-2 focus:ring-blue-primary transition-all"
              placeholder="e.g., custom-knee-postsurgical"
            />
            {errors.template_type && (
              <p className="mt-1 text-sm text-red-500">{errors.template_type}</p>
            )}
          </div>

          {/* Body Region & Session Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Body Region
              </label>
              <select
                value={template.body_region}
                onChange={(e) => setTemplate({ ...template, body_region: e.target.value })}
                className="w-full px-4 py-2 bg-white/50 dark:bg-black/20 border border-grey-200 dark:border-white/10 rounded-lg text-grey-900 dark:text-grey-100 focus:outline-none focus:ring-2 focus:ring-blue-primary transition-all"
              >
                <option value="">Select...</option>
                {BODY_REGIONS.map(region => (
                  <option key={region} value={region}>
                    {region.charAt(0).toUpperCase() + region.slice(1).replace('-', '/')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Session Type
              </label>
              <select
                value={template.session_type}
                onChange={(e) => setTemplate({ ...template, session_type: e.target.value })}
                className="w-full px-4 py-2 bg-white/50 dark:bg-black/20 border border-grey-200 dark:border-white/10 rounded-lg text-grey-900 dark:text-grey-100 focus:outline-none focus:ring-2 focus:ring-blue-primary transition-all"
              >
                <option value="">Select...</option>
                {SESSION_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
              Description
            </label>
            <textarea
              value={template.description}
              onChange={(e) => setTemplate({ ...template, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white/50 dark:bg-black/20 border border-grey-200 dark:border-white/10 rounded-lg text-grey-900 dark:text-grey-100 focus:outline-none focus:ring-2 focus:ring-blue-primary transition-all"
              placeholder="Brief description of when to use this template..."
            />
          </div>
        </div>
      </motion.div>

      {/* Subjective Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/50 dark:bg-white/5 rounded-xl p-6 mb-6 border border-grey-200 dark:border-white/10 backdrop-blur-sm"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-grey-900 dark:text-grey-100">
            Subjective Section
          </h2>
          <button
            onClick={addSubjectiveField}
            className="flex items-center gap-2 px-3 py-2 bg-blue-primary hover:bg-blue-dark text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </button>
        </div>

        <div className="space-y-3">
          {(template.template_config?.subjective?.fields || []).map((field, index) => (
            <div key={field.id} className="flex gap-3 items-start p-3 bg-white/40 dark:bg-black/20 rounded-lg border border-grey-200/50 dark:border-white/5">
              <GripVertical className="w-5 h-5 text-grey-400 mt-2 flex-shrink-0" />
              <div className="flex-1 grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateSubjectiveField(index, { label: e.target.value })}
                  placeholder="Field label"
                  className="px-3 py-2 bg-white/50 dark:bg-black/20 border border-grey-200 dark:border-white/10 rounded-lg text-grey-900 dark:text-grey-100 focus:outline-none focus:ring-2 focus:ring-blue-primary"
                />
                <select
                  value={field.type}
                  onChange={(e) => updateSubjectiveField(index, { type: e.target.value })}
                  className="px-3 py-2 bg-white/50 dark:bg-black/20 border border-grey-200 dark:border-white/10 rounded-lg text-grey-900 dark:text-grey-100 focus:outline-none focus:ring-2 focus:ring-blue-primary"
                >
                  {FIELD_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => removeSubjectiveField(index)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {(template.template_config?.subjective?.fields || []).length === 0 && (
            <p className="text-center text-grey-500 dark:text-grey-400 py-4">
              No fields added yet. Click "Add Field" to get started.
            </p>
          )}
        </div>
      </motion.div>

      {/* Objective Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/50 dark:bg-white/5 rounded-xl p-6 mb-6 border border-grey-200 dark:border-white/10 backdrop-blur-sm"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-grey-900 dark:text-grey-100">
            Objective Section
          </h2>
          <button
            onClick={addObjectiveMeasurement}
            className="flex items-center gap-2 px-3 py-2 bg-blue-primary hover:bg-blue-dark text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Measurement
          </button>
        </div>

        <div className="space-y-3">
          {(template.template_config?.objective?.measurements || []).map((measurement, index) => (
            <div key={measurement.id} className="flex gap-3 items-start p-3 bg-white/40 dark:bg-black/20 rounded-lg border border-grey-200/50 dark:border-white/5">
              <GripVertical className="w-5 h-5 text-grey-400 mt-2 flex-shrink-0" />
              <div className="flex-1 grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={measurement.label}
                  onChange={(e) => updateObjectiveMeasurement(index, { label: e.target.value })}
                  placeholder="Measurement label"
                  className="px-3 py-2 bg-white/50 dark:bg-black/20 border border-grey-200 dark:border-white/10 rounded-lg text-grey-900 dark:text-grey-100 focus:outline-none focus:ring-2 focus:ring-blue-primary"
                />
                <input
                  type="text"
                  value={measurement.unit || ''}
                  onChange={(e) => updateObjectiveMeasurement(index, { unit: e.target.value })}
                  placeholder="Unit (e.g., degrees)"
                  className="px-3 py-2 bg-white/50 dark:bg-black/20 border border-grey-200 dark:border-white/10 rounded-lg text-grey-900 dark:text-grey-100 focus:outline-none focus:ring-2 focus:ring-blue-primary"
                />
                <select
                  value={measurement.type}
                  onChange={(e) => updateObjectiveMeasurement(index, { type: e.target.value })}
                  className="px-3 py-2 bg-white/50 dark:bg-black/20 border border-grey-200 dark:border-white/10 rounded-lg text-grey-900 dark:text-grey-100 focus:outline-none focus:ring-2 focus:ring-blue-primary"
                >
                  {FIELD_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => removeObjectiveMeasurement(index)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {(template.template_config?.objective?.measurements || []).length === 0 && (
            <p className="text-center text-grey-500 dark:text-grey-400 py-4">
              No measurements added yet. Click "Add Measurement" to get started.
            </p>
          )}
        </div>
      </motion.div>

      {/* Assessment Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/50 dark:bg-white/5 rounded-xl p-6 mb-6 border border-grey-200 dark:border-white/10 backdrop-blur-sm"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-grey-900 dark:text-grey-100">
            Assessment Section
          </h2>
          <button
            onClick={addAssessmentPrompt}
            className="flex items-center gap-2 px-3 py-2 bg-blue-primary hover:bg-blue-dark text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Prompt
          </button>
        </div>

        <div className="space-y-3">
          {(template.template_config?.assessment?.prompts || []).map((prompt, index) => (
            <div key={index} className="flex gap-3 items-center p-3 bg-white/40 dark:bg-black/20 rounded-lg border border-grey-200/50 dark:border-white/5">
              <GripVertical className="w-5 h-5 text-grey-400 flex-shrink-0" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => updateAssessmentPrompt(index, e.target.value)}
                placeholder="Assessment prompt or question"
                className="flex-1 px-3 py-2 bg-white/50 dark:bg-black/20 border border-grey-200 dark:border-white/10 rounded-lg text-grey-900 dark:text-grey-100 focus:outline-none focus:ring-2 focus:ring-blue-primary"
              />
              <button
                onClick={() => removeAssessmentPrompt(index)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {(template.template_config?.assessment?.prompts || []).length === 0 && (
            <p className="text-center text-grey-500 dark:text-grey-400 py-4">
              No prompts added yet. Click "Add Prompt" to get started.
            </p>
          )}
        </div>
      </motion.div>

      {/* Plan Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/50 dark:bg-white/5 rounded-xl p-6 mb-6 border border-grey-200 dark:border-white/10 backdrop-blur-sm"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-grey-900 dark:text-grey-100">
            Plan Section
          </h2>
          <button
            onClick={addPlanSection}
            className="flex items-center gap-2 px-3 py-2 bg-blue-primary hover:bg-blue-dark text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>

        <div className="space-y-3">
          {(template.template_config?.plan?.sections || []).map((section, index) => (
            <div key={section.id} className="flex gap-3 items-center p-3 bg-white/40 dark:bg-black/20 rounded-lg border border-grey-200/50 dark:border-white/5">
              <GripVertical className="w-5 h-5 text-grey-400 flex-shrink-0" />
              <input
                type="text"
                value={section.label}
                onChange={(e) => updatePlanSection(index, { label: e.target.value })}
                placeholder="Section label"
                className="flex-1 px-3 py-2 bg-white/50 dark:bg-black/20 border border-grey-200 dark:border-white/10 rounded-lg text-grey-900 dark:text-grey-100 focus:outline-none focus:ring-2 focus:ring-blue-primary"
              />
              <button
                onClick={() => removePlanSection(index)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {(template.template_config?.plan?.sections || []).length === 0 && (
            <p className="text-center text-grey-500 dark:text-grey-400 py-4">
              No sections added yet. Click "Add Section" to get started.
            </p>
          )}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-6 py-3 bg-white/50 dark:bg-white/5 text-grey-700 dark:text-grey-300 rounded-xl hover:bg-white/80 dark:hover:bg-white/10 transition-colors disabled:opacity-50 border border-grey-200/50 dark:border-white/5"
        >
          <X className="w-5 h-5 inline mr-2" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-blue-primary hover:bg-blue-dark text-white rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Template
            </>
          )}
        </button>
      </div>

      {errors.submit && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
          {errors.submit}
        </div>
      )}
    </div>
  );
}

