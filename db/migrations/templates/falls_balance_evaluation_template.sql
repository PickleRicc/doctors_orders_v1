-- Insert Falls and Balance Evaluation Template
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
  'Falls and Balance Evaluation',
  'general',
  'falls_balance',
  'Patient presents with {{duration}} history of {{fall_concerns}}. Reports {{fall_frequency}} falls in the past {{time_period}}. Most recent fall occurred {{recent_fall_timing}} with {{fall_mechanism}}.

Fall circumstances: {{fall_circumstances}}. Patient {{consciousness_status}} during falls. {{injury_description}} from falls.

Patient reports {{fear_of_falling_rating}}/10 fear of falling which has impacted {{activities_avoided}}. 

Medical history significant for {{relevant_medical_history}}. Current medications include {{medications}} which may {{medication_effects}} on balance.

Patient uses {{assistive_device}} for mobility with {{device_dependence_level}} dependence. Living environment includes {{environmental_hazards}}.

Patient''s primary goals are {{patient_goals}}. Prior balance interventions have included {{prior_interventions}} with {{intervention_effectiveness}}.

Functional limitations include difficulty with {{functional_limitations}} which impacts {{daily_activities_impact}}. Patient reports {{activity_level}} and {{social_participation}}.',
  'OBSERVATION:
Posture assessment: {{postural_alignment}}
Mobility level: {{mobility_status}}
Assistive device: {{assistive_device_usage}}
Footwear: {{footwear_assessment}}

BALANCE ASSESSMENTS:
- Berg Balance Scale: {{berg_balance_score}}/56 - {{berg_balance_interpretation}}
- Timed Up and Go (TUG): {{tug_time}} seconds (Normal <10 sec)
- 30-Second Chair Stand Test: {{chair_stand_reps}} reps (Age-normative value: {{age_normative_value}})
- Single Leg Stance: R: {{single_leg_stance_right}} sec, L: {{single_leg_stance_left}} sec (Normal >10 sec)
- Four Square Step Test: {{four_square_step_time}} seconds (Normal <15 sec)
- Functional Reach Test: {{functional_reach}} cm (Normal >25 cm)
- Dynamic Gait Index: {{dynamic_gait_index}}/24 - {{dgi_fall_risk}}
- Activities-Specific Balance Confidence Scale (ABC): {{abc_score}}/100% - {{abc_interpretation}}

GAIT ASSESSMENT:
Gait pattern: {{gait_pattern}}
Gait speed: {{gait_speed}} m/s (Normal >1.0 m/s)
Step length: {{step_length}}
Step width: {{step_width}}
Cadence: {{cadence}} steps/min
Turning: {{turning_assessment}}
Dual task performance: {{dual_task_assessment}}

SENSORY ASSESSMENT:
- Vision: {{vision_assessment}}
- Vestibular: {{vestibular_assessment}}
- Proprioception: {{proprioception_testing}}
- Somatosensory: {{somatosensory_testing}}

STRENGTH ASSESSMENT (0-5 scale):
- Hip Flexion: R: {{r_hip_flexion}}, L: {{l_hip_flexion}}
- Hip Extension: R: {{r_hip_extension}}, L: {{l_hip_extension}}
- Hip Abduction: R: {{r_hip_abduction}}, L: {{l_hip_abduction}}
- Knee Extension: R: {{r_knee_extension}}, L: {{l_knee_extension}}
- Ankle Dorsiflexion: R: {{r_ankle_dorsiflexion}}, L: {{l_ankle_dorsiflexion}}
- Ankle Plantarflexion: R: {{r_ankle_plantarflexion}}, L: {{l_ankle_plantarflexion}}

RANGE OF MOTION:
{{rom_findings}}

COGNITIVE ASSESSMENT:
Attention: {{attention_assessment}}
Processing speed: {{processing_speed}}
Executive function: {{executive_function}}
Memory: {{memory_assessment}}',
  'Patient presents with findings consistent with {{balance_diagnosis}}.

FALL RISK ASSESSMENT:
- Fall Risk Level: {{fall_risk_level}} based on {{fall_risk_factors}}
- Specific Risk Factors: {{specific_risk_factors}}
- Environmental Factors: {{environmental_factors}}

CONTRIBUTING FACTORS:
- {{musculoskeletal_factors}}
- {{sensory_factors}}
- {{neuromuscular_factors}}
- {{cognitive_factors}}
- {{medication_factors}}
- {{environmental_factors}}

FUNCTIONAL LIMITATIONS:
Patient demonstrates difficulty with {{specific_functional_limitations}} due to {{underlying_impairments}}. These limitations impact patient''s ability to {{impact_on_daily_functioning}}.

RED FLAGS:
{{red_flag_assessment}}

REHABILITATION POTENTIAL:
{{rehab_potential}} for improvement with physical therapy intervention. Prognosis is {{prognosis}} based on {{prognostic_factors}}.',
  'FREQUENCY & DURATION:
Recommend {{visit_frequency}} for {{treatment_duration}}.

TREATMENT INTERVENTIONS:
1. Balance Training: {{balance_exercises}}
2. Gait Training: {{gait_training}}
3. Strength Training: {{strengthening_exercises}}
4. Vestibular Rehabilitation: {{vestibular_exercises}}
5. Dual Task Training: {{dual_task_exercises}}
6. Environmental Assessment: {{home_safety_assessment}}
7. Patient Education: {{fall_prevention_education}}
8. Assistive Device Training: {{assistive_device_training}}

HOME EXERCISE PROGRAM:
{{home_exercise_details}}

FALL PREVENTION STRATEGIES:
{{fall_prevention_strategies}}

HOME MODIFICATIONS:
{{home_modification_recommendations}}

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

COORDINATION OF CARE:
{{coordination_needs}}

NEXT APPOINTMENT:
{{next_appointment}}',
  true -- is_default
) ON CONFLICT DO NOTHING;
