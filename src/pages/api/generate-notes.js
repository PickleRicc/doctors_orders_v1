import { supabase } from '@/lib/supabase';
import { initializeAI, getOpenAIClient } from '@/services/aiClient';

/**
 * Simplified Notes Generation API
 * Following the generation guide approach:
 * 1. Fetch template with structured_data
 * 2. Prompt LLM to fill the schema
 * 3. Save filled JSON to sessions.structured_notes
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize OpenAI client with API key from environment
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured' 
      });
    }
    
    try {
      initializeAI(apiKey);
    } catch (initError) {
      return res.status(500).json({ 
        error: 'Failed to initialize AI service',
        details: initError.message 
      });
    }

    const { sessionId, transcript, templateId, templateData } = req.body;

    if (!sessionId || !transcript || (!templateId && !templateData)) {
      return res.status(400).json({ 
        error: 'Missing required fields: sessionId, transcript, and either templateId or templateData' 
      });
    }

    console.log('🎯 Generate Notes API: Starting generation', {
      sessionId,
      templateId: templateId || 'fallback',
      hasTemplateData: !!templateData,
      transcriptLength: transcript.length
    });

    let template;
    
    if (templateData) {
      // Use provided template data (for fallback templates)
      template = templateData;
      console.log('📋 Using provided template data', {
        templateName: template.name,
        hasStructuredData: !!template.structured_data
      });
    } else {
      // Step 1: Fetch the template with structured_data from database
      const { data: fetchedTemplate, error: templateError } = await supabase
        .from('templates')
        .select('*')
        .eq('template_key', templateId)
        .single();

      if (templateError || !fetchedTemplate) {
        return res.status(404).json({ 
          error: 'Template not found',
          details: templateError?.message 
        });
      }
      
      template = fetchedTemplate;
      console.log('📋 Template fetched from database', {
        templateName: template.name,
        hasStructuredData: !!template.structured_data
      });
    }

    // Step 2: Parse the structured_data schema
    let structuredSchema;
    try {
      structuredSchema = typeof template.structured_data === 'string' 
        ? JSON.parse(template.structured_data)
        : template.structured_data;
    } catch (parseError) {
      return res.status(500).json({ 
        error: 'Invalid template structured data',
        details: parseError.message 
      });
    }

    // Step 3: Create LLM prompt to fill the schema
    const prompt = `Based on this physical therapy transcript, fill the JSON schema by replacing placeholders with extracted values.

TRANSCRIPT:
${transcript}

TEMPLATE SCHEMA:
${JSON.stringify(structuredSchema, null, 2)}

INSTRUCTIONS:
- Extract relevant information from the transcript
- Replace template variables ({{variable_name}}) with actual extracted values
- Use "Not assessed" for missing values
- Maintain the exact JSON structure
- Output ONLY the filled JSON, no explanations

FILLED JSON:`;

    // Step 4: Call LLM to fill the schema
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a physical therapy documentation assistant. Fill JSON schemas with extracted transcript data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.1
    });

    const llmResponse = completion.choices[0]?.message?.content?.trim();
    
    if (!llmResponse) {
      return res.status(500).json({ error: 'No response from LLM' });
    }

    // Step 5: Parse and validate LLM output
    let filledStructuredData;
    try {
      filledStructuredData = JSON.parse(llmResponse);
      console.log('✅ LLM generated valid JSON', {
        keys: Object.keys(filledStructuredData)
      });
    } catch (jsonError) {
      console.error('❌ LLM JSON parse error:', jsonError.message);
      console.error('LLM Response:', llmResponse);
      
      // Fallback: return the schema with "Not assessed" values
      filledStructuredData = fillSchemaWithDefaults(structuredSchema);
    }

    // Step 6: Save filled JSON to sessions.structured_notes
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ 
        structured_notes: filledStructuredData,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (updateError) {
      return res.status(500).json({ 
        error: 'Failed to save structured notes',
        details: updateError.message 
      });
    }

    console.log('💾 Structured notes saved to session', { sessionId });

    return res.status(200).json({
      success: true,
      sessionId,
      structuredNotes: filledStructuredData,
      message: 'Structured notes generated and saved successfully'
    });

  } catch (error) {
    console.error('❌ Generate Notes API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

/**
 * Fallback function to fill schema with default values
 */
function fillSchemaWithDefaults(schema) {
  if (typeof schema !== 'object' || schema === null) {
    return 'Not assessed';
  }

  if (Array.isArray(schema)) {
    return schema.map(item => fillSchemaWithDefaults(item));
  }

  const filled = {};
  for (const [key, value] of Object.entries(schema)) {
    if (typeof value === 'string' && value.includes('{{')) {
      filled[key] = 'Not assessed';
    } else if (typeof value === 'object') {
      filled[key] = fillSchemaWithDefaults(value);
    } else {
      filled[key] = value;
    }
  }
  return filled;
}
