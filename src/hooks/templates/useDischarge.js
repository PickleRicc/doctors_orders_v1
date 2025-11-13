/**
 * Discharge Note Template Hook
 * Universal template for patient discharge documentation
 * Not body-part specific - works for all patient types
 */

export const useDischarge = () => {
  const templateConfig = {
    id: 'discharge',
    name: 'Discharge Note',
    description: 'Final visit and discharge summary',
    category: 'universal',
    
    schema: {
      subjective: {
        type: 'wysiwyg',
        label: 'Subjective',
        placeholder: 'Patient reports at discharge, final symptoms, functional status, satisfaction with care...'
      },
      objective: {
        type: 'composite',
        label: 'Objective',
        fields: {
          observations: {
            type: 'wysiwyg',
            label: 'Final Observations',
            placeholder: 'Final clinical observations, functional abilities...'
          },
          measurements: {
            type: 'table',
            label: 'Discharge Measurements',
            headers: ['Test/Measurement', 'Initial', 'Discharge', 'Change'],
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
            label: 'Discharge Summary',
            placeholder: 'Overall progress, goal achievement, functional outcomes, reason for discharge...'
          },
          medical_necessity: {
            type: 'wysiwyg',
            label: 'Medical Necessity',
            placeholder: 'Why discharge is appropriate: goals met, independent with HEP, no longer needs skilled PT...'
          },
          goals_achieved: {
            type: 'list',
            label: 'Goals Achieved',
            items: [],
            placeholder: 'SMART goals that were successfully met (with baseline and discharge measurements)'
          },
          goals_partially_met: {
            type: 'list',
            label: 'Goals Partially Met',
            items: [],
            placeholder: 'SMART goals with partial progress (document what was achieved)'
          }
        }
      },
      plan: {
        type: 'composite',
        label: 'Plan',
        fields: {
          discharge_instructions: {
            type: 'wysiwyg',
            label: 'Discharge Instructions',
            placeholder: 'Home exercise program, activity guidelines, precautions, return to sport/work recommendations...'
          },
          follow_up: {
            type: 'wysiwyg',
            label: 'Follow-Up Recommendations',
            placeholder: 'Return to PT if needed, physician follow-up, maintenance program...'
          },
          prognosis: {
            type: 'wysiwyg',
            label: 'Long-Term Prognosis',
            placeholder: 'Expected long-term outcomes, risk factors, prevention strategies...'
          }
        }
      },
      billing: {
        type: 'composite',
        label: 'Billing',
        fields: {
          cpt_codes: {
            type: 'list',
            label: 'CPT Codes',
            items: [],
            placeholder: 'CPT codes for final session'
          },
          units: {
            type: 'wysiwyg',
            label: 'Units',
            placeholder: 'Time-based units (1 unit = 15 min)'
          },
          icd10_codes: {
            type: 'list',
            label: 'ICD-10 Codes',
            items: [],
            placeholder: 'ICD-10 diagnosis codes'
          }
        }
      }
    },

    aiPrompt: `You are a physical therapy documentation assistant. Generate a comprehensive Discharge Note based on the provided transcript.

IMPORTANT: Return ONLY valid JSON matching this exact structure:

{
  "subjective": "Patient's final reported status and satisfaction",
  "objective": {
    "observations": "Final clinical observations",
    "measurements": [
      {"test": "Test name", "initial": "Initial value", "discharge": "Discharge value", "change": "Change/improvement"}
    ]
  },
  "assessment": {
    "clinical_impression": {
      "content": "Discharge summary and overall progress"
    },
    "goals_achieved": {
      "items": ["Goal 1", "Goal 2"]
    },
    "goals_partially_met": {
      "items": ["Goal 1", "Goal 2"]
    }
  },
  "plan": {
    "discharge_instructions": {
      "content": "Home program and activity guidelines"
    },
    "follow_up": {
      "content": "Follow-up recommendations"
    },
    "prognosis": {
      "content": "Long-term prognosis and prevention"
    }
  }
}

Guidelines:
- Summarize entire episode of care
- Compare initial to discharge status
- Document goal achievement
- Provide clear discharge instructions
- Include prevention strategies
- Use professional PT terminology
- Be thorough and comprehensive`
  };

  const generateSOAP = async (transcript, aiService) => {
    if (!transcript || !aiService) {
      return {
        success: false,
        error: 'Transcript and AI service are required'
      };
    }

    try {
      // Build the full prompt with transcript and privacy instructions
      const fullPrompt = `${templateConfig.aiPrompt}

CRITICAL PRIVACY INSTRUCTION:
**NEVER include patient names or identifiers in the note. ALWAYS use "patient" or "the patient" instead of names.**
If the transcript says "John reports..." or "Mrs. Smith states...", write "Patient reports..." or "The patient states..."

INSTRUCTIONS:
1. Document goals achieved using SMART format with baseline and discharge measurements
2. Explain why discharge is appropriate (medical necessity for ending care)
3. Suggest appropriate billing codes for final session
4. Use professional terminology

TRANSCRIPT:
${transcript}`;
      
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
            medical_necessity: {
              ...schema.assessment.fields.medical_necessity,
              content: soapData.assessment?.medical_necessity?.content || ''
            },
            goals_achieved: {
              ...schema.assessment.fields.goals_achieved,
              items: soapData.assessment?.goals_achieved?.items || []
            },
            goals_partially_met: {
              ...schema.assessment.fields.goals_partially_met,
              items: soapData.assessment?.goals_partially_met?.items || []
            }
          }
        },
        plan: {
          ...schema.plan,
          fields: {
            discharge_instructions: {
              ...schema.plan.fields.discharge_instructions,
              content: soapData.plan?.discharge_instructions?.content || ''
            },
            follow_up: {
              ...schema.plan.fields.follow_up,
              content: soapData.plan?.follow_up?.content || ''
            },
            prognosis: {
              ...schema.plan.fields.prognosis,
              content: soapData.plan?.prognosis?.content || ''
            }
          }
        },
        billing: {
          ...schema.billing,
          fields: {
            cpt_codes: {
              ...schema.billing.fields.cpt_codes,
              items: soapData.billing?.cpt_codes || []
            },
            units: {
              ...schema.billing.fields.units,
              content: soapData.billing?.units || ''
            },
            icd10_codes: {
              ...schema.billing.fields.icd10_codes,
              items: soapData.billing?.icd10_codes || []
            }
          }
        }
      };

      console.log('✅ Discharge Note SOAP generated successfully');

      return {
        success: true,
        data: structuredSOAP
      };

    } catch (error) {
      console.error('Error generating Discharge Note:', error);
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

export default useDischarge;
