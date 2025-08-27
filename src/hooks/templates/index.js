/**
 * Template Hooks Index
 * Centralized export for all template-specific hooks
 * Each hook contains AI prompts and JSON schemas for structured SOAP generation
 */

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
  knee: {
    name: 'Knee Evaluation',
    bodyRegion: 'knee',
    sessionType: 'evaluation',
    description: 'Comprehensive knee assessment including ligament tests and ROM'
  },
  shoulder: {
    name: 'Shoulder Evaluation',
    bodyRegion: 'shoulder',
    sessionType: 'evaluation',
    description: 'Shoulder impingement, rotator cuff, and mobility assessment'
  },
  back: {
    name: 'Back Evaluation',
    bodyRegion: 'back',
    sessionType: 'evaluation',
    description: 'Spinal assessment including posture and movement analysis'
  },
  neck: {
    name: 'Neck Evaluation',
    bodyRegion: 'neck',
    sessionType: 'evaluation',
    description: 'Cervical spine mobility and neurological screening'
  },
  hip: {
    name: 'Hip Evaluation',
    bodyRegion: 'hip',
    sessionType: 'evaluation',
    description: 'Hip joint mobility, strength, and functional assessment'
  },
  ankle_foot: {
    name: 'Ankle/Foot Evaluation',
    bodyRegion: 'ankle_foot',
    sessionType: 'evaluation',
    description: 'Lower extremity assessment including gait analysis'
  }
};
