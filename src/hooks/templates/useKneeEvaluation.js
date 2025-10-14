/**
 * Knee Evaluation Template Hook
 * Specialized AI prompts and JSON schema for knee assessments
 * Replaces database-stored templates with code-based approach
 */

import { useState } from 'react';

export const useKneeEvaluation = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * JSON Schema for knee evaluation SOAP note structure
   * Defines the exact structure the AI should return
   */
  const getSchema = () => ({
    subjective: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Patient history, pain description, functional limitations...'
    },
    objective: {
      type: 'table',
      headers: ['Category', 'Test/Measurement', 'Result', 'Notes'],
      categories: [
        {
          name: 'Observation',
          rows: [
            { test: 'Knee Effusion/Swelling', result: '', notes: '' },
            { test: 'Gait Pattern', result: '', notes: '' }
          ]
        },
        {
          name: 'Palpation',
          rows: [
            { test: 'Joint Line Tenderness', result: '', notes: '' },
            { test: 'Patellar Tendon', result: '', notes: '' }
          ]
        },
        {
          name: 'Range of Motion',
          rows: [
            { test: 'Knee Flexion', result: '', notes: '' },
            { test: 'Knee Extension', result: '', notes: '' }
          ]
        },
        {
          name: 'Strength Testing',
          rows: [
            { test: 'Quadriceps Strength', result: '', notes: '' },
            { test: 'Hamstring Strength', result: '', notes: '' }
          ]
        },
        {
          name: 'Special Tests',
          rows: [
            { test: 'McMurray\'s Test', result: '', notes: '' },
            { test: 'Lachman\'s Test', result: '', notes: '' },
            { test: 'Valgus/Varus Stress', result: '', notes: '' },
            { test: 'Patellar Mobility', result: '', notes: '' }
          ]
        },
        {
          name: 'Functional Testing',
          rows: [
            { test: 'Single Leg Stance', result: '', notes: '' },
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
      short_term_goals: {
        type: 'list',
        items: [],
        placeholder: 'Goals for 2-4 weeks (e.g., Reduce pain to 3/10, Improve knee flexion to 120°)'
      },
      long_term_goals: {
        type: 'list',
        items: [],
        placeholder: 'Goals for 6-12 weeks (e.g., Return to running, Independent with HEP)'
      }
    },
    plan: {
      type: 'composite',
      interventions: {
        type: 'list',
        items: [],
        placeholder: 'Manual therapy, therapeutic exercises, modalities...'
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
   * AI Prompt for knee evaluation SOAP generation
   * Specialized for knee-specific terminology and assessments
   */
  const createPrompt = (transcript) => `
You are a physical therapist documenting a knee evaluation. Generate a professional SOAP note from this session transcript.

TRANSCRIPT:
${transcript}

INSTRUCTIONS:
1. Extract relevant information for each SOAP section
2. Use professional PT terminology
3. Focus on knee-specific assessments and findings
4. Return ONLY a JSON object matching this exact structure:
{
  "subjective": {
    "content": "Patient narrative including pain description, functional limitations, mechanism of injury, and relevant history. Use professional medical language."
  },
  "objective": {
    "categories": [
      {
        "name": "Observation",
        "rows": [
          {"test": "Knee Effusion/Swelling", "result": "Moderate", "notes": "Joint line swelling present"},
          {"test": "Gait Pattern", "result": "Antalgic", "notes": "Decreased stance time on affected leg"}
        ]
      },
      {
        "name": "Palpation",
        "rows": [
          {"test": "Joint Line Tenderness", "result": "Positive", "notes": "Medial joint line tender to palpation"},
          {"test": "Patellar Tendon", "result": "WNL", "notes": "No tenderness noted"}
        ]
      },
      {
        "name": "Range of Motion",
        "rows": [
          {"test": "Knee Flexion", "result": "120°", "notes": "Limited by pain at end range"},
          {"test": "Knee Extension", "result": "-5°", "notes": "Extension lag present"}
        ]
      },
      {
        "name": "Strength Testing",
        "rows": [
          {"test": "Quadriceps Strength", "result": "4/5", "notes": "Weakness noted with resistance"},
          {"test": "Hamstring Strength", "result": "5/5", "notes": "Strong and pain-free"}
        ]
      },
      {
        "name": "Special Tests",
        "rows": [
          {"test": "McMurray's Test", "result": "Positive", "notes": "Medial compartment clicking"},
          {"test": "Lachman's Test", "result": "Negative", "notes": "Firm endpoint, no laxity"},
          {"test": "Valgus/Varus Stress", "result": "Negative", "notes": "Stable in both planes"},
          {"test": "Patellar Mobility", "result": "Limited", "notes": "Decreased superior glide"}
        ]
      },
      {
        "name": "Functional Testing",
        "rows": [
          {"test": "Single Leg Stance", "result": "15 seconds", "notes": "Decreased from 30s baseline"},
          {"test": "Squat Assessment", "result": "Limited", "notes": "Pain at 90° knee flexion"}
        ]
      }
    ]
  },
  "assessment": {
    "clinical_impression": "Clinical reasoning, likely diagnosis (e.g., meniscus tear, ACL sprain, patellofemoral syndrome), contributing factors, prognosis. Be specific about knee pathology.",
    "short_term_goals": [
      "Specific, measurable goal for 2-4 weeks (e.g., Reduce pain from 6/10 to 3/10)",
      "Another short-term goal (e.g., Increase knee flexion from 95° to 120°)",
      "2-4 goals total focused on immediate improvements"
    ],
    "long_term_goals": [
      "Specific, measurable goal for 6-12 weeks (e.g., Return to basketball without pain)",
      "Another long-term goal (e.g., Demonstrate proper squat mechanics)",
      "2-3 goals total focused on functional outcomes"
    ]
  },
  "plan": {
    "interventions": [
      "Patellar mobilizations (superior/inferior glides)",
      "Quad strengthening (straight leg raises, short arc quads)",
      "IT band foam rolling and stretching",
      "Hamstring strengthening (prone curls)",
      "Manual therapy to patellar tendon",
      "Balance training on affected leg",
      "3-5 knee-specific interventions"
    ],
    "progressions": [
      "Increase resistance from 5 lbs to 10 lbs to 15 lbs",
      "Progress from double leg to single leg exercises",
      "Advance from partial ROM to full ROM",
      "Add functional movements (squats, lunges, step-ups)"
    ],
    "regressions": [
      "Reduce ROM to pain-free range if pain increases",
      "Return to isometric exercises if swelling worsens",
      "Decrease weight bearing or resistance"
    ],
    "frequency_duration": "Treatment frequency (e.g., 2x/week for 4 weeks), expected timeline for reassessment.",
    "patient_education": "Home exercise program details, activity modifications, precautions, when to call clinic."
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
8. Return valid JSON only, no additional text before or after
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
      
      // Call AI service with specialized knee evaluation prompt
      const response = await aiService.generateCompletion(prompt, {
        temperature: 0.3, // Lower temperature for more consistent medical documentation
        max_tokens: 2000
      });

      // Parse and validate the AI response
      let soapData;
      try {
        soapData = JSON.parse(response);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        throw new Error('AI returned invalid JSON response');
      }

      console.log('🔍 AI Response received:', {
        hasAssessment: !!soapData.assessment,
        assessmentKeys: soapData.assessment ? Object.keys(soapData.assessment) : [],
        assessmentPreview: JSON.stringify(soapData.assessment).substring(0, 200)
      });

      // Merge with schema structure to ensure all required fields exist
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

      console.log('✅ Structured SOAP created:', {
        hasAssessmentGoals: !!structuredSOAP.assessment.short_term_goals,
        shortTermCount: structuredSOAP.assessment.short_term_goals?.items?.length || 0,
        longTermCount: structuredSOAP.assessment.long_term_goals?.items?.length || 0
      });

      // Calculate confidence scores (simplified for now)
      const confidence = {
        subjective: 0.85,
        objective: 0.90,
        assessment: 0.88,
        plan: 0.82,
        overall: 0.86
      };

      return {
        success: true,
        data: structuredSOAP,
        confidence,
        templateType: 'knee'
      };

    } catch (error) {
      console.error('Knee evaluation SOAP generation failed:', error);
      
      // Return empty schema structure on error
      return {
        success: false,
        error: error.message,
        soapData: getSchema(),
        confidence: {
          subjective: 0,
          objective: 0,
          assessment: 0,
          plan: 0,
          overall: 0
        },
        templateType: 'knee'
      };
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Get empty schema for new sessions
   */
  const getEmptySOAP = () => ({
    success: true,
    data: getSchema(),
    templateType: 'knee'
  });

  /**
   * Validate SOAP data structure
   */
  const validateSOAP = (soapData) => {
    const schema = getSchema();
    const errors = [];

    // Check required sections exist
    ['subjective', 'objective', 'assessment', 'plan'].forEach(section => {
      if (!soapData[section]) {
        errors.push(`Missing ${section} section`);
      }
    });

    // Validate objective table structure
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
    templateType: 'knee',
    metadata: {
      name: 'Knee Evaluation',
      bodyRegion: 'knee',
      sessionType: 'evaluation',
      description: 'Comprehensive knee assessment including ligament tests and ROM'
    }
  };
};
