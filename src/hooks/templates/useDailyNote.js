/**
 * Daily Note Template Hook
 * Universal template for routine follow-up visits
 * Not body-part specific - works for all patient types
 */

export const useDailyNote = () => {
  const templateConfig = {
    id: 'daily-note',
    name: 'Daily Note',
    description: 'Routine follow-up visit documentation',
    category: 'universal',
    
    schema: {
      subjective: {
        type: 'wysiwyg',
        label: 'Subjective',
        placeholder: 'Patient reports, symptoms, progress since last visit, pain levels, functional changes...'
      },
      objective: {
        type: 'composite',
        label: 'Objective',
        fields: {
          observations: {
            type: 'wysiwyg',
            label: 'Observations',
            placeholder: 'Clinical observations, gait, posture, movement quality...'
          },
          measurements: {
            type: 'table',
            label: 'Measurements',
            headers: ['Test/Measurement', 'Result', 'Notes'],
            rows: []
          }
        }
      },
      assessment: {
        type: 'composite',
        label: 'Assessment',
        fields: {
          clinical_impression: {
            type: 'wysiwyg',
            label: 'Clinical Impression',
            placeholder: 'Progress assessment, response to treatment, functional improvements...'
          },
          short_term_goals: {
            type: 'list',
            label: 'Short Term Goals (2-4 weeks)',
            items: []
          },
          long_term_goals: {
            type: 'list',
            label: 'Long Term Goals (6-12 weeks)',
            items: []
          }
        }
      },
      plan: {
        type: 'composite',
        label: 'Plan',
        fields: {
          interventions: {
            type: 'wysiwyg',
            label: 'Interventions',
            placeholder: 'Treatment provided today, exercises, modalities, manual therapy...'
          },
          home_program: {
            type: 'wysiwyg',
            label: 'Home Exercise Program',
            placeholder: 'Home exercises, activity modifications, self-care instructions...'
          },
          frequency: {
            type: 'wysiwyg',
            label: 'Treatment Frequency',
            placeholder: 'Recommended frequency and duration of continued care...'
          }
        }
      }
    },

    aiPrompt: `You are a physical therapy documentation assistant. Generate a comprehensive Daily Note based on the provided transcript.

IMPORTANT: Return ONLY valid JSON matching this exact structure:

{
  "subjective": "Patient's reported symptoms, progress, and concerns",
  "objective": {
    "observations": "Clinical observations and findings",
    "measurements": [
      {"test": "Test name", "result": "Result", "notes": "Notes"}
    ]
  },
  "assessment": {
    "clinical_impression": {
      "content": "Progress assessment and clinical reasoning"
    },
    "short_term_goals": {
      "items": ["Goal 1", "Goal 2"]
    },
    "long_term_goals": {
      "items": ["Goal 1", "Goal 2"]
    }
  },
  "plan": {
    "interventions": {
      "content": "Treatment provided today"
    },
    "home_program": {
      "content": "Home exercise program"
    },
    "frequency": {
      "content": "Recommended treatment frequency"
    }
  }
}

Guidelines:
- Focus on progress since last visit
- Document response to treatment
- Update goals if needed
- Be concise but thorough
- Use professional PT terminology
- Include objective measurements when mentioned`
  };

  const generateSOAP = async (transcript, aiService) => {
    if (!transcript || !aiService) {
      return {
        success: false,
        error: 'Transcript and AI service are required'
      };
    }

    try {
      // Build the full prompt with transcript
      const fullPrompt = `${templateConfig.aiPrompt}\n\nTRANSCRIPT:\n${transcript}`;
      
      // Call AI service with the prompt
      const response = await aiService.generateCompletion(fullPrompt, {
        temperature: 0.3,
        max_tokens: 2000
      });

      // Parse the AI response
      let soapData;
      try {
        soapData = JSON.parse(response);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        return {
          success: false,
          error: 'AI returned invalid JSON response'
        };
      }

      // Merge with schema structure to ensure all required fields exist
      const schema = templateConfig.schema;
      const structuredSOAP = {
        subjective: {
          ...schema.subjective,
          content: soapData.subjective || ''
        },
        objective: {
          ...schema.objective,
          fields: {
            observations: {
              ...schema.objective.fields.observations,
              content: soapData.objective?.observations || ''
            },
            measurements: {
              ...schema.objective.fields.measurements,
              rows: soapData.objective?.measurements || []
            }
          }
        },
        assessment: {
          ...schema.assessment,
          fields: {
            clinical_impression: {
              ...schema.assessment.fields.clinical_impression,
              content: soapData.assessment?.clinical_impression?.content || ''
            },
            short_term_goals: {
              ...schema.assessment.fields.short_term_goals,
              items: soapData.assessment?.short_term_goals?.items || []
            },
            long_term_goals: {
              ...schema.assessment.fields.long_term_goals,
              items: soapData.assessment?.long_term_goals?.items || []
            }
          }
        },
        plan: {
          ...schema.plan,
          fields: {
            interventions: {
              ...schema.plan.fields.interventions,
              content: soapData.plan?.interventions?.content || ''
            },
            home_program: {
              ...schema.plan.fields.home_program,
              content: soapData.plan?.home_program?.content || ''
            },
            frequency: {
              ...schema.plan.fields.frequency,
              content: soapData.plan?.frequency?.content || ''
            }
          }
        }
      };

      console.log('✅ Daily Note SOAP generated successfully');

      return {
        success: true,
        data: structuredSOAP
      };

    } catch (error) {
      console.error('Error generating Daily Note:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  return {
    templateConfig,
    generateSOAP,
    schema: templateConfig.schema
  };
};

export default useDailyNote;
