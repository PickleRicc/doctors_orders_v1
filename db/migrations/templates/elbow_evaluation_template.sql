-- Insert Elbow Evaluation Template
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
  'Elbow Evaluation',
  'elbow',
  'evaluation',
  'Patient presents with {{duration}} of {{pain_location}} elbow pain. Pain is rated {{pain_scale}}/10 at worst and {{pain_scale_best}}/10 at best. 

Pain is described as {{pain_quality}} and is aggravated by {{aggravating_factors}}. Pain is relieved by {{relieving_factors}}. 

Patient reports {{associated_symptoms}}. History of prior elbow injury: {{injury_history}}. Prior interventions have included {{prior_treatments}} with {{treatment_effectiveness}}.

Medical history significant for {{relevant_medical_history}}. Recent imaging: {{diagnostic_imaging_results}}.

Handedness: {{hand_dominance}}. Occupation: {{occupation}} with {{occupational_demands}}.

Patient''s primary goals for therapy are {{patient_goals}}.

Functional limitations include difficulty with {{functional_limitations}} and impact on {{daily_activity_impact}}.',
  'OBSERVATION:
Visual inspection: {{visual_inspection}}. 
Posture: {{postural_assessment}}.
Edema: {{edema_location}} rated {{edema_severity}}.
Skin integrity: {{skin_condition}}.
Scar assessment: {{scar_assessment}}.

SPECIAL TESTS:
- Lateral Epicondylitis Test (Cozen''s): {{cozens_test}}
- Mills Test: {{mills_test}}
- Medial Epicondylitis Test (Golfer''s Elbow): {{golfers_elbow_test}}
- Tinel''s Sign at Cubital Tunnel: {{tinels_sign_cubital}}
- Ulnar Nerve Compression Test: {{ulnar_nerve_compression}}
- Valgus Stress Test: {{valgus_stress_test}}
- Varus Stress Test: {{varus_stress_test}}
- Moving Valgus Stress Test: {{moving_valgus_test}}
- Push-up Test: {{push_up_test}}
- Pronation/Supination Resistance Test: {{pronation_supination_test}}

UE MMT 	(upper extremity manual muscle test)
Strength scale 0-5 ( ± allowed; * = painful)
- Shoulder Flexion: R: {{r_shoulder_flexion}}, L: {{l_shoulder_flexion}}
- Shoulder Abduction: R: {{r_shoulder_abduction}}, L: {{l_shoulder_abduction}}
- Elbow Flexion: R: {{r_elbow_flexion}}, L: {{l_elbow_flexion}}
- Elbow Extension: R: {{r_elbow_extension}}, L: {{l_elbow_extension}}
- Forearm Pronation: R: {{r_pronation}}, L: {{l_pronation}}
- Forearm Supination: R: {{r_supination}}, L: {{l_supination}}
- Wrist Flexion: R: {{r_wrist_flexion}}, L: {{l_wrist_flexion}}
- Wrist Extension: R: {{r_wrist_extension}}, L: {{l_wrist_extension}}
- Grip Strength: R: {{r_grip_strength}}, L: {{l_grip_strength}}

UE AROM
Shoulder IR: {{shoulder_ir_arom}}
Shoulder ER: {{shoulder_er_arom}}
Shoulder flexion: {{shoulder_flexion_arom}}
Shoulder extension: {{shoulder_extension_arom}}
Shoulder abduction: {{shoulder_abduction_arom}}
Elbow flexion: {{elbow_flexion_arom}}
Elbow extension: {{elbow_extension_arom}}
Pronation: {{pronation_arom}}
Supination: {{supination_arom}}
Wrist flexion: {{wrist_flexion_arom}}
Wrist extension: {{wrist_extension_arom}}
Ulnar deviation: {{ulnar_deviation_arom}}
Radial deviation: {{radial_deviation_arom}}

UE PROM
Shoulder IR: {{shoulder_ir_prom}}
Shoulder ER: {{shoulder_er_prom}}
Shoulder flexion: {{shoulder_flexion_prom}}
Shoulder extension: {{shoulder_extension_prom}}
Shoulder abduction: {{shoulder_abduction_prom}}
Elbow flexion: {{elbow_flexion_prom}}
Elbow extension: {{elbow_extension_prom}}
Pronation: {{pronation_prom}}
Supination: {{supination_prom}}
Wrist flexion: {{wrist_flexion_prom}}
Wrist extension: {{wrist_extension_prom}}
Ulnar deviation: {{ulnar_deviation_prom}}
Radial deviation: {{radial_deviation_prom}}

- you can also use "WFL" or "WNL" if it is gross screen—within functional limits or within normal limits

PALPATION:
{{palpation_findings}}

JOINT MOBILITY:
- Humeroulnar Joint: {{humeroulnar_mobility}}
- Humeroradial Joint: {{humeroradial_mobility}}
- Proximal Radioulnar Joint: {{proximal_radioulnar_mobility}}
- Distal Radioulnar Joint: {{distal_radioulnar_mobility}}

NEUROLOGICAL ASSESSMENT:
- Sensation: {{sensation_assessment}}
- Motor Function: {{motor_assessment}}
- Reflexes: {{reflex_assessment}}

FUNCTIONAL ASSESSMENT:
- Gripping Activities: {{grip_assessment}}
- Lifting Assessment: {{lifting_assessment}}
- Fine Motor Control: {{fine_motor_assessment}}
- ADL Performance: {{adl_performance}}',
  'Patient presents with clinical findings consistent with {{primary_diagnosis}}.

CONTRIBUTING FACTORS:
- {{biomechanical_factors}}
- {{muscle_imbalances}}
- {{joint_stability_issues}}
- {{repetitive_stress_factors}}
- {{postural_contribution}}
- {{activity_related_factors}}
- {{neuromuscular_factors}}

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
6. Neural Mobilization: {{nerve_mobilization}}
7. Muscle Energy Techniques: {{muscle_energy_techniques}}
8. Functional Training: {{functional_exercises}}
9. Activity Modification Training: {{activity_training}}
10. Modalities: {{modalities}}

HOME EXERCISE PROGRAM:
{{home_exercise_details}}

BRACING/SUPPORTS:
{{bracing_recommendations}}

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
