/**
 * Template Manager Hook
 * Dynamically loads and manages template hooks based on body region/spinal region
 * Supports both PT and Chiropractic templates with STRICT profession separation
 * Supports both system templates and custom user templates
 * 
 * IMPORTANT: Templates are COMPLETELY SEPARATE between professions
 * - PT templates are for Physical Therapists ONLY
 * - Chiropractic templates are for Chiropractors ONLY
 * - NO crossover is allowed
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  // PT Templates
  useKneeEvaluation,
  useShoulderEvaluation,
  useBackEvaluation,
  useNeckEvaluation,
  useHipEvaluation,
  useAnkleFootEvaluation,
  useDailyNote,
  useDischarge,
  // Chiropractic Templates
  useCervicalAdjustment,
  useThoracicAdjustment,
  useLumbarAdjustment,
  useFullSpineAdjustment,
  useExtremityAdjustment,
  useMaintenanceCare,
  // Utilities
  TEMPLATE_METADATA,
  PROFESSIONS,
  getTemplatesByProfession,
  isTemplateForProfession,
  validateTemplateProfession
} from './index';
import { useCustomTemplate } from './useCustomTemplate';
import { authenticatedFetch } from '../../lib/authHeaders';

/**
 * Template Manager Hook
 * @param {string} templateType - The initial template type to load
 * @param {string} profession - The user's profession (physical_therapy or chiropractic)
 */
export const useTemplateManager = (templateType = null, profession = PROFESSIONS.PHYSICAL_THERAPY) => {
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customTemplateConfig, setCustomTemplateConfig] = useState(null);
  const [professionError, setProfessionError] = useState(null);

  // Determine default template based on profession
  const getDefaultTemplate = useCallback((prof) => {
    return prof === PROFESSIONS.CHIROPRACTIC ? 'cervical-adjustment' : 'knee';
  }, []);

  // Use default template if none specified
  const effectiveTemplateType = templateType || getDefaultTemplate(profession);

  // ============================================
  // PT TEMPLATE HOOKS (PT-EXCLUSIVE)
  // ============================================
  const kneeTemplate = useKneeEvaluation();
  const shoulderTemplate = useShoulderEvaluation();
  const backTemplate = useBackEvaluation();
  const neckTemplate = useNeckEvaluation();
  const hipTemplate = useHipEvaluation();
  const ankleFootTemplate = useAnkleFootEvaluation();
  const dailyNoteTemplate = useDailyNote();
  const dischargeTemplate = useDischarge();

  // ============================================
  // CHIROPRACTIC TEMPLATE HOOKS (CHIRO-EXCLUSIVE)
  // ============================================
  const cervicalAdjustmentTemplate = useCervicalAdjustment();
  const thoracicAdjustmentTemplate = useThoracicAdjustment();
  const lumbarAdjustmentTemplate = useLumbarAdjustment();
  const fullSpineAdjustmentTemplate = useFullSpineAdjustment();
  const extremityAdjustmentTemplate = useExtremityAdjustment();
  const maintenanceCareTemplate = useMaintenanceCare();

  // PT Template hooks registry (PT-EXCLUSIVE)
  const ptTemplateHooks = {
    knee: kneeTemplate,
    shoulder: shoulderTemplate,
    back: backTemplate,
    neck: neckTemplate,
    hip: hipTemplate,
    ankle_foot: ankleFootTemplate,
    'daily-note': dailyNoteTemplate,
    discharge: dischargeTemplate
  };

  // Chiropractic Template hooks registry (CHIRO-EXCLUSIVE)
  const chiroTemplateHooks = {
    'cervical-adjustment': cervicalAdjustmentTemplate,
    'thoracic-adjustment': thoracicAdjustmentTemplate,
    'lumbar-adjustment': lumbarAdjustmentTemplate,
    'full-spine-adjustment': fullSpineAdjustmentTemplate,
    'extremity-adjustment': extremityAdjustmentTemplate,
    'maintenance-care': maintenanceCareTemplate
  };

  // Get template hooks based on profession
  const getTemplateHooksForProfession = useCallback((prof) => {
    return prof === PROFESSIONS.CHIROPRACTIC ? chiroTemplateHooks : ptTemplateHooks;
  }, []);

  // Combined registry for internal use (but filtered by profession when accessed)
  const templateHooks = {
    ...ptTemplateHooks,
    ...chiroTemplateHooks
  };

  // Create custom template hook if we have config (pass profession for terminology)
  const customTemplate = useCustomTemplate(customTemplateConfig, profession);

  // Load template based on type with STRICT profession validation
  useEffect(() => {
    const loadTemplate = async () => {
      setIsLoading(true);
      setProfessionError(null);
      
      // Get the appropriate template hooks for this profession
      const professionHooks = getTemplateHooksForProfession(profession);
      const defaultTemplate = getDefaultTemplate(profession);
      
      // Check if this is a custom template
      if (effectiveTemplateType && effectiveTemplateType.startsWith('custom-')) {
        const customTemplateId = effectiveTemplateType.replace('custom-', '');
        
        try {
          // Fetch custom template configuration
          const response = await authenticatedFetch(`/api/phi/custom-templates?id=${customTemplateId}`);
          
          if (response.ok) {
            const customTemplateData = await response.json();
            console.log('📋 Loaded custom template:', customTemplateData);
            
            // Set the configuration which will be used by useCustomTemplate
            setCustomTemplateConfig(customTemplateData.template_config);
            setCurrentTemplate(null); // Clear system template
          } else {
            console.error('Failed to load custom template, falling back to default');
            setCurrentTemplate(professionHooks[defaultTemplate]);
            setCustomTemplateConfig(null);
          }
        } catch (error) {
          console.error('Error loading custom template:', error);
          setCurrentTemplate(professionHooks[defaultTemplate]);
          setCustomTemplateConfig(null);
        }
      } else {
        // System template - ENFORCE PROFESSION SEPARATION
        try {
          // Validate that this template is allowed for the user's profession
          if (!isTemplateForProfession(effectiveTemplateType, profession)) {
            const templateMeta = TEMPLATE_METADATA[effectiveTemplateType];
            const templateName = templateMeta?.name || effectiveTemplateType;
            const professionName = profession === PROFESSIONS.CHIROPRACTIC ? 'Chiropractors' : 'Physical Therapists';
            
            const errorMsg = `Template "${templateName}" is not available for ${professionName}. Using default template.`;
            console.warn(`🚫 Profession mismatch: ${errorMsg}`);
            setProfessionError(errorMsg);
            
            // Fall back to default template for the profession
            setCurrentTemplate(professionHooks[defaultTemplate]);
            setCustomTemplateConfig(null);
          } else {
            // Template is valid for this profession
            const template = templateHooks[effectiveTemplateType];
            if (template) {
              setCurrentTemplate(template);
              setCustomTemplateConfig(null);
            } else {
              console.warn(`Template type "${effectiveTemplateType}" not found, defaulting to ${defaultTemplate}`);
              setCurrentTemplate(professionHooks[defaultTemplate]);
              setCustomTemplateConfig(null);
            }
          }
        } catch (error) {
          console.error('Error validating template profession:', error);
          setCurrentTemplate(professionHooks[defaultTemplate]);
          setCustomTemplateConfig(null);
          setProfessionError(error.message);
        }
      }
      
      setIsLoading(false);
    };

    loadTemplate();
  }, [effectiveTemplateType, profession]);

  /**
   * Get all available templates for selection UI
   * FILTERED BY PROFESSION - only returns templates for the current profession
   */
  const getAvailableTemplates = useCallback(() => {
    const professionTemplates = getTemplatesByProfession(profession);
    const professionHooks = getTemplateHooksForProfession(profession);
    
    return Object.keys(professionTemplates).map(key => ({
      key,
      ...professionTemplates[key],
      hook: professionHooks[key]
    }));
  }, [profession]);

  /**
   * Get all templates without profession filtering (for admin/debug purposes only)
   * WARNING: Do not use this in user-facing features
   */
  const getAllTemplatesUnfiltered = () => {
    return Object.keys(TEMPLATE_METADATA).map(key => ({
      key,
      ...TEMPLATE_METADATA[key],
      hook: templateHooks[key]
    }));
  };

  /**
   * Switch to a different template type
   * ENFORCES PROFESSION SEPARATION - will reject templates from other professions
   */
  const switchTemplate = useCallback((newTemplateType) => {
    // Validate profession before switching
    if (!isTemplateForProfession(newTemplateType, profession)) {
      const templateMeta = TEMPLATE_METADATA[newTemplateType];
      const templateName = templateMeta?.name || newTemplateType;
      const professionName = profession === PROFESSIONS.CHIROPRACTIC ? 'Chiropractors' : 'Physical Therapists';
      
      console.error(`🚫 Cannot switch to template "${templateName}" - not available for ${professionName}`);
      setProfessionError(`Template "${templateName}" is not available for ${professionName}`);
      return false;
    }
    
    if (templateHooks[newTemplateType]) {
      setCurrentTemplate(templateHooks[newTemplateType]);
      setProfessionError(null);
      return true;
    }
    return false;
  }, [profession]);

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
    // Use custom template if available
    if (customTemplateConfig && customTemplate) {
      return await customTemplate.generateSOAP(transcript, aiService);
    }
    
    if (!currentTemplate) {
      throw new Error('No template loaded');
    }
    return await currentTemplate.generateSOAP(transcript, aiService);
  };

  /**
   * Get empty SOAP structure for current template
   */
  const getEmptySOAP = () => {
    // Use custom template if available
    if (customTemplateConfig && customTemplate) {
      return customTemplate.getEmptySOAP();
    }
    
    if (!currentTemplate) {
      return templateHooks.knee.getEmptySOAP(); // Fallback to knee
    }
    return currentTemplate.getEmptySOAP();
  };

  /**
   * Validate SOAP data using current template
   */
  const validateSOAP = (soapData) => {
    // Use custom template if available
    if (customTemplateConfig && customTemplate) {
      return customTemplate.validateSOAP(soapData);
    }
    
    if (!currentTemplate) {
      return { isValid: false, errors: ['No template loaded'] };
    }
    return currentTemplate.validateSOAP(soapData);
  };

  /**
   * Auto-suggest template based on transcript content
   * FILTERED BY PROFESSION - only suggests templates for the current profession
   */
  const suggestTemplate = useCallback((transcript) => {
    const lowerTranscript = transcript.toLowerCase();
    
    // PT keyword mapping (only used for Physical Therapists)
    const ptKeywords = {
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

    // Chiropractic keyword mapping (only used for Chiropractors)
    const chiroKeywords = {
      'cervical-adjustment': {
        keywords: ['cervical', 'neck', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'atlas', 'axis', 'headache', 'upper cervical'],
        weight: 1
      },
      'thoracic-adjustment': {
        keywords: ['thoracic', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10', 't11', 't12', 'rib', 'mid back', 'upper back'],
        weight: 1
      },
      'lumbar-adjustment': {
        keywords: ['lumbar', 'l1', 'l2', 'l3', 'l4', 'l5', 'sacrum', 'sacral', 'si joint', 'sacroiliac', 'pelvis', 'lower back', 'low back'],
        weight: 1
      },
      'full-spine-adjustment': {
        keywords: ['full spine', 'complete', 'initial', 'evaluation', 'new patient', 'comprehensive'],
        weight: 1
      },
      'extremity-adjustment': {
        keywords: ['shoulder', 'elbow', 'wrist', 'hand', 'hip', 'knee', 'ankle', 'foot', 'extremity', 'joint'],
        weight: 1
      },
      'maintenance-care': {
        keywords: ['maintenance', 'wellness', 'preventive', 'routine', 'follow up', 'check up', 'tune up'],
        weight: 1
      }
    };

    // Use profession-specific keywords
    const templateKeywords = profession === PROFESSIONS.CHIROPRACTIC ? chiroKeywords : ptKeywords;
    const defaultTemplate = getDefaultTemplate(profession);

    // Count keyword matches with weights
    const scores = {};
    Object.entries(templateKeywords).forEach(([templateType, { keywords, weight }]) => {
      scores[templateType] = keywords.reduce((count, keyword) => {
        const matches = (lowerTranscript.match(new RegExp(keyword, 'gi')) || []).length;
        return count + (matches * weight);
      }, 0);
    });

    // Return template with highest score, default to profession-appropriate template
    const suggestedTemplate = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    )[0];

    const maxScore = Math.max(...Object.values(scores));

    return {
      suggested: maxScore > 0 ? suggestedTemplate : defaultTemplate,
      confidence: maxScore > 0 ? scores[suggestedTemplate] / maxScore : 0,
      allScores: scores,
      profession
    };
  }, [profession]);

  return {
    // Current template
    currentTemplate: customTemplateConfig ? customTemplate : currentTemplate,
    templateType: customTemplateConfig ? 'custom' : (currentTemplate?.templateType || effectiveTemplateType),
    metadata: getCurrentTemplateMetadata(),
    isLoading,
    isCustomTemplate: !!customTemplateConfig,
    
    // Profession information
    profession,
    professionError,
    isPT: profession === PROFESSIONS.PHYSICAL_THERAPY,
    isChiro: profession === PROFESSIONS.CHIROPRACTIC,
    
    // Template management (FILTERED BY PROFESSION)
    getAvailableTemplates,
    switchTemplate,
    suggestTemplate,
    
    // SOAP operations
    generateSOAP,
    getEmptySOAP,
    validateSOAP,
    
    // Profession-filtered template access
    templates: getTemplateHooksForProfession(profession),
    
    // Utilities (for admin/debug only)
    getAllTemplatesUnfiltered,
    isTemplateForProfession: (templateKey) => isTemplateForProfession(templateKey, profession),
    validateTemplateProfession: (templateKey) => validateTemplateProfession(templateKey, profession)
  };
};
