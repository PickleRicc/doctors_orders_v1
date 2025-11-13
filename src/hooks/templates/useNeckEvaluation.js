/**
 * Neck Evaluation Template Hook
 * Specialized AI prompts and JSON schema for cervical spine assessments
 * Focuses on cervical mobility, neurological screening, and headache assessment
 */

import { useState } from 'react';

export const useNeckEvaluation = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * JSON Schema for neck evaluation SOAP note structure
   */
  const getSchema = () => ({
    subjective: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Patient history, pain description, headaches, neurological symptoms, functional limitations...'
    },
    objective: {
      type: 'table',
      headers: ['Test/Measurement', 'Result', 'Notes'],
      categories: [
        {
          name: 'Observation',
          rows: [
            { test: 'Posture (Forward Head)', result: '', notes: '' },
            { test: 'Shoulder Height', result: '', notes: '' },
            { test: 'Muscle Bulk', result: '', notes: '' }
          ]
        },
        {
          name: 'Palpation',
          rows: [
            { test: 'Cervical Paraspinals', result: '', notes: '' },
            { test: 'Upper Trapezius', result: '', notes: '' },
            { test: 'SCM', result: '', notes: '' },
            { test: 'Facet Joints', result: '', notes: '' }
          ]
        },
        {
          name: 'Range of Motion',
          rows: [
            { test: 'Cervical Flexion', result: '', notes: '' },
            { test: 'Cervical Extension', result: '', notes: '' },
            { test: 'Lateral Flexion (Left)', result: '', notes: '' },
            { test: 'Lateral Flexion (Right)', result: '', notes: '' },
            { test: 'Rotation (Left)', result: '', notes: '' },
            { test: 'Rotation (Right)', result: '', notes: '' }
          ]
        },
        {
          name: 'Strength Testing',
          rows: [
            { test: 'Deep Neck Flexors', result: '', notes: '' },
            { test: 'Upper Trapezius', result: '', notes: '' },
            { test: 'Levator Scapulae', result: '', notes: '' }
          ]
        },
        {
          name: 'Special Tests',
          rows: [
            { test: 'Spurling\'s Test', result: '', notes: '' },
            { test: 'Distraction Test', result: '', notes: '' },
            { test: 'Upper Limb Tension Test', result: '', notes: '' },
            { test: 'Vertebral Artery Test', result: '', notes: '' }
          ]
        },
        {
          name: 'Functional Testing',
          rows: [
            { test: 'Cervical Endurance', result: '', notes: '' },
            { test: 'Posture Holding', result: '', notes: '' },
            { test: 'Neurological Screen', result: '', notes: '' }
          ]
        }
      ],
      allowAddRows: true,
      commonResults: ['Positive', 'Negative', 'Not Tested', 'WNL', 'Limited', 'Painful', 'Forward Head', 'Normal']
    },
    assessment: {
      type: 'composite',
      clinical_impression: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Clinical reasoning, diagnosis, contributing factors, prognosis...'
      },
      medical_necessity: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Why PT is needed: functional limitations, safety concerns, impact on ADLs...'
      },
      short_term_goals: {
        type: 'list',
        items: [],
        placeholder: 'SMART goals for 2-4 weeks (Specific, Measurable, Achievable, Relevant, Time-bound)'
      },
      long_term_goals: {
        type: 'list',
        items: [],
        placeholder: 'SMART goals for 6-12 weeks'
      }
    },
    plan: {
      type: 'composite',
      interventions: {
        type: 'list',
        items: [],
        placeholder: 'Neck-specific interventions...'
      },
      progressions: {
        type: 'list',
        items: [],
        placeholder: 'How to advance exercises as patient improves...'
      },
      regressions: {
        type: 'list',
        items: [],
        placeholder: 'How to modify if symptoms increase...'
      },
      frequency_duration: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Treatment frequency, session duration, expected timeline...'
      },
      patient_education: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Home exercise program, activity modifications, precautions...'
      }
    },
    billing: {
      type: 'composite',
      cpt_codes: {
        type: 'list',
        items: [],
        placeholder: 'CPT codes based on interventions performed'
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
   * AI Prompt for neck evaluation SOAP generation
   */
  const createPrompt = (transcript) => `
You are a physical therapist documenting a cervical spine/neck evaluation. Generate a professional SOAP note from this session transcript.

CRITICAL PRIVACY INSTRUCTION:
**NEVER include patient names or identifiers in the note. ALWAYS use "patient" or "the patient" instead of names.**
If the transcript says "John reports..." or "Mrs. Smith states...", write "Patient reports..." or "The patient states..."

TRANSCRIPT:
${transcript}

INSTRUCTIONS:
1. Write SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
2. Clearly document medical necessity and why PT is needed for insurance
3. Suggest appropriate billing codes based on interventions
4.
1. Extract relevant information for each SOAP section
2. Use professional PT terminology specific to cervical spine conditions
3. Focus on cervical mobility, postural dysfunction, and neurological screening
4. Return ONLY a JSON object matching this exact structure:

{
  "subjective": {
    "content": "Patient narrative including pain description, headache patterns, neurological symptoms, mechanism of injury, functional limitations, work ergonomics. Use professional medical language."
  },
  "objective": {
    "categories": [
      {
        "name": "Observation",
        "rows": [
          {"test": "Posture (Forward Head)", "result": "Moderate FHP", "notes": "CVA angle 45°, normal 50-55°"},
          {"test": "Shoulder Height", "result": "Right elevated", "notes": "Upper trap hypertonicity"},
          {"test": "Muscle Bulk", "result": "Atrophy", "notes": "Left SCM decreased bulk"}
        ]
      },
      {
        "name": "Palpation",
        "rows": [
          {"test": "Cervical Paraspinals", "result": "Tender", "notes": "C5-C6 bilateral tenderness"},
          {"test": "Upper Trapezius", "result": "Hypertonic", "notes": "Bilateral trigger points"},
          {"test": "SCM", "result": "Tender right", "notes": "Insertion point tenderness"},
          {"test": "Facet Joints", "result": "Tender", "notes": "C4-C5 right unilateral"}
        ]
      },
      {
        "name": "Range of Motion",
        "rows": [
          {"test": "Cervical Flexion", "result": "40°", "notes": "Limited, normal 50°, pain at end range"},
          {"test": "Cervical Extension", "result": "50°", "notes": "WNL, no pain"},
          {"test": "Lateral Flexion (Left)", "result": "35°", "notes": "Limited 50%, pain at end range"},
          {"test": "Lateral Flexion (Right)", "result": "30°", "notes": "More limited than left"},
          {"test": "Rotation (Left)", "result": "60°", "notes": "Limited, normal 80°"},
          {"test": "Rotation (Right)", "result": "55°", "notes": "Pain with overpressure"}
        ]
      },
      {
        "name": "Strength Testing",
        "rows": [
          {"test": "Deep Neck Flexors", "result": "2/5", "notes": "Significant weakness, poor endurance"},
          {"test": "Upper Trapezius", "result": "5/5", "notes": "Overactive, compensatory pattern"},
          {"test": "Levator Scapulae", "result": "4/5", "notes": "Mild weakness right"}
        ]
      },
      {
        "name": "Special Tests",
        "rows": [
          {"test": "Spurling's Test", "result": "Positive right", "notes": "Reproduces arm pain C6 distribution"},
          {"test": "Distraction Test", "result": "Positive", "notes": "Relieves symptoms"},
          {"test": "Upper Limb Tension Test", "result": "Positive", "notes": "Median nerve bias positive"},
          {"test": "Vertebral Artery Test", "result": "Negative", "notes": "No dizziness or nystagmus"}
        ]
      },
      {
        "name": "Functional Testing",
        "rows": [
          {"test": "Cervical Endurance", "result": "15 seconds", "notes": "Decreased from 30s baseline"},
          {"test": "Posture Holding", "result": "Poor", "notes": "Cannot maintain neutral >2 minutes"},
          {"test": "Neurological Screen", "result": "Abnormal", "notes": "C6 dermatomal numbness"}
        ]
      }
    ]
  },
  "assessment": {
    "clinical_impression": "Clinical reasoning, likely diagnosis (e.g., cervical radiculopathy, muscle tension headache, postural dysfunction), neurological findings, contributing factors, prognosis.",
    "short_term_goals": [
      "Specific, measurable goal for 2-4 weeks (e.g., Reduce pain from 6/10 to 3/10)",
      "Another short-term goal (e.g., Improve neck rotation from 50° to 70°)",
      "2-4 goals total focused on immediate improvements"
    ],
    "long_term_goals": [
      "Specific, measurable goal for 6-12 weeks (e.g., Work at computer 8 hours pain-free)",
      "Another long-term goal (e.g., Achieve full cervical ROM in all planes)",
      "2-3 goals total focused on functional outcomes"
    ]
  },
  "plan": {
    "interventions": [
      "Cervical joint mobilizations (PA glides C4-C6)",
      "Deep neck flexor strengthening (chin tucks)",
      "Upper trapezius stretching and manual release",
      "Postural correction exercises (scapular retraction)",
      "Thoracic spine mobilization",
      "Neural mobilization for radiculopathy",
      "3-5 cervical-specific interventions"
    ],
    "progressions": [
      "Progress from supine to sitting to standing chin tucks",
      "Increase hold times (10s to 20s to 30s)",
      "Add resistance with theraband",
      "Progress from isolated to functional movements"
    ],
    "regressions": [
      "Reduce ROM if symptoms peripheralize",
      "Return to supine exercises if sitting increases pain",
      "Decrease hold times or resistance"
    ],
    "frequency_duration": "Treatment frequency (e.g., 2x/week for 4-6 weeks), expected timeline for return to desk work tolerance.",
    "patient_education": "Home exercise program (chin tucks, doorway stretches), ergonomic workstation setup, sleeping positions, break reminders for prolonged sitting."
  }
}

IMPORTANT: 
- Only include tests/measurements that were actually mentioned in the transcript
- Use "Not assessed" if information is missing
- Focus on cervical spine-specific conditions and postural dysfunction
- Return valid JSON only, no additional text
`;

  /**
   * Generate structured SOAP note from transcript
   */
  const generateSOAP = async (transcript, aiService) => {
    if (!transcript || !aiService) {
      throw new Error('Transcript and AI service are required');
    }

    setIsGenerating(true);
    
    try {
      const prompt = createPrompt(transcript);
      
      const response = await aiService.generateCompletion(prompt, {
        temperature: 0.3,
        maxTokens: 2000,
        responseFormat: 'json'
      });

      let soapData;
      try {
        soapData = JSON.parse(response);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
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
          clinical_impression: {
            ...schema.assessment.clinical_impression,
            content: soapData.assessment?.clinical_impression || ''
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
          interventions: {
            ...schema.plan.interventions,
            items: soapData.plan?.interventions || []
          },
          progressions: {
            ...schema.plan.progressions,
            items: soapData.plan?.progressions || []
          },
          regressions: {
            ...schema.plan.regressions,
            items: soapData.plan?.regressions || []
          },
          frequency_duration: {
            ...schema.plan.frequency_duration,
            content: soapData.plan?.frequency_duration || ''
          },
          patient_education: {
            ...schema.plan.patient_education,
            content: soapData.plan?.patient_education || ''
          }
        }
      };

      return {
        success: true,
        data: structuredSOAP,
        templateType: 'neck',
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Neck evaluation SOAP generation failed:', error);
      
      return {
        success: false,
        error: error.message,
        data: getSchema(),
        templateType: 'neck'
      };
    } finally {
      setIsGenerating(false);
    }
  };

  const getEmptySOAP = () => ({
    success: true,
    data: getSchema(),
    templateType: 'neck'
  });

  const validateSOAP = (soapData) => {
    const errors = [];
    ['subjective', 'objective', 'assessment', 'plan'].forEach(section => {
      if (!soapData[section]) {
        errors.push(`Missing ${section} section`);
      }
    });

    if (soapData.objective && !Array.isArray(soapData.objective.categories)) {
      errors.push('Objective section must contain categories array');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return {
    generateSOAP,
    getEmptySOAP,
    getSchema,
    validateSOAP,
    isGenerating,
    templateType: 'neck',
    metadata: {
      name: 'Neck Evaluation',
      bodyRegion: 'neck',
      sessionType: 'evaluation',
      description: 'Cervical spine mobility and neurological screening'
    }
  };
};
