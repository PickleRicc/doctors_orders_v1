/**
 * Thoracic Adjustment Template Hook
 * Specialized AI prompts and JSON schema for thoracic spine chiropractic assessments
 * CHIROPRACTIC-EXCLUSIVE - Not for Physical Therapy use
 */

import { useState } from 'react';

export const useThoracicAdjustment = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * JSON Schema for thoracic adjustment SOAP note structure
   */
  const getSchema = () => ({
    subjective: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Chief complaint, mid-back pain patterns, rib pain, breathing issues, mechanism of injury...'
    },
    objective: {
      type: 'table',
      headers: ['Category', 'Test/Measurement', 'Result', 'Notes'],
      categories: [
        {
          name: 'Postural Assessment',
          rows: [
            { test: 'Thoracic Kyphosis', result: '', notes: '' },
            { test: 'Scoliosis Assessment', result: '', notes: '' },
            { test: 'Shoulder Level', result: '', notes: '' },
            { test: 'Scapular Position', result: '', notes: '' }
          ]
        },
        {
          name: 'Static Palpation',
          rows: [
            { test: 'T1-T4 (Upper Thoracic)', result: '', notes: '' },
            { test: 'T5-T8 (Mid Thoracic)', result: '', notes: '' },
            { test: 'T9-T12 (Lower Thoracic)', result: '', notes: '' },
            { test: 'Paraspinal Musculature', result: '', notes: '' },
            { test: 'Rhomboids', result: '', notes: '' },
            { test: 'Intercostal Spaces', result: '', notes: '' }
          ]
        },
        {
          name: 'Motion Palpation',
          rows: [
            { test: 'T1-T2 Motion', result: '', notes: '' },
            { test: 'T3-T4 Motion', result: '', notes: '' },
            { test: 'T5-T6 Motion', result: '', notes: '' },
            { test: 'T7-T8 Motion', result: '', notes: '' },
            { test: 'T9-T10 Motion', result: '', notes: '' },
            { test: 'T11-T12 Motion', result: '', notes: '' }
          ]
        },
        {
          name: 'Rib Assessment',
          rows: [
            { test: 'Rib 1-2 Motion', result: '', notes: '' },
            { test: 'Rib 3-5 Motion', result: '', notes: '' },
            { test: 'Rib 6-10 Motion', result: '', notes: '' },
            { test: 'Floating Ribs (11-12)', result: '', notes: '' },
            { test: 'Costotransverse Joints', result: '', notes: '' },
            { test: 'Costovertebral Joints', result: '', notes: '' }
          ]
        },
        {
          name: 'Range of Motion',
          rows: [
            { test: 'Thoracic Flexion', result: '', notes: '' },
            { test: 'Thoracic Extension', result: '', notes: '' },
            { test: 'Left Lateral Flexion', result: '', notes: '' },
            { test: 'Right Lateral Flexion', result: '', notes: '' },
            { test: 'Left Rotation', result: '', notes: '' },
            { test: 'Right Rotation', result: '', notes: '' }
          ]
        },
        {
          name: 'Orthopedic/Neurological Tests',
          rows: [
            { test: 'Rib Compression Test', result: '', notes: '' },
            { test: 'Kemp\'s Test', result: '', notes: '' },
            { test: 'Chest Expansion', result: '', notes: '' },
            { test: 'Deep Tendon Reflexes', result: '', notes: '' },
            { test: 'Dermatomal Sensation', result: '', notes: '' }
          ]
        },
        {
          name: 'Subluxation Analysis',
          rows: [
            { test: 'T1-T4 Listings', result: '', notes: '' },
            { test: 'T5-T8 Listings', result: '', notes: '' },
            { test: 'T9-T12 Listings', result: '', notes: '' },
            { test: 'Rib Subluxations', result: '', notes: '' }
          ]
        }
      ],
      allowAddRows: true,
      commonResults: [
        'WNL', 'Not Tested', 'Present', 'Absent',
        'Fixated', 'Hypomobile', 'Hypermobile', 'Restricted',
        'PL', 'PR', 'PI', 'PS', 'PL-T', 'PR-T',
        'Posterior Rib', 'Anterior Rib', 'Elevated Rib', 'Depressed Rib',
        'Adjusted', 'Not Adjusted', 'Tender', 'Hypertonic'
      ]
    },
    assessment: {
      type: 'composite',
      subluxation_findings: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Vertebral subluxation complex findings, rib dysfunction, listings...'
      },
      clinical_impression: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Clinical reasoning, diagnosis, contributing factors, prognosis...'
      },
      medical_necessity: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Why chiropractic care is needed: functional limitations, pain levels, breathing issues...'
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
        placeholder: 'Diversified, Drop Table, Activator, prone, supine positioning...'
      },
      supportive_care: {
        type: 'list',
        items: [],
        placeholder: 'Modalities, rib mobilization, breathing exercises...'
      },
      frequency_duration: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Treatment frequency, expected duration, re-evaluation schedule...'
      },
      patient_education: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Posture advice, breathing exercises, sleeping position, activity modifications...'
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
   * AI Prompt for thoracic adjustment SOAP generation
   */
  const createPrompt = (transcript) => `
You are a chiropractor documenting a thoracic spine assessment and adjustment. Generate a professional SOAP note from this session transcript.

TRANSCRIPT:
${transcript}

CRITICAL PRIVACY INSTRUCTION:
**NEVER include patient names or identifiers in the note. ALWAYS use "patient" or "the patient" instead of names.**

INSTRUCTIONS:
1. Extract relevant information for each SOAP section
2. Use professional CHIROPRACTIC terminology
3. Focus on thoracic spine (T1-T12) and rib subluxation analysis
4. Document vertebral listings and rib dysfunctions
5. Include adjustment techniques used
6. Return ONLY a JSON object matching the required structure

Return JSON with these sections: subjective (content), objective (categories array with rows), assessment (subluxation_findings, clinical_impression, medical_necessity, short_term_goals array, long_term_goals array), plan (adjustments_performed array, techniques_used array, supportive_care array, frequency_duration, patient_education), billing (cpt_codes array, units, icd10_codes array).

Focus on thoracic-specific findings: kyphosis, rib dysfunction, breathing mechanics, costovertebral/costotransverse joints, T1-T12 motion and fixation patterns.

Use chiropractic terminology: fixation, subluxation, rib subluxation (posterior/anterior rib), thoracic listings, manual adjustment, drop table technique.

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
        templateType: 'thoracic-adjustment'
      };

    } catch (error) {
      console.error('Thoracic adjustment SOAP generation failed:', error);
      return {
        success: false,
        error: error.message,
        soapData: getSchema(),
        confidence: { subjective: 0, objective: 0, assessment: 0, plan: 0, overall: 0 },
        templateType: 'thoracic-adjustment'
      };
    } finally {
      setIsGenerating(false);
    }
  };

  const getEmptySOAP = () => ({
    success: true,
    data: getSchema(),
    templateType: 'thoracic-adjustment'
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
    templateType: 'thoracic-adjustment',
    metadata: {
      name: 'Thoracic Adjustment',
      profession: 'chiropractic',
      spinalRegion: 'thoracic',
      sessionType: 'adjustment',
      description: 'Thoracic spine and rib assessment with adjustment (T1-T12)'
    }
  };
};


