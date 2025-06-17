-- Insert Neurologic Evaluation Template
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
  'Neurologic Evaluation',
  'general',
  'neurologic',
  'Patient presents with {{duration}} history of {{neurological_symptoms}}. Symptoms began {{onset_description}} and have been {{progression_pattern}}.

Patient reports {{symptom_quality}} that is {{symptom_timing}} and rated {{pain_scale}}/10 at worst. Symptoms are aggravated by {{aggravating_factors}} and alleviated by {{relieving_factors}}.

Associated symptoms include {{associated_symptoms}}. Neurological symptoms impact {{functional_activities}} with {{activity_limitation_severity}}.

Medical history significant for {{relevant_medical_history}}. Prior diagnoses include {{prior_diagnoses}}. Surgical history includes {{surgical_history}}.

Current medications include {{medications}}. Recent imaging/tests show {{diagnostic_results}}.

Prior treatments have included {{prior_interventions}} with {{treatment_effectiveness}}.

Patient''s primary goals for therapy are {{patient_goals}}. Patient reports {{independence_level}} with ADLs and {{support_systems}} at home.',
  'OBSERVATION:
General appearance: {{general_appearance}}
Mental status: {{mental_status}}
Communication ability: {{communication_ability}}

MOTOR ASSESSMENT:
- Muscle Tone: {{muscle_tone}}
- Tremor/Involuntary Movements: {{involuntary_movements}}
- Atrophy: {{muscle_atrophy}}
- Symmetry: {{body_symmetry}}
- Posture: {{postural_assessment}}

MANUAL MUSCLE TESTING (0-5 scale):
Upper Extremities:
- Shoulder: {{shoulder_strength}}
- Elbow: {{elbow_strength}}
- Wrist/Hand: {{wrist_hand_strength}}

Lower Extremities:
- Hip: {{hip_strength}}
- Knee: {{knee_strength}}
- Ankle/Foot: {{ankle_foot_strength}}

Trunk:
- Core: {{core_strength}}
- Cervical: {{cervical_strength}}

REFLEX TESTING (0-4+ scale):
- Biceps (C5,C6): R: {{r_biceps_reflex}}, L: {{l_biceps_reflex}}
- Triceps (C7,C8): R: {{r_triceps_reflex}}, L: {{l_triceps_reflex}}
- Brachioradialis (C5,C6): R: {{r_brachioradialis_reflex}}, L: {{l_brachioradialis_reflex}}
- Patellar (L2-L4): R: {{r_patellar_reflex}}, L: {{l_patellar_reflex}}
- Achilles (S1-S2): R: {{r_achilles_reflex}}, L: {{l_achilles_reflex}}
- Plantar response: R: {{r_plantar_response}}, L: {{l_plantar_response}}
- Clonus: {{clonus}}
- Pathological reflexes: {{pathological_reflexes}}

SENSORY ASSESSMENT:
- Light Touch: {{light_touch}}
- Proprioception: {{proprioception}}
- Vibration: {{vibration_sense}}
- Temperature: {{temperature_sense}}
- Pain: {{pain_sensation}}
- Dermatomal pattern: {{dermatome_pattern}}

COORDINATION:
- Finger-to-nose: {{finger_to_nose}}
- Heel-to-shin: {{heel_to_shin}}
- Rapid alternating movements: {{ram}}
- Diadochokinesia: {{diadochokinesia}}

CRANIAL NERVE ASSESSMENT:
{{cranial_nerve_findings}}

BALANCE AND VESTIBULAR:
- Romberg: {{romberg_test}}
- Single leg stance: R: {{r_single_leg_stance}} sec, L: {{l_single_leg_stance}} sec
- Dynamic balance: {{dynamic_balance}}
- Vestibular assessment: {{vestibular_findings}}

GAIT ASSESSMENT:
- Pattern: {{gait_pattern}}
- Speed: {{gait_speed}}
- Assistive device: {{assistive_device}}
- Safety concerns: {{gait_safety}}
- Gait deviations: {{gait_deviations}}

FUNCTIONAL MOBILITY:
- Bed mobility: {{bed_mobility}}
- Transfers: {{transfer_ability}}
- Sit-to-stand: {{sit_to_stand}}
- Stairs: {{stair_negotiation}}

SPECIAL TESTS:
{{special_tests_findings}}',
  'Patient presents with clinical findings consistent with {{primary_diagnosis}}.

NEUROLOGICAL FINDINGS:
- Upper Motor Neuron Involvement: {{umn_findings}}
- Lower Motor Neuron Involvement: {{lmn_findings}}
- Sensory Involvement: {{sensory_findings}}
- Coordination Involvement: {{coordination_findings}}
- Cognitive/Perceptual Involvement: {{cognitive_findings}}

CONTRIBUTING FACTORS:
- {{biomechanical_factors}}
- {{pain_factors}}
- {{deconditioning_factors}}
- {{cognitive_factors}}
- {{psychological_factors}}
- {{environmental_barriers}}

FUNCTIONAL LIMITATIONS:
Patient demonstrates difficulty with {{specific_functional_limitations}} due to {{underlying_impairments}}. These limitations impact patient''s ability to {{impact_on_daily_functioning}}.

RED FLAGS:
{{red_flag_assessment}}

REHABILITATION POTENTIAL:
{{rehab_potential}} for improvement with physical therapy intervention. Prognosis is {{prognosis}} based on {{prognostic_factors}}.',
  'FREQUENCY & DURATION:
Recommend {{visit_frequency}} for {{treatment_duration}}.

TREATMENT INTERVENTIONS:
1. Neuromuscular Re-education: {{neuromuscular_reeducation}}
2. Therapeutic Exercise: {{therapeutic_exercises}}
3. Functional Training: {{functional_training}}
4. Balance Activities: {{balance_activities}}
5. Gait Training: {{gait_training}}
6. Task-Specific Training: {{task_specific_training}}
7. Sensory Re-education: {{sensory_reeducation}}
8. Compensatory Strategy Training: {{compensatory_strategies}}
9. Assistive Device Training: {{assistive_device_training}}
10. Pain Management: {{pain_management}}

HOME EXERCISE PROGRAM:
{{home_exercise_details}}

CAREGIVER EDUCATION:
{{caregiver_education}}

ENVIRONMENTAL MODIFICATIONS:
{{environmental_adaptations}}

EQUIPMENT NEEDS:
{{equipment_recommendations}}

SHORT-TERM GOALS (1-2 weeks):
1. {{short_term_goal_1}}
2. {{short_term_goal_2}}
3. {{short_term_goal_3}}

LONG-TERM GOALS (4-6 weeks):
1. {{long_term_goal_1}}
2. {{long_term_goal_2}}
3. {{long_term_goal_3}}

COORDINATION OF CARE:
{{interdisciplinary_coordination}}

NEXT APPOINTMENT:
{{next_appointment}}',
  true -- is_default
) ON CONFLICT DO NOTHING;
