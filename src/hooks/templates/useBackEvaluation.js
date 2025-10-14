/**
 * Back Evaluation Template Hook
 * Specialized AI prompts and JSON schema for back/spine assessments
 * Focuses on lumbar spine, posture, and movement analysis
 */

import { useState } from 'react';

export const useBackEvaluation = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * JSON Schema for back evaluation SOAP note structure
   */
  const getSchema = () => ({
    subjective: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Patient history, pain description, radiation patterns, functional limitations...'
    },
    objective: {
      type: 'table',
      headers: ['Test/Measurement', 'Result', 'Notes'],
      categories: [
        {
          name: 'Observation',
          rows: [
            { test: 'Posture Assessment', result: '', notes: '' },
            { test: 'Spinal Alignment', result: '', notes: '' },
            { test: 'Gait Pattern', result: '', notes: '' }
          ]
        },
        {
          name: 'Palpation',
          rows: [
            { test: 'Paraspinal Tenderness', result: '', notes: '' },
            { test: 'SI Joint', result: '', notes: '' },
            { test: 'Trigger Points', result: '', notes: '' }
          ]
        },
        {
          name: 'Range of Motion',
          rows: [
            { test: 'Lumbar Flexion', result: '', notes: '' },
            { test: 'Lumbar Extension', result: '', notes: '' },
            { test: 'Lateral Flexion', result: '', notes: '' },
            { test: 'Rotation', result: '', notes: '' }
          ]
        },
        {
          name: 'Strength Testing',
          rows: [
            { test: 'Core Strength', result: '', notes: '' },
            { test: 'Hip Flexors', result: '', notes: '' },
            { test: 'Gluteals', result: '', notes: '' }
          ]
        },
        {
          name: 'Special Tests',
          rows: [
            { test: 'SLR Test', result: '', notes: '' },
            { test: 'FABER Test', result: '', notes: '' },
            { test: 'Centralization/Peripheralization', result: '', notes: '' }
          ]
        },
        {
          name: 'Functional Testing',
          rows: [
            { test: 'Sit-to-Stand', result: '', notes: '' },
            { test: 'Forward Bending', result: '', notes: '' },
            { test: 'Lifting Mechanics', result: '', notes: '' }
          ]
        }
      ],
      allowAddRows: true,
      commonResults: ['Positive', 'Negative', 'Not Tested', 'WNL', 'Limited', 'Painful', 'Centralizes', 'Peripheralizes']
    },
    assessment: {
      type: 'composite',
      clinical_impression: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Clinical reasoning, diagnosis, contributing factors, prognosis...'
      },
      short_term_goals: {
        type: 'list',
        items: [],
        placeholder: 'Goals for 2-4 weeks (e.g., Reduce pain to 3/10, Improve lumbar flexion ROM)'
      },
      long_term_goals: {
        type: 'list',
        items: [],
        placeholder: 'Goals for 6-12 weeks (e.g., Return to work without restrictions, Independent with HEP)'
      }
    },
    plan: {
      type: 'composite',
      interventions: {
        type: 'list',
        items: [],
        placeholder: 'Back-specific interventions...'
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
    }
  });

  /**
   * AI Prompt for back evaluation SOAP generation
   */
  const createPrompt = (transcript) => `
You are a physical therapist documenting a back/spine evaluation. Generate a professional SOAP note from this session transcript.

TRANSCRIPT:
${transcript}

INSTRUCTIONS:
1. Extract relevant information for each SOAP section
2. Use professional PT terminology specific to spine conditions
3. Focus on lumbar spine pathology, movement patterns, and postural dysfunction
4. Return ONLY a JSON object matching this exact structure:

{
  "subjective": {
    "content": "Patient narrative including pain description, radiation patterns, aggravating/relieving factors, functional limitations, work-related factors. Use professional medical language."
  },
  "objective": {
    "categories": [
      {
        "name": "Observation",
        "rows": [
          {"test": "Posture Assessment", "result": "Forward head posture", "notes": "Increased thoracic kyphosis noted"},
          {"test": "Spinal Alignment", "result": "Lateral shift right", "notes": "L3-L4 level"},
          {"test": "Gait Pattern", "result": "Antalgic", "notes": "Decreased stride length on right"}
        ]
      },
      {
        "name": "Palpation",
        "rows": [
          {"test": "Paraspinal Tenderness", "result": "Positive", "notes": "L4-L5 bilateral tenderness"},
          {"test": "SI Joint", "result": "Tender right", "notes": "PSIS region"},
          {"test": "Trigger Points", "result": "Positive", "notes": "QL and piriformis bilaterally"}
        ]
      },
      {
        "name": "Range of Motion",
        "rows": [
          {"test": "Lumbar Flexion", "result": "Fingertips to mid-shin", "notes": "Limited by pain at L4-L5"},
          {"test": "Lumbar Extension", "result": "15°", "notes": "WNL, no pain"},
          {"test": "Lateral Flexion", "result": "Limited 50%", "notes": "Right more limited than left"},
          {"test": "Rotation", "result": "30° bilateral", "notes": "Pain at end range"}
        ]
      },
      {
        "name": "Strength Testing",
        "rows": [
          {"test": "Core Strength", "result": "3/5", "notes": "Unable to hold plank >10 seconds"},
          {"test": "Hip Flexors", "result": "4/5", "notes": "Bilateral weakness noted"},
          {"test": "Gluteals", "result": "3+/5", "notes": "Significant weakness, poor activation"}
        ]
      },
      {
        "name": "Special Tests",
        "rows": [
          {"test": "SLR Test", "result": "Positive at 45°", "notes": "Right leg, reproduces leg pain"},
          {"test": "FABER Test", "result": "Negative", "notes": "No hip pathology indicated"},
          {"test": "Centralization/Peripheralization", "result": "Centralizes with extension", "notes": "McKenzie positive"}
        ]
      },
      {
        "name": "Functional Testing",
        "rows": [
          {"test": "Sit-to-Stand", "result": "Painful", "notes": "Requires arm support"},
          {"test": "Forward Bending", "result": "Limited", "notes": "Cannot touch toes, pain at L4-L5"},
          {"test": "Lifting Mechanics", "result": "Poor", "notes": "Excessive lumbar flexion, no hip hinge"}
        ]
      }
    ]
  },
  "assessment": {
    "clinical_impression": "Clinical reasoning, likely diagnosis (e.g., mechanical low back pain, disc herniation, facet syndrome), movement dysfunction patterns, contributing factors, prognosis.",
    "short_term_goals": [
      "Specific, measurable goal for 2-4 weeks (e.g., Reduce pain from 7/10 to 4/10)",
      "Another short-term goal (e.g., Improve forward bending to touch knees)",
      "2-4 goals total focused on immediate improvements"
    ],
    "long_term_goals": [
      "Specific, measurable goal for 6-12 weeks (e.g., Return to lifting 50 lbs without pain)",
      "Another long-term goal (e.g., Complete 8-hour workday without increased symptoms)",
      "2-3 goals total focused on functional outcomes"
    ]
  },
  "plan": {
    "interventions": [
      "Lumbar mobilizations (PA glides L3-L5)",
      "Core stabilization (dead bug, bird dog, planks)",
      "Hip flexor stretching (Thomas stretch)",
      "Hamstring stretching",
      "McKenzie extension exercises",
      "Manual therapy to paraspinals and QL",
      "3-5 back-specific interventions"
    ],
    "progressions": [
      "Progress from supine to standing exercises",
      "Increase plank hold time (20s to 45s to 60s)",
      "Add resistance to core exercises",
      "Progress from static to dynamic movements"
    ],
    "regressions": [
      "Reduce ROM if centralization reverses",
      "Return to supine exercises if standing increases symptoms",
      "Decrease hold times or repetitions"
    ],
    "frequency_duration": "Treatment frequency (e.g., 2x/week for 4-6 weeks), expected timeline for return to work activities.",
    "patient_education": "Home exercise program (cat-cow, pelvic tilts), proper lifting mechanics, ergonomic workstation setup, posture awareness."
  }
}

CRITICAL INSTRUCTIONS - FOLLOW EXACTLY:

OBJECTIVE SECTION REQUIREMENTS:
1. **MANDATORY**: Every row MUST have ALL THREE fields filled:
   - "test": The test name (e.g., "Lumbar Flexion")
   - "result": ACTUAL finding (e.g., "Limited 50%", "Positive", "3/5", "15°")
   - "notes": Clinical context (e.g., "Pain at L4-L5", "Bilateral weakness")

2. **NEVER** use these INVALID placeholders:
   ❌ "Result" ❌ "Notes" ❌ "Additional notes" ❌ "Test Name"
   
3. **VALID result values** (use these formats):
   ✅ Positive/Negative/Not Tested/WNL/Limited/Painful
   ✅ Specific degrees: "120°", "-5°", "Limited 50%"
   ✅ MMT grades: "3/5", "4/5", "5/5", "3+/5"
   ✅ Distances: "Fingertips to mid-shin", "Cannot touch toes"
   ✅ Descriptive: "Antalgic", "Forward head posture", "Tender right"

4. **If test not mentioned in transcript**: Use "Not assessed" as result

5. **Match the exact category structure** shown in the example above with 6 categories

6. **Extract from transcript**: Look for any mention of observation, palpation, ROM, strength, special tests, or functional activities

7. **Return ONLY valid JSON** - no text before or after the JSON object
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
        templateType: 'back',
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Back evaluation SOAP generation failed:', error);
      
      return {
        success: false,
        error: error.message,
        data: getSchema(),
        templateType: 'back'
      };
    } finally {
      setIsGenerating(false);
    }
  };

  const getEmptySOAP = () => ({
    success: true,
    data: getSchema(),
    templateType: 'back'
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
    templateType: 'back',
    metadata: {
      name: 'Back Evaluation',
      bodyRegion: 'back',
      sessionType: 'evaluation',
      description: 'Spinal assessment including posture and movement analysis'
    }
  };
};
