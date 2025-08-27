/**
 * AI Service for PT SOAP Generator - Main Entry Point
 * 
 * This file serves as the main entry point for AI functionality and maintains
 * backward compatibility with existing code. All AI operations are now handled
 * by specialized service modules for better maintainability.
 * 
 * Service Architecture:
 * - aiClient.js: OpenAI client management
 * - transcriptionService.js: Audio transcription
 * - soapGenerationService.js: SOAP note generation with advanced JSON parsing
 * - aiOrchestrator.js: Main orchestration service
 */

// Import all functions from the specialized services
import {
  initializeAIService,
  isAIServiceInitialized,
  processRecordingToSOAP,
  refineExistingSOAPNote,
  transcribeAudioOnly,
  generateSOAPFromTranscription
} from './aiOrchestrator.js';

import { transcribeAudio } from './transcriptionService.js';
import { generateSOAPNote, refineSOAPNote } from './soapGenerationService.js';

// Re-export functions for backward compatibility
// These maintain the same API as the original monolithic service

/**
 * Initialize the AI service with API key
 * @param {string} apiKey - OpenAI API key
 * @returns {Object} - Initialization result
 */
export const initializeAI = initializeAIService;

/**
 * Check if AI service is initialized
 * @returns {boolean} - Whether AI service is ready
 */
export const isAIInitialized = isAIServiceInitialized;

/**
 * Transcribe audio file using OpenAI's Whisper API
 * @param {File|Blob} audioBlob - Audio file to transcribe
 * @returns {Promise<string>} - Transcription text
 */
export { transcribeAudio };

/**
 * Generate a SOAP note from transcription using AI
 * @param {string} transcriptionText - Transcribed text from session recording
 * @param {Object} templateData - Template data for the SOAP note
 * @param {Object} sessionInfo - Information about the session (body region, etc.)
 * @returns {Promise<Object>} - Generated SOAP note sections and structured data
 */
export { generateSOAPNote };

/**
 * Generate billing code suggestions based on SOAP note content
 * @param {Object} soapNote - The SOAP note content
 * @param {Object} sessionInfo - Session information including type and body region
 * @returns {Promise<Array>} - Array of billing code suggestions
 */
export { generateBillingSuggestions };

/**
 * Analyze transcription for specific muscle tests and ROM values
 * @param {string} transcriptionText - Transcribed text to analyze
 * @param {string} bodyRegion - The body region of focus
 * @returns {Promise<Object>} - Extracted muscle tests and ROM values
 */
export { analyzeMuscleTests };

/**
 * Modify or refine an existing SOAP note
 * @param {Object} existingSOAP - Current SOAP note content
 * @param {string} userFeedback - User's feedback or instructions
 * @returns {Promise<Object>} - Updated SOAP note
 */
export { refineSOAPNote };

/**
 * Process audio recording or test transcription to generate SOAP note with enhanced features
 * This is the main orchestration function that coordinates all AI services
 * @param {File|Blob|Object} input - Audio recording file OR object with test transcription
 * @param {Object} templateData - Template data for structure
 * @param {Object} sessionInfo - Information about the session
 * @returns {Promise<Object>} - Result object with transcription, SOAP note, billing, and muscle tests
 */
export { processRecordingToSOAP };

// Additional orchestrator functions for more granular control
/**
 * Refine an existing SOAP note based on user feedback
 * @param {Object} existingSOAP - Current SOAP note content
 * @param {string} userFeedback - User's feedback or instructions
 * @returns {Promise<Object>} - Updated SOAP note result
 */
export const refineSOAPNoteWithResult = refineExistingSOAPNote;

/**
 * Transcribe audio file only (without SOAP generation)
 * @param {File|Blob} audioBlob - Audio file to transcribe

/**
 * Transcribe audio file only (without SOAP generation)
 * @param {File|Blob} audioBlob - Audio file to transcribe
 * @returns {Promise<Object>} - Transcription result
 */
export const getTranscriptionOnly = transcribeAudioOnly;

/**
 * Generate SOAP note from existing transcription
 * @param {string} transcriptionText - Existing transcription
 * @param {Object} templateData - Template data
 * @param {Object} sessionInfo - Session information
 * @returns {Promise<Object>} - SOAP generation result
 */
export const getSOAPFromTranscription = generateSOAPFromTranscription;

// Default export for convenience
export default {
  // Core functions (backward compatibility)
  initializeAI,
  isAIInitialized,
  transcribeAudio,
  generateSOAPNote,
  refineSOAPNote,
  processRecordingToSOAP,
  
  // Extended orchestrator functions
  refineSOAPNoteWithResult,
  getTranscriptionOnly,
  getSOAPFromTranscription
};
