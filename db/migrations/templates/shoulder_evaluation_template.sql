-- Insert Shoulder Evaluation Template
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
  'Shoulder Evaluation',
  'shoulder',
  'evaluation',
  'Patient presents with {{duration}} of {{pain_location}} shoulder pain. Pain is rated {{pain_scale}}/10 at worst and {{pain_scale_best}}/10 at best. 

Pain is described as {{pain_quality}} and is aggravated by {{aggravating_factors}}. Pain is relieved by {{relieving_factors}}. 

Patient reports {{associated_symptoms}}. History of prior shoulder injury: {{injury_history}}. Prior interventions have included {{prior_treatments}} with {{treatment_effectiveness}}.

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
- Hawkins-Kennedy Test: {{hawkins_kennedy_test}}
- Neer Impingement Test: {{neer_test}}
- Empty Can Test: {{empty_can_test}}
- Full Can Test: {{full_can_test}}
- Painful Arc: {{painful_arc}}
- Drop Arm Test: {{drop_arm_test}}
- Apprehension Test: {{apprehension_test}}
- Relocation Test: {{relocation_test}}
- Speed''s Test: {{speeds_test}}
- Yergason''s Test: {{yergasons_test}}
- Crossover Test: {{crossover_test}}
- O''Brien''s Test: {{obriens_test}}

UE MMT 	(upper extremity manual muscle test)
Strength scale 0-5 ( ± allowed; * = painful)
- Shoulder Flexion: R: {{r_shoulder_flexion}}, L: {{l_shoulder_flexion}}
- Shoulder Extension: R: {{r_shoulder_extension}}, L: {{l_shoulder_extension}}
- Shoulder Abduction: R: {{r_shoulder_abduction}}, L: {{l_shoulder_abduction}}
- Shoulder IR: R: {{r_shoulder_ir}}, L: {{l_shoulder_ir}}
- Shoulder ER: R: {{r_shoulder_er}}, L: {{l_shoulder_er}}
- Elbow Flexion: R: {{r_elbow_flexion}}, L: {{l_elbow_flexion}}
- Elbow Extension: R: {{r_elbow_extension}}, L: {{l_elbow_extension}}
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
- Glenohumeral Joint: {{gh_joint_mobility}}
- Acromioclavicular Joint: {{ac_joint_mobility}}
- Sternoclavicular Joint: {{sc_joint_mobility}}
- Scapulothoracic Mobility: {{scapulothoracic_mobility}}

SCAPULAR ASSESSMENT:
- Scapular Positioning: {{scapular_position}}
- Scapular Dyskinesis: {{scapular_dyskinesis}}
- Scapulohumeral Rhythm: {{scapulohumeral_rhythm}}

FUNCTIONAL ASSESSMENT:
- Overhead Activities: {{overhead_assessment}}
- Behind Back Reach: {{behind_back_reach}}
- Functional Reach: {{functional_reach}}
- ADL Performance: {{adl_performance}}',
  'Patient presents with clinical findings consistent with {{primary_diagnosis}}.

CONTRIBUTING FACTORS:
- {{biomechanical_factors}}
- {{muscle_imbalances}}
- {{joint_stability_issues}}
- {{scapular_dysfunction}}
- {{posture_contribution}}
- {{motor_control_issues}}
- {{rotator_cuff_status}}

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
4. Scapular Stabilization: {{scapular_exercises}}
5. Rotator Cuff Strengthening: {{rotator_cuff_exercises}}
6. Range of Motion: {{rom_exercises}}
7. Neuromuscular Re-education: {{neuromuscular_exercises}}
8. Postural Training: {{postural_exercises}}
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
