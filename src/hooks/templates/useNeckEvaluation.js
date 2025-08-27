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
      rows: [
        { test: 'Spurling\'s Test', result: '', notes: '' },
        { test: 'Distraction Test', result: '', notes: '' },
        { test: 'Upper Limb Tension Test', result: '', notes: '' },
        { test: 'Vertebral Artery Test', result: '', notes: '' },
        { test: 'Deep Neck Flexor Test', result: '', notes: '' },
        { test: 'Cervical Flexion ROM', result: '', notes: '' },
        { test: 'Cervical Extension ROM', result: '', notes: '' },
        { test: 'Lateral Flexion ROM', result: '', notes: '' },
        { test: 'Rotation ROM', result: '', notes: '' },
        { test: 'Upper Trap Strength', result: '', notes: '' },
        { test: 'Deep Neck Flexor Strength', result: '', notes: '' },
        { test: 'Posture Assessment', result: '', notes: '' },
        { test: 'Neurological Screen', result: '', notes: '' }
      ],
      allowAddRows: true,
      commonResults: ['Positive', 'Negative', 'Not Tested', 'WNL', 'Limited', 'Painful', 'Forward Head', 'Normal']
    },
    assessment: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Clinical impression, cervical dysfunction, postural syndrome, neurological findings, prognosis...'
    },
    plan: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Treatment plan, postural exercises, manual therapy, ergonomic modifications, patient education...'
    }
  });

  /**
   * AI Prompt for neck evaluation SOAP generation
   */
  const createPrompt = (transcript) => `
You are a physical therapist documenting a cervical spine/neck evaluation. Generate a professional SOAP note from this session transcript.

TRANSCRIPT:
${transcript}

INSTRUCTIONS:
1. Extract relevant information for each SOAP section
2. Use professional PT terminology specific to cervical spine conditions
3. Focus on cervical mobility, postural dysfunction, and neurological screening
4. Return ONLY a JSON object matching this exact structure:

{
  "subjective": {
    "content": "Patient narrative including pain description, headache patterns, neurological symptoms, mechanism of injury, functional limitations, work ergonomics. Use professional medical language."
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
    "content": "Clinical reasoning, likely diagnosis (cervical dysfunction, postural syndrome, etc.), neurological findings, contributing factors, prognosis."
  },
  "plan": {
    "content": "Treatment plan including manual therapy, postural correction exercises, ergonomic modifications, patient education, and follow-up recommendations."
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
    templateType: 'neck',
    metadata: {
      name: 'Neck Evaluation',
      bodyRegion: 'neck',
      sessionType: 'evaluation',
      description: 'Cervical spine mobility and neurological screening'
    }
  };
};
