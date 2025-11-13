/**
 * Shoulder Evaluation Template Hook
 * Specialized AI prompts and JSON schema for shoulder assessments
 * Focuses on rotator cuff, impingement, and mobility testing
 */

import { useState } from 'react';

export const useShoulderEvaluation = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * JSON Schema for shoulder evaluation SOAP note structure
   */
  const getSchema = () => ({
    subjective: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Patient history, pain description, mechanism of injury, functional limitations...'
    },
    objective: {
      type: 'table',
      headers: ['Test/Measurement', 'Result', 'Notes'],
      categories: [
        {
          name: 'Observation',
          rows: [
            { test: 'Posture Assessment', result: '', notes: '' },
            { test: 'Shoulder Height Symmetry', result: '', notes: '' }
          ]
        },
        {
          name: 'Palpation',
          rows: [
            { test: 'AC Joint', result: '', notes: '' },
            { test: 'Subacromial Space', result: '', notes: '' },
            { test: 'Biceps Tendon', result: '', notes: '' }
          ]
        },
        {
          name: 'Range of Motion',
          rows: [
            { test: 'Shoulder Flexion', result: '', notes: '' },
            { test: 'Shoulder Abduction', result: '', notes: '' },
            { test: 'Internal Rotation', result: '', notes: '' },
            { test: 'External Rotation', result: '', notes: '' }
          ]
        },
        {
          name: 'Strength Testing',
          rows: [
            { test: 'Rotator Cuff Strength', result: '', notes: '' },
            { test: 'Scapular Stabilizers', result: '', notes: '' }
          ]
        },
        {
          name: 'Special Tests',
          rows: [
            { test: 'Hawkins-Kennedy Test', result: '', notes: '' },
            { test: 'Neer\'s Test', result: '', notes: '' },
            { test: 'Empty Can Test', result: '', notes: '' },
            { test: 'Drop Arm Test', result: '', notes: '' }
          ]
        },
        {
          name: 'Functional Testing',
          rows: [
            { test: 'Overhead Reach', result: '', notes: '' },
            { test: 'Behind-Back Reach', result: '', notes: '' }
          ]
        }
      ],
      allowAddRows: true,
      commonResults: ['Positive', 'Negative', 'Not Tested', 'WNL', 'Limited', 'Painful', '3/5', '4/5', '5/5']
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
        placeholder: 'Shoulder-specific interventions...'
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
   * AI Prompt for shoulder evaluation SOAP generation
   */
  const createPrompt = (transcript) => `
You are a physical therapist documenting a shoulder evaluation. Generate a professional SOAP note from this session transcript.

CRITICAL PRIVACY INSTRUCTION:
**NEVER include patient names or identifiers in the note. ALWAYS use "patient" or "the patient" instead of names.**

TRANSCRIPT:
${transcript}

INSTRUCTIONS:
1. Write SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
2. Document medical necessity for insurance approval
3. Suggest appropriate billing codes
4.
1. Extract relevant information for each SOAP section
2. Use professional PT terminology specific to shoulder conditions
3. Focus on rotator cuff, impingement, and shoulder stability assessments
4. Return ONLY a JSON object matching this exact structure:

{
  "subjective": {
    "content": "Patient narrative including pain description, mechanism of injury, functional limitations, overhead activities, sleep disturbance. Use professional medical language."
  },
  "objective": {
    "categories": [
      {
        "name": "Observation",
        "rows": [
          {"test": "Posture Assessment", "result": "Forward shoulders", "notes": "Rounded shoulder posture noted"},
          {"test": "Shoulder Height Symmetry", "result": "Right elevated 2cm", "notes": "Upper trap hypertonicity"}
        ]
      },
      {
        "name": "Palpation",
        "rows": [
          {"test": "AC Joint", "result": "Tender", "notes": "Point tenderness over AC joint"},
          {"test": "Subacromial Space", "result": "Tender", "notes": "Pain with compression"},
          {"test": "Biceps Tendon", "result": "Tender", "notes": "Long head biceps groove"}
        ]
      },
      {
        "name": "Range of Motion",
        "rows": [
          {"test": "Shoulder Flexion", "result": "160°", "notes": "Limited, normal 180°, painful arc 90-120°"},
          {"test": "Abduction", "result": "150°", "notes": "Painful arc present"},
          {"test": "Internal Rotation", "result": "T8", "notes": "Limited, normal T6"},
          {"test": "External Rotation", "result": "70°", "notes": "WNL, slight pain end range"}
        ]
      },
      {
        "name": "Strength Testing",
        "rows": [
          {"test": "Rotator Cuff Strength", "result": "4-/5", "notes": "Weakness with pain"},
          {"test": "Scapular Stabilizers", "result": "3/5", "notes": "Poor scapular control, winging noted"}
        ]
      },
      {
        "name": "Special Tests",
        "rows": [
          {"test": "Hawkins-Kennedy", "result": "Positive", "notes": "Reproduces anterior shoulder pain"},
          {"test": "Neer's Test", "result": "Positive", "notes": "Pain with impingement"},
          {"test": "Empty Can Test", "result": "Positive", "notes": "Weakness and pain, supraspinatus involvement"},
          {"test": "Drop Arm Test", "result": "Negative", "notes": "No rotator cuff tear indicated"}
        ]
      },
      {
        "name": "Functional Testing",
        "rows": [
          {"test": "Overhead Reach", "result": "Limited", "notes": "Cannot reach overhead shelf"},
          {"test": "Behind-Back Reach", "result": "Limited to L4", "notes": "Normal is T6-T8"}
        ]
      }
    ]
  },
  "assessment": {
    "clinical_impression": "Clinical reasoning, likely diagnosis (e.g., subacromial impingement, rotator cuff tendinopathy, adhesive capsulitis), contributing factors, prognosis. Be specific about shoulder pathology.",
    "short_term_goals": [
      "Specific, measurable goal for 2-4 weeks (e.g., Reduce pain from 6/10 to 3/10 with overhead activities)",
      "Another short-term goal (e.g., Increase shoulder flexion from 140° to 160°)",
      "2-4 goals total focused on immediate improvements"
    ],
    "long_term_goals": [
      "Specific, measurable goal for 6-12 weeks (e.g., Return to painting/overhead work without pain)",
      "Another long-term goal (e.g., Sleep on affected side without waking)",
      "2-3 goals total focused on functional outcomes"
    ]
  },
  "plan": {
    "interventions": [
      "Glenohumeral joint mobilizations (posterior glide)",
      "Scapular stabilization exercises (rows, Y-T-W)",
      "Rotator cuff strengthening (external rotation, internal rotation)",
      "Posterior capsule stretching",
      "Manual therapy to upper trapezius",
      "3-5 shoulder-specific interventions"
    ],
    "progressions": [
      "Progress from isometric to isotonic exercises",
      "Increase elevation range (90° to 140° to 170°)",
      "Add resistance from 2 lbs to 5 lbs",
      "Progress from supported to unsupported positions"
    ],
    "regressions": [
      "Reduce ROM to pain-free range if pain increases",
      "Return to passive ROM if active causes symptoms",
      "Decrease resistance or eliminate weight"
    ],
    "frequency_duration": "Treatment frequency (e.g., 2x/week for 6 weeks), expected timeline for overhead activities.",
    "patient_education": "Home exercise program (pendulums, wall slides), sleeping positions, activity modifications for overhead work."
  }
}

CRITICAL INSTRUCTIONS FOR OBJECTIVE SECTION:
1. ALWAYS fill in the "result" field with ACTUAL values from the transcript
2. NEVER use placeholder text like "Result" or "Notes" - these are INVALID
3. Use standard results: Positive, Negative, Not Tested, WNL, Limited, Painful, specific measurements
4. If a test wasn't mentioned, use "Not assessed" in the result field
5. Include specific measurements when mentioned (degrees, MMT grades, time durations)
6. The "notes" field should add clinical context, NOT be a placeholder
7. Only include tests/measurements that were actually performed or mentioned
8. Focus on shoulder-specific conditions and terminology
9. Return valid JSON only, no additional text before or after
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
        templateType: 'shoulder',
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Shoulder evaluation SOAP generation failed:', error);
      
      return {
        success: false,
        error: error.message,
        data: getSchema(),
        templateType: 'shoulder'
      };
    } finally {
      setIsGenerating(false);
    }
  };

  const getEmptySOAP = () => ({
    success: true,
    data: getSchema(),
    templateType: 'shoulder'
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
    templateType: 'shoulder',
    metadata: {
      name: 'Shoulder Evaluation',
      bodyRegion: 'shoulder',
      sessionType: 'evaluation',
      description: 'Shoulder impingement, rotator cuff, and mobility assessment'
    }
  };
};
