/**
 * Extremity Adjustment Template Hook
 * Specialized for upper and lower extremity chiropractic assessments
 * CHIROPRACTIC-EXCLUSIVE - Not for Physical Therapy use
 */

import { useState } from 'react';

export const useExtremityAdjustment = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * JSON Schema for extremity adjustment SOAP note structure
   */
  const getSchema = () => ({
    subjective: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Chief complaint, extremity pain patterns, mechanism of injury, functional limitations...'
    },
    objective: {
      type: 'table',
      headers: ['Category', 'Test/Measurement', 'Result', 'Notes'],
      categories: [
        {
          name: 'Upper Extremity - Shoulder',
          rows: [
            { test: 'AC Joint', result: '', notes: '' },
            { test: 'Glenohumeral Joint', result: '', notes: '' },
            { test: 'Scapulothoracic Motion', result: '', notes: '' },
            { test: 'Shoulder ROM', result: '', notes: '' }
          ]
        },
        {
          name: 'Upper Extremity - Elbow/Wrist/Hand',
          rows: [
            { test: 'Elbow Joint', result: '', notes: '' },
            { test: 'Radial Head', result: '', notes: '' },
            { test: 'Wrist/Carpal Bones', result: '', notes: '' },
            { test: 'Hand/Finger Joints', result: '', notes: '' }
          ]
        },
        {
          name: 'Lower Extremity - Hip',
          rows: [
            { test: 'Hip Joint Mobility', result: '', notes: '' },
            { test: 'Hip Flexion/Extension', result: '', notes: '' },
            { test: 'Hip Internal/External Rotation', result: '', notes: '' },
            { test: 'Hip Abduction/Adduction', result: '', notes: '' }
          ]
        },
        {
          name: 'Lower Extremity - Knee',
          rows: [
            { test: 'Tibiofemoral Joint', result: '', notes: '' },
            { test: 'Patellofemoral Joint', result: '', notes: '' },
            { test: 'Proximal Tibiofibular', result: '', notes: '' },
            { test: 'Knee ROM', result: '', notes: '' }
          ]
        },
        {
          name: 'Lower Extremity - Ankle/Foot',
          rows: [
            { test: 'Talocrural Joint', result: '', notes: '' },
            { test: 'Subtalar Joint', result: '', notes: '' },
            { test: 'Midfoot Joints', result: '', notes: '' },
            { test: 'Metatarsals/Phalanges', result: '', notes: '' },
            { test: 'Ankle ROM', result: '', notes: '' }
          ]
        },
        {
          name: 'Orthopedic Tests',
          rows: [
            { test: 'Relevant Orthopedic Test 1', result: '', notes: '' },
            { test: 'Relevant Orthopedic Test 2', result: '', notes: '' },
            { test: 'Relevant Orthopedic Test 3', result: '', notes: '' }
          ]
        },
        {
          name: 'Extremity Subluxation Analysis',
          rows: [
            { test: 'Primary Joint Dysfunction', result: '', notes: '' },
            { test: 'Secondary Dysfunction', result: '', notes: '' },
            { test: 'Compensatory Patterns', result: '', notes: '' }
          ]
        },
        {
          name: 'Related Spinal Segments',
          rows: [
            { test: 'Cervical (if upper extremity)', result: '', notes: '' },
            { test: 'Thoracic (if applicable)', result: '', notes: '' },
            { test: 'Lumbar/Pelvis (if lower extremity)', result: '', notes: '' }
          ]
        }
      ],
      allowAddRows: true,
      commonResults: [
        'WNL', 'Not Tested', 'Present', 'Absent',
        'Fixated', 'Hypomobile', 'Hypermobile', 'Restricted',
        'Anterior', 'Posterior', 'Superior', 'Inferior',
        'Internal', 'External', 'Medial', 'Lateral',
        'Adjusted', 'Not Adjusted', 'Tender', 'Crepitus'
      ]
    },
    assessment: {
      type: 'composite',
      subluxation_findings: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Extremity joint dysfunction findings, fixation patterns, related spinal involvement...'
      },
      clinical_impression: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Clinical reasoning, diagnosis, contributing factors, prognosis...'
      },
      medical_necessity: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Why extremity adjustment is needed: joint dysfunction, functional limitations...'
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
        placeholder: 'Extremity adjustments with joint, direction, and technique'
      },
      techniques_used: {
        type: 'list',
        items: [],
        placeholder: 'Extremity adjusting techniques, mobilization, manipulation...'
      },
      supportive_care: {
        type: 'list',
        items: [],
        placeholder: 'Modalities, taping, exercises, bracing...'
      },
      frequency_duration: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Treatment frequency, expected duration, re-evaluation schedule...'
      },
      patient_education: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Home exercises, activity modifications, ergonomic advice, protective measures...'
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
   * AI Prompt for extremity adjustment SOAP generation
   */
  const createPrompt = (transcript) => `
You are a chiropractor documenting an extremity assessment and adjustment. Generate a professional SOAP note from this session transcript.

TRANSCRIPT:
${transcript}

CRITICAL PRIVACY INSTRUCTION:
**NEVER include patient names or identifiers in the note. ALWAYS use "patient" or "the patient" instead of names.**

INSTRUCTIONS:
1. Extract relevant information for extremity (non-spinal) joint evaluation
2. Use professional CHIROPRACTIC terminology for extremity adjusting
3. Focus on the specific extremity joint(s) involved (shoulder, elbow, wrist, hip, knee, ankle, foot)
4. Document joint fixation patterns and directional dysfunction
5. Include related spinal segments that may contribute
6. Include adjustment techniques used (long axis distraction, drop table, mobilization)
7. Return ONLY a JSON object matching the required structure

Return JSON with: subjective (content), objective (categories array), assessment (subluxation_findings, clinical_impression, medical_necessity, short_term_goals array, long_term_goals array), plan (adjustments_performed array, techniques_used array, supportive_care array, frequency_duration, patient_education), billing (cpt_codes array, units, icd10_codes array).

Focus on extremity-specific findings: joint mobility, fixation direction (anterior, posterior, superior, inferior, internal, external rotation), ROM, orthopedic tests, related spinal involvement.

Use chiropractic extremity terminology: joint fixation, subluxation, mobilization, manipulation, long axis distraction, drop adjusting.

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
        templateType: 'extremity-adjustment'
      };

    } catch (error) {
      console.error('Extremity adjustment SOAP generation failed:', error);
      return {
        success: false,
        error: error.message,
        soapData: getSchema(),
        confidence: { subjective: 0, objective: 0, assessment: 0, plan: 0, overall: 0 },
        templateType: 'extremity-adjustment'
      };
    } finally {
      setIsGenerating(false);
    }
  };

  const getEmptySOAP = () => ({
    success: true,
    data: getSchema(),
    templateType: 'extremity-adjustment'
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
    templateType: 'extremity-adjustment',
    metadata: {
      name: 'Extremity Adjustment',
      profession: 'chiropractic',
      category: 'specialized',
      sessionType: 'adjustment',
      description: 'Joint assessment and adjustment for upper/lower extremities'
    }
  };
};


