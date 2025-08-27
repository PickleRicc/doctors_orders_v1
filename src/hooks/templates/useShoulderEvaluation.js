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
      rows: [
        { test: 'Hawkins-Kennedy Test', result: '', notes: '' },
        { test: 'Neer\'s Test', result: '', notes: '' },
        { test: 'Empty Can Test', result: '', notes: '' },
        { test: 'Full Can Test', result: '', notes: '' },
        { test: 'External Rotation Test', result: '', notes: '' },
        { test: 'Lift-off Test', result: '', notes: '' },
        { test: 'Apprehension Test', result: '', notes: '' },
        { test: 'Relocation Test', result: '', notes: '' },
        { test: 'Shoulder Flexion ROM', result: '', notes: '' },
        { test: 'Shoulder Abduction ROM', result: '', notes: '' },
        { test: 'External Rotation ROM', result: '', notes: '' },
        { test: 'Internal Rotation ROM', result: '', notes: '' },
        { test: 'Deltoid Strength', result: '', notes: '' },
        { test: 'Rotator Cuff Strength', result: '', notes: '' }
      ],
      allowAddRows: true,
      commonResults: ['Positive', 'Negative', 'Not Tested', 'WNL', 'Limited', 'Painful', '3/5', '4/5', '5/5']
    },
    assessment: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Clinical impression, impingement syndrome, rotator cuff pathology, prognosis...'
    },
    plan: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Treatment plan, strengthening exercises, manual therapy, patient education...'
    }
  });

  /**
   * AI Prompt for shoulder evaluation SOAP generation
   */
  const createPrompt = (transcript) => `
You are a physical therapist documenting a shoulder evaluation. Generate a professional SOAP note from this session transcript.

TRANSCRIPT:
${transcript}

INSTRUCTIONS:
1. Extract relevant information for each SOAP section
2. Use professional PT terminology specific to shoulder conditions
3. Focus on rotator cuff, impingement, and shoulder stability assessments
4. Return ONLY a JSON object matching this exact structure:

{
  "subjective": {
    "content": "Patient narrative including pain description, mechanism of injury, functional limitations, overhead activities, sleep disturbance. Use professional medical language."
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
    "content": "Clinical reasoning, likely diagnosis (impingement syndrome, rotator cuff tear, etc.), contributing factors, prognosis. Be specific about shoulder pathology."
  },
  "plan": {
    "content": "Treatment plan including manual therapy, therapeutic exercises, activity modifications, patient education, and follow-up recommendations."
  }
}

IMPORTANT: 
- Only include tests/measurements that were actually mentioned in the transcript
- Use "Not assessed" if information is missing
- Focus on shoulder-specific conditions and terminology
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
    templateType: 'shoulder',
    metadata: {
      name: 'Shoulder Evaluation',
      bodyRegion: 'shoulder',
      sessionType: 'evaluation',
      description: 'Shoulder impingement, rotator cuff, and mobility assessment'
    }
  };
};
