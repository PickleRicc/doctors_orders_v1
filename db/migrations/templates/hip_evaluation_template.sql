-- Insert Hip Evaluation Template
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
  'Hip Evaluation',
  'hip',
  'evaluation',
  'Patient presents with {{duration}} of {{pain_location}} hip pain. Pain is rated {{pain_scale}}/10 at worst and {{pain_scale_best}}/10 at best.

Pain is described as {{pain_quality}} and {{pain_pattern}}. Patient reports {{radiation_symptoms}} radiation to {{radiation_location}}.

Onset: {{mechanism_of_injury}}. Aggravating factors include {{aggravating_factors}}. Relieving factors include {{relieving_factors}}.

Patient reports {{associated_symptoms}}. Prior interventions have included {{prior_treatments}} with {{treatment_effectiveness}}.

Medical history significant for {{relevant_medical_history}}. Recent imaging: {{diagnostic_imaging_results}}.

Sleep is {{sleep_quality}} due to pain. Work status: {{work_status}} with {{work_modifications}} modifications.

Patient''s primary goals for therapy are {{patient_goals}}.

Functional limitations include difficulty with {{functional_limitations}} and impact on {{daily_activity_impact}}.',
  'OBSERVATION:
Posture assessment: {{posture_observations}}. 
Gait analysis: {{gait_analysis}}.
Weight-bearing status: {{weight_bearing_status}}.
Assistive device: {{assistive_device}}.

RANGE OF MOTION (in degrees with normal values):
- Hip Flexion: {{hip_flexion}} (0-120°) {{hip_flexion_symptoms}}
- Hip Extension: {{hip_extension}} (0-30°) {{hip_extension_symptoms}}
- Hip Abduction: {{hip_abduction}} (0-45°) {{hip_abduction_symptoms}}
- Hip Adduction: {{hip_adduction}} (0-30°) {{hip_adduction_symptoms}}
- Hip Internal Rotation: {{hip_ir}} (0-45°) {{hip_ir_symptoms}}
- Hip External Rotation: {{hip_er}} (0-45°) {{hip_er_symptoms}}

SPECIAL TESTS:
- FABER/Patrick Test: {{faber_test}}
- FADIR Test: {{fadir_test}}
- Trendelenburg Test: {{trendelenburg_test}}
- Thomas Test: {{thomas_test}}
- Ober Test: {{ober_test}}
- Scour Test: {{scour_test}}
- Straight Leg Raise: {{slr_test}}
- SI Joint Provocation Tests: {{si_joint_tests}}

LE MMT 	(lower extremity manual muscle test)
Strength scale 0-5 ( ± allowed; * = painful)
- Hip Flexors: {{hip_flexor_strength}}
- Hip Extensors: {{hip_extensor_strength}}
- Hip Abductors: {{hip_abductor_strength}}
- Hip Adductors: {{hip_adductor_strength}}
- Hip Internal Rotators: {{hip_ir_strength}}
- Hip External Rotators: {{hip_er_strength}}
- Core Stability: {{core_stability}}

LE AROM
Hip flexion: {{hip_flexion_arom}}
Hip extension: {{hip_extension_arom}}
Hip Abduction: {{hip_abduction_arom}}
Hip adduction: {{hip_adduction_arom}}
Glute extension: {{glute_extension_arom}}
Knee extension: {{knee_extension_arom}}
Knee flexion: {{knee_flexion_arom}}
Ankle dorsiflexion: {{ankle_dorsiflexion_arom}}
Ankle plantarflexion: {{ankle_plantarflexion_arom}}
Ankle inversion: {{ankle_inversion_arom}}
Ankle eversion: {{ankle_evension_arom}}

LE PROM
Hip flexion: {{hip_flexion_prom}}
Hip extension: {{hip_extension_prom}}
Hip Abduction: {{hip_abduction_prom}}
Hip adduction: {{hip_adduction_prom}}
Glute extension: {{glute_extension_prom}}
Knee extension: {{knee_extension_prom}}
Knee flexion: {{knee_flexion_prom}}
Ankle dorsiflexion: {{ankle_dorsiflexion_prom}}
Ankle plantarflexion: {{ankle_plantarflexion_prom}}
Ankle inversion: {{ankle_inversion_prom}}
Ankle eversion: {{ankle_evension_prom}}

- you can also use "WFL" or "WNL" if it is gross screen—within functional limits or within normal limits

PALPATION:
{{palpation_findings}}

JOINT MOBILITY:
- Hip Joint: {{hip_mobility}}
- SI Joint: {{si_joint_mobility}}
- Lumbar Spine: {{lumbar_mobility}}

FUNCTIONAL ASSESSMENT:
- Squat: {{squat_assessment}}
- Single Leg Stance: {{single_leg_stance}}
- Step Up/Down: {{step_assessment}}
- Transfer Assessment: {{transfer_assessment}}',
  'Patient presents with clinical findings consistent with {{primary_diagnosis}}.

CONTRIBUTING FACTORS:
- {{biomechanical_factors}}
- {{muscle_imbalances}}
- {{movement_pattern_dysfunction}}
- {{leg_length_discrepancy}}
- {{core_stability_issues}}
- {{postural_factors}}

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
3. Joint Mobilization: {{joint_mobilization_techniques}}
4. Soft Tissue Mobilization: {{soft_tissue_techniques}}
5. Strengthening: {{strengthening_exercises}}
6. Range of Motion: {{rom_exercises}}
7. Neuromuscular Re-education: {{neuromuscular_exercises}}
8. Gait Training: {{gait_training}}
9. Functional Training: {{functional_exercises}}
10. Modalities: {{modalities}}

HOME EXERCISE PROGRAM:
{{home_exercise_details}}

WEIGHT-BEARING STATUS & ACTIVITY MODIFICATIONS:
{{weight_bearing_instructions}}
{{activity_modifications}}

ASSISTIVE DEVICE RECOMMENDATIONS:
{{assistive_device_recommendations}}

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
