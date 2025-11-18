/**
 * Custom Template Hook - AI Generation
 * Handles SOAP note generation for user-created custom templates
 */

/**
 * Build AI prompt from custom template configuration
 * @param {string} transcript - The recorded session transcript
 * @param {object} config - Custom template configuration
 * @returns {string} AI prompt
 */
function buildCustomPrompt(transcript, config) {
  const { subjective, objective, assessment, plan } = config;
  
  let prompt = `You are a physical therapy documentation AI. Based on the following transcript, generate a structured SOAP note according to the custom template specifications.

TRANSCRIPT:
${transcript}

TEMPLATE STRUCTURE:

`;

  // Subjective Section
  if (subjective?.fields) {
    prompt += `SUBJECTIVE - Extract the following information:\n`;
    subjective.fields.forEach(field => {
      prompt += `- ${field.label}`;
      if (field.type === 'number' && field.unit) {
        prompt += ` (${field.unit})`;
      }
      prompt += '\n';
    });
    prompt += '\n';
  }

  // Objective Section
  if (objective?.measurements) {
    prompt += `OBJECTIVE - Document these measurements and observations:\n`;
    objective.measurements.forEach(measurement => {
      prompt += `- ${measurement.label}`;
      if (measurement.unit) {
        prompt += ` (in ${measurement.unit})`;
      } else if (measurement.scale) {
        prompt += ` (scale: ${measurement.scale})`;
      }
      prompt += '\n';
    });
    prompt += '\n';
  }

  // Assessment Section
  if (assessment?.prompts) {
    prompt += `ASSESSMENT - Address these points:\n`;
    assessment.prompts.forEach(promptText => {
      prompt += `- ${promptText}\n`;
    });
    prompt += '\n';
  }

  // Plan Section
  if (plan?.sections) {
    prompt += `PLAN - Include these sections:\n`;
    plan.sections.forEach(section => {
      prompt += `- ${section.label}\n`;
    });
    prompt += '\n';
  }

  prompt += `
OUTPUT FORMAT:
Return a valid JSON object with this structure:
{
  "subjective": {
    ${subjective?.fields ? subjective.fields.map(f => `"${f.id}": "extracted value"`).join(',\n    ') : '"text": "subjective content"'}
  },
  "objective": {
    ${objective?.measurements ? objective.measurements.map(m => `"${m.id}": "measured value"`).join(',\n    ') : '"measurements": "objective content"'}
  },
  "assessment": "Clinical assessment based on the prompts above",
  "plan": {
    ${plan?.sections ? plan.sections.map(s => `"${s.id}": "plan details"`).join(',\n    ') : '"text": "plan content"'}
  }
}

IMPORTANT:
- Extract information directly from the transcript
- Use "Not mentioned" or "Not assessed" for missing information
- Be concise and professional
- Use clinical terminology appropriate for physical therapy
- Return ONLY the JSON object, no additional text`;

  return prompt;
}

/**
 * Generate empty SOAP structure from custom template config
 * @param {object} config - Custom template configuration
 * @returns {object} Empty SOAP structure
 */
function getEmptySOAP(config) {
  const { subjective, objective, assessment, plan } = config;
  
  const emptySOAP = {
    subjective: {},
    objective: {},
    assessment: '',
    plan: {}
  };

  // Build subjective structure
  if (subjective?.fields) {
    subjective.fields.forEach(field => {
      emptySOAP.subjective[field.id] = '';
    });
  }

  // Build objective structure
  if (objective?.measurements) {
    objective.measurements.forEach(measurement => {
      emptySOAP.objective[measurement.id] = '';
    });
  }

  // Build plan structure
  if (plan?.sections) {
    plan.sections.forEach(section => {
      emptySOAP.plan[section.id] = '';
    });
  }

  return emptySOAP;
}

/**
 * Validate SOAP data against custom template structure
 * @param {object} soapData - SOAP data to validate
 * @param {object} config - Custom template configuration
 * @returns {object} Validation result
 */
function validateSOAP(soapData, config) {
  const errors = [];
  
  if (!soapData) {
    return { isValid: false, errors: ['SOAP data is required'] };
  }

  // Check required sections
  if (!soapData.subjective) {
    errors.push('Subjective section is required');
  }
  if (!soapData.objective) {
    errors.push('Objective section is required');
  }
  if (!soapData.assessment) {
    errors.push('Assessment section is required');
  }
  if (!soapData.plan) {
    errors.push('Plan section is required');
  }

  // Validate subjective fields
  if (config.subjective?.fields) {
    config.subjective.fields.forEach(field => {
      if (field.required && !soapData.subjective?.[field.id]) {
        errors.push(`Subjective field "${field.label}" is required`);
      }
    });
  }

  // Validate objective measurements
  if (config.objective?.measurements) {
    config.objective.measurements.forEach(measurement => {
      if (measurement.required && !soapData.objective?.[measurement.id]) {
        errors.push(`Objective measurement "${measurement.label}" is required`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Custom Template Hook
 * Provides SOAP generation functionality for custom templates
 */
export const useCustomTemplate = (templateConfig) => {
  /**
   * Generate SOAP note using custom template
   * @param {string} transcript - Recording transcript
   * @param {object} aiService - AI service instance
   * @returns {Promise<object>} Generation result
   */
  const generateSOAP = async (transcript, aiService) => {
    try {
      if (!templateConfig) {
        return {
          success: false,
          error: 'Template configuration is required'
        };
      }

      const prompt = buildCustomPrompt(transcript, templateConfig);
      
      console.log('🤖 Generating SOAP with custom template...');
      console.log('📋 Template config:', templateConfig);
      
      const aiResponse = await aiService.generateCompletion(prompt);
      
      // Parse the JSON response
      let soapData;
      try {
        soapData = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response:', aiResponse);
        return {
          success: false,
          error: 'AI returned invalid JSON: ' + parseError.message
        };
      }

      // Validate the generated SOAP
      const validation = validateSOAP(soapData, templateConfig);
      if (!validation.isValid) {
        console.warn('⚠️ Generated SOAP has validation issues:', validation.errors);
        // Continue anyway, user can fix in editor
      }

      return {
        success: true,
        data: soapData
      };
    } catch (error) {
      console.error('❌ Error generating SOAP with custom template:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  return {
    templateType: 'custom',
    generateSOAP,
    getEmptySOAP: () => getEmptySOAP(templateConfig),
    validateSOAP: (soapData) => validateSOAP(soapData, templateConfig),
    config: templateConfig
  };
};

// Export helper functions for direct use
export { buildCustomPrompt, getEmptySOAP, validateSOAP };

