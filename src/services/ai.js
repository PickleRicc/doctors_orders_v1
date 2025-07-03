/**
 * AI service for the PT SOAP Generator application
 * Handles transcription of audio recordings and generation of SOAP notes
 * Uses OpenAI API for transcription (Whisper) and text generation
 * Supports advanced muscle test detection and billing code suggestions
 */

import OpenAI from 'openai';
import axios from 'axios';

// Initialize OpenAI client
// Note: API key should be set as an environment variable OPENAI_API_KEY
let openai = null;

/**
 * Initialize the OpenAI client with the provided API key
 * @param {string} apiKey - OpenAI API key
 */
export const initializeAI = (apiKey) => {
  openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Allow client-side usage
  });
  
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
 * Transcribe audio file using OpenAI's Whisper API
 * @param {File|Blob} audioBlob - Audio file to transcribe
 * @returns {Promise<string>} - Transcription text
 */
export const transcribeAudio = async (audioBlob) => {
  if (!openai) {
    throw new Error('AI service not initialized. Please provide an OpenAI API key.');
  }
  
  console.log('🎤 Starting audio transcription...', {
    audioSize: audioBlob.size,
    audioType: audioBlob.type,
    timestamp: new Date().toISOString()
  });
  
  try {
    // Create a form data object with the audio file
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-1');
    
    console.log('📡 Sending audio to OpenAI Whisper API...');
    
    // Ensure we have a proper File object for the OpenAI API
    // The OpenAI SDK expects a proper File object, not just a blob
    const audioFile = new File(
      [audioBlob], 
      'recording.webm', 
      { type: audioBlob.type || 'audio/webm' }
    );
    
    console.log('📁 Creating proper File object for API:', {
      fileName: 'recording.webm',
      fileSize: audioFile.size,
      fileType: audioFile.type
    });
    
    // Make the transcription request with a proper File object
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });
    
    console.log('✅ Transcription successful!', {
      transcriptionLength: transcription.text.length,
      previewText: transcription.text.substring(0, 100) + '...',
      timestamp: new Date().toISOString()
    });
    
    return transcription.text;
  } catch (error) {
    console.error('❌ Error transcribing audio:', error);
    throw error;
  }
};

/**
 * Generate a SOAP note from transcription using AI
 * @param {string} transcriptionText - Transcribed text from session recording
 * @param {Object} templateData - Template data for the SOAP note
 * @param {Object} sessionInfo - Information about the session (body region, etc.)
 * @returns {Promise<Object>} - Generated SOAP note sections
 */
export const generateSOAPNote = async (transcriptionText, templateData, sessionInfo) => {
  if (!openai) {
    throw new Error('AI service not initialized. Please provide an OpenAI API key.');
  }
  
  try {
    const { bodyRegion, sessionType } = sessionInfo;
    
    console.log('🧠 Starting SOAP note generation...', { 
      bodyRegion, 
      sessionType,
      templateName: templateData.name,
      transcriptionLength: transcriptionText.length,
      timestamp: new Date().toISOString()
    });
    
    // Create a well-structured prompt for SOAP note generation
    const systemPrompt = `You are a professional physical therapist creating a SOAP note from a session recording. 

Use the following template structure:
${JSON.stringify(templateData, null, 2)}

Focus on the ${bodyRegion} region for a ${sessionType} session.

EXTRACTION PRIORITIES:
1. MUSCLE TEST DETECTION: Pay special attention to identifying and extracting Manual Muscle Test (MMT) values. Listen for phrases like:
   - "MMT for shoulder flexion is 4/5"
   - "strength in hip abduction measures 4-/5"
   - "knee extension strength is 3+/5 with pain"
   - Properly format extracted values in the 0-5 scale with +/- modifiers and * for pain

2. RANGE OF MOTION VALUES: Listen for and extract all Active (AROM) and Passive (PROM) range of motion values mentioned.
   - Format as "X degrees" or as compared to normal (e.g., "WFL", "75% of normal")
   - Note any painful arcs or restricted movements

Extract relevant information from the transcription and organize it into professional SOAP note format.
- Keep medical terminology precise
- Format measurements with proper units
- Use professional medical abbreviations where appropriate
- Maintain a clinical tone throughout
- ALWAYS RETURN A VALID JSON RESPONSE with the following structure, even if information is minimal:
{
  "subjective": "Patient reported information...",
  "objective": "Measurable findings...",
  "assessment": "Clinical assessment...",
  "plan": "Treatment plan...",
  "billing_suggestions": []
}
- If the information is insufficient, still provide a valid JSON response with placeholders noting what's missing.
- Do not include any patient identifying information

BILLING SUGGESTIONS GUIDE:
- Based on the content of the note, suggest appropriate billing codes
- Consider CPT codes relevant to the session type (evaluation, treatment, re-evaluation)
- For evaluations, distinguish between low, moderate, and high complexity
- Include modifiers when appropriate (e.g., 97110 - Therapeutic Exercise, 97112 - Neuromuscular Re-education)
- Return as an array in the billing_suggestions field

Respond with a JSON object containing the SOAP sections and billing suggestions as separate fields.`;
    
    console.log('📝 Template structure being used:', {
      templateId: templateData.id,
      templateSections: Object.keys(templateData.sections || {})
    });
    
    console.log('📡 Sending request to OpenAI GPT-4...');
    
    console.log('📣 Modified API call to handle JSON correctly');
    
    // Explicitly ask for JSON in the prompt itself rather than using response_format
    const jsonSystemPrompt = systemPrompt + `\n\nIMPORTANT: You must respond with a valid JSON object containing the SOAP note sections. DO NOT include any explanatory text or markdown formatting outside the JSON structure.`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",  // Use GPT-4 for best clinical understanding
      messages: [
        {
          "role": "system",
          "content": jsonSystemPrompt
        },
        {
          "role": "user",
          "content": transcriptionText
        }
      ],
      // Remove response_format which is causing the error
    });
    
    // Parse the response into JSON
    const soapNoteText = completion.choices[0].message.content;
    console.log('📝 Raw SOAP note text from API:', soapNoteText.substring(0, 100) + '...');
    
    // Handle potential JSON formatting issues by extracting JSON portion if needed
    let soapContent = completion.choices[0].message.content;
    
    try {
      // With response_format set to json_object, we should get valid JSON directly
      const soapNote = JSON.parse(soapContent);
      
      // Check if we have some valid data in the SOAP note
      const hasValidData = Object.values(soapNote).some(value => 
        typeof value === 'string' && 
        value.length > 10 && 
        !value.includes("Error parsing AI response") && 
        !value.includes("not enough information")
      );
      
      if (!hasValidData) {
        console.warn('⚠️ AI returned JSON but with insufficient data');
        return {
          subjective: "Insufficient information in recording. Please provide more details about patient subjective reports.",
          objective: "Insufficient information in recording. Please provide more details about objective measurements.",
          assessment: "Insufficient information in recording. Please provide more details for clinical assessment.",
          plan: "Insufficient information in recording. Please provide more details about treatment plan."
        };
      }
      
      console.log('✅ SOAP note generation successful!', {
        sections: Object.keys(soapNote),
        previewSubjective: soapNote.subjective?.substring(0, 50) + '...' || 'N/A',
        responseSize: soapContent.length,
        timestamp: new Date().toISOString()
      });
      
      return soapNote;
    } catch (jsonError) {
      console.error('❌ Error parsing JSON from OpenAI response:', jsonError);
      console.log('Raw response content:', soapContent);
      
      // Check if the response contains an apology or insufficient data message
      if (soapContent.toLowerCase().includes("sorry") || 
          soapContent.toLowerCase().includes("not enough information") ||
          soapContent.toLowerCase().includes("insufficient")) {
        
        return {
          subjective: "Insufficient information in recording. Please provide more patient details and symptoms.",
          objective: "Insufficient information in recording. Please include measurements and observations.",
          assessment: "Insufficient information for assessment. Please describe clinical findings.", 
          plan: "Insufficient information for treatment plan. Please outline therapy approach."
        };
      }
      
      // Generic fallback for other parsing errors
      return {
        subjective: "Error processing AI response. Please try recording with more details about patient symptoms and history.",
        objective: "Error processing AI response. Please include clear measurements and observations in your recording.",
        assessment: "Error processing AI response. Please articulate your clinical assessment more clearly.", 
        plan: "Error processing AI response. Please describe your treatment plan in more detail."
      };
    }
  } catch (error) {
    console.error('❌ Error generating SOAP note:', error);
    throw error;
  }
};

/**
 * Process audio recording and generate SOAP note in one function
 * @param {File|Blob} audioBlob - Audio recording file
 * @param {Object} templateData - Template data for structure
 * @param {Object} sessionInfo - Information about the session
 * @returns {Promise<Object>} - Result object with transcription and SOAP note
 */
/**
 * Process audio recording and generate SOAP note with enhanced features in one function
 * @param {File|Blob} audioBlob - Audio recording file
 * @param {Object} templateData - Template data for structure
 * @param {Object} sessionInfo - Information about the session
 * @returns {Promise<Object>} - Result object with transcription, SOAP note, billing, and muscle tests
 */
export const processRecordingToSOAP = async (audioBlob, templateData, sessionInfo) => {
  console.log('🔄 Starting end-to-end recording processing...', {
    bodyRegion: sessionInfo.bodyRegion,
    sessionType: sessionInfo.sessionType,
    templateName: templateData.name,
    audioSize: audioBlob.size,
    timestamp: new Date().toISOString()
  });
  
  try {
    // First transcribe the audio
    console.log('📊 Step 1/4: Transcribing audio recording...');
    const transcription = await transcribeAudio(audioBlob);
    
    // Analyze for muscle tests and ROM values in parallel with SOAP generation
    console.log('📊 Step 2/4: Analyzing transcription for muscle tests and ROM values...');
    const muscleTestAnalysisPromise = analyzeMuscleTests(transcription, sessionInfo.bodyRegion);
    
    // Generate the SOAP note from the transcription
    console.log('📊 Step 3/4: Generating SOAP note from transcription...');
    const soapNote = await generateSOAPNote(transcription, templateData, sessionInfo);
    
    // Generate billing suggestions based on the SOAP note
    console.log('📊 Step 4/4: Generating billing suggestions...');
    const billingSuggestionsPromise = generateBillingSuggestions(soapNote, sessionInfo);
    
    // Wait for parallel operations to complete
    const [muscleTestResults, billingSuggestions] = await Promise.all([
      muscleTestAnalysisPromise,
      billingSuggestionsPromise
    ]);
    
    // Add the billing suggestions and muscle test data to the SOAP note
    soapNote.billing_suggestions = billingSuggestions;
    soapNote.muscle_tests = muscleTestResults;
    
    // Calculate processing time
    const startTime = new Date().getTime();
    const endTime = new Date().getTime();
    const processingTime = endTime - startTime;
    
    console.log('🎉 Enhanced recording processing complete!', {
      timestamp: new Date().toISOString(),
      processingTime: `${processingTime}ms`,
      muscleTestConfidence: muscleTestResults.confidence,
      billingSuggestionsCount: billingSuggestions.length
    });
    
    return {
      transcription,
      soapNote,
      muscleTests: muscleTestResults,
      billingSuggestions,
      success: true
    };
  } catch (error) {
    console.error('❌ Error in enhanced recording processing pipeline:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Modify or refine an existing SOAP note
 * @param {Object} existingSOAP - Current SOAP note content
 * @param {string} userFeedback - User's feedback or instructions
 * @returns {Promise<Object>} - Updated SOAP note
 */
/**
 * Generate billing code suggestions based on SOAP note content
 * @param {Object} soapNote - The SOAP note content
 * @param {Object} sessionInfo - Session information including type and body region
 * @returns {Promise<Array>} - Array of billing code suggestions
 */
export const generateBillingSuggestions = async (soapNote, sessionInfo) => {
  if (!openai) {
    throw new Error('AI service not initialized. Please provide an OpenAI API key.');
  }
  
  const { bodyRegion, sessionType } = sessionInfo;
  
  try {
    console.log('💵 Generating billing suggestions...', {
      bodyRegion,
      sessionType,
      timestamp: new Date().toISOString()
    });
    
    // Create a prompt focused on billing code analysis
    const systemPrompt = `You are an expert in physical therapy billing and coding. 
    
Analyze the following SOAP note and suggest appropriate billing codes:
${JSON.stringify(soapNote, null, 2)}

This is a ${sessionType} session focusing on the ${bodyRegion} region.

Provide billing code suggestions based on:
1. CPT codes relevant to the session content
2. The appropriate level of evaluation (low, moderate, high complexity)
3. Treatment modalities documented in the note
4. Time-based vs. service-based codes as appropriate

Respond with a JSON array of objects containing:
- code: The CPT or billing code
- description: Brief description of what the code represents
- justification: Brief explanation of why this code is appropriate based on the note content

Example response format:
[
  {
    "code": "97161",
    "description": "PT evaluation: low complexity",
    "justification": "Initial evaluation with limited examination requirements"
  },
  {
    "code": "97110",
    "description": "Therapeutic exercise",
    "justification": "Documented therapeutic exercises for strength training"
  }
]`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          "role": "system",
          "content": systemPrompt
        }
      ],
      response_format: { "type": "json_object" }
    });
    
    const billingSuggestionsText = completion.choices[0].message.content;
    return JSON.parse(billingSuggestionsText);
  } catch (error) {
    console.error('❌ Error generating billing suggestions:', error);
    return [{
      code: "Error",
      description: "Unable to generate billing suggestions",
      justification: "Please try again or consult billing resources"
    }];
  }
};

/**
 * Analyze transcription for specific muscle tests and ROM values
 * @param {string} transcriptionText - Transcribed text to analyze
 * @param {Object} bodyRegion - The body region of focus
 * @returns {Object} - Extracted muscle tests and ROM values
 */
export const analyzeMuscleTests = async (transcriptionText, bodyRegion) => {
  if (!openai) {
    throw new Error('AI service not initialized. Please provide an OpenAI API key.');
  }
  
  try {
    console.log('💪 Analyzing transcription for muscle tests...', {
      bodyRegion,
      transcriptionLength: transcriptionText.length,
      timestamp: new Date().toISOString()
    });
    
    const systemPrompt = `You are an expert physical therapist specializing in manual muscle testing and range of motion assessment.

Analyze the following transcription for any mentions of muscle tests and range of motion values, focusing on the ${bodyRegion} region.

Extract and structure the following information:
1. Manual Muscle Tests (MMT) - Format as muscle: grade (e.g., "Shoulder Flexion: 4/5")
   - Include any modifiers like + or - and * for pain
   - Convert verbal descriptions to numerical values when possible
   - Example: "good strength" → approximately 4/5

2. Range of Motion (ROM) values - Both active (AROM) and passive (PROM)
   - Format as movement: value (e.g., "Shoulder Flexion: 160 degrees")
   - Note any discrepancies between active and passive
   - Convert descriptive terms to estimated values when possible
   - Example: "slightly limited" → approximately 10-20% restriction

Respond with a JSON object containing:
- muscle_tests: Array of detected muscle tests with muscle name and grade
- rom_values: Array of detected ROM values with movement name and measurement
- confidence: Your confidence in these extractions (low, medium, high)

Example response:
{
  "muscle_tests": [
    { "muscle": "Shoulder Flexion", "grade": "4/5", "side": "right" },
    { "muscle": "Elbow Extension", "grade": "4+/5*", "side": "left" }
  ],
  "rom_values": [
    { "movement": "Shoulder Flexion", "arom": "160 degrees", "prom": "170 degrees", "side": "right" },
    { "movement": "Shoulder External Rotation", "arom": "WFL", "prom": "WFL", "side": "left" }
  ],
  "confidence": "medium"
}`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          "role": "system",
          "content": systemPrompt
        },
        {
          "role": "user",
          "content": transcriptionText
        }
      ],
      response_format: { "type": "json_object" }
    });
    
    const analysisText = completion.choices[0].message.content;
    return JSON.parse(analysisText);
  } catch (error) {
    console.error('❌ Error analyzing muscle tests:', error);
    return {
      muscle_tests: [],
      rom_values: [],
      confidence: "error",
      error: error.message
    };
  }
};

/**
 * Modify or refine an existing SOAP note
 * @param {Object} existingSOAP - Current SOAP note content
 * @param {string} userFeedback - User's feedback or instructions
 * @returns {Promise<Object>} - Updated SOAP note
 */
export const refineSOAPNote = async (existingSOAP, userFeedback) => {
  if (!openai) {
    throw new Error('AI service not initialized. Please provide an OpenAI API key.');
  }
  
  try {
    const systemPrompt = `You are a professional physical therapist refining a SOAP note. 

Here is the current SOAP note:
${JSON.stringify(existingSOAP, null, 2)}

Please modify the SOAP note based on the user's feedback while maintaining professional medical standards.

Respond with a JSON object containing the updated SOAP sections as separate fields.`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          "role": "system",
          "content": systemPrompt
        },
        {
          "role": "user",
          "content": userFeedback
        }
      ],
      response_format: { "type": "json_object" }
    });
    
    const refinedSOAPNoteText = completion.choices[0].message.content;
    return JSON.parse(refinedSOAPNoteText);
  } catch (error) {
    console.error('Error refining SOAP note:', error);
    throw error;
  }
};
