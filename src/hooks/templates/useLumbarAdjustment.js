/**
 * Lumbar Adjustment Template Hook
 * Specialized AI prompts and JSON schema for lumbar spine chiropractic assessments
 * CHIROPRACTIC-EXCLUSIVE - Not for Physical Therapy use
 */

import { useState } from 'react';

export const useLumbarAdjustment = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * JSON Schema for lumbar adjustment SOAP note structure
   */
  const getSchema = () => ({
    subjective: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Chief complaint, low back pain patterns, leg pain/numbness, mechanism of injury...'
    },
    objective: {
      type: 'table',
      headers: ['Category', 'Test/Measurement', 'Result', 'Notes'],
      categories: [
        {
          name: 'Postural Assessment',
          rows: [
            { test: 'Lumbar Lordosis', result: '', notes: '' },
            { test: 'Pelvic Tilt', result: '', notes: '' },
            { test: 'Pelvic Level', result: '', notes: '' },
            { test: 'Scoliosis/Lateral Shift', result: '', notes: '' }
          ]
        },
        {
          name: 'Static Palpation',
          rows: [
            { test: 'L1-L2', result: '', notes: '' },
            { test: 'L3', result: '', notes: '' },
            { test: 'L4', result: '', notes: '' },
            { test: 'L5', result: '', notes: '' },
            { test: 'Sacrum', result: '', notes: '' },
            { test: 'SI Joints', result: '', notes: '' },
            { test: 'Paraspinal Musculature', result: '', notes: '' },
            { test: 'Piriformis', result: '', notes: '' }
          ]
        },
        {
          name: 'Motion Palpation',
          rows: [
            { test: 'L1-L2 Motion', result: '', notes: '' },
            { test: 'L2-L3 Motion', result: '', notes: '' },
            { test: 'L3-L4 Motion', result: '', notes: '' },
            { test: 'L4-L5 Motion', result: '', notes: '' },
            { test: 'L5-S1 Motion', result: '', notes: '' },
            { test: 'SI Joint Motion', result: '', notes: '' }
          ]
        },
        {
          name: 'Pelvic Assessment',
          rows: [
            { test: 'ASIS Level', result: '', notes: '' },
            { test: 'PSIS Level', result: '', notes: '' },
            { test: 'Leg Length (Supine)', result: '', notes: '' },
            { test: 'Leg Length (Prone)', result: '', notes: '' },
            { test: 'Sacral Base', result: '', notes: '' }
          ]
        },
        {
          name: 'Range of Motion',
          rows: [
            { test: 'Lumbar Flexion', result: '', notes: '' },
            { test: 'Lumbar Extension', result: '', notes: '' },
            { test: 'Left Lateral Flexion', result: '', notes: '' },
            { test: 'Right Lateral Flexion', result: '', notes: '' },
            { test: 'Left Rotation', result: '', notes: '' },
            { test: 'Right Rotation', result: '', notes: '' }
          ]
        },
        {
          name: 'Orthopedic/Neurological Tests',
          rows: [
            { test: 'Straight Leg Raise (L)', result: '', notes: '' },
            { test: 'Straight Leg Raise (R)', result: '', notes: '' },
            { test: 'Kemp\'s Test', result: '', notes: '' },
            { test: 'SI Provocation Tests', result: '', notes: '' },
            { test: 'Valsalva/Dejerine', result: '', notes: '' },
            { test: 'Deep Tendon Reflexes', result: '', notes: '' },
            { test: 'Dermatomal Sensation', result: '', notes: '' },
            { test: 'Motor Strength (L4-S1)', result: '', notes: '' }
          ]
        },
        {
          name: 'Subluxation Analysis',
          rows: [
            { test: 'L1 Listing', result: '', notes: '' },
            { test: 'L2 Listing', result: '', notes: '' },
            { test: 'L3 Listing', result: '', notes: '' },
            { test: 'L4 Listing', result: '', notes: '' },
            { test: 'L5 Listing', result: '', notes: '' },
            { test: 'Sacral Listing', result: '', notes: '' },
            { test: 'Ilium Listing', result: '', notes: '' }
          ]
        }
      ],
      allowAddRows: true,
      commonResults: [
        'WNL', 'Not Tested', 'Present', 'Absent',
        'Fixated', 'Hypomobile', 'Hypermobile', 'Restricted',
        'PL', 'PR', 'PI', 'PS', 'PL-M', 'PR-M',
        'PI-Ex', 'AS-In', 'In-Ex', 'Base Posterior', 'Base Anterior',
        'Adjusted', 'Not Adjusted', 'Tender', 'Hypertonic'
      ]
    },
    assessment: {
      type: 'composite',
      subluxation_findings: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Lumbar subluxation complex findings, pelvic dysfunction, listings...'
      },
      clinical_impression: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Clinical reasoning, diagnosis, contributing factors, prognosis...'
      },
      medical_necessity: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Why chiropractic care is needed: functional limitations, pain levels, impact on ADLs...'
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
        placeholder: 'Specific adjustments with segment, listing, and technique'
      },
      techniques_used: {
        type: 'list',
        items: [],
        placeholder: 'Diversified, Gonstead, Drop Table, SOT, Flexion-Distraction...'
      },
      supportive_care: {
        type: 'list',
        items: [],
        placeholder: 'Modalities, flexion-distraction, exercises, traction...'
      },
      frequency_duration: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Treatment frequency, expected duration, re-evaluation schedule...'
      },
      patient_education: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Lifting mechanics, core exercises, sleeping position, activity modifications...'
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
   * AI Prompt for lumbar adjustment SOAP generation
   */
  const createPrompt = (transcript) => `
You are a chiropractor documenting a lumbar spine assessment and adjustment. Generate a professional SOAP note from this session transcript.

TRANSCRIPT:
${transcript}

CRITICAL PRIVACY INSTRUCTION:
**NEVER include patient names or identifiers in the note. ALWAYS use "patient" or "the patient" instead of names.**

INSTRUCTIONS:
1. Extract relevant information for each SOAP section
2. Use professional CHIROPRACTIC terminology
3. Focus on lumbar spine (L1-L5), sacrum, and pelvic subluxation analysis
4. Document vertebral listings, pelvic misalignments, and SI joint dysfunction
5. Include adjustment techniques used (Diversified, Gonstead, Drop Table, SOT, Flexion-Distraction)
6. Return ONLY a JSON object matching the required structure

Return JSON with: subjective (content), objective (categories array), assessment (subluxation_findings, clinical_impression, medical_necessity, short_term_goals array, long_term_goals array), plan (adjustments_performed array, techniques_used array, supportive_care array, frequency_duration, patient_education), billing (cpt_codes array, units, icd10_codes array).

Focus on lumbar-specific findings: lordosis, pelvic tilt/level, leg length inequality, L1-L5 motion, SI joint function, sacral base position, neurological screening (L4-S1).

Use chiropractic terminology: subluxation, fixation, PI/AS ilium, sacral listings, lumbar listings (PL, PR, PL-M, PR-M), pelvic misalignment.

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
        max_tokens: 2500
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
        templateType: 'lumbar-adjustment'
      };

    } catch (error) {
      console.error('Lumbar adjustment SOAP generation failed:', error);
      return {
        success: false,
        error: error.message,
        soapData: getSchema(),
        confidence: { subjective: 0, objective: 0, assessment: 0, plan: 0, overall: 0 },
        templateType: 'lumbar-adjustment'
      };
    } finally {
      setIsGenerating(false);
    }
  };

  const getEmptySOAP = () => ({
    success: true,
    data: getSchema(),
    templateType: 'lumbar-adjustment'
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
    templateType: 'lumbar-adjustment',
    metadata: {
      name: 'Lumbar Adjustment',
      profession: 'chiropractic',
      spinalRegion: 'lumbar',
      sessionType: 'adjustment',
      description: 'Lumbar spine and pelvic assessment with adjustment (L1-L5, Sacrum)'
    }
  };
};


