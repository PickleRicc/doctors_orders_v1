/**
 * AI service for the PT SOAP Generator application
 * Handles transcription of audio recordings and generation of SOAP notes
 * Uses OpenAI API for transcription (Whisper) and text generation
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
  "plan": "Treatment plan..."
}
- If the information is insufficient, still provide a valid JSON response with placeholders noting what's missing.
- Do not include any patient identifying information

Respond with a JSON object containing the SOAP sections as separate fields.`;
    
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
    console.log('📊 Step 1/2: Transcribing audio recording...');
    const transcription = await transcribeAudio(audioBlob);
    
    // Then generate the SOAP note from the transcription
    console.log('📊 Step 2/2: Generating SOAP note from transcription...');
    const soapNote = await generateSOAPNote(transcription, templateData, sessionInfo);
    
    console.log('🎉 Recording processing complete! Pipeline successful.', {
      timestamp: new Date().toISOString(),
      processingTime: `${new Date().getTime() - new Date().getTime()}ms`
    });
    
    return {
      transcription,
      soapNote,
      success: true
    };
  } catch (error) {
    console.error('❌ Error in recording processing pipeline:', error);
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
