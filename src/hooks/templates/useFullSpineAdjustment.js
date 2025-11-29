/**
 * Full Spine Adjustment Template Hook
 * Comprehensive spinal evaluation from occiput to sacrum
 * CHIROPRACTIC-EXCLUSIVE - Not for Physical Therapy use
 */

import { useState } from 'react';

export const useFullSpineAdjustment = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * JSON Schema for full spine evaluation SOAP note structure
   */
  const getSchema = () => ({
    subjective: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Chief complaint, pain patterns, history of present illness, past medical history...'
    },
    objective: {
      type: 'table',
      headers: ['Category', 'Test/Measurement', 'Result', 'Notes'],
      categories: [
        {
          name: 'Postural Assessment',
          rows: [
            { test: 'Head Position', result: '', notes: '' },
            { test: 'Cervical Lordosis', result: '', notes: '' },
            { test: 'Shoulder Level', result: '', notes: '' },
            { test: 'Thoracic Kyphosis', result: '', notes: '' },
            { test: 'Lumbar Lordosis', result: '', notes: '' },
            { test: 'Pelvic Tilt/Level', result: '', notes: '' },
            { test: 'Overall Spinal Alignment', result: '', notes: '' }
          ]
        },
        {
          name: 'Cervical Spine (C1-C7)',
          rows: [
            { test: 'C1-C2 (Upper Cervical)', result: '', notes: '' },
            { test: 'C3-C4', result: '', notes: '' },
            { test: 'C5-C6', result: '', notes: '' },
            { test: 'C7-T1', result: '', notes: '' },
            { test: 'Cervical ROM', result: '', notes: '' }
          ]
        },
        {
          name: 'Thoracic Spine (T1-T12)',
          rows: [
            { test: 'T1-T4 (Upper)', result: '', notes: '' },
            { test: 'T5-T8 (Mid)', result: '', notes: '' },
            { test: 'T9-T12 (Lower)', result: '', notes: '' },
            { test: 'Rib Cage Assessment', result: '', notes: '' },
            { test: 'Thoracic ROM', result: '', notes: '' }
          ]
        },
        {
          name: 'Lumbar Spine (L1-L5)',
          rows: [
            { test: 'L1-L2', result: '', notes: '' },
            { test: 'L3-L4', result: '', notes: '' },
            { test: 'L5-S1', result: '', notes: '' },
            { test: 'Lumbar ROM', result: '', notes: '' }
          ]
        },
        {
          name: 'Pelvis & Sacrum',
          rows: [
            { test: 'Sacral Base', result: '', notes: '' },
            { test: 'Right SI Joint', result: '', notes: '' },
            { test: 'Left SI Joint', result: '', notes: '' },
            { test: 'Leg Length', result: '', notes: '' },
            { test: 'Ilium Position', result: '', notes: '' }
          ]
        },
        {
          name: 'Neurological Screening',
          rows: [
            { test: 'Upper Extremity DTRs', result: '', notes: '' },
            { test: 'Lower Extremity DTRs', result: '', notes: '' },
            { test: 'Sensation Screening', result: '', notes: '' },
            { test: 'Motor Strength', result: '', notes: '' }
          ]
        },
        {
          name: 'Full Spine Subluxation Analysis',
          rows: [
            { test: 'Primary Subluxation', result: '', notes: '' },
            { test: 'Secondary Subluxation(s)', result: '', notes: '' },
            { test: 'Compensatory Patterns', result: '', notes: '' },
            { test: 'Overall Spine Pattern', result: '', notes: '' }
          ]
        }
      ],
      allowAddRows: true,
      commonResults: [
        'WNL', 'Not Tested', 'Present', 'Absent',
        'Fixated', 'Hypomobile', 'Hypermobile', 'Restricted',
        'PL', 'PR', 'PI', 'PS', 'AL', 'AR',
        'Adjusted', 'Not Adjusted', 'Tender', 'Hypertonic',
        'Normal', 'Reduced', 'Increased', 'Reversed'
      ]
    },
    assessment: {
      type: 'composite',
      subluxation_findings: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Complete subluxation complex analysis across all spinal regions...'
      },
      clinical_impression: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Clinical reasoning, diagnosis, contributing factors, prognosis...'
      },
      medical_necessity: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Why comprehensive chiropractic care is needed...'
      },
      short_term_goals: {
        type: 'list',
        items: [],
        placeholder: 'Goals for 2-4 weeks of care'
      },
      long_term_goals: {
        type: 'list',
        items: [],
        placeholder: 'Goals for 6-12 weeks of care'
      }
    },
    plan: {
      type: 'composite',
      adjustments_performed: {
        type: 'list',
        items: [],
        placeholder: 'All adjustments performed with segment, listing, and technique'
      },
      techniques_used: {
        type: 'list',
        items: [],
        placeholder: 'Diversified, Gonstead, Activator, Drop Table, Toggle, SOT...'
      },
      supportive_care: {
        type: 'list',
        items: [],
        placeholder: 'Modalities, exercises, traction, rehabilitation...'
      },
      frequency_duration: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Treatment frequency, phases of care, re-evaluation schedule...'
      },
      patient_education: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Comprehensive home care, exercises, lifestyle modifications...'
      }
    },
    billing: {
      type: 'composite',
      cpt_codes: {
        type: 'list',
        items: [],
        placeholder: 'CPT codes for chiropractic services'
      },
      units: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Time-based units for billing'
      },
      icd10_codes: {
        type: 'list',
        items: [],
        placeholder: 'ICD-10 diagnosis codes'
      }
    }
  });

  /**
   * AI Prompt for full spine evaluation SOAP generation
   */
  const createPrompt = (transcript) => `
You are a chiropractor documenting a comprehensive full spine evaluation. Generate a professional SOAP note from this session transcript.

TRANSCRIPT:
${transcript}

CRITICAL PRIVACY INSTRUCTION:
**NEVER include patient names or identifiers in the note. ALWAYS use "patient" or "the patient" instead of names.**

INSTRUCTIONS:
1. Extract relevant information for COMPREHENSIVE spinal evaluation
2. Use professional CHIROPRACTIC terminology
3. Cover ALL spinal regions: Cervical (C1-C7), Thoracic (T1-T12), Lumbar (L1-L5), Sacrum, Pelvis
4. Document primary and secondary subluxations with compensatory patterns
5. Include adjustment techniques used for each region
6. This is typically an initial evaluation - be thorough
7. Return ONLY a JSON object matching the required structure

Return JSON with: subjective (content), objective (categories array), assessment (subluxation_findings, clinical_impression, medical_necessity, short_term_goals array, long_term_goals array), plan (adjustments_performed array, techniques_used array, supportive_care array, frequency_duration, patient_education), billing (cpt_codes array, units, icd10_codes array).

Focus on full spine: postural analysis, spinal curves, all region motion/fixation, pelvic alignment, neurological screening, overall subluxation pattern analysis.

Use chiropractic terminology: vertebral subluxation complex, listings for all regions, primary/secondary subluxations, compensatory patterns, adjustment techniques.

CRITICAL: Return valid JSON only, no additional text.
`;

  const generateSOAP = async (transcript, aiService) => {
    if (!transcript || !aiService) {
      throw new Error('Transcript and AI service are required');
    }

    setIsGenerating(true);
    
    try {
      const prompt = createPrompt(transcript);
      const response = await aiService.generateCompletion(prompt, {
        temperature: 0.3,
        max_tokens: 3000
      });

      let soapData;
      try {
        soapData = JSON.parse(response);
      } catch (parseError) {
        throw new Error('AI returned invalid JSON response');
      }

      const schema = getSchema();
      const structuredSOAP = {
        subjective: {
          ...schema.subjective,
          content: soapData.subjective?.content || ''
        },
        objective: {
          ...schema.objective,
          categories: soapData.objective?.categories || schema.objective.categories
        },
        assessment: {
          ...schema.assessment,
          subluxation_findings: {
            ...schema.assessment.subluxation_findings,
            content: soapData.assessment?.subluxation_findings || ''
          },
          clinical_impression: {
            ...schema.assessment.clinical_impression,
            content: soapData.assessment?.clinical_impression || ''
          },
          medical_necessity: {
            ...schema.assessment.medical_necessity,
            content: soapData.assessment?.medical_necessity || ''
          },
          short_term_goals: {
            ...schema.assessment.short_term_goals,
            items: soapData.assessment?.short_term_goals || []
          },
          long_term_goals: {
            ...schema.assessment.long_term_goals,
            items: soapData.assessment?.long_term_goals || []
          }
        },
        plan: {
          ...schema.plan,
          adjustments_performed: {
            ...schema.plan.adjustments_performed,
            items: soapData.plan?.adjustments_performed || []
          },
          techniques_used: {
            ...schema.plan.techniques_used,
            items: soapData.plan?.techniques_used || []
          },
          supportive_care: {
            ...schema.plan.supportive_care,
            items: soapData.plan?.supportive_care || []
          },
          frequency_duration: {
            ...schema.plan.frequency_duration,
            content: soapData.plan?.frequency_duration || ''
          },
          patient_education: {
            ...schema.plan.patient_education,
            content: soapData.plan?.patient_education || ''
          }
        },
        billing: {
          ...schema.billing,
          cpt_codes: {
            ...schema.billing.cpt_codes,
            items: soapData.billing?.cpt_codes || []
          },
          units: {
            ...schema.billing.units,
            content: soapData.billing?.units || ''
          },
          icd10_codes: {
            ...schema.billing.icd10_codes,
            items: soapData.billing?.icd10_codes || []
          }
        }
      };

      return {
        success: true,
        data: structuredSOAP,
        confidence: { subjective: 0.85, objective: 0.90, assessment: 0.88, plan: 0.82, overall: 0.86 },
        templateType: 'full-spine-adjustment'
      };

    } catch (error) {
      console.error('Full spine evaluation SOAP generation failed:', error);
      return {
        success: false,
        error: error.message,
        soapData: getSchema(),
        confidence: { subjective: 0, objective: 0, assessment: 0, plan: 0, overall: 0 },
        templateType: 'full-spine-adjustment'
      };
    } finally {
      setIsGenerating(false);
    }
  };

  const getEmptySOAP = () => ({
    success: true,
    data: getSchema(),
    templateType: 'full-spine-adjustment'
  });

  const validateSOAP = (soapData) => {
    const errors = [];
    ['subjective', 'objective', 'assessment', 'plan'].forEach(section => {
      if (!soapData[section]) errors.push(`Missing ${section} section`);
    });
    if (soapData.objective && !Array.isArray(soapData.objective.categories)) {
      errors.push('Objective section must contain categories array');
    }
    return { isValid: errors.length === 0, errors };
  };

  return {
    generateSOAP,
    getEmptySOAP,
    getSchema,
    validateSOAP,
    isGenerating,
    templateType: 'full-spine-adjustment',
    metadata: {
      name: 'Full Spine Evaluation',
      profession: 'chiropractic',
      spinalRegion: 'full',
      sessionType: 'evaluation',
      description: 'Comprehensive spinal assessment from occiput to sacrum'
    }
  };
};


