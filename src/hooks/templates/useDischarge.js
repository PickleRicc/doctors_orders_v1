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
          goals_achieved: {
            type: 'list',
            label: 'Goals Achieved',
            items: []
          },
          goals_partially_met: {
            type: 'list',
            label: 'Goals Partially Met',
            items: []
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
    try {
      const result = await aiService.generateStructuredNote(
        transcript,
        templateConfig.aiPrompt,
        templateConfig.schema
      );
      return result;
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
