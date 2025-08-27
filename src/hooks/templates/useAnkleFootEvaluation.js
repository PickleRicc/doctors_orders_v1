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
      content: '',
      placeholder: 'Patient history, pain description, mechanism of injury, functional limitations, gait issues...'
    },
    objective: {
      type: 'table',
      headers: ['Test/Measurement', 'Result', 'Notes'],
      rows: [
        { test: 'Anterior Drawer Test', result: '', notes: '' },
        { test: 'Talar Tilt Test', result: '', notes: '' },
        { test: 'Thompson Test', result: '', notes: '' },
        { test: 'Kleiger Test', result: '', notes: '' },
        { test: 'Windlass Test', result: '', notes: '' },
        { test: 'Ankle Dorsiflexion ROM', result: '', notes: '' },
        { test: 'Ankle Plantarflexion ROM', result: '', notes: '' },
        { test: 'Inversion ROM', result: '', notes: '' },
        { test: 'Eversion ROM', result: '', notes: '' },
        { test: 'Calf Strength', result: '', notes: '' },
        { test: 'Dorsiflexor Strength', result: '', notes: '' },
        { test: 'Gait Assessment', result: '', notes: '' },
        { test: 'Balance Assessment', result: '', notes: '' },
        { test: 'Weight Bearing Status', result: '', notes: '' }
      ],
      allowAddRows: true,
      commonResults: ['Positive', 'Negative', 'Not Tested', 'WNL', 'Limited', 'Painful', 'Antalgic', 'Normal']
    },
    assessment: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Clinical impression, ankle sprain, plantar fasciitis, gait dysfunction, prognosis...'
    },
    plan: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Treatment plan, strengthening exercises, gait training, balance work, patient education...'
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
    "rows": [
      {"test": "Test Name", "result": "Result", "notes": "Additional notes"},
      // Include all relevant tests mentioned in transcript
      // Use standard results: Positive/Negative/Not Tested/WNL/Limited/Painful
      // Include ROM measurements, strength grades, special tests, gait analysis
    ]
  },
  "assessment": {
    "content": "Clinical reasoning, likely diagnosis (ankle sprain, plantar fasciitis, etc.), gait dysfunction, contributing factors, prognosis."
  },
  "plan": {
    "content": "Treatment plan including strengthening exercises, gait training, balance work, manual therapy, and follow-up recommendations."
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
          rows: soapData.objective?.rows || schema.objective.rows
        },
        assessment: {
          ...schema.assessment,
          content: soapData.assessment?.content || ''
        },
        plan: {
          ...schema.plan,
          content: soapData.plan?.content || ''
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

    if (soapData.objective && !Array.isArray(soapData.objective.rows)) {
      errors.push('Objective section must contain rows array');
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
