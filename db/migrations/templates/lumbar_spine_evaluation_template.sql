-- Insert Lumbar Spine Evaluation Template
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
  'Lumbar Spine Evaluation',
  'lumbar',
  'evaluation',
  'Patient presents with {{duration}} of {{pain_location}} low back pain. Pain is rated {{pain_scale}}/10 at worst and {{pain_scale_best}}/10 at best. 

Pain is described as {{pain_quality}} and is aggravated by {{aggravating_factors}}. Pain is relieved by {{relieving_factors}}. 

Patient reports {{associated_symptoms}}. Radiating symptoms: {{radiation_pattern}}. History of prior back injury: {{injury_history}}. Prior interventions have included {{prior_treatments}} with {{treatment_effectiveness}}.

Medical history significant for {{relevant_medical_history}}. Recent imaging: {{diagnostic_imaging_results}}.

Patient''s primary goals for therapy are {{patient_goals}}.

Functional limitations include difficulty with {{functional_limitations}} and impact on {{daily_activity_impact}}. Sleep is {{sleep_disturbance}} by symptoms.',
  'OBSERVATION:
Visual inspection: {{visual_inspection}}. 
Posture: {{postural_assessment}}.
Gait pattern: {{gait_pattern}}.
Lateral shift: {{lateral_shift}}.
Skin integrity: {{skin_condition}}.

RANGE OF MOTION:
- Forward Flexion: {{lumbar_flexion}} (0-60°) {{lumbar_flexion_symptoms}}
- Extension: {{lumbar_extension}} (0-25°) {{lumbar_extension_symptoms}}
- Left Side Bend: {{left_side_bend}} (0-25°) {{left_side_bend_symptoms}}
- Right Side Bend: {{right_side_bend}} (0-25°) {{right_side_bend_symptoms}}
- Left Rotation: {{left_rotation}} (0-30°) {{left_rotation_symptoms}}
- Right Rotation: {{right_rotation}} (0-30°) {{right_rotation_symptoms}}

REPEATED MOVEMENT TESTING:
- Repeated Flexion: {{repeated_flexion_response}}
- Repeated Extension: {{repeated_extension_response}}
- Repeated Side Bend: {{repeated_side_bend_response}}

SPECIAL TESTS:
- Straight Leg Raise: R: {{r_slr}}, L: {{l_slr}}
- Slump Test: R: {{r_slump}}, L: {{l_slump}}
- Prone Knee Bend: R: {{r_pkb}}, L: {{l_pkb}}
- FABER Test: R: {{r_faber}}, L: {{l_faber}}
- Sacroiliac Compression: {{si_compression}}
- Sacroiliac Distraction: {{si_distraction}}
- Prone Instability Test: {{prone_instability}}

LE MMT 	(lower extremity manual muscle test)
Strength scale 0-5 ( ± allowed; * = painful)
- you can also use "WFL" or "WNL" if it is gross screen—within functional limits or within normal limits
- Hip Flexion: R: {{r_hip_flexion}}, L: {{l_hip_flexion}}
- Hip Extension: R: {{r_hip_extension}}, L: {{l_hip_extension}}
- Hip Abduction: R: {{r_hip_abduction}}, L: {{l_hip_abduction}}
- Hip Adduction: R: {{r_hip_adduction}}, L: {{l_hip_adduction}}
- Knee Extension: R: {{r_knee_extension}}, L: {{l_knee_extension}}
- Knee Flexion: R: {{r_knee_flexion}}, L: {{l_knee_flexion}}
- Ankle Dorsiflexion: R: {{r_ankle_dorsiflexion}}, L: {{l_ankle_dorsiflexion}}
- Ankle Plantarflexion: R: {{r_ankle_plantarflexion}}, L: {{l_ankle_plantarflexion}}
- Great Toe Extension: R: {{r_toe_extension}}, L: {{l_toe_extension}}

LE AROM
Hip flexion: {{hip_flexion_arom}}
Hip extension: {{hip_extension_arom}}
Hip IR: {{hip_ir_arom}}
Hip ER: {{hip_er_arom}}
Hip abduction: {{hip_abduction_arom}}
Hip adduction: {{hip_adduction_arom}}
Knee flexion: {{knee_flexion_arom}}
Knee extension: {{knee_extension_arom}}
Ankle dorsiflexion: {{ankle_dorsiflexion_arom}}
Ankle plantarflexion: {{ankle_plantarflexion_arom}}
STJ inversion: {{stj_inversion_arom}}
STJ eversion: {{stj_eversion_arom}}
Toe flexion: {{toe_flexion_arom}}
Toe extension: {{toe_extension_arom}}

LE PROM
Hip flexion: {{hip_flexion_prom}}
Hip extension: {{hip_extension_prom}}
Hip IR: {{hip_ir_prom}}
Hip ER: {{hip_er_prom}}
Hip abduction: {{hip_abduction_prom}}
Hip adduction: {{hip_adduction_prom}}
Knee flexion: {{knee_flexion_prom}}
Knee extension: {{knee_extension_prom}}
Ankle dorsiflexion: {{ankle_dorsiflexion_prom}}
Ankle plantarflexion: {{ankle_plantarflexion_prom}}
STJ inversion: {{stj_inversion_prom}}
STJ eversion: {{stj_eversion_prom}}
Toe flexion: {{toe_flexion_prom}}
Toe extension: {{toe_extension_prom}}

PALPATION:
{{palpation_findings}}

JOINT MOBILITY:
- Lumbar Segmental Mobility: {{lumbar_segmental_mobility}}
- SI Joint Mobility: {{si_joint_mobility}}
- Hip Joint Mobility: {{hip_joint_mobility}}

NEUROLOGICAL ASSESSMENT:
- Reflexes: Patellar: R: {{r_patellar}}, L: {{l_patellar}}; Achilles: R: {{r_achilles}}, L: {{l_achilles}}
- Sensation: {{sensation_assessment}}
- Motor Function: {{motor_assessment}}
- Dural Signs: {{dural_signs}}

FUNCTIONAL ASSESSMENT:
- Sit-to-Stand: {{sit_to_stand}}
- Squat: {{squat_assessment}}
- Gait: {{detailed_gait_assessment}}
- Balance: {{balance_assessment}}',
  'Patient presents with clinical findings consistent with {{primary_diagnosis}}.

CONTRIBUTING FACTORS:
- {{mechanical_factors}}
- {{postural_factors}}
- {{movement_pattern_factors}}
- {{muscle_imbalances}}
- {{spine_stability_issues}}
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
3. Lumbar Stabilization: {{core_stabilization_exercises}}
4. Directional Preference Exercises: {{directional_preference}}
5. Motor Control Training: {{motor_control_exercises}}
6. Range of Motion: {{rom_exercises}}
7. Neuromuscular Re-education: {{neuromuscular_exercises}}
8. Functional Training: {{functional_exercises}}
9. Body Mechanics Training: {{body_mechanics_training}}
10. Modalities: {{modalities}}

HOME EXERCISE PROGRAM:
{{home_exercise_details}}

POSTURAL RECOMMENDATIONS:
{{posture_recommendations}}

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
