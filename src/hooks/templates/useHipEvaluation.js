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
      rows: [
        { test: 'FABER Test', result: '', notes: '' },
        { test: 'FADIR Test', result: '', notes: '' },
        { test: 'Thomas Test', result: '', notes: '' },
        { test: 'Ober Test', result: '', notes: '' },
        { test: 'Trendelenburg Test', result: '', notes: '' },
        { test: 'Craig\'s Test', result: '', notes: '' },
        { test: 'Hip Flexion ROM', result: '', notes: '' },
        { test: 'Hip Extension ROM', result: '', notes: '' },
        { test: 'Hip Abduction ROM', result: '', notes: '' },
        { test: 'Hip Adduction ROM', result: '', notes: '' },
        { test: 'Internal Rotation ROM', result: '', notes: '' },
        { test: 'External Rotation ROM', result: '', notes: '' },
        { test: 'Gluteus Medius Strength', result: '', notes: '' },
        { test: 'Hip Flexor Strength', result: '', notes: '' }
      ],
      allowAddRows: true,
      commonResults: ['Positive', 'Negative', 'Not Tested', 'WNL', 'Limited', 'Painful', '3/5', '4/5', '5/5']
    },
    assessment: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Clinical impression, hip impingement, muscle imbalances, functional deficits, prognosis...'
    },
    plan: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Treatment plan, strengthening exercises, mobility work, functional training, patient education...'
    }
  });

  /**
   * AI Prompt for hip evaluation SOAP generation
   */
  const createPrompt = (transcript) => `
You are a physical therapist documenting a hip evaluation. Generate a professional SOAP note from this session transcript.

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
    "rows": [
      {"test": "Test Name", "result": "Result", "notes": "Additional notes"},
      // Include all relevant tests mentioned in transcript
      // Use standard results: Positive/Negative/Not Tested/WNL/Limited/Painful
      // Include ROM measurements, strength grades, special tests
    ]
  },
  "assessment": {
    "content": "Clinical reasoning, likely diagnosis (hip impingement, muscle imbalances, etc.), functional deficits, contributing factors, prognosis."
  },
  "plan": {
    "content": "Treatment plan including strengthening exercises, mobility work, functional training, activity modifications, and follow-up recommendations."
  }
}

IMPORTANT: 
- Only include tests/measurements that were actually mentioned in the transcript
- Use "Not assessed" if information is missing
- Focus on hip-specific conditions and functional movement patterns
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
    templateType: 'hip',
    metadata: {
      name: 'Hip Evaluation',
      bodyRegion: 'hip',
      sessionType: 'evaluation',
      description: 'Hip joint mobility, strength, and functional assessment'
    }
  };
};
