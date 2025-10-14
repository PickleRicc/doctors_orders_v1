/**
 * Template Hooks Index
 * Centralized export for all template-specific hooks
 * Each hook contains AI prompts and JSON schemas for structured SOAP generation
 */

// Universal Templates
export { useDailyNote } from './useDailyNote';
export { useDischarge } from './useDischarge';

// Body-Part Specific Templates
export { useKneeEvaluation } from './useKneeEvaluation';
export { useShoulderEvaluation } from './useShoulderEvaluation';
export { useBackEvaluation } from './useBackEvaluation';
export { useNeckEvaluation } from './useNeckEvaluation';
export { useHipEvaluation } from './useHipEvaluation';
export { useAnkleFootEvaluation } from './useAnkleFootEvaluation';

/**
 * Template registry for dynamic template selection
 * Maps template types to their respective hooks
 */
export const TEMPLATE_REGISTRY = {
  // Universal
  'daily-note': 'useDailyNote',
  'discharge': 'useDischarge',
  
  // Body-Part Specific
  knee: 'useKneeEvaluation',
  shoulder: 'useShoulderEvaluation',
  back: 'useBackEvaluation',
  neck: 'useNeckEvaluation',
  hip: 'useHipEvaluation',
  ankle_foot: 'useAnkleFootEvaluation'
};

/**
 * Template metadata for UI display
 */
export const TEMPLATE_METADATA = {
  // Universal Templates
  'daily-note': {
    name: 'Daily Note',
    category: 'universal',
    sessionType: 'follow-up',
    description: 'Routine follow-up visit documentation'
  },
  'discharge': {
    name: 'Discharge Note',
    category: 'universal',
    sessionType: 'discharge',
    description: 'Final visit and discharge summary'
  },
  
  // Body-Part Specific Templates
  knee: {
    name: 'Knee Evaluation',
    bodyRegion: 'knee',
    category: 'bodyPart',
    sessionType: 'evaluation',
    description: 'Comprehensive knee assessment including ligament tests and ROM'
  },
  shoulder: {
    name: 'Shoulder Evaluation',
    bodyRegion: 'shoulder',
    category: 'bodyPart',
    sessionType: 'evaluation',
    description: 'Shoulder impingement, rotator cuff, and mobility assessment'
  },
  back: {
    name: 'Back Evaluation',
    bodyRegion: 'back',
    category: 'bodyPart',
    sessionType: 'evaluation',
    description: 'Spinal assessment including posture and movement analysis'
  },
  neck: {
    name: 'Neck Evaluation',
    bodyRegion: 'neck',
    category: 'bodyPart',
    sessionType: 'evaluation',
    description: 'Cervical spine mobility and neurological screening'
  },
  hip: {
    name: 'Hip Evaluation',
    bodyRegion: 'hip',
    category: 'bodyPart',
    sessionType: 'evaluation',
    description: 'Hip joint mobility, strength, and functional assessment'
  },
  ankle_foot: {
    name: 'Ankle/Foot Evaluation',
    bodyRegion: 'ankle_foot',
    category: 'bodyPart',
    sessionType: 'evaluation',
    description: 'Lower extremity assessment including gait analysis'
  }
};
