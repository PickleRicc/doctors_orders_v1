/**
 * Template Processing Utility for PT SOAP Generator
 * Handles processing of templates and structured data integration
 */

import { logInfo, logAIProcess, logWarning } from './logging';

/**
 * Processes a template and extracts structured data
 * 
 * @param {object} template - The template object from the database
 * @param {string} transcription - The raw transcription text
 * @return {object} The processed template with structured data
 */
export const processTemplateData = (template, transcription) => {
  logAIProcess('TEMPLATE_PROCESSING', 'Starting template processing', {
    templateId: template?.id,
    templateKey: template?.template_key,
    hasStructuredData: !!template?.structured_data
  });

  // If no template or no structured data, return early
  if (!template || !template.structured_data) {
    logWarning('Template Processing', 'No template or structured data available', {
      templateId: template?.id
    });
    return {
      processed: false,
      template,
      structuredData: null
    };
  }

  // Extract structured data from template
  try {
    const structuredData = typeof template.structured_data === 'string'
      ? JSON.parse(template.structured_data)
      : template.structured_data;

    logAIProcess('TEMPLATE_PROCESSING', 'Successfully extracted structured data', {
      dataKeys: Object.keys(structuredData)
    });

    return {
      processed: true,
      template,
      structuredData
    };
  } catch (error) {
    logWarning('Template Processing', 'Failed to parse structured data', {
      error: error.message,
      templateId: template.id
    });
    return {
      processed: false,
      template,
      structuredData: null,
      error: error.message
    };
  }
};

/**
 * Applies structured data from template to a session
 * 
 * @param {object} session - The session object
 * @param {object} structuredData - The structured data from template
 * @return {object} The session with template_structured_data added
 */
export const applyStructuredDataToSession = (session, structuredData) => {
  if (!session || !structuredData) {
    return session;
  }

  logAIProcess('DATA_INTEGRATION', 'Applying structured data to session', {
    sessionId: session.id,
    structuredDataKeys: Object.keys(structuredData)
  });

  return {
    ...session,
    template_structured_data: structuredData
  };
};

/**
 * Main function to process and apply template data to a session
 * 
 * @param {object} session - The session object
 * @param {object} template - The template object
 * @param {string} transcription - The raw transcription text
 * @return {object} The enhanced session with structured data
 */
export const enhanceSessionWithTemplate = (session, template, transcription) => {
  logAIProcess('SESSION_ENHANCEMENT', 'Enhancing session with template data', {
    sessionId: session?.id,
    templateId: template?.id
  });

  // Process the template
  const { processed, structuredData, error } = processTemplateData(template, transcription);
  
  if (!processed || error) {
    logWarning('Session Enhancement', 'Failed to enhance session with template data', {
      error,
      sessionId: session?.id
    });
    return session;
  }
  
  // Apply structured data to session
  const enhancedSession = applyStructuredDataToSession(session, structuredData);
  
  logInfo('Session Enhancement', 'Successfully enhanced session with template data', {
    sessionId: session?.id,
    hasStructuredData: !!enhancedSession.template_structured_data
  });
  
  return enhancedSession;
};

export default {
  processTemplateData,
  applyStructuredDataToSession,
  enhanceSessionWithTemplate
};
