-- Insert Neck Evaluation Template
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
  'Neck Evaluation',
  'neck',
  'evaluation',
  'Patient presents with {{duration}} of {{pain_location}} neck pain. Pain is rated {{pain_scale}}/10 at worst and {{pain_scale_best}}/10 at best.

Pain is described as {{pain_quality}} and {{pain_pattern}}. Patient reports {{radiation_symptoms}} radiation to {{radiation_location}}.

Onset: {{mechanism_of_injury}}. Aggravating factors include {{aggravating_factors}}. Relieving factors include {{relieving_factors}}.

Patient reports {{associated_symptoms}}. Prior interventions have included {{prior_treatments}} with {{treatment_effectiveness}}.

Medical history significant for {{relevant_medical_history}}. Recent imaging: {{diagnostic_imaging_results}}.

Sleep is {{sleep_quality}} due to pain. Work status: {{work_status}} with {{work_modifications}} modifications.

Patient''s primary goals for therapy are {{patient_goals}}.

Functional limitations include difficulty with {{functional_limitations}} and impact on {{daily_activity_impact}}.',
  'OBSERVATION:
Patient presents with {{posture_observations}} and {{forward_head_position}}. Visible {{muscle_guarding_location}} noted.

RANGE OF MOTION (in degrees with normal values):
- Flexion: {{flexion_rom}} (0-45°) {{flexion_symptoms}}
- Extension: {{extension_rom}} (0-45°) {{extension_symptoms}}
- R Rotation: {{r_rotation}} (0-80°) {{r_rotation_symptoms}}
- L Rotation: {{l_rotation}} (0-80°) {{l_rotation_symptoms}}
- R Lateral Flexion: {{r_side_bend}} (0-45°) {{r_side_bend_symptoms}}
- L Lateral Flexion: {{l_side_bend}} (0-45°) {{l_side_bend_symptoms}}

NEUROLOGICAL ASSESSMENT:
- Upper Limb Tension Tests: {{ult_findings}}
- Sensory: {{sensory_findings}}
- Motor: {{motor_findings}}
- Reflexes: {{reflex_findings}}

SPECIAL TESTS:
- Spurling''s Test: {{spurlings_test}}
- Distraction Test: {{distraction_test}}
- Upper Limb Tension Test: {{ultt_test}}
- Vertebral Artery Test: {{vat_test}}

STRENGTH ASSESSMENT (0-5 scale):
- Cervical Flexors: {{cervical_flexor_strength}}
- Cervical Extensors: {{cervical_extensor_strength}}
- Deep Neck Flexors: {{deep_neck_flexor_strength}}
- Scapular Stabilizers: {{scapular_stabilizer_strength}}

PALPATION:
{{palpation_findings}}

JOINT MOBILITY:
{{joint_mobility_findings}}',
  'Patient presents with clinical findings consistent with {{primary_diagnosis}}.

CONTRIBUTING FACTORS:
- {{posture_contribution}}
- {{muscle_imbalances}}
- {{movement_pattern_dysfunction}}
- {{ergonomic_factors}}
- {{psychosocial_factors}}

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
2. Manual Therapy: {{manual_therapy_techniques}}
3. Deep Neck Flexor Training: {{dnf_exercises}}
4. Postural Re-education: {{postural_training}}
5. Cervical Stabilization: {{cervical_stabilization}}
6. Scapular Stabilization: {{scapular_exercises}}
7. Movement Pattern Correction: {{movement_retraining}}
8. Modalities: {{modalities}}

HOME EXERCISE PROGRAM:
{{home_exercise_details}}

ACTIVITY MODIFICATIONS:
{{activity_modifications}}

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
