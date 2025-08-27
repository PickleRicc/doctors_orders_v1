/**
 * AI Client Service for PT SOAP Generator
 * Handles OpenAI client initialization and basic API interactions
 * Provides a centralized way to manage the OpenAI client instance
 */

import OpenAI from 'openai';

// Global OpenAI client instance
let openai = null;

/**
 * Initialize the OpenAI client with the provided API key
 * @param {string} apiKey - OpenAI API key
 * @returns {Object} - Initialization result
 */
export const initializeAI = (apiKey) => {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Allow client-side usage
  });
  
  console.log('✅ OpenAI client initialized successfully');
  
  return {
    isInitialized: !!openai
  };
};

/**
 * Check if the AI service is initialized
 * @returns {boolean} - Whether the AI service is initialized
 */
export const isAIInitialized = () => {
  return !!openai;
};

/**
 * Get the OpenAI client instance
 * @returns {OpenAI} - The OpenAI client instance
 * @throws {Error} - If the client is not initialized
 */
export const getOpenAIClient = () => {
  if (!openai) {
    throw new Error('AI service not initialized. Please provide an OpenAI API key.');
  }
  return openai;
};

/**
 * Make a chat completion request
 * @param {Object} params - Chat completion parameters
 * @returns {Promise<Object>} - Chat completion response
 */
export const createChatCompletion = async (params) => {
  const client = getOpenAIClient();
  
  try {
    console.log('🤖 Making OpenAI chat completion request:', {
      model: params.model,
      temperature: params.temperature,
      messageCount: params.messages?.length
    });
    
    const completion = await client.chat.completions.create(params);
    
    console.log('✅ Chat completion successful:', {
      finishReason: completion.choices[0]?.finish_reason,
      responseLength: completion.choices[0]?.message?.content?.length
    });
    
    return completion;
  } catch (error) {
    console.error('❌ OpenAI API call failed:', error);
    throw new Error(`AI service unavailable: ${error.message}`);
  }
};

/**
 * Validate API response structure
 * @param {Object} completion - API response to validate
 * @throws {Error} - If response structure is invalid
 */
export const validateApiResponse = (completion) => {
  if (!completion || !completion.choices || !completion.choices[0] || !completion.choices[0].message) {
    console.error('❌ Invalid API response structure:', completion);
    throw new Error('Invalid response from AI service');
  }
  
  const content = completion.choices[0].message.content;
  if (!content) {
    console.error('❌ Empty response from AI service');
    throw new Error('Empty response from AI service');
  }
  
  return content;
};

export default {
  initializeAI,
  isAIInitialized,
  getOpenAIClient,
  createChatCompletion,
  validateApiResponse
};
