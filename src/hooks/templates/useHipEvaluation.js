/**
 * Hip Evaluation Template Hook
 * Specialized AI prompts and JSON schema for hip assessments
 * Focuses on hip joint mobility, strength, and functional assessment
 */

import { useState } from 'react';

export const useHipEvaluation = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * JSON Schema for hip evaluation SOAP note structure
   */
  const getSchema = () => ({
    subjective: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Patient history, pain description, functional limitations, activity modifications...'
    },
    objective: {
      type: 'table',
      headers: ['Test/Measurement', 'Result', 'Notes'],
      categories: [
        {
          name: 'Observation',
          rows: [
            { test: 'Gait Pattern', result: '', notes: '' },
            { test: 'Pelvic Alignment', result: '', notes: '' },
            { test: 'Leg Length Discrepancy', result: '', notes: '' }
          ]
        },
        {
          name: 'Palpation',
          rows: [
            { test: 'Greater Trochanter', result: '', notes: '' },
            { test: 'ASIS', result: '', notes: '' },
            { test: 'Hip Joint Line', result: '', notes: '' }
          ]
        },
        {
          name: 'Range of Motion',
          rows: [
            { test: 'Hip Flexion', result: '', notes: '' },
            { test: 'Hip Extension', result: '', notes: '' },
            { test: 'Hip Abduction', result: '', notes: '' },
            { test: 'Hip Adduction', result: '', notes: '' },
            { test: 'Internal Rotation', result: '', notes: '' },
            { test: 'External Rotation', result: '', notes: '' }
          ]
        },
        {
          name: 'Strength Testing',
          rows: [
            { test: 'Hip Flexors', result: '', notes: '' },
            { test: 'Hip Extensors', result: '', notes: '' },
            { test: 'Hip Abductors (Glute Med)', result: '', notes: '' },
            { test: 'Hip Adductors', result: '', notes: '' }
          ]
        },
        {
          name: 'Special Tests',
          rows: [
            { test: 'FABER Test', result: '', notes: '' },
            { test: 'FADIR Test', result: '', notes: '' },
            { test: 'Thomas Test', result: '', notes: '' },
            { test: 'Ober Test', result: '', notes: '' },
            { test: 'Trendelenburg Test', result: '', notes: '' }
          ]
        },
        {
          name: 'Functional Testing',
          rows: [
            { test: 'Single Leg Stance', result: '', notes: '' },
            { test: 'Step-Up', result: '', notes: '' },
            { test: 'Squat Assessment', result: '', notes: '' }
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
        placeholder: 'Hip-specific interventions...'
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
   * AI Prompt for hip evaluation SOAP generation
   */
  const createPrompt = (transcript) => `
You are a physical therapist documenting a hip evaluation. Generate a professional SOAP note from this session transcript.

CRITICAL PRIVACY INSTRUCTION:
**NEVER include patient names or identifiers in the note. ALWAYS use "patient" or "the patient" instead of names.**

TRANSCRIPT:
${transcript}

INSTRUCTIONS:
1. Extract relevant information for each SOAP section
2. Use professional PT terminology specific to hip conditions
3. Focus on hip joint pathology, muscle imbalances, and functional deficits
4. Return ONLY a JSON object matching this exact structure:

{
  "subjective": {
    "content": "Patient narrative including pain description, functional limitations, activity modifications, mechanism of injury, impact on ADLs. Use professional medical language."
  },
  "objective": {
    "categories": [
      {
        "name": "Observation",
        "rows": [
          {"test": "Gait Pattern", "result": "Antalgic", "notes": "Decreased stance time on right"},
          {"test": "Pelvic Alignment", "result": "Right hip drop", "notes": "Trendelenburg gait pattern"},
          {"test": "Leg Length Discrepancy", "result": "5mm short right", "notes": "Measured supine"}
        ]
      },
      {
        "name": "Palpation",
        "rows": [
          {"test": "Greater Trochanter", "result": "Tender right", "notes": "Trochanteric bursitis suspected"},
          {"test": "ASIS", "result": "Tender bilateral", "notes": "Hip flexor insertion"},
          {"test": "Hip Joint Line", "result": "Tender anterior", "notes": "Anterior capsule tenderness"}
        ]
      },
      {
        "name": "Range of Motion",
        "rows": [
          {"test": "Hip Flexion", "result": "110°", "notes": "Limited, normal 120°, pain at end range"},
          {"test": "Hip Extension", "result": "10°", "notes": "Limited, normal 20°"},
          {"test": "Abduction", "result": "35°", "notes": "Limited, painful"},
          {"test": "Adduction", "result": "WNL", "notes": "Full range, no pain"},
          {"test": "Internal Rotation", "result": "20°", "notes": "Limited 50%, painful"},
          {"test": "External Rotation", "result": "40°", "notes": "WNL"}
        ]
      },
      {
        "name": "Strength Testing",
        "rows": [
          {"test": "Hip Flexors", "result": "4/5", "notes": "Weakness noted bilaterally"},
          {"test": "Hip Extensors (Gluteus Maximus)", "result": "3/5", "notes": "Significant weakness"},
          {"test": "Hip Abductors (Gluteus Medius)", "result": "3+/5", "notes": "Weakness, Trendelenburg positive"},
          {"test": "Hip Adductors", "result": "4/5", "notes": "Mild weakness"}
        ]
      },
      {
        "name": "Special Tests",
        "rows": [
          {"test": "FABER Test", "result": "Positive", "notes": "Reproduces groin pain, hip pathology"},
          {"test": "FADIR Test", "result": "Positive", "notes": "Hip impingement suspected"},
          {"test": "Thomas Test", "result": "Positive", "notes": "Hip flexor tightness bilateral"},
          {"test": "Ober Test", "result": "Positive", "notes": "IT band tightness"},
          {"test": "Trendelenburg Test", "result": "Positive", "notes": "Hip drop during single leg stance"}
        ]
      },
      {
        "name": "Functional Testing",
        "rows": [
          {"test": "Single Leg Stance", "result": "10 seconds", "notes": "Decreased from 30s baseline"},
          {"test": "Step-Up Test", "result": "Painful", "notes": "8-inch step, requires rail support"},
          {"test": "Squat Assessment", "result": "Limited", "notes": "Hip pain limits depth to 60°"}
        ]
      }
    ]
  },
  "assessment": {
    "clinical_impression": "Clinical reasoning, likely diagnosis (e.g., hip osteoarthritis, FAI, trochanteric bursitis), functional deficits, contributing factors, prognosis.",
    "short_term_goals": [
      "Specific, measurable goal for 2-4 weeks (e.g., Reduce pain from 5/10 to 3/10 with walking)",
      "Another short-term goal (e.g., Increase hip flexion from 90° to 110°)",
      "2-4 goals total focused on immediate improvements"
    ],
    "long_term_goals": [
      "Specific, measurable goal for 6-12 weeks (e.g., Walk 30 minutes continuously without pain)",
      "Another long-term goal (e.g., Return to recreational activities without limitations)",
      "2-3 goals total focused on functional outcomes"
    ]
  },
  "plan": {
    "interventions": [
      "Hip joint mobilizations (distraction, inferior glide)",
      "Gluteus medius strengthening (clamshells, side-lying abduction)",
      "Hip flexor stretching (modified Thomas stretch)",
      "IT band foam rolling and stretching",
      "Single leg balance exercises",
      "Manual therapy to hip external rotators",
      "3-5 hip-specific interventions"
    ],
    "progressions": [
      "Progress from bilateral to unilateral stance",
      "Increase resistance band strength (red to blue to black)",
      "Add functional movements (step-ups, lunges)",
      "Progress from non-weight bearing to weight bearing exercises"
    ],
    "regressions": [
      "Reduce weight bearing if pain increases",
      "Return to supine exercises if standing aggravates symptoms",
      "Decrease resistance or ROM"
    ],
    "frequency_duration": "Treatment frequency (e.g., 2x/week for 6 weeks), expected timeline for return to walking tolerance.",
    "patient_education": "Home exercise program (bridges, clamshells), sleeping positions, activity pacing for walking/stairs."
  }
}

CRITICAL INSTRUCTIONS FOR OBJECTIVE SECTION:
1. ALWAYS fill in the "result" field with ACTUAL values from the transcript
2. NEVER use placeholder text like "Result" or "Notes" - these are INVALID
3. Use standard results: Positive, Negative, Not Tested, WNL, Limited, Painful, specific measurements
4. If a test wasn't mentioned, use "Not assessed" in the result field
5. Include specific measurements when mentioned (degrees, MMT grades, leg length discrepancy)
6. The "notes" field should add clinical context, NOT be a placeholder
7. Only include tests/measurements that were actually performed or mentioned
8. Focus on hip-specific conditions and functional movement patterns
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
        templateType: 'hip',
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Hip evaluation SOAP generation failed:', error);
      
      return {
        success: false,
        error: error.message,
        data: getSchema(),
        templateType: 'hip'
      };
    } finally {
      setIsGenerating(false);
    }
  };

  const getEmptySOAP = () => ({
    success: true,
    data: getSchema(),
    templateType: 'hip'
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
    templateType: 'hip',
    metadata: {
      name: 'Hip Evaluation',
      bodyRegion: 'hip',
      sessionType: 'evaluation',
      description: 'Hip joint mobility, strength, and functional assessment'
    }
  };
};
