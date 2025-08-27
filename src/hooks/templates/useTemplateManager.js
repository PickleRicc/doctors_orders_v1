/**
 * Template Manager Hook
 * Dynamically loads and manages template hooks based on body region
 * Replaces database template system with code-based template selection
 */

import { useState, useEffect } from 'react';
import { 
  useKneeEvaluation,
  useShoulderEvaluation,
  useBackEvaluation,
  useNeckEvaluation,
  useHipEvaluation,
  useAnkleFootEvaluation,
  TEMPLATE_METADATA
} from './index';

export const useTemplateManager = (templateType = 'knee') => {
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize template hooks
  const kneeTemplate = useKneeEvaluation();
  const shoulderTemplate = useShoulderEvaluation();
  const backTemplate = useBackEvaluation();
  const neckTemplate = useNeckEvaluation();
  const hipTemplate = useHipEvaluation();
  const ankleFootTemplate = useAnkleFootEvaluation();

  // Template hook registry
  const templateHooks = {
    knee: kneeTemplate,
    shoulder: shoulderTemplate,
    back: backTemplate,
    neck: neckTemplate,
    hip: hipTemplate,
    ankle_foot: ankleFootTemplate
  };

  // Load template based on type
  useEffect(() => {
    setIsLoading(true);
    
    const template = templateHooks[templateType];
    if (template) {
      setCurrentTemplate(template);
    } else {
      console.warn(`Template type "${templateType}" not found, defaulting to knee`);
      setCurrentTemplate(templateHooks.knee);
    }
    
    setIsLoading(false);
  }, [templateType]);

  /**
   * Get all available templates for selection UI
   */
  const getAvailableTemplates = () => {
    return Object.keys(templateHooks).map(key => ({
      key,
      ...TEMPLATE_METADATA[key],
      hook: templateHooks[key]
    }));
  };

  /**
   * Switch to a different template type
   */
  const switchTemplate = (newTemplateType) => {
    if (templateHooks[newTemplateType]) {
      setCurrentTemplate(templateHooks[newTemplateType]);
      return true;
    }
    return false;
  };

  /**
   * Get template metadata for current template
   */
  const getCurrentTemplateMetadata = () => {
    if (!currentTemplate) return null;
    return TEMPLATE_METADATA[currentTemplate.templateType] || null;
  };

  /**
   * Generate SOAP note using current template
   */
  const generateSOAP = async (transcript, aiService) => {
    if (!currentTemplate) {
      throw new Error('No template loaded');
    }
    return await currentTemplate.generateSOAP(transcript, aiService);
  };

  /**
   * Get empty SOAP structure for current template
   */
  const getEmptySOAP = () => {
    if (!currentTemplate) {
      return templateHooks.knee.getEmptySOAP(); // Fallback to knee
    }
    return currentTemplate.getEmptySOAP();
  };

  /**
   * Validate SOAP data using current template
   */
  const validateSOAP = (soapData) => {
    if (!currentTemplate) {
      return { isValid: false, errors: ['No template loaded'] };
    }
    return currentTemplate.validateSOAP(soapData);
  };

  /**
   * Auto-suggest template based on transcript content
   */
  const suggestTemplate = (transcript) => {
    const lowerTranscript = transcript.toLowerCase();
    
    // Enhanced keyword mapping for template suggestion
    const templateKeywords = {
      knee: {
        keywords: ['knee', 'patella', 'meniscus', 'acl', 'pcl', 'mcl', 'lcl', 'quadriceps', 'hamstring', 'kneecap'],
        weight: 1
      },
      shoulder: {
        keywords: ['shoulder', 'rotator cuff', 'impingement', 'deltoid', 'supraspinatus', 'infraspinatus', 'arm'],
        weight: 1
      },
      back: {
        keywords: ['back', 'spine', 'lumbar', 'thoracic', 'lower back', 'upper back', 'sciatica', 'disc'],
        weight: 1
      },
      neck: {
        keywords: ['neck', 'cervical', 'headache', 'whiplash', 'cervical spine', 'head'],
        weight: 1
      },
      hip: {
        keywords: ['hip', 'groin', 'pelvis', 'piriformis', 'hip flexor', 'glute', 'gluteus'],
        weight: 1
      },
      ankle_foot: {
        keywords: ['ankle', 'foot', 'achilles', 'plantar fasciitis', 'calf', 'toe', 'heel'],
        weight: 1
      }
    };

    // Count keyword matches with weights
    const scores = {};
    Object.entries(templateKeywords).forEach(([templateType, { keywords, weight }]) => {
      scores[templateType] = keywords.reduce((count, keyword) => {
        const matches = (lowerTranscript.match(new RegExp(keyword, 'g')) || []).length;
        return count + (matches * weight);
      }, 0);
    });

    // Return template with highest score, default to 'knee' if no clear winner
    const suggestedTemplate = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    )[0];

    return {
      suggested: scores[suggestedTemplate] > 0 ? suggestedTemplate : 'knee',
      confidence: scores[suggestedTemplate] / Math.max(...Object.values(scores)),
      allScores: scores
    };
  };

  return {
    // Current template
    currentTemplate,
    templateType: currentTemplate?.templateType || templateType,
    metadata: getCurrentTemplateMetadata(),
    isLoading,
    
    // Template management
    getAvailableTemplates,
    switchTemplate,
    suggestTemplate,
    
    // SOAP operations
    generateSOAP,
    getEmptySOAP,
    validateSOAP,
    
    // Individual template access (for advanced use cases)
    templates: templateHooks
  };
};
