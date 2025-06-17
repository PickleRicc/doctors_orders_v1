-- Insert General Weakness Evaluation Template
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
  'General Weakness Evaluation',
  'general',
  'weakness',
  'Patient presents with {{duration}} history of generalized weakness. Reports {{weakness_onset}} onset that has been {{progression_pattern}}. 

Patient describes weakness as {{weakness_description}} and primarily affecting {{affected_areas}}. Weakness is rated {{severity_rating}}/10 (10 being pre-illness strength) and is {{fluctuation_pattern}} throughout the day.

Patient reports associated symptoms including {{associated_symptoms}}. Activities that exacerbate weakness include {{exacerbating_activities}} and symptoms are somewhat alleviated by {{relieving_factors}}.

Medical history significant for {{relevant_medical_history}}. Recent hospitalization/illness: {{recent_hospitalization}}. Current medications include {{medications}}.

Prior level of function: {{prior_function_description}}. Patient was previously {{independence_level}} with all ADLs and {{mobility_status}} for mobility.

Patient reports {{fatigue_level}}/10 fatigue that impacts {{fatigue_impact_activities}}. Current activity level is {{current_activity_level}} compared to baseline.

Patient''s primary goals are {{patient_goals}}. Living situation includes {{living_environment}} with {{available_support}}.',
  'VITAL SIGNS:
BP: {{blood_pressure}}
HR: {{heart_rate}}
RR: {{respiratory_rate}}
O2 Sat: {{oxygen_saturation}}%
Perceived Exertion (Borg): {{borg_scale}}/10

OBSERVATION:
General appearance: {{general_appearance}}
Posture: {{postural_assessment}}
Skin integrity: {{skin_condition}}
Edema: {{edema_assessment}}
Respiratory effort: {{respiratory_effort}}

MANUAL MUSCLE TESTING (0-5 scale):
Upper Extremities:
- Shoulder Flexion: R: {{r_shoulder_flexion}}, L: {{l_shoulder_flexion}}
- Shoulder Abduction: R: {{r_shoulder_abduction}}, L: {{l_shoulder_abduction}}
- Elbow Flexion: R: {{r_elbow_flexion}}, L: {{l_elbow_flexion}}
- Elbow Extension: R: {{r_elbow_extension}}, L: {{l_elbow_extension}}
- Grip Strength: R: {{r_grip_strength}}, L: {{l_grip_strength}}

Lower Extremities:
- Hip Flexion: R: {{r_hip_flexion}}, L: {{l_hip_flexion}}
- Hip Extension: R: {{r_hip_extension}}, L: {{l_hip_extension}}
- Hip Abduction: R: {{r_hip_abduction}}, L: {{l_hip_abduction}}
- Knee Extension: R: {{r_knee_extension}}, L: {{l_knee_extension}}
- Knee Flexion: R: {{r_knee_flexion}}, L: {{l_knee_flexion}}
- Ankle Dorsiflexion: R: {{r_ankle_dorsiflexion}}, L: {{l_ankle_dorsiflexion}}
- Ankle Plantarflexion: R: {{r_ankle_plantarflexion}}, L: {{l_ankle_plantarflexion}}

Core/Trunk:
- Trunk Flexion: {{trunk_flexion}}
- Trunk Extension: {{trunk_extension}}
- Trunk Rotation: {{trunk_rotation}}

RANGE OF MOTION:
{{rom_findings}}

ENDURANCE:
- 30-Second Sit-to-Stand: {{sit_to_stand_reps}} reps (Age norm: {{sit_to_stand_norm}})
- 6-Minute Walk Test: {{six_min_walk_distance}} meters (Predicted: {{predicted_distance}})
- 2-Minute Walk Test: {{two_min_walk_distance}} meters
- Activity tolerance: {{activity_tolerance}}
- Recovery rate: {{recovery_rate}}

FUNCTIONAL MOBILITY:
- Bed Mobility: {{bed_mobility}}
- Supine↔Sit: {{supine_to_sit}}
- Sit↔Stand: {{sit_to_stand}}
- Transfers: {{transfer_ability}}
- Gait: {{gait_assessment}}
- Assistive Device: {{assistive_device}}
- Stair Negotiation: {{stair_assessment}}

BALANCE:
- Static Standing Balance: {{static_balance}}
- Dynamic Balance: {{dynamic_balance}}
- Functional Reach Test: {{functional_reach}} cm
- Berg Balance Scale: {{berg_balance_score}}/56

SENSATION/COORDINATION:
{{sensation_coordination}}

FUNCTIONAL ASSESSMENT:
- Barthel Index: {{barthel_score}}/100
- Functional Independence Measure (FIM): {{fim_score}}
- ADL Assessment: {{adl_assessment}}
- IADL Assessment: {{iadl_assessment}}',
  'Patient presents with generalized weakness consistent with {{primary_diagnosis}}.

CONTRIBUTING FACTORS:
- {{deconditioning_factors}}
- {{medical_factors}}
- {{nutritional_factors}}
- {{cardiopulmonary_factors}}
- {{neurological_factors}}
- {{psychological_factors}}

IMPAIRMENTS:
- Decreased strength: {{strength_impairment_details}}
- Decreased endurance: {{endurance_impairment_details}}
- Decreased activity tolerance: {{activity_tolerance_details}}
- Impaired mobility: {{mobility_impairment_details}}
- Impaired balance: {{balance_impairment_details}}

FUNCTIONAL LIMITATIONS:
Patient demonstrates difficulty with {{specific_functional_limitations}} due to {{underlying_impairments}}. These limitations impact patient''s ability to {{impact_on_daily_functioning}}.

ACTIVITY LIMITATIONS/PARTICIPATION RESTRICTIONS:
{{activity_limitations}} impacting participation in {{participation_restrictions}}.

RED FLAGS:
{{red_flag_assessment}}

REHABILITATION POTENTIAL:
{{rehab_potential}} for improvement with physical therapy intervention. Prognosis is {{prognosis}} based on {{prognostic_factors}}.',
  'FREQUENCY & DURATION:
Recommend {{visit_frequency}} for {{treatment_duration}}.

TREATMENT INTERVENTIONS:
1. Strength Training: {{strengthening_program}}
2. Endurance Training: {{endurance_program}}
3. Functional Training: {{functional_training}}
4. Mobility/Gait Training: {{mobility_training}}
5. Balance Activities: {{balance_activities}}
6. Energy Conservation: {{energy_conservation_techniques}}
7. Respiratory Training: {{respiratory_training}}
8. Aerobic Conditioning: {{aerobic_conditioning}}
9. Assisted Mobility/Transfer Training: {{transfer_training}}
10. Modalities: {{modalities}}

HOME EXERCISE PROGRAM:
{{home_exercise_details}}

ACTIVITY PACING/ENERGY CONSERVATION:
{{pacing_strategies}}

ASSISTIVE DEVICE RECOMMENDATIONS:
{{assistive_device_recommendations}}

ENVIRONMENTAL MODIFICATIONS:
{{environmental_modifications}}

SHORT-TERM GOALS (1-2 weeks):
1. {{short_term_goal_1}}
2. {{short_term_goal_2}}
3. {{short_term_goal_3}}

LONG-TERM GOALS (4-6 weeks):
1. {{long_term_goal_1}}
2. {{long_term_goal_2}}
3. {{long_term_goal_3}}

CAREGIVER EDUCATION:
{{caregiver_education}}

COORDINATION OF CARE:
{{coordination_needs}}

NEXT APPOINTMENT:
{{next_appointment}}',
  true -- is_default
) ON CONFLICT DO NOTHING;
