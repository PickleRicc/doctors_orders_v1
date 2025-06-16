-- Insert Wrist/Hand Evaluation Template
INSERT INTO templates (
  template_key,
  user_id,
  name,
  body_region,
  session_type,
  subjective,
  objective,
  assessment,
  plan,
  is_default
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1), -- Use the first user in the system
  'Wrist/Hand Evaluation',
  'wrist_hand',
  'evaluation',
  'Patient presents with {{duration}} of {{pain_location}} wrist/hand pain. Pain is rated {{pain_scale}}/10 at worst and {{pain_scale_best}}/10 at best.

Pain is described as {{pain_quality}} and {{pain_pattern}}. Patient reports {{radiation_symptoms}} radiation to {{radiation_location}}.

Onset: {{mechanism_of_injury}}. Aggravating factors include {{aggravating_factors}}. Relieving factors include {{relieving_factors}}.

Patient reports {{associated_symptoms}}. Prior interventions have included {{prior_treatments}} with {{treatment_effectiveness}}.

Medical history significant for {{relevant_medical_history}}. Recent imaging: {{diagnostic_imaging_results}}.

Handedness: {{hand_dominance}}. Occupation: {{occupation}} with {{occupational_demands}}.

Patient''s primary goals for therapy are {{patient_goals}}.

Functional limitations include difficulty with {{functional_limitations}} and impact on {{daily_activity_impact}}.',
  'OBSERVATION:
Visual inspection: {{visual_inspection}}. 
Edema: {{edema_location}} rated {{edema_severity}}.
Skin integrity: {{skin_condition}}.
Scar assessment: {{scar_assessment}}.

RANGE OF MOTION (in degrees with normal values):
- Wrist Flexion: {{wrist_flexion}} (0-80°) {{wrist_flexion_symptoms}}
- Wrist Extension: {{wrist_extension}} (0-70°) {{wrist_extension_symptoms}}
- Wrist Radial Deviation: {{radial_deviation}} (0-20°) {{radial_deviation_symptoms}}
- Wrist Ulnar Deviation: {{ulnar_deviation}} (0-30°) {{ulnar_deviation_symptoms}}
- Pronation: {{pronation}} (0-80°) {{pronation_symptoms}}
- Supination: {{supination}} (0-80°) {{supination_symptoms}}
- Thumb CMC Abduction: {{thumb_abduction}} {{thumb_abduction_symptoms}}
- Thumb MCP Flexion: {{thumb_mcp_flexion}} {{thumb_mcp_flexion_symptoms}}
- Thumb IP Flexion: {{thumb_ip_flexion}} {{thumb_ip_flexion_symptoms}}
- Finger MCP Flexion: {{finger_mcp_flexion}} {{finger_mcp_flexion_symptoms}}
- Finger PIP Flexion: {{finger_pip_flexion}} {{finger_pip_flexion_symptoms}}
- Finger DIP Flexion: {{finger_dip_flexion}} {{finger_dip_flexion_symptoms}}

SPECIAL TESTS:
- Finkelstein''s Test: {{finkelsteins_test}}
- Phalen''s Test: {{phalens_test}}
- Tinel''s Sign: {{tinels_sign}}
- Grind Test: {{grind_test}}
- Watson''s Test: {{watsons_test}}
- Piano Key Test: {{piano_key_test}}
- Empty Can Test: {{empty_can_test}}

STRENGTH ASSESSMENT (0-5 scale):
- Grip Strength: {{grip_strength}} (Compare: L {{left_grip}} lbs, R {{right_grip}} lbs)
- Pinch Strength: {{pinch_strength}} (Compare: L {{left_pinch}} lbs, R {{right_pinch}} lbs)
- Wrist Flexors: {{wrist_flexor_strength}}
- Wrist Extensors: {{wrist_extensor_strength}}
- Finger Flexors: {{finger_flexor_strength}}
- Finger Extensors: {{finger_extensor_strength}}
- Thumb Abductors: {{thumb_abductor_strength}}
- Thumb Opposers: {{thumb_opposition_strength}}

PALPATION:
{{palpation_findings}}

JOINT MOBILITY:
- Radiocarpal Joint: {{radiocarpal_mobility}}
- Distal Radioulnar Joint: {{dru_mobility}}
- Intercarpal Joints: {{intercarpal_mobility}}
- CMC Joints: {{cmc_mobility}}
- MCP Joints: {{mcp_mobility}}
- IP Joints: {{ip_mobility}}

SENSORY ASSESSMENT:
- Light Touch: {{light_touch_assessment}}
- Two-Point Discrimination: {{two_point_discrimination}}
- Sharp/Dull: {{sharp_dull_assessment}}
- Monofilament Testing: {{monofilament_results}}

FUNCTIONAL ASSESSMENT:
- Dexterity Testing: {{dexterity_assessment}}
- Functional Task Performance: {{functional_task_assessment}}',
  'Patient presents with clinical findings consistent with {{primary_diagnosis}}.

CONTRIBUTING FACTORS:
- {{biomechanical_factors}}
- {{ergonomic_factors}}
- {{muscle_imbalances}}
- {{joint_stability_issues}}
- {{repetitive_stress_factors}}
- {{posture_contribution}}

FUNCTIONAL LIMITATIONS:
Patient demonstrates difficulty with {{specific_functional_limitations}} due to {{underlying_impairments}}. These limitations impact patient''s ability to {{impact_on_daily_functioning}}.

RED FLAGS:
{{red_flag_assessment}}

REHABILITATION POTENTIAL:
{{rehab_potential}} for improvement with physical therapy intervention. Prognosis is {{prognosis}} based on {{prognostic_factors}}.',
  'FREQUENCY & DURATION:
Recommend {{visit_frequency}} for {{treatment_duration}}.

TREATMENT INTERVENTIONS:
1. Pain Management: {{pain_management_strategies}}
2. Edema Control: {{edema_management}}
3. Manual Therapy: {{manual_therapy_techniques}}
4. Joint Mobilization: {{joint_mobilization_techniques}}
5. Soft Tissue Mobilization: {{soft_tissue_techniques}}
6. Nerve Mobilization: {{nerve_mobilization}}
7. Strengthening: {{strengthening_exercises}}
8. Range of Motion: {{rom_exercises}}
9. Dexterity Training: {{dexterity_exercises}}
10. Functional Training: {{functional_exercises}}
11. Modalities: {{modalities}}

HOME EXERCISE PROGRAM:
{{home_exercise_details}}

ORTHOTIC/SPLINTING RECOMMENDATIONS:
{{orthotic_recommendations}}
{{splinting_recommendations}}

ACTIVITY MODIFICATIONS:
{{activity_modifications}}
{{ergonomic_recommendations}}

SHORT-TERM GOALS (1-2 weeks):
1. {{short_term_goal_1}}
2. {{short_term_goal_2}}
3. {{short_term_goal_3}}

LONG-TERM GOALS (4-6 weeks):
1. {{long_term_goal_1}}
2. {{long_term_goal_2}}
3. {{long_term_goal_3}}

PATIENT EDUCATION:
{{patient_education_topics}}

NEXT APPOINTMENT:
{{next_appointment}}',
  true -- is_default
) ON CONFLICT DO NOTHING;
