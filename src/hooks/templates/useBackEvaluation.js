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
      rows: [
        { test: 'Straight Leg Raise', result: '', notes: '' },
        { test: 'Slump Test', result: '', notes: '' },
        { test: 'Prone Instability Test', result: '', notes: '' },
        { test: 'Posterior Shear Test', result: '', notes: '' },
        { test: 'FABER Test', result: '', notes: '' },
        { test: 'Thomas Test', result: '', notes: '' },
        { test: 'Lumbar Flexion ROM', result: '', notes: '' },
        { test: 'Lumbar Extension ROM', result: '', notes: '' },
        { test: 'Lateral Flexion ROM', result: '', notes: '' },
        { test: 'Rotation ROM', result: '', notes: '' },
        { test: 'Core Strength', result: '', notes: '' },
        { test: 'Hip Flexor Flexibility', result: '', notes: '' },
        { test: 'Hamstring Flexibility', result: '', notes: '' },
        { test: 'Posture Assessment', result: '', notes: '' }
      ],
      allowAddRows: true,
      commonResults: ['Positive', 'Negative', 'Not Tested', 'WNL', 'Limited', 'Painful', 'Poor', 'Fair', 'Good']
    },
    assessment: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Clinical impression, mechanical vs. non-mechanical pain, movement dysfunction, prognosis...'
    },
    plan: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Treatment plan, core strengthening, manual therapy, ergonomic education...'
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
    "rows": [
      {"test": "Test Name", "result": "Result", "notes": "Additional notes"},
      // Include all relevant tests mentioned in transcript
      // Use standard results: Positive/Negative/Not Tested/WNL/Limited/Painful
      // Include ROM measurements, neurological tests, postural assessment
    ]
  },
  "assessment": {
    "content": "Clinical reasoning, likely diagnosis (mechanical low back pain, disc pathology, etc.), movement dysfunction patterns, contributing factors, prognosis."
  },
  "plan": {
    "content": "Treatment plan including manual therapy, core stabilization exercises, movement re-education, ergonomic training, and follow-up recommendations."
  }
}

IMPORTANT: 
- Only include tests/measurements that were actually mentioned in the transcript
- Use "Not assessed" if information is missing
- Focus on spine-specific conditions and movement patterns
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
    templateType: 'back',
    metadata: {
      name: 'Back Evaluation',
      bodyRegion: 'back',
      sessionType: 'evaluation',
      description: 'Spinal assessment including posture and movement analysis'
    }
  };
};
