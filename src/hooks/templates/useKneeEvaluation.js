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
      headers: ['Test/Measurement', 'Result', 'Notes'],
      rows: [
        { test: 'Anterior Drawer Test', result: '', notes: '' },
        { test: 'Posterior Drawer Test', result: '', notes: '' },
        { test: 'Lachman\'s Test', result: '', notes: '' },
        { test: 'Valgus Stress Test', result: '', notes: '' },
        { test: 'Varus Stress Test', result: '', notes: '' },
        { test: 'McMurray\'s Test', result: '', notes: '' },
        { test: 'Patella Apprehension Test', result: '', notes: '' },
        { test: 'Patella Grind Test', result: '', notes: '' },
        { test: 'Knee Flexion ROM', result: '', notes: '' },
        { test: 'Knee Extension ROM', result: '', notes: '' },
        { test: 'Quadriceps Strength', result: '', notes: '' },
        { test: 'Hamstring Strength', result: '', notes: '' }
      ],
      allowAddRows: true,
      commonResults: ['Positive', 'Negative', 'Not Tested', 'Limited', 'WNL', '1+', '2+', '3+']
    },
    assessment: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Clinical impression, diagnosis, prognosis...'
    },
    plan: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Treatment plan, goals, frequency, patient education...'
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
    "rows": [
      {"test": "Test Name", "result": "Result", "notes": "Additional notes"},
      // Include all relevant tests mentioned in transcript
      // Use standard results: Positive/Negative/Not Tested/WNL/Limited
      // Include ROM measurements, strength grades, special tests
    ]
  },
  "assessment": {
    "content": "Clinical reasoning, likely diagnosis, contributing factors, prognosis. Be specific about knee pathology."
  },
  "plan": {
    "content": "Treatment plan including interventions, goals, frequency, patient education, and follow-up recommendations."
  }
}

IMPORTANT: 
- Only include tests/measurements that were actually mentioned in the transcript
- Use "Not assessed" if information is missing
- Be concise but thorough
- Use proper medical abbreviations (ROM, WNL, etc.)
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

      // Merge with schema structure to ensure all required fields exist
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
        soapData: structuredSOAP,
        confidence: confidence,
        templateType: 'knee',
        generatedAt: new Date().toISOString()
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
    templateType: 'knee',
    metadata: {
      name: 'Knee Evaluation',
      bodyRegion: 'knee',
      sessionType: 'evaluation',
      description: 'Comprehensive knee assessment including ligament tests and ROM'
    }
  };
};
