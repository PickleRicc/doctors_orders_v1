-- Insert Knee Evaluation Template
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
  'Knee Evaluation',
  'knee',
  'evaluation',
  'Patient presents with {{duration}} of {{pain_location}} knee pain. Pain is rated {{pain_scale}}/10 at worst and {{pain_scale_best}}/10 at best. 

Pain is described as {{pain_quality}} and is aggravated by {{aggravating_factors}}. Pain is relieved by {{relieving_factors}}. 

Patient reports {{associated_symptoms}}. History of prior knee injury: {{injury_history}}. Prior interventions have included {{prior_treatments}} with {{treatment_effectiveness}}.

Medical history significant for {{relevant_medical_history}}. Recent imaging: {{diagnostic_imaging_results}}.

Patient''s primary goals for therapy are {{patient_goals}}.

Functional limitations include difficulty with {{functional_limitations}} and impact on {{daily_activity_impact}}.',
  'OBSERVATION:
Visual inspection: {{visual_inspection}}. 
Gait assessment: {{gait_pattern}}.
Edema: {{edema_location}} rated {{edema_severity}}.
Skin integrity: {{skin_condition}}.
Scar assessment: {{scar_assessment}}.

SPECIAL TESTS:
- Anterior Drawer Test: {{anterior_drawer_test}}
- Posterior Drawer Test: {{posterior_drawer_test}}
- Lachman''s Test: {{lachmans_test}}
- Valgus Stress Test: {{valgus_stress_test}}
- Varus Stress Test: {{varus_stress_test}}
- McMurray''s Test: {{mcmurrays_test}}
- Patella Apprehension Test: {{patella_apprehension_test}}
- Patella Grind Test: {{patella_grind_test}}
- Noble Compression Test: {{noble_compression_test}}
- Thessaly Test: {{thessaly_test}}
- Ober Test: {{ober_test}}

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
- Patellofemoral Joint: {{pf_joint_mobility}}
- Tibiofemoral Joint: {{tf_joint_mobility}}
- Proximal Tibiofibular Joint: {{ptf_joint_mobility}}

FUNCTIONAL ASSESSMENT:
- Squat test: {{squat_assessment}}
- Step-up/step-down: {{step_assessment}}
- Hop test: {{hop_test}}
- Single-leg stance: {{single_leg_stance}}',
  'Patient presents with clinical findings consistent with {{primary_diagnosis}}.

CONTRIBUTING FACTORS:
- {{biomechanical_factors}}
- {{muscle_imbalances}}
- {{joint_stability_issues}}
- {{movement_pattern_factors}}
- {{strength_deficits}}
- {{flexibility_issues}}
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
2. Joint Mobilization: {{joint_mobilization}}
3. Soft Tissue Mobilization: {{soft_tissue_techniques}}
4. Strengthening: {{strengthening_exercises}}
5. Range of Motion: {{rom_exercises}}
6. Neuromuscular Re-education: {{neuromuscular_exercises}}
7. Balance/Proprioception: {{balance_exercises}}
8. Gait Training: {{gait_training}}
9. Functional Training: {{functional_exercises}}
10. Modalities: {{modalities}}

HOME EXERCISE PROGRAM:
{{home_exercise_details}}

BRACING/SUPPORTS:
{{bracing_recommendations}}

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
