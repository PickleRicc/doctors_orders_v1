/**
 * Custom Templates Hook
 * Manages CRUD operations for doctor-specific custom SOAP note templates
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { authenticatedFetch } from '../lib/authHeaders';

export const useCustomTemplates = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all custom templates for the current user
   */
  const fetchTemplates = useCallback(async () => {
    if (!user) {
      setTemplates([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch('/api/phi/custom-templates');
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch templates');
      }
    } catch (err) {
      console.error('Error fetching custom templates:', err);
      setError(err.message);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Get a single template by ID
   */
  const getTemplate = useCallback(async (id) => {
    if (!user) return null;

    try {
      const response = await authenticatedFetch(`/api/phi/custom-templates?id=${id}`);
      
      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch template');
      }
    } catch (err) {
      console.error('Error fetching template:', err);
      setError(err.message);
      return null;
    }
  }, [user]);

  /**
   * Create a new custom template
   */
  const createTemplate = useCallback(async (templateData) => {
    if (!user) {
      throw new Error('User must be authenticated to create templates');
    }

    console.log('🔧 useCustomTemplates.createTemplate called with:', templateData);
    console.log('Template config being sent:', JSON.stringify(templateData.template_config, null, 2));

    setLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch('/api/phi/custom-templates', {
        method: 'POST',
        body: JSON.stringify(templateData)
      });

      console.log('API Response status:', response.status);

      if (response.ok) {
        const newTemplate = await response.json();
        console.log('✅ Template created successfully:', newTemplate);
        console.log('Saved template_config:', newTemplate.template_config);
        setTemplates(prev => [newTemplate, ...prev]);
        return { success: true, template: newTemplate };
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || 'Failed to create template');
      }
    } catch (err) {
      console.error('Error creating template:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Update an existing template
   */
  const updateTemplate = useCallback(async (id, updates) => {
    if (!user) {
      throw new Error('User must be authenticated to update templates');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch('/api/phi/custom-templates', {
        method: 'PUT',
        body: JSON.stringify({ id, ...updates })
      });

      if (response.ok) {
        const updatedTemplate = await response.json();
        setTemplates(prev => 
          prev.map(t => t.id === id ? updatedTemplate : t)
        );
        return { success: true, template: updatedTemplate };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update template');
      }
    } catch (err) {
      console.error('Error updating template:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Delete a template (soft delete)
   */
  const deleteTemplate = useCallback(async (id) => {
    if (!user) {
      throw new Error('User must be authenticated to delete templates');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch('/api/phi/custom-templates', {
        method: 'DELETE',
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        setTemplates(prev => prev.filter(t => t.id !== id));
        return { success: true };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete template');
      }
    } catch (err) {
      console.error('Error deleting template:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Toggle favorite status of a template
   */
  const toggleFavorite = useCallback(async (id, currentStatus) => {
    return updateTemplate(id, { is_favorite: !currentStatus });
  }, [updateTemplate]);

  /**
   * Increment usage count for a template
   */
  const incrementUsage = useCallback(async (id) => {
    try {
      // We'll just do this silently in the background
      const template = templates.find(t => t.id === id);
      if (template) {
        await updateTemplate(id, { usage_count: (template.usage_count || 0) + 1 });
      }
    } catch (err) {
      // Don't throw error, this is non-critical
      console.warn('Failed to increment usage count:', err);
    }
  }, [templates, updateTemplate]);

  /**
   * Duplicate an existing template
   */
  const duplicateTemplate = useCallback(async (id) => {
    const template = await getTemplate(id);
    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    // Create a copy with modified name
    const duplicateData = {
      name: `${template.name} (Copy)`,
      template_type: template.template_type,
      body_region: template.body_region,
      session_type: template.session_type,
      description: template.description,
      template_config: template.template_config,
      ai_prompts: template.ai_prompts
    };

    return createTemplate(duplicateData);
  }, [getTemplate, createTemplate]);

  // Fetch templates on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user, fetchTemplates]);

  return {
    // State
    templates,
    loading,
    error,
    
    // Actions
    fetchTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleFavorite,
    incrementUsage,
    duplicateTemplate
  };
};

