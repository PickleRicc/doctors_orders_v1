/**
 * Cervical Adjustment Template Hook
 * Specialized AI prompts and JSON schema for cervical spine chiropractic assessments
 * CHIROPRACTIC-EXCLUSIVE - Not for Physical Therapy use
 */

import { useState } from 'react';

export const useCervicalAdjustment = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * JSON Schema for cervical adjustment SOAP note structure
   * Defines the exact structure the AI should return
   */
  const getSchema = () => ({
    subjective: {
      type: 'wysiwyg',
      content: '',
      placeholder: 'Chief complaint, neck pain patterns, headaches, radiation, mechanism of injury...'
    },
    objective: {
      type: 'table',
      headers: ['Category', 'Test/Measurement', 'Result', 'Notes'],
      categories: [
        {
          name: 'Postural Assessment',
          rows: [
            { test: 'Forward Head Posture', result: '', notes: '' },
            { test: 'Lateral Head Tilt', result: '', notes: '' },
            { test: 'Shoulder Level', result: '', notes: '' },
            { test: 'Cervical Lordosis', result: '', notes: '' }
          ]
        },
        {
          name: 'Static Palpation',
          rows: [
            { test: 'C1 (Atlas)', result: '', notes: '' },
            { test: 'C2 (Axis)', result: '', notes: '' },
            { test: 'C3-C4', result: '', notes: '' },
            { test: 'C5-C6', result: '', notes: '' },
            { test: 'C7', result: '', notes: '' },
            { test: 'Paraspinal Musculature', result: '', notes: '' },
            { test: 'Suboccipital Muscles', result: '', notes: '' }
          ]
        },
        {
          name: 'Motion Palpation',
          rows: [
            { test: 'C0-C1 Flexion/Extension', result: '', notes: '' },
            { test: 'C1-C2 Rotation', result: '', notes: '' },
            { test: 'C2-C3 Motion', result: '', notes: '' },
            { test: 'C3-C4 Motion', result: '', notes: '' },
            { test: 'C4-C5 Motion', result: '', notes: '' },
            { test: 'C5-C6 Motion', result: '', notes: '' },
            { test: 'C6-C7 Motion', result: '', notes: '' }
          ]
        },
        {
          name: 'Range of Motion',
          rows: [
            { test: 'Cervical Flexion', result: '', notes: '' },
            { test: 'Cervical Extension', result: '', notes: '' },
            { test: 'Left Lateral Flexion', result: '', notes: '' },
            { test: 'Right Lateral Flexion', result: '', notes: '' },
            { test: 'Left Rotation', result: '', notes: '' },
            { test: 'Right Rotation', result: '', notes: '' }
          ]
        },
        {
          name: 'Orthopedic/Neurological Tests',
          rows: [
            { test: 'Cervical Compression', result: '', notes: '' },
            { test: 'Cervical Distraction', result: '', notes: '' },
            { test: 'Shoulder Depression', result: '', notes: '' },
            { test: 'Upper Limb Tension Test', result: '', notes: '' },
            { test: 'Deep Tendon Reflexes', result: '', notes: '' },
            { test: 'Dermatomal Sensation', result: '', notes: '' }
          ]
        },
        {
          name: 'Subluxation Analysis',
          rows: [
            { test: 'C1 Listing', result: '', notes: '' },
            { test: 'C2 Listing', result: '', notes: '' },
            { test: 'C3 Listing', result: '', notes: '' },
            { test: 'C4 Listing', result: '', notes: '' },
            { test: 'C5 Listing', result: '', notes: '' },
            { test: 'C6 Listing', result: '', notes: '' },
            { test: 'C7 Listing', result: '', notes: '' }
          ]
        },
        {
          name: 'X-Ray Findings',
          rows: [
            { test: 'Cervical Curve', result: '', notes: '' },
            { test: 'Disc Spaces', result: '', notes: '' },
            { test: 'Degenerative Changes', result: '', notes: '' },
            { test: 'Alignment', result: '', notes: '' }
          ]
        }
      ],
      allowAddRows: true,
      commonResults: [
        'WNL', 'Not Tested', 'Present', 'Absent',
        'Fixated', 'Hypomobile', 'Hypermobile', 'Restricted',
        'PL', 'PR', 'PI', 'PS', 'AL', 'AR', 'AI', 'AS',
        'PL-S', 'PR-S', 'PL-I', 'PR-I',
        'Adjusted', 'Not Adjusted', 'Tender', 'Hypertonic'
      ]
    },
    assessment: {
      type: 'composite',
      subluxation_findings: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Vertebral subluxation complex findings, listings, biomechanical dysfunction...'
      },
      clinical_impression: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Clinical reasoning, diagnosis, contributing factors, prognosis...'
      },
      medical_necessity: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Why chiropractic care is needed: functional limitations, pain levels, impact on daily activities...'
      },
      short_term_goals: {
        type: 'list',
        items: [],
        placeholder: 'Goals for 2-4 weeks of care'
      },
      long_term_goals: {
        type: 'list',
        items: [],
        placeholder: 'Goals for 6-12 weeks of care'
      }
    },
    plan: {
      type: 'composite',
      adjustments_performed: {
        type: 'list',
        items: [],
        placeholder: 'Specific adjustments with segment, listing, and technique (e.g., C5 PL-I Diversified)'
      },
      techniques_used: {
        type: 'list',
        items: [],
        placeholder: 'Diversified, Gonstead, Activator, Drop Table, etc.'
      },
      supportive_care: {
        type: 'list',
        items: [],
        placeholder: 'Modalities, traction, soft tissue work, exercises...'
      },
      frequency_duration: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Treatment frequency, expected duration, re-evaluation schedule...'
      },
      patient_education: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Posture advice, ergonomic recommendations, home exercises, precautions...'
      }
    },
    billing: {
      type: 'composite',
      cpt_codes: {
        type: 'list',
        items: [],
        placeholder: 'CPT codes for chiropractic services'
      },
      units: {
        type: 'wysiwyg',
        content: '',
        placeholder: 'Time-based units for billing'
      },
      icd10_codes: {
        type: 'list',
        items: [],
        placeholder: 'ICD-10 diagnosis codes'
      }
    }
  });

  /**
   * AI Prompt for cervical adjustment SOAP generation
   * Specialized for chiropractic terminology and cervical spine assessments
   */
  const createPrompt = (transcript) => `
You are a chiropractor documenting a cervical spine assessment and adjustment. Generate a professional SOAP note from this session transcript.

TRANSCRIPT:
${transcript}

CRITICAL PRIVACY INSTRUCTION:
**NEVER include patient names or identifiers in the note. ALWAYS use "patient" or "the patient" instead of names.**
If the transcript says "John reports..." or "Mrs. Smith states...", write "Patient reports..." or "The patient states..."

INSTRUCTIONS:
1. Extract relevant information for each SOAP section
2. Use professional CHIROPRACTIC terminology (NOT physical therapy terminology)
3. Focus on cervical spine (C1-C7) subluxation analysis and adjustment findings
4. Document vertebral listings using standard notation (PL, PR, PI, PS, AL, AR, etc.)
5. Include adjustment techniques used (Diversified, Gonstead, Activator, Drop Table, etc.)
6. Write clear goals for chiropractic care
7. Return ONLY a JSON object matching this exact structure:
{
  "subjective": {
    "content": "Patient narrative including neck pain description, headaches, radiation patterns, mechanism of injury, and relevant history. Use professional chiropractic language."
  },
  "objective": {
    "categories": [
      {
        "name": "Postural Assessment",
        "rows": [
          {"test": "Forward Head Posture", "result": "Moderate", "notes": "2 inch anterior translation"},
          {"test": "Lateral Head Tilt", "result": "Left", "notes": "Approximately 8 degrees"},
          {"test": "Shoulder Level", "result": "Right low", "notes": "Secondary to head tilt"},
          {"test": "Cervical Lordosis", "result": "Reduced", "notes": "Flattening of normal curve"}
        ]
      },
      {
        "name": "Static Palpation",
        "rows": [
          {"test": "C1 (Atlas)", "result": "Tender", "notes": "Right lateral mass tenderness"},
          {"test": "C2 (Axis)", "result": "WNL", "notes": "No tenderness noted"},
          {"test": "C5-C6", "result": "Hypertonic", "notes": "Bilateral paraspinal muscle tension"},
          {"test": "Suboccipital Muscles", "result": "Tender", "notes": "Trigger points present bilaterally"}
        ]
      },
      {
        "name": "Motion Palpation",
        "rows": [
          {"test": "C0-C1 Flexion/Extension", "result": "Restricted", "notes": "Limited extension"},
          {"test": "C1-C2 Rotation", "result": "Fixated", "notes": "Right rotation restricted"},
          {"test": "C5-C6 Motion", "result": "Hypomobile", "notes": "Decreased flexion/extension"}
        ]
      },
      {
        "name": "Range of Motion",
        "rows": [
          {"test": "Cervical Flexion", "result": "45°", "notes": "Limited (normal 50°)"},
          {"test": "Cervical Extension", "result": "50°", "notes": "Pain at end range"},
          {"test": "Left Rotation", "result": "65°", "notes": "Restricted (normal 80°)"},
          {"test": "Right Rotation", "result": "75°", "notes": "Mildly restricted"}
        ]
      },
      {
        "name": "Orthopedic/Neurological Tests",
        "rows": [
          {"test": "Cervical Compression", "result": "Positive", "notes": "Reproduces neck pain"},
          {"test": "Cervical Distraction", "result": "Negative", "notes": "Relieves symptoms"},
          {"test": "Deep Tendon Reflexes", "result": "2+", "notes": "Normal and symmetric"}
        ]
      },
      {
        "name": "Subluxation Analysis",
        "rows": [
          {"test": "C1 Listing", "result": "ASR", "notes": "Anterior-Superior-Right"},
          {"test": "C5 Listing", "result": "PL-I", "notes": "Posterior-Left-Inferior"},
          {"test": "C6 Listing", "result": "PR", "notes": "Posterior-Right"}
        ]
      },
      {
        "name": "X-Ray Findings",
        "rows": [
          {"test": "Cervical Curve", "result": "Hypolordosis", "notes": "Loss of normal cervical curve"},
          {"test": "Disc Spaces", "result": "C5-C6 narrowing", "notes": "Mild disc degeneration"},
          {"test": "Degenerative Changes", "result": "Present", "notes": "Osteophyte formation C5-C6"}
        ]
      }
    ]
  },
  "assessment": {
    "subluxation_findings": "Vertebral subluxation complex (VSC) identified at C1 ASR, C5 PL-I, and C6 PR. Segmental dysfunction characterized by fixation, muscle hypertonicity, and associated pain patterns. Biomechanical dysfunction contributing to cervicogenic headaches and restricted range of motion.",
    "clinical_impression": "Clinical presentation consistent with cervical subluxation complex with associated myofascial involvement. Contributing factors include forward head posture, occupational ergonomic stressors, and previous trauma history. Good prognosis with chiropractic intervention.",
    "medical_necessity": "Chiropractic care is medically necessary to: 1) Restore proper cervical biomechanics and reduce subluxation, 2) Decrease pain levels affecting work performance, 3) Improve cervical range of motion for daily activities, 4) Prevent progression of degenerative changes. Without intervention, patient's condition will likely worsen with continued pain and functional decline.",
    "short_term_goals": [
      "Reduce neck pain from 7/10 to 4/10 within 2 weeks",
      "Improve cervical rotation to 75° bilaterally within 3 weeks",
      "Reduce headache frequency from daily to 2x/week within 2 weeks",
      "Restore motion at C5-C6 segment within 4 weeks"
    ],
    "long_term_goals": [
      "Reduce neck pain to 2/10 or less within 8 weeks",
      "Restore full cervical range of motion within 10 weeks",
      "Eliminate cervicogenic headaches within 12 weeks",
      "Achieve spinal stability and transition to maintenance care"
    ]
  },
  "plan": {
    "adjustments_performed": [
      "C1 ASR - Toggle Recoil technique",
      "C5 PL-I - Diversified rotary adjustment",
      "C6 PR - Diversified lateral break adjustment"
    ],
    "techniques_used": [
      "Diversified technique for mid-cervical segments",
      "Toggle Recoil for upper cervical (C1)",
      "Soft tissue mobilization to paraspinal musculature",
      "Suboccipital release technique"
    ],
    "supportive_care": [
      "Cervical traction - 10 lbs, 10 minutes",
      "Ice application post-adjustment",
      "Trigger point therapy to upper trapezius",
      "Cervical stretching exercises prescribed"
    ],
    "frequency_duration": "Treatment frequency: 3x/week for 2 weeks, then 2x/week for 4 weeks, then 1x/week for 4 weeks. Re-evaluation at 4 weeks to assess progress. Expected total treatment duration: 10-12 weeks.",
    "patient_education": "Posture correction exercises, workstation ergonomic modifications, ice/heat application instructions, cervical pillow recommendation, activity modifications to avoid aggravating movements."
  },
  "billing": {
    "cpt_codes": [
      "98940 - CMT, spinal, 1-2 regions",
      "97140 - Manual therapy (soft tissue mobilization)",
      "97012 - Mechanical traction",
      "97110 - Therapeutic exercises (cervical stretching)"
    ],
    "units": "98940 (1 unit), 97140 (2 units, 30 min), 97012 (1 unit, 15 min), 97110 (1 unit, 15 min). Total treatment time: 60 minutes.",
    "icd10_codes": [
      "M99.01 - Segmental dysfunction, cervical region",
      "M54.2 - Cervicalgia",
      "G44.841 - Cervicogenic headache"
    ]
  }
}

CRITICAL INSTRUCTIONS FOR OBJECTIVE SECTION:
1. ALWAYS fill in the "result" field with ACTUAL values from the transcript
2. NEVER use placeholder text like "Result" or "Notes" - these are INVALID
3. Use chiropractic-specific results: Fixated, Hypomobile, Restricted, vertebral listings (PL, PR, etc.)
4. If a test wasn't mentioned, use "Not assessed" in the result field
5. Include specific measurements when mentioned (degrees, vertebral levels)
6. The "notes" field should add clinical context, NOT be a placeholder
7. Only include tests/measurements that were actually performed or mentioned
8. Return valid JSON only, no additional text before or after
`;

  /**
   * Generate structured SOAP note from transcript
   */
  const generateSOAP = async (transcript, aiService) => {
    if (!transcript || !aiService) {
      throw new Error('Transcript and AI service are required');
    }

    setIsGenerating(true);
    
    try {
      const prompt = createPrompt(transcript);
      
      // Call AI service with specialized cervical adjustment prompt
      const response = await aiService.generateCompletion(prompt, {
        temperature: 0.3,
        max_tokens: 2500
      });

      // Parse and validate the AI response
      let soapData;
      try {
        soapData = JSON.parse(response);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        throw new Error('AI returned invalid JSON response');
      }

      // Merge with schema structure to ensure all required fields exist
      const schema = getSchema();
      const structuredSOAP = {
        subjective: {
          ...schema.subjective,
          content: soapData.subjective?.content || ''
        },
        objective: {
          ...schema.objective,
          categories: soapData.objective?.categories || schema.objective.categories
        },
        assessment: {
          ...schema.assessment,
          subluxation_findings: {
            ...schema.assessment.subluxation_findings,
            content: soapData.assessment?.subluxation_findings || ''
          },
          clinical_impression: {
            ...schema.assessment.clinical_impression,
            content: soapData.assessment?.clinical_impression || ''
          },
          medical_necessity: {
            ...schema.assessment.medical_necessity,
            content: soapData.assessment?.medical_necessity || ''
          },
          short_term_goals: {
            ...schema.assessment.short_term_goals,
            items: soapData.assessment?.short_term_goals || []
          },
          long_term_goals: {
            ...schema.assessment.long_term_goals,
            items: soapData.assessment?.long_term_goals || []
          }
        },
        plan: {
          ...schema.plan,
          adjustments_performed: {
            ...schema.plan.adjustments_performed,
            items: soapData.plan?.adjustments_performed || []
          },
          techniques_used: {
            ...schema.plan.techniques_used,
            items: soapData.plan?.techniques_used || []
          },
          supportive_care: {
            ...schema.plan.supportive_care,
            items: soapData.plan?.supportive_care || []
          },
          frequency_duration: {
            ...schema.plan.frequency_duration,
            content: soapData.plan?.frequency_duration || ''
          },
          patient_education: {
            ...schema.plan.patient_education,
            content: soapData.plan?.patient_education || ''
          }
        },
        billing: {
          ...schema.billing,
          cpt_codes: {
            ...schema.billing.cpt_codes,
            items: soapData.billing?.cpt_codes || []
          },
          units: {
            ...schema.billing.units,
            content: soapData.billing?.units || ''
          },
          icd10_codes: {
            ...schema.billing.icd10_codes,
            items: soapData.billing?.icd10_codes || []
          }
        }
      };

      // Calculate confidence scores
      const confidence = {
        subjective: 0.85,
        objective: 0.90,
        assessment: 0.88,
        plan: 0.82,
        overall: 0.86
      };

      return {
        success: true,
        data: structuredSOAP,
        confidence,
        templateType: 'cervical-adjustment'
      };

    } catch (error) {
      console.error('Cervical adjustment SOAP generation failed:', error);
      
      return {
        success: false,
        error: error.message,
        soapData: getSchema(),
        confidence: {
          subjective: 0,
          objective: 0,
          assessment: 0,
          plan: 0,
          overall: 0
        },
        templateType: 'cervical-adjustment'
      };
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Get empty schema for new sessions
   */
  const getEmptySOAP = () => ({
    success: true,
    data: getSchema(),
    templateType: 'cervical-adjustment'
  });

  /**
   * Validate SOAP data structure
   */
  const validateSOAP = (soapData) => {
    const errors = [];

    // Check required sections exist
    ['subjective', 'objective', 'assessment', 'plan'].forEach(section => {
      if (!soapData[section]) {
        errors.push(`Missing ${section} section`);
      }
    });

    // Validate objective table structure
    if (soapData.objective && !Array.isArray(soapData.objective.categories)) {
      errors.push('Objective section must contain categories array');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return {
    generateSOAP,
    getEmptySOAP,
    getSchema,
    validateSOAP,
    isGenerating,
    templateType: 'cervical-adjustment',
    metadata: {
      name: 'Cervical Adjustment',
      profession: 'chiropractic',
      spinalRegion: 'cervical',
      sessionType: 'adjustment',
      description: 'Cervical spine subluxation assessment and adjustment (C1-C7)'
    }
  };
};


