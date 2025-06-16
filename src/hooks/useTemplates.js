import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import { useAuth } from './useAuth';

/**
 * Custom hook for managing SOAP note templates
 * Handles fetching, selecting, and generating templates for PT notes
 * Provides CRUD operations for template management
 */
const useTemplates = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [bodyRegions, setBodyRegions] = useState([]);
  const [sessionTypes, setSessionTypes] = useState([]);

  // Fallback default templates in case database fetch fails
  const getFallbackTemplates = () => {
    // NOTE: These templates are only used as a fallback if database templates cannot be loaded
    return [
      // Example template to guide users
      {
        id: 'example-template',
        name: '👋 Example Template - How To Guide',
        bodyRegion: 'general',
        sessionType: 'evaluation',
        subjective: 'This is the SUBJECTIVE section where you document what the patient reports:\n\n- Patient reports {{duration}} of {{pain_location}} pain, rating it {{pain_scale}}/10\n- Pain is described as {{pain_quality}} and {{pain_pattern}}\n- Aggravating factors include {{aggravating_factors}}\n- Relieving factors include {{relieving_factors}}\n- Previous interventions: {{previous_interventions}}\n\nTIP: Use variables like {{variable_name}} for information that will be filled in later based on your recording.',
        objective: 'This is the OBJECTIVE section where you document measurable findings:\n\n- Range of motion: {{rom_findings}}\n- Strength testing: {{strength_findings}}\n- Special tests: {{special_tests}}\n- Palpation: {{palpation_findings}}\n- Gait/movement analysis: {{movement_patterns}}\n\nTIP: Structure your recording to match these variables for better AI extraction.',
        assessment: 'This is the ASSESSMENT section where you provide your clinical reasoning:\n\n- Patient presents with signs consistent with {{diagnosis}}\n- Contributing factors include {{contributing_factors}}\n- Current functional limitations: {{functional_limitations}}\n- Rehabilitation potential is {{rehab_potential}}\n\nTIP: Speak clearly about your clinical impression during recording.',
        plan: 'This is the PLAN section where you document treatment strategies:\n\n- Frequency: {{frequency}} for {{duration_of_care}}\n- Interventions: {{interventions}}\n- Home program: {{home_exercises}}\n- Short-term goals: {{short_term_goals}} in {{short_term_timeframe}}\n- Long-term goals: {{long_term_goals}} in {{long_term_timeframe}}\n\nTIP: Templates can be customized for different body regions and session types.',
        isDefault: true,
        isExample: true
      }
    ];
  };

  // Fetch templates from the database
  const fetchTemplates = async () => {
    if (!user) {
      // If no user, just provide the fallback templates
      setTemplates(getFallbackTemplates());
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch templates from Supabase
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform the data from snake_case to camelCase
      const transformedData = data.map((template) => ({
        id: template.template_key,
        name: template.name,
        bodyRegion: template.body_region,
        sessionType: template.session_type,
        subjective: template.subjective,
        objective: template.objective,
        assessment: template.assessment,
        plan: template.plan,
        isDefault: template.is_default,
        isExample: template.is_example,
        isCustom: !template.is_default,
        createdAt: template.created_at,
        updatedAt: template.updated_at
      }));
      
      // If there are no templates, use fallback templates
      if (transformedData.length === 0) {
        setTemplates(getFallbackTemplates());
        toast.error('Failed to load templates from database. Using fallback templates.');
      } else {
        setTemplates(transformedData);
      }
      
      // Extract unique body regions and session types for filtering
      const regions = [...new Set(transformedData.map(t => t.bodyRegion))];
      const types = [...new Set(transformedData.map(t => t.sessionType))];
      setBodyRegions(regions);
      setSessionTypes(types);
      
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError(error);
      toast.error('Error loading templates: ' + error.message);
      
      // Use fallback templates if database fetch fails
      setTemplates(getFallbackTemplates());
    } finally {
      setIsLoading(false);
    }
  };

  // Select a template based on body region and session type
  const selectTemplateByBodyRegionAndType = (bodyRegion, sessionType) => {
    const found = templates.find(
      (t) => t.bodyRegion === bodyRegion && t.sessionType === sessionType
    );

    if (found) {
      setSelectedTemplate(found);
      return found;
    }

    // Fallback to default if no specific match is found
    const fallback = templates.find((t) => t.isDefault) || templates[0];
    setSelectedTemplate(fallback);
    return fallback;
  };

  // Select a template by ID
  const selectTemplateById = (templateId) => {
    const found = templates.find((t) => t.id === templateId);

    if (found) {
      setSelectedTemplate(found);
      return found;
    }

    // Fallback to default if no specific match is found
    const fallback = templates.find((t) => t.isDefault) || templates[0];
    setSelectedTemplate(fallback);
    return fallback;
  };

  // Fill template with data
  const fillTemplate = (templateId, data) => {
    const template = templates.find((t) => t.id === templateId);

    if (!template) {
      setError('Template not found');
      return null;
    }

    // Deep clone the template to avoid mutations
    const filledTemplate = JSON.parse(JSON.stringify(template));

    // Fill in template variables with data
    Object.keys(filledTemplate.sections).forEach((section) => {
      let content = filledTemplate.sections[section];

      // Replace all variables in the format {{variable_name}}
      Object.keys(data).forEach((key) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        content = content.replace(regex, data[key] || `[${key}]`);
      });

      filledTemplate.sections[section] = content;
    });

    return filledTemplate;
  };

  // Generate a draft note from a filled template
  const generateNote = (filledTemplate) => {
    if (!filledTemplate) return null;

    return {
      id: `note-${Date.now()}`,
      templateId: filledTemplate.id,
      title: filledTemplate.name,
      createdAt: new Date().toISOString(),
      content: {
        subjective: filledTemplate.sections.subjective,
        objective: filledTemplate.sections.objective,
        assessment: filledTemplate.sections.assessment,
        plan: filledTemplate.sections.plan,
      },
    };
  };

  // Create a new template
  const createTemplate = async (templateData) => {
    setIsSaving(true);
    try {
      if (!user) throw new Error('User must be logged in to create templates');

      // Generate a UUID for the new template
      const templateId = uuidv4();

      // Insert into Supabase
      const { error } = await supabase.from('templates').insert({
        template_key: templateId,
        user_id: user.id,
        name: templateData.name,
        body_region: templateData.bodyRegion,
        session_type: templateData.sessionType,
        subjective: templateData.subjective,
        objective: templateData.objective,
        assessment: templateData.assessment,
        plan: templateData.plan,
        created_at: new Date(),
        updated_at: new Date(),
      });

      if (error) throw error;

      // Refresh templates
      await fetchTemplates();

      // Show success toast
      toast.success(`Template "${templateData.name}" created successfully`);

      return {
        ...templateData,
        id: templateId,
        isDefault: false,
        isCustom: true,
      };
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error(`Failed to create template: ${error.message || 'Unknown error'}`);
      throw new Error(error.message || 'Failed to create template');
    } finally {
      setIsSaving(false);
    }
  };

  // Update an existing template
  const updateTemplate = async (templateData) => {
    setIsSaving(true);
    try {
      if (!user) throw new Error('User must be logged in to update templates');
      if (!templateData.id) throw new Error('Template ID is required');

      // Check if this is a default template that needs to be copied
      const existingTemplate = templates.find((t) => t.id === templateData.id);

      if (existingTemplate?.isDefault) {
        // If updating a default template, create a new custom one instead
        toast.info(`Creating your personalized copy of "${existingTemplate.name}"`);
        
        const newTemplate = await createTemplate({
          ...templateData,
          name: `${templateData.name} (My Version)`,
          id: undefined, // Remove ID to create a new one
        });
        
        // Return the new template for redirection
        return newTemplate;
      }

      // Update in Supabase
      const { error } = await supabase
        .from('templates')
        .update({
          name: templateData.name,
          body_region: templateData.bodyRegion,
          session_type: templateData.sessionType,
          subjective: templateData.subjective,
          objective: templateData.objective,
          assessment: templateData.assessment,
          plan: templateData.plan,
          updated_at: new Date(),
        })
        .eq('template_key', templateData.id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh templates
      await fetchTemplates();

      // Show success toast
      toast.success(`Template "${templateData.name}" updated successfully`);

      return templateData;
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error(`Failed to update template: ${error.message || 'Unknown error'}`);
      throw new Error(error.message || 'Failed to update template');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a template
  const deleteTemplate = async (templateId) => {
    try {
      if (!user) throw new Error('User must be logged in to delete templates');
      if (!templateId) throw new Error('Template ID is required');

      // Delete from Supabase
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('template_key', templateId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setTemplates(templates.filter((template) => template.id !== templateId));

      // Show success toast
      const templateName = templates.find(t => t.id === templateId)?.name || 'Template';
      toast.success(`Template "${templateName}" deleted successfully`);

      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error(`Failed to delete template: ${error.message || 'Unknown error'}`);
      throw new Error(error.message || 'Failed to delete template');
    }
  };

  // Duplicate a template
  const duplicateTemplate = async (templateId) => {
    try {
      if (!templateId) throw new Error('Template ID is required');

      // Find the template to duplicate
      const templateToDuplicate = templates.find((t) => t.id === templateId);
      if (!templateToDuplicate) throw new Error('Template not found');

      // Show toast notification
      toast.success(`Duplicating "${templateToDuplicate.name}"...`);
      
      // Create a new template based on the existing one
      return createTemplate({
        ...templateToDuplicate,
        name: `${templateToDuplicate.name} (Copy)`,
        id: undefined, // Remove ID to create a new one
      });
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error(`Failed to duplicate template: ${error.message || 'Unknown error'}`);
      throw new Error(error.message || 'Failed to duplicate template');
    }
  };

  // Load templates on initial render
  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    bodyRegions,
    sessionTypes,
    selectedTemplate,
    isLoading,
    error,
    isSaving,
    selectTemplateByBodyRegionAndType,
    selectTemplateById,
    generateNote,
    fillTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    fetchTemplates,
  };
};

export default useTemplates;