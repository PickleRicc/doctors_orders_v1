/**
 * Ankle/Foot Evaluation Template Hook
 * Specialized AI prompts and JSON schema for ankle and foot assessments
 * Focuses on lower extremity assessment including gait analysis
 */

import { useState } from 'react';

export const useAnkleFootEvaluation = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * JSON Schema for ankle/foot evaluation SOAP note structure
   */
  const getSchema = () => ({
    subjective: {
      type: 'wysiwyg',
      placeholder: 'Patient history, pain description, mechanism of injury, functional limitations, gait issues...'
    },
    objective: {
      type: 'categorized_table',
      categories: [
        {
          name: 'Observation',
          rows: [
            { test: 'Swelling/Edema', result: '', notes: '' },
            { test: 'Alignment (varus/valgus)', result: '', notes: '' },
            { test: 'Arch Height', result: '', notes: '' },
            { test: 'Gait Pattern', result: '', notes: '' }
          ]
        },
        {
          name: 'Palpation',
          rows: [
            { test: 'Ankle Joint', result: '', notes: '' },
            { test: 'Achilles Tendon', result: '', notes: '' },
            { test: 'Plantar Fascia', result: '', notes: '' }
          ]
        },
        {
          name: 'Range of Motion',
          rows: [
            { test: 'Dorsiflexion', result: '', notes: '' },
            { test: 'Plantarflexion', result: '', notes: '' },
            { test: 'Inversion', result: '', notes: '' },
            { test: 'Eversion', result: '', notes: '' }
          ]
        },
        {
          name: 'Strength Testing',
          rows: [
            { test: 'Calf Strength (Plantarflexors)', result: '', notes: '' },
            { test: 'Dorsiflexors', result: '', notes: '' },
            { test: 'Invertors', result: '', notes: '' },
            { test: 'Evertors', result: '', notes: '' }
          ]
        },
        {
          name: 'Special Tests',
          rows: [
            { test: 'Anterior Drawer Test', result: '', notes: '' },
            { test: 'Talar Tilt Test', result: '', notes: '' },
            { test: 'Thompson Test', result: '', notes: '' }
          ]
        },
        {
          name: 'Functional Testing',
          rows: [
            { test: 'Single Leg Balance', result: '', notes: '' },
            { test: 'Heel Raises', result: '', notes: '' },
            { test: 'Hop Test', result: '', notes: '' },
            { test: 'Weight Bearing Status', result: '', notes: '' }
          ]
        }
      ],
      allowAddRows: true,
      commonResults: ['Positive', 'Negative', 'Not Tested', 'WNL', 'Limited', 'Painful', 'Antalgic', 'Normal']
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
        placeholder: 'Goals for 2-4 weeks (e.g., Reduce swelling, Walk without limp)'
      },
      long_term_goals: {
        type: 'list',
        items: [],
        placeholder: 'Goals for 6-12 weeks (e.g., Return to running, Full weight bearing activities)'
      }
    },
    plan: {
      type: 'composite',
      interventions: {
        type: 'list',
        items: [],
        placeholder: 'Ankle/foot-specific interventions...'
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
   * AI Prompt for ankle/foot evaluation SOAP generation
   */
  const createPrompt = (transcript) => `
You are a physical therapist documenting an ankle/foot evaluation. Generate a professional SOAP note from this session transcript.

TRANSCRIPT:
${transcript}

INSTRUCTIONS:
1. Extract relevant information for each SOAP section
2. Use professional PT terminology specific to ankle/foot conditions
3. Focus on ankle stability, foot mechanics, and gait analysis
4. Return ONLY a JSON object matching this exact structure:

{
  "subjective": {
    "content": "Patient narrative including pain description, mechanism of injury, functional limitations, gait issues, weight-bearing status. Use professional medical language."
  },
  "objective": {
    "categories": [
      {
        "name": "Observation",
        "rows": [
          {"test": "Swelling/Edema", "result": "Moderate", "notes": "Lateral malleolus region"},
          {"test": "Alignment (varus/valgus)", "result": "Valgus 5°", "notes": "Hindfoot alignment"},
          {"test": "Arch Height", "result": "Pes planus", "notes": "Bilateral flat feet"},
          {"test": "Gait Pattern", "result": "Antalgic", "notes": "Decreased stance phase right"}
        ]
      },
      {
        "name": "Palpation",
        "rows": [
          {"test": "Ankle Joint", "result": "Tender", "notes": "Anterior talofibular ligament"},
          {"test": "Achilles Tendon", "result": "Tender to palpation", "notes": "Mid-portion thickening noted"},
          {"test": "Plantar Fascia", "result": "Positive", "notes": "Medial calcaneal insertion point"}
        ]
      },
      {
        "name": "Range of Motion",
        "rows": [
          {"test": "Dorsiflexion", "result": "5°", "notes": "Limited, normal 20°"},
          {"test": "Plantarflexion", "result": "40°", "notes": "WNL, pain-free"},
          {"test": "Inversion", "result": "Limited 50%", "notes": "Pain at end range"},
          {"test": "Eversion", "result": "WNL", "notes": "Full ROM, no pain"}
        ]
      },
      {
        "name": "Strength Testing",
        "rows": [
          {"test": "Calf Strength (Plantarflexors)", "result": "4/5", "notes": "Weakness with heel raises"},
          {"test": "Dorsiflexors", "result": "5/5", "notes": "Strong and pain-free"},
          {"test": "Invertors", "result": "4/5", "notes": "Mild weakness noted"},
          {"test": "Evertors", "result": "3/5", "notes": "Significant weakness"}
        ]
      },
      {
        "name": "Special Tests",
        "rows": [
          {"test": "Anterior Drawer Test", "result": "Positive", "notes": "Grade 2 laxity, ATFL injury"},
          {"test": "Talar Tilt Test", "result": "Positive", "notes": "Excessive inversion"},
          {"test": "Thompson Test", "result": "Negative", "notes": "Achilles intact"}
        ]
      },
      {
        "name": "Functional Testing",
        "rows": [
          {"test": "Single Leg Balance", "result": "10 seconds", "notes": "Decreased from 30s baseline"},
          {"test": "Heel Raises", "result": "Limited", "notes": "5 reps only, pain at end range"},
          {"test": "Hop Test", "result": "Unable", "notes": "Too painful to attempt"},
          {"test": "Weight Bearing Status", "result": "Partial", "notes": "50% weight bearing tolerated"}
        ]
      }
    ]
  },
  "assessment": {
    "clinical_impression": "Clinical reasoning, likely diagnosis (e.g., lateral ankle sprain, plantar fasciitis, Achilles tendinopathy), gait dysfunction, contributing factors, prognosis.",
    "short_term_goals": [
      "Specific, measurable goal for 2-4 weeks (e.g., Reduce swelling to minimal)",
      "Another short-term goal (e.g., Walk 10 minutes without limping)",
      "2-4 goals total focused on immediate improvements"
    ],
    "long_term_goals": [
      "Specific, measurable goal for 6-12 weeks (e.g., Return to running 3 miles)",
      "Another long-term goal (e.g., Single leg balance 30 seconds)",
      "2-3 goals total focused on functional outcomes"
    ]
  },
  "plan": {
    "interventions": [
      "Ankle joint mobilizations (talocrural distraction)",
      "Calf strengthening (heel raises, eccentric lowering)",
      "Plantar fascia stretching and massage",
      "Balance exercises (single leg stance, BOSU)",
      "Gait training with proper heel-toe pattern",
      "Manual therapy to gastrocnemius/soleus",
      "3-5 ankle/foot-specific interventions"
    ],
    "progressions": [
      "Progress from bilateral to unilateral heel raises",
      "Increase single leg balance time (15s to 30s to 60s)",
      "Add unstable surfaces (foam pad, wobble board)",
      "Progress from walking to light jogging"
    ],
    "regressions": [
      "Reduce weight bearing if swelling increases",
      "Return to bilateral stance exercises",
      "Decrease balance challenge or hold times"
    ],
    "frequency_duration": "Treatment frequency (e.g., 2x/week for 4 weeks), expected timeline for return to full weight bearing activities.",
    "patient_education": "Home exercise program (alphabet exercises, towel scrunches), proper footwear, ice/compression protocol, activity pacing."
  }
}

IMPORTANT: 
- Only include tests/measurements that were actually mentioned in the transcript
- Use "Not assessed" if information is missing
- Focus on ankle/foot-specific conditions and gait patterns
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
        templateType: 'ankle_foot',
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Ankle/foot evaluation SOAP generation failed:', error);
      
      return {
        success: false,
        error: error.message,
        data: getSchema(),
        templateType: 'ankle_foot'
      };
    } finally {
      setIsGenerating(false);
    }
  };

  const getEmptySOAP = () => ({
    success: true,
    data: getSchema(),
    templateType: 'ankle_foot'
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
    templateType: 'ankle_foot',
    metadata: {
      name: 'Ankle/Foot Evaluation',
      bodyRegion: 'ankle_foot',
      sessionType: 'evaluation',
      description: 'Lower extremity assessment including gait analysis'
    }
  };
};
