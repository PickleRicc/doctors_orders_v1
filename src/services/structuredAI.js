/**
 * Structured AI Service for PT SOAP Generator
 * Simplified AI service focused on JSON-structured SOAP generation
 * Replaces complex soapGenerationService.js with clean, focused approach
 */

import { createChatCompletion, initializeAI, isAIInitialized } from './aiClient.js';

/**
 * Prepend strict rules to any AI prompt to prevent hallucination
 */
const addStrictRules = (prompt) => {
  const strictRules = `
CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. ONLY use information explicitly stated in the transcript below
2. If a test/measurement is NOT mentioned in the transcript, use "Not documented" or leave the field empty
3. DO NOT make assumptions or infer information not present
4. DO NOT fill in fields with generic placeholder content
5. If the transcript lacks sufficient information, it's better to have empty fields than fabricated data
6. Examples in the prompt are for structure only - do not copy example values

`;
  return strictRules + prompt;
};

/**
 * AI Service wrapper that matches the expected interface for template hooks
 * Provides generateCompletion method that template hooks expect
 */
export const createAIService = () => {
  // Auto-initialize AI client if not already initialized
  if (!isAIInitialized()) {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    console.log('🔑 Checking OpenAI API key...', {
      hasKey: !!apiKey,
      keyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'none',
      envVars: Object.keys(process.env).filter(k => k.includes('OPENAI'))
    });
    
    if (apiKey) {
      console.log('✅ Initializing OpenAI client...');
      initializeAI(apiKey);
    } else {
      const errorMsg = '⚠️ No OpenAI API key found in environment variables. Please set NEXT_PUBLIC_OPENAI_API_KEY in .env.local';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
  }
  return {
    generateCompletion: async (prompt, options = {}) => {
      try {
        // Add strict rules to prevent hallucination
        const enhancedPrompt = addStrictRules(prompt);
        
        // Convert camelCase options to snake_case for OpenAI API
        const normalizedOptions = {
          temperature: options.temperature || 0.2, // Lower temperature for more factual responses
          max_tokens: options.maxTokens || options.max_tokens || 2000,
          model: options.model || 'gpt-4o'
        };
        
        // Note: Not using response_format as it's not supported by all models
        // The prompt should explicitly request JSON format instead

        console.log('🧠 Generating structured SOAP with AI...', {
          promptLength: enhancedPrompt.length,
          options: normalizedOptions,
          timestamp: new Date().toISOString()
        });

        const completion = await createChatCompletion({
          messages: [
            {
              role: 'system',
              content: `You are an expert physical therapist creating professional SOAP notes. 

CRITICAL RULES:
1. ONLY use information explicitly stated in the transcript
2. NEVER make up, assume, or infer information not present in the transcript
3. If information for a field is not mentioned, use "Not documented" or leave empty
4. If the transcript is empty or has insufficient information, return an error message
5. Do not fill in template fields with generic or placeholder content
6. Always return valid JSON matching the requested structure exactly

Your goal is accuracy and honesty, not completeness. An incomplete note based on real data is better than a complete note with fabricated information.`
            },
            {
              role: 'user',
              content: enhancedPrompt
            }
          ],
          ...normalizedOptions
        });

        // Extract the response content from the completion
        const response = completion.choices[0]?.message?.content;
        
        if (!response) {
          throw new Error('No response content received from AI service');
        }

        console.log('📄 AI Response received:', {
          responseLength: response.length,
          responsePreview: response.substring(0, 200) + '...',
          timestamp: new Date().toISOString()
        });

        // Clean up the response - remove markdown code blocks if present
        let cleanedResponse = response.trim();
        
        // Remove ```json and ``` wrappers if present
        if (cleanedResponse.startsWith('```json')) {
          cleanedResponse = cleanedResponse.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
        } else if (cleanedResponse.startsWith('```')) {
          cleanedResponse = cleanedResponse.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
        }
        
        cleanedResponse = cleanedResponse.trim();

        console.log('✅ AI response cleaned and ready', {
          originalLength: response.length,
          cleanedLength: cleanedResponse.length,
          startsWithBrace: cleanedResponse.startsWith('{'),
          timestamp: new Date().toISOString()
        });

        return cleanedResponse;

      } catch (error) {
        console.error('❌ Structured AI generation failed:', error);
        throw new Error(`AI generation failed: ${error.message}`);
      }
    }
  };
};

/**
 * Generate structured SOAP note using AI (legacy function for backward compatibility)
 * @param {string} prompt - Complete prompt including transcript and instructions
 * @param {Object} options - AI generation options
 * @returns {Promise<string>} - AI response as string (should be JSON)
 */
export const generateStructuredSOAP = async (prompt, options = {}) => {
  const aiService = createAIService();
  return await aiService.generateCompletion(prompt, options);
};

/**
 * Validate JSON response from AI
 * @param {string} response - AI response string
 * @returns {Object} - Parsed and validated JSON or error
 */
export const validateAIResponse = (response) => {
  try {
    // Clean response - remove any markdown formatting or extra text
    let cleanResponse = response.trim();
    
    // Remove markdown code blocks if present
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    // Parse JSON
    const parsed = JSON.parse(cleanResponse);

    // Basic structure validation
    const requiredSections = ['subjective', 'objective', 'assessment', 'plan'];
    const missingSections = requiredSections.filter(section => !parsed[section]);
    
    if (missingSections.length > 0) {
      throw new Error(`Missing required sections: ${missingSections.join(', ')}`);
    }

    return {
      success: true,
      data: parsed,
      errors: []
    };

  } catch (error) {
    console.error('JSON validation failed:', error);
    return {
      success: false,
      data: null,
      errors: [error.message]
    };
  }
};

/**
 * Auto-suggest template type based on transcript content
 * @param {string} transcript - Session transcript
 * @returns {string} - Suggested template type
 */
export const suggestTemplateType = (transcript) => {
  const lowerTranscript = transcript.toLowerCase();
  
  // Keyword mapping for template suggestion
  const templateKeywords = {
    knee: ['knee', 'patella', 'meniscus', 'acl', 'pcl', 'mcl', 'lcl', 'quadriceps', 'hamstring'],
    shoulder: ['shoulder', 'rotator cuff', 'impingement', 'deltoid', 'supraspinatus', 'infraspinatus'],
    back: ['back', 'spine', 'lumbar', 'thoracic', 'lower back', 'upper back', 'sciatica'],
    neck: ['neck', 'cervical', 'headache', 'whiplash', 'cervical spine'],
    hip: ['hip', 'groin', 'pelvis', 'piriformis', 'hip flexor', 'glute'],
    ankle_foot: ['ankle', 'foot', 'achilles', 'plantar fasciitis', 'calf', 'toe']
  };

  // Count keyword matches for each template
  const scores = {};
  Object.entries(templateKeywords).forEach(([templateType, keywords]) => {
    scores[templateType] = keywords.reduce((count, keyword) => {
      return count + (lowerTranscript.includes(keyword) ? 1 : 0);
    }, 0);
  });

  // Return template with highest score, default to 'knee' if no clear winner
  const suggestedTemplate = Object.entries(scores).reduce((a, b) => 
    scores[a[0]] > scores[b[0]] ? a : b
  )[0];

  return scores[suggestedTemplate] > 0 ? suggestedTemplate : 'knee';
};

/**
 * Generate confidence score for AI-generated content
 * @param {Object} soapData - Generated SOAP data
 * @param {string} transcript - Original transcript
 * @returns {Object} - Confidence scores for each section
 */
export const calculateConfidenceScores = (soapData, transcript) => {
  const transcriptLength = transcript.length;
  const transcriptWords = transcript.split(' ').length;

  const calculateSectionConfidence = (content, sectionType) => {
    if (!content || content.length < 10) return 0.2; // Very low confidence for minimal content
    
    // Base confidence on content length and detail
    let confidence = Math.min(content.length / 200, 1.0); // Scale based on content length
    
    // Adjust based on section type
    if (sectionType === 'objective' && Array.isArray(content)) {
      // For objective tables, confidence based on number of completed tests
      const completedTests = content.filter(row => row.result && row.result !== '').length;
      confidence = completedTests / Math.max(content.length, 1);
    }
    
    // Boost confidence if transcript is detailed
    if (transcriptWords > 100) confidence *= 1.2;
    if (transcriptWords > 200) confidence *= 1.1;
    
    return Math.min(Math.max(confidence, 0.1), 1.0); // Keep between 0.1 and 1.0
  };

  return {
    subjective: calculateSectionConfidence(soapData.subjective?.content, 'subjective'),
    objective: calculateSectionConfidence(soapData.objective?.rows, 'objective'),
    assessment: calculateSectionConfidence(soapData.assessment?.content, 'assessment'),
    plan: calculateSectionConfidence(soapData.plan?.content, 'plan'),
    overall: Object.values(soapData).reduce((acc, section, index, array) => {
      const sectionConfidence = calculateSectionConfidence(
        section.content || section.rows, 
        ['subjective', 'objective', 'assessment', 'plan'][index]
      );
      return acc + sectionConfidence / array.length;
    }, 0)
  };
};
