/**
 * Custom Template Hook - AI Generation
 * Handles SOAP note generation for user-created custom templates
 * Supports multiple template configuration formats
 * Supports both Physical Therapy and Chiropractic terminology
 */

// Profession constants - matching those in useProfession and supabase service
const PROFESSIONS = {
  PHYSICAL_THERAPY: 'physical_therapy',
  CHIROPRACTIC: 'chiropractic'
};

/**
 * Get profession-specific terminology for custom template prompts
 * @param {string} profession - The user's profession
 * @returns {object} - Terminology configuration
 */
const getProfessionTerminology = (profession) => {
  if (profession === PROFESSIONS.CHIROPRACTIC) {
    return {
      roleDescription: 'expert chiropractor',
      documentationType: 'chiropractic SOAP note',
      terminologyGuidelines: `
- Use chiropractic terminology: subluxation, vertebral listings (PL, PR, PI, PS), fixation, hypomobility
- Focus on spinal segment levels (C1-C7, T1-T12, L1-L5, Sacrum)
- Document motion palpation and static palpation findings
- Include adjustment techniques when mentioned (Diversified, Gonstead, Drop Table, Activator, etc.)
- Document vertebral listings when described`,
      defaultObjectiveFields: [
        'Postural Assessment',
        'Static Palpation',
        'Motion Palpation',
        'Range of Motion',
        'Orthopedic Tests',
        'Subluxation Analysis'
      ]
    };
  }
  
  // Default: Physical Therapy
  return {
    roleDescription: 'expert physical therapist',
    documentationType: 'physical therapy SOAP note',
    terminologyGuidelines: `
- Use physical therapy terminology: therapeutic exercise, manual therapy, ROM, strength (MMT grades)
- Focus on functional outcomes and measurable goals
- Document special tests with clinical findings
- Include interventions: stretching, strengthening, modalities
- Write SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)`,
    defaultObjectiveFields: [
      'Observation',
      'Palpation',
      'Range of Motion',
      'Strength Testing',
      'Special Tests',
      'Functional Testing'
    ]
  };
};

/**
 * Normalize template config to a consistent format
 * Handles both structured (fields/measurements) and simple (text content) formats
 * @param {object} config - Template configuration from database
 * @returns {object} - Normalized configuration
 */
const normalizeTemplateConfig = (config) => {
  if (!config) {
    return {
      subjective: { type: 'text', content: '', fields: [] },
      objective: { type: 'text', content: '', measurements: [] },
      assessment: { type: 'text', content: '', prompts: [] },
      plan: { type: 'text', content: '', sections: [] },
      ai_instructions: null,
      custom_prompts: null
    };
  }

  const normalized = {
    subjective: normalizeSection(config.subjective, 'subjective'),
    objective: normalizeSection(config.objective, 'objective'),
    assessment: normalizeSection(config.assessment, 'assessment'),
    plan: normalizeSection(config.plan, 'plan'),
    ai_instructions: config.ai_instructions || config.aiInstructions || null,
    custom_prompts: config.custom_prompts || config.customPrompts || config.ai_prompts || null,
    name: config.name || null,
    description: config.description || null,
    body_region: config.body_region || config.bodyRegion || null,
    session_type: config.session_type || config.sessionType || null
  };

  return normalized;
};

/**
 * Normalize a single SOAP section
 * @param {any} section - Section data (string, object, or undefined)
 * @param {string} sectionName - Name of the section for context
 * @returns {object} - Normalized section
 */
const normalizeSection = (section, sectionName) => {
  // If section is a string (simple text format)
  if (typeof section === 'string') {
    return {
      type: 'text',
      content: section,
      placeholder: section
    };
  }

  // If section is undefined or null
  if (!section) {
    return {
      type: 'text',
      content: '',
      placeholder: `Enter ${sectionName} information...`
    };
  }

  // If section is already structured
  if (typeof section === 'object') {
    // Handle different structural formats
    
    // Format 1: Has 'content' field (wysiwyg style)
    if (section.content !== undefined) {
      return {
        type: section.type || 'wysiwyg',
        content: section.content,
        placeholder: section.placeholder || ''
      };
    }

    // Format 2: Has 'fields' array (structured subjective)
    if (section.fields && Array.isArray(section.fields)) {
      return {
        type: 'structured',
        fields: section.fields,
        content: ''
      };
    }

    // Format 3: Has 'measurements' array (structured objective)
    if (section.measurements && Array.isArray(section.measurements)) {
      return {
        type: 'table',
        measurements: section.measurements,
        categories: section.categories || null,
        content: ''
      };
    }

    // Format 4: Has 'categories' array (categorized objective table)
    if (section.categories && Array.isArray(section.categories)) {
      return {
        type: 'table',
        categories: section.categories,
        measurements: [],
        commonResults: section.commonResults || [],
        content: ''
      };
    }

    // Format 5: Has 'prompts' array (assessment prompts)
    if (section.prompts && Array.isArray(section.prompts)) {
      return {
        type: 'prompted',
        prompts: section.prompts,
        content: ''
      };
    }

    // Format 6: Has 'sections' array (plan sections)
    if (section.sections && Array.isArray(section.sections)) {
      return {
        type: 'composite',
        sections: section.sections,
        content: ''
      };
    }

    // Format 7: Composite type with named sub-sections (like assessment with clinical_impression, medical_necessity)
    if (section.type === 'composite' || Object.keys(section).some(k => typeof section[k] === 'object' && section[k]?.type)) {
      return {
        type: 'composite',
        ...section
      };
    }

    // Default: treat as structured with unknown format
    return {
      type: 'unknown',
      data: section,
      content: ''
    };
  }

  // Fallback
  return {
    type: 'text',
    content: '',
    placeholder: ''
  };
};

/**
 * Build AI prompt from custom template configuration
 * @param {string} transcript - The recorded session transcript
 * @param {object} config - Custom template configuration
 * @param {string} profession - User's profession (physical_therapy or chiropractic)
 * @returns {string} AI prompt
 */
function buildCustomPrompt(transcript, config, profession = PROFESSIONS.PHYSICAL_THERAPY) {
  const normalized = normalizeTemplateConfig(config);
  const terminology = getProfessionTerminology(profession);
  
  // Check if template has custom AI instructions
  const customInstructions = normalized.ai_instructions || normalized.custom_prompts?.system || '';
  
  let prompt = `You are an ${terminology.roleDescription} creating a professional ${terminology.documentationType}. 

Based on the following transcript, generate a structured SOAP note according to the custom template specifications.

CRITICAL PRIVACY INSTRUCTION:
**NEVER include patient names or identifiers in the note. ALWAYS use "patient" or "the patient" instead of names.**

PROFESSION-SPECIFIC GUIDELINES:
${terminology.terminologyGuidelines}

`;

  // Add custom instructions if provided
  if (customInstructions) {
    prompt += `CUSTOM TEMPLATE INSTRUCTIONS:
${customInstructions}

`;
  }

  // Add template context if available
  if (normalized.name || normalized.description || normalized.body_region) {
    prompt += `TEMPLATE CONTEXT:
`;
    if (normalized.name) prompt += `- Template Name: ${normalized.name}\n`;
    if (normalized.description) prompt += `- Description: ${normalized.description}\n`;
    if (normalized.body_region) prompt += `- Body Region/Focus: ${normalized.body_region}\n`;
    if (normalized.session_type) prompt += `- Session Type: ${normalized.session_type}\n`;
    prompt += '\n';
  }

  prompt += `TRANSCRIPT:
${transcript}

TEMPLATE STRUCTURE:
`;

  // Build subjective section requirements
  prompt += buildSubjectivePromptSection(normalized.subjective);
  
  // Build objective section requirements  
  prompt += buildObjectivePromptSection(normalized.objective, terminology);
  
  // Build assessment section requirements
  prompt += buildAssessmentPromptSection(normalized.assessment);
  
  // Build plan section requirements
  prompt += buildPlanPromptSection(normalized.plan);

  // Build the expected JSON output structure
  prompt += buildOutputFormatSection(normalized);

  prompt += `
CRITICAL INSTRUCTIONS:
1. ONLY use information explicitly stated in the transcript
2. If information is not mentioned, use "Not documented" or leave empty
3. NEVER make up, assume, or infer information not present
4. Use professional ${terminology.documentationType === 'chiropractic SOAP note' ? 'chiropractic' : 'physical therapy'} terminology
5. Return ONLY valid JSON matching the structure above, no additional text
6. Maintain the exact JSON structure shown above`;

  return prompt;
}

/**
 * Build subjective section of the prompt
 */
function buildSubjectivePromptSection(subjective) {
  let prompt = '\nSUBJECTIVE - Extract patient-reported information:\n';
  
  if (subjective.type === 'structured' && subjective.fields?.length > 0) {
    subjective.fields.forEach(field => {
      prompt += `- ${field.label || field.name || field.id}`;
      if (field.description) prompt += `: ${field.description}`;
      if (field.type === 'number' && field.unit) prompt += ` (${field.unit})`;
      prompt += '\n';
    });
  } else if (subjective.content || subjective.placeholder) {
    prompt += `Based on template guidance: ${subjective.content || subjective.placeholder}\n`;
    prompt += `- Chief complaint and history\n`;
    prompt += `- Pain description (location, intensity, quality)\n`;
    prompt += `- Functional limitations\n`;
    prompt += `- Relevant history and goals\n`;
  } else {
    prompt += `- Chief complaint\n- Pain description\n- History of present illness\n- Functional limitations\n- Patient goals\n`;
  }
  
  return prompt;
}

/**
 * Build objective section of the prompt
 */
function buildObjectivePromptSection(objective, terminology) {
  let prompt = '\nOBJECTIVE - Document findings and measurements:\n';
  
  if (objective.type === 'table' && objective.categories?.length > 0) {
    // Categorized table format
    objective.categories.forEach(category => {
      prompt += `${category.name}:\n`;
      if (category.rows) {
        category.rows.forEach(row => {
          prompt += `  - ${row.test || row.name}: [result] [notes]\n`;
        });
      }
    });
  } else if (objective.measurements?.length > 0) {
    // Simple measurements format
    objective.measurements.forEach(measurement => {
      prompt += `- ${measurement.label || measurement.name}`;
      if (measurement.unit) prompt += ` (in ${measurement.unit})`;
      else if (measurement.scale) prompt += ` (scale: ${measurement.scale})`;
      prompt += '\n';
    });
  } else if (objective.content || objective.placeholder) {
    prompt += `Based on template guidance: ${objective.content || objective.placeholder}\n`;
    terminology.defaultObjectiveFields.forEach(field => {
      prompt += `- ${field}\n`;
    });
  } else {
    // Default fields based on profession
    terminology.defaultObjectiveFields.forEach(field => {
      prompt += `- ${field}\n`;
    });
  }
  
  return prompt;
}

/**
 * Build assessment section of the prompt
 */
function buildAssessmentPromptSection(assessment) {
  let prompt = '\nASSESSMENT - Clinical reasoning and diagnosis:\n';
  
  if (assessment.type === 'prompted' && assessment.prompts?.length > 0) {
    assessment.prompts.forEach(promptText => {
      prompt += `- ${promptText}\n`;
    });
  } else if (assessment.type === 'composite') {
    // Handle composite assessment (clinical_impression, medical_necessity, goals)
    if (assessment.clinical_impression) prompt += `- Clinical Impression\n`;
    if (assessment.medical_necessity) prompt += `- Medical Necessity\n`;
    if (assessment.short_term_goals) prompt += `- Short-term Goals (SMART format)\n`;
    if (assessment.long_term_goals) prompt += `- Long-term Goals (SMART format)\n`;
    if (assessment.subluxation_findings) prompt += `- Subluxation Findings\n`;
  } else if (assessment.content || assessment.placeholder) {
    prompt += `Based on template guidance: ${assessment.content || assessment.placeholder}\n`;
  } else {
    prompt += `- Clinical impression/diagnosis\n`;
    prompt += `- Contributing factors\n`;
    prompt += `- Medical necessity for treatment\n`;
    prompt += `- Short-term goals (2-4 weeks)\n`;
    prompt += `- Long-term goals (6-12 weeks)\n`;
    prompt += `- Prognosis\n`;
  }
  
  return prompt;
}

/**
 * Build plan section of the prompt
 */
function buildPlanPromptSection(plan) {
  let prompt = '\nPLAN - Treatment approach:\n';
  
  if (plan.type === 'composite' && plan.sections?.length > 0) {
    plan.sections.forEach(section => {
      prompt += `- ${section.label || section.name || section.id}\n`;
    });
  } else if (plan.type === 'composite') {
    // Handle named sub-sections
    if (plan.interventions) prompt += `- Interventions/Treatments\n`;
    if (plan.adjustments_performed) prompt += `- Adjustments Performed\n`;
    if (plan.techniques_used) prompt += `- Techniques Used\n`;
    if (plan.supportive_care) prompt += `- Supportive Care\n`;
    if (plan.frequency_duration) prompt += `- Frequency and Duration\n`;
    if (plan.patient_education) prompt += `- Patient Education/Home Program\n`;
    if (plan.progressions) prompt += `- Exercise Progressions\n`;
    if (plan.regressions) prompt += `- Regression Modifications\n`;
  } else if (plan.content || plan.placeholder) {
    prompt += `Based on template guidance: ${plan.content || plan.placeholder}\n`;
  } else {
    prompt += `- Interventions/treatments performed\n`;
    prompt += `- Treatment frequency and duration\n`;
    prompt += `- Home exercise program\n`;
    prompt += `- Patient education\n`;
    prompt += `- Follow-up plan\n`;
  }
  
  return prompt;
}

/**
 * Build the expected JSON output format section
 */
function buildOutputFormatSection(normalized) {
  let prompt = `
OUTPUT FORMAT:
Return a valid JSON object with this exact structure:
{
  "subjective": {
    "content": "Patient's reported information in narrative form"
  },
  "objective": {
`;

  // Determine objective output format
  if (normalized.objective.type === 'table' && normalized.objective.categories?.length > 0) {
    prompt += `    "categories": [
      {
        "name": "Category Name",
        "rows": [
          {"test": "Test Name", "result": "Finding", "notes": "Additional details"}
        ]
      }
    ]`;
  } else if (normalized.objective.measurements?.length > 0) {
    const measurementExamples = normalized.objective.measurements
      .slice(0, 3)
      .map(m => `"${m.id || m.label}": "measured value"`)
      .join(',\n    ');
    prompt += `    ${measurementExamples}`;
  } else {
    prompt += `    "categories": [
      {
        "name": "Examination Category",
        "rows": [
          {"test": "Test/Measurement", "result": "Result", "notes": "Notes"}
        ]
      }
    ]`;
  }

  prompt += `
  },
  "assessment": {
    "clinical_impression": "Diagnosis and clinical reasoning",
    "medical_necessity": "Why treatment is needed",
    "short_term_goals": ["Goal 1", "Goal 2"],
    "long_term_goals": ["Goal 1", "Goal 2"]
  },
  "plan": {
    "interventions": ["Intervention 1", "Intervention 2"],
    "frequency_duration": "Treatment frequency and expected duration",
    "patient_education": "Home program and instructions"
  }
}
`;

  return prompt;
}

/**
 * Generate empty SOAP structure from custom template config
 * @param {object} config - Custom template configuration
 * @returns {object} Empty SOAP structure
 */
function getEmptySOAP(config) {
  const normalized = normalizeTemplateConfig(config);
  
  const emptySOAP = {
    subjective: {
      type: normalized.subjective.type || 'wysiwyg',
      content: ''
    },
    objective: {
      type: normalized.objective.type || 'table',
      categories: normalized.objective.categories || [],
      measurements: normalized.objective.measurements || []
    },
    assessment: {
      type: 'composite',
      clinical_impression: { type: 'wysiwyg', content: '' },
      medical_necessity: { type: 'wysiwyg', content: '' },
      short_term_goals: { type: 'list', items: [] },
      long_term_goals: { type: 'list', items: [] }
    },
    plan: {
      type: 'composite',
      interventions: { type: 'list', items: [] },
      frequency_duration: { type: 'wysiwyg', content: '' },
      patient_education: { type: 'wysiwyg', content: '' }
    }
  };

  // Build subjective structure based on config
  if (normalized.subjective.type === 'structured' && normalized.subjective.fields) {
    emptySOAP.subjective = { type: 'structured' };
    normalized.subjective.fields.forEach(field => {
      emptySOAP.subjective[field.id] = '';
    });
  }

  // Build objective structure based on config
  if (normalized.objective.type === 'table' && normalized.objective.categories) {
    emptySOAP.objective.categories = normalized.objective.categories.map(cat => ({
      ...cat,
      rows: cat.rows?.map(row => ({ ...row, result: '', notes: '' })) || []
    }));
  }

  // Build plan structure based on config
  if (normalized.plan.type === 'composite' && normalized.plan.sections) {
    emptySOAP.plan = { type: 'composite' };
    normalized.plan.sections.forEach(section => {
      emptySOAP.plan[section.id] = section.type === 'list' ? { type: 'list', items: [] } : { type: 'wysiwyg', content: '' };
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

  // Check required sections exist
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

  const normalized = normalizeTemplateConfig(config);

  // Validate subjective fields if structured
  if (normalized.subjective.type === 'structured' && normalized.subjective.fields) {
    normalized.subjective.fields.forEach(field => {
      if (field.required && !soapData.subjective?.[field.id]) {
        errors.push(`Subjective field "${field.label}" is required`);
      }
    });
  }

  // Validate objective measurements if structured
  if (normalized.objective.measurements) {
    normalized.objective.measurements.forEach(measurement => {
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
 * @param {object} templateConfig - The custom template configuration
 * @param {string} profession - User's profession for terminology
 */
export const useCustomTemplate = (templateConfig, profession = PROFESSIONS.PHYSICAL_THERAPY) => {
  /**
   * Generate SOAP note using custom template
   * @param {string} transcript - Recording transcript
   * @param {object} aiService - AI service instance
   * @returns {Promise<object>} Generation result
   */
  const generateSOAP = async (transcript, aiService) => {
    try {
      if (!templateConfig) {
        console.error('❌ Custom template generation failed: No template configuration provided');
        return {
          success: false,
          error: 'Template configuration is required'
        };
      }

      console.log('🤖 Generating SOAP with custom template...');
      console.log('📋 Template config:', JSON.stringify(templateConfig, null, 2));
      console.log('👤 Profession:', profession);

      // Build the prompt using the template configuration
      const prompt = buildCustomPrompt(transcript, templateConfig, profession);
      
      console.log('📝 Generated prompt length:', prompt.length);
      console.log('📝 Prompt preview:', prompt.substring(0, 500) + '...');
      
      // Call AI service
      const aiResponse = await aiService.generateCompletion(prompt, {
        temperature: 0.3,
        max_tokens: 2500
      });
      
      console.log('🤖 AI Response received, length:', aiResponse.length);

      // Parse the JSON response
      let soapData;
      try {
        soapData = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response:', aiResponse.substring(0, 500));
        return {
          success: false,
          error: 'AI returned invalid JSON: ' + parseError.message
        };
      }

      console.log('✅ SOAP parsed successfully');

      // Validate the generated SOAP
      const validation = validateSOAP(soapData, templateConfig);
      if (!validation.isValid) {
        console.warn('⚠️ Generated SOAP has validation issues:', validation.errors);
        // Continue anyway, user can fix in editor
      }

      // Structure the SOAP data to match expected format
      const structuredSOAP = structureSOAPData(soapData, templateConfig);

      return {
        success: true,
        data: structuredSOAP,
        templateType: 'custom',
        confidence: {
          subjective: 0.85,
          objective: 0.85,
          assessment: 0.85,
          plan: 0.85,
          overall: 0.85
        }
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
    config: templateConfig,
    profession
  };
};

/**
 * Structure SOAP data to match the expected component format
 * @param {object} rawSoapData - Raw SOAP data from AI
 * @param {object} config - Template configuration
 * @returns {object} Structured SOAP data
 */
function structureSOAPData(rawSoapData, config) {
  const normalized = normalizeTemplateConfig(config);
  
  // Structure subjective
  let subjective;
  if (typeof rawSoapData.subjective === 'string') {
    subjective = { type: 'wysiwyg', content: rawSoapData.subjective };
  } else if (rawSoapData.subjective?.content) {
    subjective = { type: 'wysiwyg', content: rawSoapData.subjective.content };
  } else {
    subjective = { type: 'wysiwyg', content: JSON.stringify(rawSoapData.subjective) };
  }

  // Structure objective
  let objective;
  if (rawSoapData.objective?.categories) {
    objective = {
      type: 'table',
      categories: rawSoapData.objective.categories,
      commonResults: normalized.objective.commonResults || []
    };
  } else if (rawSoapData.objective?.rows) {
    objective = {
      type: 'table',
      categories: [{ name: 'Findings', rows: rawSoapData.objective.rows }],
      commonResults: normalized.objective.commonResults || []
    };
  } else {
    objective = {
      type: 'table',
      categories: [],
      rawData: rawSoapData.objective
    };
  }

  // Structure assessment
  let assessment;
  if (typeof rawSoapData.assessment === 'string') {
    assessment = {
      type: 'composite',
      clinical_impression: { type: 'wysiwyg', content: rawSoapData.assessment },
      medical_necessity: { type: 'wysiwyg', content: '' },
      short_term_goals: { type: 'list', items: [] },
      long_term_goals: { type: 'list', items: [] }
    };
  } else {
    assessment = {
      type: 'composite',
      clinical_impression: { 
        type: 'wysiwyg', 
        content: rawSoapData.assessment?.clinical_impression || rawSoapData.assessment?.clinicalImpression || '' 
      },
      medical_necessity: { 
        type: 'wysiwyg', 
        content: rawSoapData.assessment?.medical_necessity || rawSoapData.assessment?.medicalNecessity || '' 
      },
      short_term_goals: { 
        type: 'list', 
        items: Array.isArray(rawSoapData.assessment?.short_term_goals) 
          ? rawSoapData.assessment.short_term_goals 
          : (rawSoapData.assessment?.shortTermGoals || [])
      },
      long_term_goals: { 
        type: 'list', 
        items: Array.isArray(rawSoapData.assessment?.long_term_goals) 
          ? rawSoapData.assessment.long_term_goals 
          : (rawSoapData.assessment?.longTermGoals || [])
      }
    };
    
    // Add subluxation findings for chiropractic
    if (rawSoapData.assessment?.subluxation_findings) {
      assessment.subluxation_findings = { 
        type: 'wysiwyg', 
        content: rawSoapData.assessment.subluxation_findings 
      };
    }
  }

  // Structure plan
  let plan;
  if (typeof rawSoapData.plan === 'string') {
    plan = {
      type: 'composite',
      interventions: { type: 'list', items: [] },
      frequency_duration: { type: 'wysiwyg', content: rawSoapData.plan },
      patient_education: { type: 'wysiwyg', content: '' }
    };
  } else {
    plan = {
      type: 'composite',
      interventions: { 
        type: 'list', 
        items: Array.isArray(rawSoapData.plan?.interventions) 
          ? rawSoapData.plan.interventions 
          : []
      },
      frequency_duration: { 
        type: 'wysiwyg', 
        content: rawSoapData.plan?.frequency_duration || rawSoapData.plan?.frequencyDuration || '' 
      },
      patient_education: { 
        type: 'wysiwyg', 
        content: rawSoapData.plan?.patient_education || rawSoapData.plan?.patientEducation || '' 
      }
    };
    
    // Add chiropractic-specific plan fields
    if (rawSoapData.plan?.adjustments_performed) {
      plan.adjustments_performed = { 
        type: 'list', 
        items: Array.isArray(rawSoapData.plan.adjustments_performed) 
          ? rawSoapData.plan.adjustments_performed 
          : []
      };
    }
    if (rawSoapData.plan?.techniques_used) {
      plan.techniques_used = { 
        type: 'list', 
        items: Array.isArray(rawSoapData.plan.techniques_used) 
          ? rawSoapData.plan.techniques_used 
          : []
      };
    }
    if (rawSoapData.plan?.supportive_care) {
      plan.supportive_care = { 
        type: 'list', 
        items: Array.isArray(rawSoapData.plan.supportive_care) 
          ? rawSoapData.plan.supportive_care 
          : []
      };
    }
  }

  return {
    subjective,
    objective,
    assessment,
    plan
  };
}

// Export helper functions for direct use
export { buildCustomPrompt, getEmptySOAP, validateSOAP, normalizeTemplateConfig };
