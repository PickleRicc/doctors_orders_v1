/**
 * Maintenance Care Template Hook
 * Simplified template for routine wellness/preventive chiropractic visits
 * CHIROPRACTIC-EXCLUSIVE - Not for Physical Therapy use
 */

import { useState } from 'react';

export const useMaintenanceCare = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * JSON Schema for maintenance care SOAP note structure
   */
  const getSchema = () => ({
    subjective: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Current status since last visit, any new complaints, overall wellness...'
    },
    objective: {
      type: 'table',
      headers: ['Category', 'Test/Measurement', 'Result', 'Notes'],
      categories: [
        {
          name: 'Current Status',
          rows: [
            { test: 'Overall Spinal Status', result: '', notes: '' },
            { test: 'Pain Level (if any)', result: '', notes: '' },
            { test: 'Functional Status', result: '', notes: '' },
            { test: 'Activity Level', result: '', notes: '' }
          ]
        },
        {
          name: 'Quick Postural Check',
          rows: [
            { test: 'Head/Neck Position', result: '', notes: '' },
            { test: 'Shoulder Level', result: '', notes: '' },
            { test: 'Pelvic Level', result: '', notes: '' },
            { test: 'Overall Posture', result: '', notes: '' }
          ]
        },
        {
          name: 'Motion Palpation Findings',
          rows: [
            { test: 'Cervical Spine', result: '', notes: '' },
            { test: 'Thoracic Spine', result: '', notes: '' },
            { test: 'Lumbar Spine', result: '', notes: '' },
            { test: 'Pelvis/Sacrum', result: '', notes: '' }
          ]
        },
        {
          name: 'Subluxation Check',
          rows: [
            { test: 'Primary Finding', result: '', notes: '' },
            { test: 'Secondary Findings', result: '', notes: '' },
            { test: 'Comparison to Last Visit', result: '', notes: '' }
          ]
        },
        {
          name: 'Muscle Tone/Tension',
          rows: [
            { test: 'Cervical Paraspinals', result: '', notes: '' },
            { test: 'Thoracic Paraspinals', result: '', notes: '' },
            { test: 'Lumbar Paraspinals', result: '', notes: '' },
            { test: 'Other Notable Areas', result: '', notes: '' }
          ]
        }
      ],
      allowAddRows: true,
      commonResults: [
        'WNL', 'Stable', 'Improved', 'Unchanged',
        'Mild', 'Moderate', 'Resolved',
        'Fixated', 'Hypomobile', 'Free',
        'Adjusted', 'Not Adjusted', 'Monitored',
        'Maintaining', 'Holding Adjustment'
      ]
    },
    assessment: {
      type: 'composite',
      subluxation_findings: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Current subluxation status, comparison to previous visits, holding patterns...'
      },
      clinical_impression: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Overall spinal health status, progress summary, stability of corrections...'
      },
      medical_necessity: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Why continued maintenance care is appropriate: prevention, wellness, stability...'
      },
      wellness_status: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Overall wellness assessment, lifestyle factors, patient-reported outcomes...'
      }
    },
    plan: {
      type: 'composite',
      adjustments_performed: {
        type: 'list',
        items: [],
        placeholder: 'Adjustments performed this visit'
      },
      techniques_used: {
        type: 'list',
        items: [],
        placeholder: 'Techniques applied'
      },
      supportive_care: {
        type: 'list',
        items: [],
        placeholder: 'Any additional care provided'
      },
      next_visit: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Recommended interval for next maintenance visit...'
      },
      wellness_recommendations: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Exercise, nutrition, ergonomic, stress management recommendations...'
      }
    },
    billing: {
      type: 'composite',
      cpt_codes: {
        type: 'list',
        items: [],
        placeholder: 'CPT codes for maintenance visit'
      },
      units: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Time-based units'
      },
      icd10_codes: {
        type: 'list',
        items: [],
        placeholder: 'ICD-10 diagnosis codes'
      }
    }
  });

  /**
   * AI Prompt for maintenance care SOAP generation
   */
  const createPrompt = (transcript) => `
You are a chiropractor documenting a maintenance/wellness care visit. Generate a professional SOAP note from this session transcript.

TRANSCRIPT:
${transcript}

CRITICAL PRIVACY INSTRUCTION:
**NEVER include patient names or identifiers in the note. ALWAYS use "patient" or "the patient" instead of names.**

INSTRUCTIONS:
1. This is a MAINTENANCE/WELLNESS visit, not an acute care visit
2. Focus on current status, stability of previous corrections, and preventive care
3. Use professional CHIROPRACTIC terminology
4. Document current subluxation status compared to previous visits
5. Emphasize wellness, prevention, and maintaining spinal health
6. Keep documentation concise but complete for routine visit
7. Return ONLY a JSON object matching the required structure

Return JSON with: subjective (content), objective (categories array), assessment (subluxation_findings, clinical_impression, medical_necessity, wellness_status), plan (adjustments_performed array, techniques_used array, supportive_care array, next_visit, wellness_recommendations), billing (cpt_codes array, units, icd10_codes array).

Focus on maintenance-specific language: stability, holding adjustments, prevention, wellness, maintaining corrections, spinal hygiene, health optimization.

Use terms like: stable, maintaining, holding, improved, resolved, monitoring, wellness care, preventive, supportive care.

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
        max_tokens: 2000
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
          wellness_status: {
            ...schema.assessment.wellness_status,
            content: soapData.assessment?.wellness_status || ''
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
          next_visit: {
            ...schema.plan.next_visit,
            content: soapData.plan?.next_visit || soapData.plan?.frequency_duration || ''
          },
          wellness_recommendations: {
            ...schema.plan.wellness_recommendations,
            content: soapData.plan?.wellness_recommendations || soapData.plan?.patient_education || ''
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
        templateType: 'maintenance-care'
      };

    } catch (error) {
      console.error('Maintenance care SOAP generation failed:', error);
      return {
        success: false,
        error: error.message,
        soapData: getSchema(),
        confidence: { subjective: 0, objective: 0, assessment: 0, plan: 0, overall: 0 },
        templateType: 'maintenance-care'
      };
    } finally {
      setIsGenerating(false);
    }
  };

  const getEmptySOAP = () => ({
    success: true,
    data: getSchema(),
    templateType: 'maintenance-care'
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
    templateType: 'maintenance-care',
    metadata: {
      name: 'Maintenance Care',
      profession: 'chiropractic',
      category: 'specialized',
      sessionType: 'maintenance',
      description: 'Wellness and preventive care documentation'
    }
  };
};


