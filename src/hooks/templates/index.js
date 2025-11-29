/**
 * Template Hooks Index
 * Centralized export for all template-specific hooks
 * Each hook contains AI prompts and JSON schemas for structured SOAP generation
 * 
 * IMPORTANT: PT and Chiropractic templates are COMPLETELY SEPARATE
 * - PT templates are for Physical Therapists ONLY
 * - Chiropractic templates are for Chiropractors ONLY
 * - NO crossover or hybrid templates
 */

// Import profession constants
import { PROFESSIONS } from '../../services/supabase';

// Re-export PROFESSIONS for convenience
export { PROFESSIONS };

// ============================================
// PHYSICAL THERAPY TEMPLATES (PT-EXCLUSIVE)
// ============================================

// PT Universal Templates
export { useDailyNote } from './useDailyNote';
export { useDischarge } from './useDischarge';

// PT Body-Part Specific Templates
export { useKneeEvaluation } from './useKneeEvaluation';
export { useShoulderEvaluation } from './useShoulderEvaluation';
export { useBackEvaluation } from './useBackEvaluation';
export { useNeckEvaluation } from './useNeckEvaluation';
export { useHipEvaluation } from './useHipEvaluation';
export { useAnkleFootEvaluation } from './useAnkleFootEvaluation';

// ============================================
// CHIROPRACTIC TEMPLATES (CHIRO-EXCLUSIVE)
// ============================================

// Chiropractic Spinal Region Templates
export { useCervicalAdjustment } from './useCervicalAdjustment';
export { useThoracicAdjustment } from './useThoracicAdjustment';
export { useLumbarAdjustment } from './useLumbarAdjustment';
export { useFullSpineAdjustment } from './useFullSpineAdjustment';

// Chiropractic Specialized Templates
export { useExtremityAdjustment } from './useExtremityAdjustment';
export { useMaintenanceCare } from './useMaintenanceCare';

/**
 * Template registry for dynamic template selection
 * Maps template types to their respective hooks
 */
export const TEMPLATE_REGISTRY = {
  // ===== PT Templates (PT-EXCLUSIVE) =====
  // Universal
  'daily-note': 'useDailyNote',
  'discharge': 'useDischarge',
  // Body-Part Specific
  knee: 'useKneeEvaluation',
  shoulder: 'useShoulderEvaluation',
  back: 'useBackEvaluation',
  neck: 'useNeckEvaluation',
  hip: 'useHipEvaluation',
  ankle_foot: 'useAnkleFootEvaluation',
  
  // ===== Chiropractic Templates (CHIRO-EXCLUSIVE) =====
  // Spinal Regions
  'cervical-adjustment': 'useCervicalAdjustment',
  'thoracic-adjustment': 'useThoracicAdjustment',
  'lumbar-adjustment': 'useLumbarAdjustment',
  'full-spine-adjustment': 'useFullSpineAdjustment',
  // Specialized
  'extremity-adjustment': 'useExtremityAdjustment',
  'maintenance-care': 'useMaintenanceCare'
};

/**
 * Template metadata for UI display
 * Each template is tagged with its profession for strict filtering
 */
export const TEMPLATE_METADATA = {
  // ================================================================
  // PHYSICAL THERAPY TEMPLATES (profession: 'physical_therapy')
  // ================================================================
  
  // PT Universal Templates
  'daily-note': {
    name: 'Daily Note',
    profession: PROFESSIONS.PHYSICAL_THERAPY,
    category: 'universal',
    sessionType: 'follow-up',
    description: 'Routine follow-up visit documentation'
  },
  'discharge': {
    name: 'Discharge Note',
    profession: PROFESSIONS.PHYSICAL_THERAPY,
    category: 'universal',
    sessionType: 'discharge',
    description: 'Final visit and discharge summary'
  },
  
  // PT Body-Part Specific Templates
  knee: {
    name: 'Knee Evaluation',
    profession: PROFESSIONS.PHYSICAL_THERAPY,
    bodyRegion: 'knee',
    category: 'bodyPart',
    sessionType: 'evaluation',
    description: 'Comprehensive knee assessment including ligament tests and ROM'
  },
  shoulder: {
    name: 'Shoulder Evaluation',
    profession: PROFESSIONS.PHYSICAL_THERAPY,
    bodyRegion: 'shoulder',
    category: 'bodyPart',
    sessionType: 'evaluation',
    description: 'Shoulder impingement, rotator cuff, and mobility assessment'
  },
  back: {
    name: 'Back Evaluation',
    profession: PROFESSIONS.PHYSICAL_THERAPY,
    bodyRegion: 'back',
    category: 'bodyPart',
    sessionType: 'evaluation',
    description: 'Spinal assessment including posture and movement analysis'
  },
  neck: {
    name: 'Neck Evaluation',
    profession: PROFESSIONS.PHYSICAL_THERAPY,
    bodyRegion: 'neck',
    category: 'bodyPart',
    sessionType: 'evaluation',
    description: 'Cervical spine mobility and neurological screening'
  },
  hip: {
    name: 'Hip Evaluation',
    profession: PROFESSIONS.PHYSICAL_THERAPY,
    bodyRegion: 'hip',
    category: 'bodyPart',
    sessionType: 'evaluation',
    description: 'Hip joint mobility, strength, and functional assessment'
  },
  ankle_foot: {
    name: 'Ankle/Foot Evaluation',
    profession: PROFESSIONS.PHYSICAL_THERAPY,
    bodyRegion: 'ankle_foot',
    category: 'bodyPart',
    sessionType: 'evaluation',
    description: 'Lower extremity assessment including gait analysis'
  },

  // ================================================================
  // CHIROPRACTIC TEMPLATES (profession: 'chiropractic')
  // ================================================================
  
  // Chiropractic Spinal Region Templates
  'cervical-adjustment': {
    name: 'Cervical Adjustment',
    profession: PROFESSIONS.CHIROPRACTIC,
    spinalRegion: 'cervical',
    category: 'spinalRegion',
    sessionType: 'adjustment',
    description: 'Cervical spine subluxation assessment and adjustment (C1-C7)'
  },
  'thoracic-adjustment': {
    name: 'Thoracic Adjustment',
    profession: PROFESSIONS.CHIROPRACTIC,
    spinalRegion: 'thoracic',
    category: 'spinalRegion',
    sessionType: 'adjustment',
    description: 'Thoracic spine and rib assessment with adjustment (T1-T12)'
  },
  'lumbar-adjustment': {
    name: 'Lumbar Adjustment',
    profession: PROFESSIONS.CHIROPRACTIC,
    spinalRegion: 'lumbar',
    category: 'spinalRegion',
    sessionType: 'adjustment',
    description: 'Lumbar spine and pelvic assessment with adjustment (L1-L5, Sacrum)'
  },
  'full-spine-adjustment': {
    name: 'Full Spine Evaluation',
    profession: PROFESSIONS.CHIROPRACTIC,
    spinalRegion: 'full',
    category: 'spinalRegion',
    sessionType: 'evaluation',
    description: 'Comprehensive spinal assessment from occiput to sacrum'
  },
  
  // Chiropractic Specialized Templates
  'extremity-adjustment': {
    name: 'Extremity Adjustment',
    profession: PROFESSIONS.CHIROPRACTIC,
    category: 'specialized',
    sessionType: 'adjustment',
    description: 'Joint assessment and adjustment for upper/lower extremities'
  },
  'maintenance-care': {
    name: 'Maintenance Care',
    profession: PROFESSIONS.CHIROPRACTIC,
    category: 'specialized',
    sessionType: 'maintenance',
    description: 'Wellness and preventive care documentation'
  }
};

/**
 * Get templates filtered by profession
 * @param {string} profession - The profession to filter by (physical_therapy or chiropractic)
 * @returns {Object} Filtered template metadata
 */
export const getTemplatesByProfession = (profession) => {
  const filtered = {};
  Object.entries(TEMPLATE_METADATA).forEach(([key, meta]) => {
    if (meta.profession === profession) {
      filtered[key] = meta;
    }
  });
  return filtered;
};

/**
 * Check if a template belongs to a specific profession
 * @param {string} templateKey - The template key
 * @param {string} profession - The profession to check against
 * @returns {boolean} True if template belongs to the profession
 */
export const isTemplateForProfession = (templateKey, profession) => {
  const template = TEMPLATE_METADATA[templateKey];
  return template && template.profession === profession;
};

/**
 * Validate that a template can be used by a specific profession
 * @param {string} templateKey - The template key to validate
 * @param {string} profession - The user's profession
 * @throws {Error} If template is not valid for the profession
 */
export const validateTemplateProfession = (templateKey, profession) => {
  const template = TEMPLATE_METADATA[templateKey];
  
  if (!template) {
    throw new Error(`Template "${templateKey}" not found`);
  }
  
  if (template.profession !== profession) {
    const professionName = profession === PROFESSIONS.CHIROPRACTIC ? 'Chiropractors' : 'Physical Therapists';
    throw new Error(`Template "${template.name}" is not available for ${professionName}`);
  }
  
  return true;
};
