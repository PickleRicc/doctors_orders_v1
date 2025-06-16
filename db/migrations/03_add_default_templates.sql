-- Migration: Add Default Templates
-- Description: Adds default SOAP templates for Knee, Shoulder, Low Back, and Example template
-- These templates serve as starting points for users and are marked as default templates

-- Insert Example Template (How To Guide) - for educational purposes
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
  is_default,
  is_example
) VALUES (
  gen_random_uuid() -- Generate random UUID for template_key
  (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1), -- Use the first user in the system -- Change to your admin email or use a system identifier
  '👋 Example Template - How To Guide',
  'general',
  'evaluation',
  'This is the SUBJECTIVE section where you document what the patient reports:

- Patient reports {{duration}} of {{pain_location}} pain, rating it {{pain_scale}}/10
- Pain is described as {{pain_quality}} and {{pain_pattern}}
- Aggravating factors include {{aggravating_factors}}
- Relieving factors include {{relieving_factors}}
- Previous interventions: {{previous_interventions}}

TIP: Use variables like {{variable_name}} for information that will be filled in later based on your recording.',
  'This is the OBJECTIVE section where you document measurable findings:

- Range of motion: {{rom_findings}}
- Strength testing: {{strength_findings}}
- Special tests: {{special_tests}}
- Palpation: {{palpation_findings}}
- Gait/movement analysis: {{movement_patterns}}

TIP: Structure your recording to match these variables for better AI extraction.',
  'This is the ASSESSMENT section where you provide your clinical reasoning:

- Patient presents with signs consistent with {{diagnosis}}
- Contributing factors include {{contributing_factors}}
- Current functional limitations: {{functional_limitations}}
- Rehabilitation potential is {{rehab_potential}}

TIP: Speak clearly about your clinical impression during recording.',
  'This is the PLAN section where you document treatment strategies:

- Frequency: {{frequency}} for {{duration_of_care}}
- Interventions: {{interventions}}
- Home program: {{home_exercises}}
- Short-term goals: {{short_term_goals}} in {{short_term_timeframe}}
- Long-term goals: {{long_term_goals}} in {{long_term_timeframe}}

TIP: Templates can be customized for different body regions and session types.',
  true, -- is_default
  true  -- is_example
) ON CONFLICT DO NOTHING;

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
  'Patient presents with {{duration}} of knee pain localized to the {{knee_pain_location}} aspect of the {{affected_side}} knee. Pain is rated {{pain_scale}}/10 and described as {{pain_quality}}. Pain pattern is {{pain_pattern}} and {{aggravated_by_activities}} aggravate symptoms, while {{relieving_factors}} provide relief.

Patient reports {{associated_symptoms}} associated with the knee pain. {{mechanism_of_injury}} Prior treatments have included {{prior_treatments}} with {{treatment_effectiveness}}. 

Medical history significant for {{relevant_medical_history}}. Patient''s goals for therapy are {{patient_goals}}.

Functional limitations include difficulty with {{functional_limitations}}. Pain interferes with {{activities_of_daily_living}} and {{recreational_activities}}.

Medications: {{current_medications}}',
  'OBSERVATION:
General: Patient presents {{gait_pattern}} with {{weight_bearing_status}} on affected extremity.

RANGE OF MOTION:
- Knee Flexion: {{knee_flexion_rom}} (Normal: 0-135°)
- Knee Extension: {{knee_extension_rom}} (Normal: 0°)
- Patellar Mobility: {{patellar_mobility}}

STRENGTH ASSESSMENT (0-5 scale):
- Quadriceps: {{quad_strength}}
- Hamstrings: {{hamstring_strength}}
- Hip Abductors: {{hip_abductor_strength}}

SPECIAL TESTS:
- Anterior Drawer: {{anterior_drawer}}
- Posterior Drawer: {{posterior_drawer}}
- Lachman''s: {{lachmans_test}}
- McMurray''s: {{mcmurrays_test}}
- Valgus/Varus Stress: {{valgus_varus_tests}}
- Patellar Apprehension: {{patellar_apprehension}}

PALPATION:
{{palpation_findings}}

JOINT EFFUSION:
{{joint_effusion}}

NEUROVASCULAR ASSESSMENT:
Sensation: {{sensation}}
Circulation: {{circulation}}',
  'Patient presents with clinical findings consistent with {{primary_diagnosis}}.

CONTRIBUTING FACTORS:
- {{biomechanical_factors}}
- {{strength_deficits}}
- {{movement_pattern_issues}}
- {{joint_mobility_restrictions}}

FUNCTIONAL LIMITATIONS:
Patient demonstrates difficulty with {{specific_functional_limitations}} due to {{underlying_impairments}}.

REHABILITATION POTENTIAL:
{{rehab_potential}} for improvement with physical therapy intervention. Patient demonstrates {{motivation_level}} motivation and {{understanding_level}} understanding of the condition and treatment plan.',
  'FREQUENCY & DURATION:
Recommend {{visit_frequency}} for {{treatment_duration}} to address impairments.

TREATMENT INTERVENTIONS:
1. Pain Management: {{pain_interventions}}
2. ROM/Joint Mobility: {{mobility_interventions}}
3. Strengthening: {{strengthening_exercises}}
4. Functional Training: {{functional_exercises}}
5. Modalities: {{modalities}}

HOME EXERCISE PROGRAM:
{{home_exercise_details}}

SHORT-TERM GOALS (1-2 weeks):
1. {{short_term_goal_1}}
2. {{short_term_goal_2}}
3. {{short_term_goal_3}}

LONG-TERM GOALS (4-6 weeks):
1. {{long_term_goal_1}}
2. {{long_term_goal_2}}
3. {{long_term_goal_3}}

PATIENT EDUCATION:
{{patient_education_provided}}

NEXT APPOINTMENT:
{{next_appointment}}',
  true -- is_default
) ON CONFLICT DO NOTHING;

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
  'Patient presents with {{duration}} of shoulder pain affecting the {{affected_side}} shoulder. Pain is located primarily in the {{shoulder_pain_location}} and is described as {{pain_quality}} with intensity rated {{pain_scale}}/10. 

Pain pattern is {{pain_pattern}} and is aggravated by {{aggravating_activities}}. Patient reports {{night_pain_status}} pain at night and {{pain_with_overhead_activities}} with overhead activities. Relieving factors include {{relieving_factors}}.

Mechanism of injury: {{mechanism_of_injury}}

Patient reports {{associated_symptoms}} and {{impact_on_daily_activities}}. Prior interventions have included {{prior_treatments}} with {{treatment_effectiveness}}.

Medical history significant for {{relevant_medical_history}}. Patient''s primary goals are to {{patient_goals}}.

Functional limitations include difficulty with {{functional_limitations}}.',
  'OBSERVATION:
Patient demonstrates {{posture_observations}} with {{shoulder_position_observation}}. {{visible_atrophy_or_swelling}}.

RANGE OF MOTION (Active/Passive):
- Flexion: {{flexion_rom}} (Normal: 0-180°)
- Abduction: {{abduction_rom}} (Normal: 0-180°)
- External Rotation: {{er_rom}} (Normal: 0-90°)
- Internal Rotation: {{ir_rom}} (Normal: 0-70°/hand to T7)
- Horizontal Adduction: {{horizontal_adduction}} (Normal: 0-135°)
{{painful_arc_findings}}

STRENGTH ASSESSMENT (0-5 scale):
- Flexion (Anterior Deltoid): {{flex_strength}}
- Abduction (Middle Deltoid): {{abd_strength}}
- External Rotation (Infraspinatus/Teres Minor): {{er_strength}}
- Internal Rotation (Subscapularis): {{ir_strength}}
- Scapular Retraction: {{scapular_retraction}}
- Serratus Anterior: {{serratus_strength}}

SPECIAL TESTS:
- Empty Can/Jobe''s Test: {{empty_can_test}}
- Hawkins-Kennedy Test: {{hawkins_kennedy}}
- Neer Impingement Test: {{neer_test}}
- Speed''s Test: {{speeds_test}}
- O''Brien''s Test: {{obriens_test}}
- Apprehension/Relocation Test: {{apprehension_test}}
- Drop Arm Test: {{drop_arm_test}}

PALPATION:
{{palpation_findings}}

JOINT MOBILITY:
{{joint_mobility_findings}}

SCAPULOHUMERAL RHYTHM:
{{scapulohumeral_rhythm}}',
  'Patient presents with clinical findings consistent with {{primary_diagnosis}}.

CONTRIBUTING FACTORS:
- {{muscle_imbalances}}
- {{postural_factors}}
- {{joint_mobility_issues}}
- {{movement_pattern_dysfunction}}
- {{tissue_quality_issues}}

FUNCTIONAL LIMITATIONS:
Patient demonstrates difficulty with {{specific_functional_limitations}} due to {{underlying_impairments}}. These limitations impact patient''s ability to {{impact_on_daily_functioning}}.

REHABILITATION POTENTIAL:
{{rehab_potential}} for improvement with physical therapy intervention. Prognosis is {{prognosis}} based on {{prognostic_factors}}. Patient demonstrates {{motivation_level}} motivation toward rehabilitation goals.',
  'FREQUENCY & DURATION:
Recommend {{visit_frequency}} for {{treatment_duration}}.

TREATMENT INTERVENTIONS:
1. Pain Management: {{pain_management_strategies}}
2. Manual Therapy: {{manual_therapy_techniques}}
3. ROM/Joint Mobility: {{mobility_interventions}}
4. Muscle Activation/Recruitment: {{muscle_activation_exercises}}
5. Strengthening: {{progressive_strengthening}}
6. Scapular Stabilization: {{scapular_exercises}}
7. Functional Training: {{functional_training}}
8. Modalities: {{modalities}}

HOME EXERCISE PROGRAM:
{{home_exercise_details}}

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

-- Insert Low Back Evaluation Template
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
  'Low Back Evaluation',
  'low back',
  'evaluation',
  'Patient presents with {{duration}} history of low back pain. Pain is located {{pain_location}} and {{radiation_pattern}}. Patient describes the pain as {{pain_quality}} with an intensity of {{pain_scale}}/10.

Pain pattern is {{pain_pattern}} and is worse with {{aggravating_factors}}. Relieving factors include {{relieving_factors}}.

Onset: {{mechanism_of_injury}}

Associated symptoms include {{associated_symptoms}}. Patient reports {{bowel_bladder_symptoms}} changes in bowel/bladder function.

Prior interventions have included {{prior_treatments}} with {{treatment_effectiveness}}. Patient has history of {{prior_back_injuries}}.

Medical history significant for {{relevant_medical_history}}. Recent diagnostic imaging: {{diagnostic_imaging_results}}.

Patient''s primary goals are {{patient_goals}}.

Functional limitations include difficulty with {{functional_limitations}} and impact on {{work_impact}} and {{daily_activity_impact}}.',
  'OBSERVATION:
Patient presents with {{posture_observations}} and {{gait_pattern}}. {{posture_deviations}} noted in standing. {{weight_shift_patterns}} observed during transitional movements.

RANGE OF MOTION:
- Forward Flexion: {{flexion_rom}} {{flexion_symptoms}}
- Extension: {{extension_rom}} {{extension_symptoms}}
- Side Bending Right: {{r_side_bend}} {{r_side_bend_symptoms}}
- Side Bending Left: {{l_side_bend}} {{l_side_bend_symptoms}}
- Rotation Right: {{r_rotation}} {{r_rotation_symptoms}}
- Rotation Left: {{l_rotation}} {{l_rotation_symptoms}}

MOVEMENT ASSESSMENT:
- Repeated Movements: {{repeated_movement_findings}}
- Centralization/Peripheralization: {{centralization_findings}}

NEUROLOGICAL ASSESSMENT:
- Dermatomes: {{dermatome_findings}}
- Myotomes: {{myotome_findings}}
- Reflexes: {{reflex_findings}}
- Tension Signs: {{tension_sign_findings}}
- Straight Leg Raise: Right {{r_slr}}, Left {{l_slr}}

SPECIAL TESTS:
- FABER: {{faber_test}}
- FADIR: {{fadir_test}}
- Sacroiliac Joint Provocation: {{sij_tests}}
- Prone Instability Test: {{prone_instability}}

STRENGTH ASSESSMENT:
- Trunk Flexors: {{trunk_flexor_strength}}
- Trunk Extensors: {{trunk_extensor_strength}}
- Hip Abductors: {{hip_abductor_strength}}
- Hip Extensors: {{hip_extensor_strength}}

PALPATION:
{{palpation_findings}}

JOINT MOBILITY:
{{joint_mobility_findings}}',
  'Patient presents with clinical findings consistent with {{primary_diagnosis}}.

CONTRIBUTING FACTORS:
- {{movement_pattern_dysfunction}}
- {{muscle_imbalances}}
- {{postural_factors}}
- {{ergonomic_factors}}
- {{psychosocial_factors}}

CLASSIFICATION (if applicable):
Patient''s presentation is consistent with {{treatment_classification}} based on {{classification_criteria}}.

FUNCTIONAL LIMITATIONS:
Patient demonstrates difficulty with {{specific_functional_limitations}} due to {{underlying_impairments}}. These limitations impact patient''s ability to {{impact_on_daily_functioning}} and {{impact_on_quality_of_life}}.

RED FLAGS:
{{red_flag_assessment}}

YELLOW FLAGS:
{{yellow_flag_assessment}}

REHABILITATION POTENTIAL:
{{rehab_potential}} for improvement with physical therapy intervention. Prognosis is {{prognosis}} based on {{prognostic_factors}}.',
  'FREQUENCY & DURATION:
Recommend {{visit_frequency}} for {{treatment_duration}}.

TREATMENT INTERVENTIONS:
1. Pain Management: {{pain_management_strategies}}
2. Manual Therapy: {{manual_therapy_techniques}}
3. Direction-Specific Exercises: {{directional_preference_exercises}}
4. Motor Control/Stabilization: {{motor_control_exercises}}
5. Functional Movement Training: {{functional_exercises}}
6. Modalities: {{modalities}}

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

-- Admin note: You may need to adjust the user_id for the default templates
-- If you have a system user or want to use NULL with appropriate RLS policies
