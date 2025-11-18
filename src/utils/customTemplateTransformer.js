/**
 * Custom Template Data Transformer
 * Converts custom template data (with field IDs) to/from SOAPEditor format
 */

/**
 * Transform custom template SOAP data into a format the SOAPEditor can display
 * @param {Object} soapData - The SOAP data with field IDs (e.g., { field_123: 'value' })
 * @param {Object} templateConfig - The template configuration with field definitions
 * @returns {Object} - Transformed SOAP data for SOAPEditor
 */
export function transformCustomTemplateForEditor(soapData, templateConfig) {
  if (!soapData || !templateConfig) {
    console.warn('⚠️ Missing data or config for transformation');
    return soapData;
  }

  console.log('🔄 Transforming custom template data for editor:', { soapData, templateConfig });

  const transformed = {
    subjective: { content: '' },
    objective: { categories: [] },
    assessment: '',
    plan: { sections: [] }
  };

  // Transform Subjective - Convert fields to readable text
  if (soapData.subjective && templateConfig.subjective?.fields) {
    let subjectiveText = '';
    
    templateConfig.subjective.fields.forEach(fieldDef => {
      const value = soapData.subjective[fieldDef.id];
      if (value) {
        subjectiveText += `<p><strong>${fieldDef.label}:</strong> ${value}</p>\n`;
      }
    });
    
    transformed.subjective.content = subjectiveText || '<p>No subjective data recorded.</p>';
  }

  // Transform Objective - Convert measurements to table rows
  if (soapData.objective && templateConfig.objective?.measurements) {
    const objectiveRows = [];
    
    templateConfig.objective.measurements.forEach(measurementDef => {
      const value = soapData.objective[measurementDef.id];
      if (value) {
        objectiveRows.push({
          test: measurementDef.label,
          result: value,
          notes: ''
        });
      }
    });
    
    if (objectiveRows.length > 0) {
      transformed.objective = {
        categories: [{
          name: 'Measurements',
          rows: objectiveRows
        }]
      };
    } else {
      transformed.objective = { categories: [] };
    }
  }

  // Transform Assessment - Keep as string
  if (typeof soapData.assessment === 'string') {
    transformed.assessment = soapData.assessment;
  } else if (soapData.assessment && typeof soapData.assessment === 'object') {
    // If assessment is an object, convert to string
    transformed.assessment = JSON.stringify(soapData.assessment, null, 2);
  }

  // Transform Plan - Convert sections to readable format
  if (soapData.plan && typeof soapData.plan === 'object') {
    // If plan has the new structure with sections
    if (templateConfig.plan?.sections && Array.isArray(templateConfig.plan.sections)) {
      transformed.plan = {
        interventions: { items: [] },
        progressions: { items: [] },
        frequency_duration: { content: '' },
        patient_education: { content: '' }
      };

      // Convert plan data based on template config
      templateConfig.plan.sections.forEach(sectionDef => {
        const value = soapData.plan[sectionDef.id];
        if (value) {
          // Add to interventions for now (could be more sophisticated)
          if (!transformed.plan.interventions) {
            transformed.plan.interventions = { items: [] };
          }
          transformed.plan.interventions.items.push(`${sectionDef.label}: ${value}`);
        }
      });
    }
  }

  console.log('✅ Transformed data:', transformed);
  return transformed;
}

/**
 * Transform SOAPEditor data back to custom template format
 * @param {Object} editorData - The SOAP data from SOAPEditor
 * @param {Object} templateConfig - The template configuration with field definitions
 * @returns {Object} - SOAP data in custom template format (with field IDs)
 */
export function transformEditorToCustomTemplate(editorData, templateConfig) {
  if (!editorData || !templateConfig) {
    return editorData;
  }

  console.log('🔄 Transforming editor data back to custom template format');

  const transformed = {
    subjective: {},
    objective: {},
    assessment: '',
    plan: {}
  };

  // This is more complex - for now, just preserve the data as-is
  // In a full implementation, you'd parse the HTML content back into field values
  // For the MVP, we'll just keep the editor's format
  return editorData;
}

/**
 * Check if SOAP data is in custom template format
 * @param {Object} soapData - The SOAP data to check
 * @returns {boolean} - True if data appears to be in custom template format
 */
export function isCustomTemplateFormat(soapData) {
  if (!soapData || typeof soapData !== 'object') {
    return false;
  }

  // Check if subjective has field IDs instead of content
  if (soapData.subjective && typeof soapData.subjective === 'object') {
    const subKeys = Object.keys(soapData.subjective);
    if (subKeys.length > 0 && subKeys[0].startsWith('field_')) {
      return true;
    }
  }

  // Check if objective has measurement IDs
  if (soapData.objective && typeof soapData.objective === 'object') {
    const objKeys = Object.keys(soapData.objective);
    if (objKeys.length > 0 && objKeys[0].startsWith('measurement_')) {
      return true;
    }
  }

  return false;
}

