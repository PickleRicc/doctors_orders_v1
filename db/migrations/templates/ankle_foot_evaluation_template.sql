-- Insert Ankle/Foot Evaluation Template
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
  'Ankle/Foot Evaluation',
  'ankle_foot',
  'evaluation',
  'Patient presents with {{duration}} of {{pain_location}} ankle/foot pain. Pain is rated {{pain_scale}}/10 at worst and {{pain_scale_best}}/10 at best.

Pain is described as {{pain_quality}} and {{pain_pattern}}. Patient reports {{radiation_symptoms}} radiation to {{radiation_location}}.

Onset: {{mechanism_of_injury}}. Aggravating factors include {{aggravating_factors}}. Relieving factors include {{relieving_factors}}.

Patient reports {{associated_symptoms}}. Prior interventions have included {{prior_treatments}} with {{treatment_effectiveness}}.

Medical history significant for {{relevant_medical_history}}. Recent imaging: {{diagnostic_imaging_results}}.

Footwear assessment: {{footwear_assessment}}.

Patient''s primary goals for therapy are {{patient_goals}}.

Functional limitations include difficulty with {{functional_limitations}} and impact on {{daily_activity_impact}}.',
  'OBSERVATION:
Weight-bearing status: {{weight_bearing_status}}
Gait analysis: {{gait_analysis}}
Footwear: {{footwear_condition}}
Edema: {{edema_location}} rated {{edema_severity}}
Skin integrity: {{skin_condition}}

RANGE OF MOTION (in degrees with normal values):
- Ankle Dorsiflexion: {{ankle_dorsiflexion}} (0-20°) {{dorsiflexion_symptoms}}
- Ankle Plantarflexion: {{ankle_plantarflexion}} (0-50°) {{plantarflexion_symptoms}}
- Subtalar Inversion: {{subtalar_inversion}} (0-35°) {{inversion_symptoms}}
- Subtalar Eversion: {{subtalar_eversion}} (0-15°) {{eversion_symptoms}}
- Forefoot Adduction: {{forefoot_adduction}} {{adduction_symptoms}}
- Forefoot Abduction: {{forefoot_abduction}} {{abduction_symptoms}}
- MTP Extension: {{mtp_extension}} {{mtp_extension_symptoms}}
- MTP Flexion: {{mtp_flexion}} {{mtp_flexion_symptoms}}

SPECIAL TESTS:
- Anterior Drawer: {{anterior_drawer_test}}
- Talar Tilt: {{talar_tilt_test}}
- Thompson Test: {{thompson_test}}
- Tinel''s Sign: {{tinels_sign}}
- Subtalar Stability: {{subtalar_stability}}
- Morton''s Test: {{mortons_test}}
- Navicular Drop Test: {{navicular_drop_test}}
- Arch Height Assessment: {{arch_height}}

STRENGTH ASSESSMENT (0-5 scale):
- Ankle Dorsiflexion: {{ankle_df_strength}}
- Ankle Plantarflexion: {{ankle_pf_strength}}
- Ankle Inversion: {{ankle_inv_strength}}
- Ankle Eversion: {{ankle_ev_strength}}
- Great Toe Extension: {{great_toe_extension_strength}}
- Toe Flexion: {{toe_flexion_strength}}

PALPATION:
{{palpation_findings}}

JOINT MOBILITY:
- Talocrural Joint: {{talocrural_mobility}}
- Subtalar Joint: {{subtalar_mobility}}
- Midfoot Joints: {{midfoot_mobility}}
- MTP Joints: {{mtp_mobility}}

NEUROLOGICAL ASSESSMENT:
- Sensation: {{sensation_findings}}
- Reflexes: {{ankle_reflexes}}
- Balance: {{balance_assessment}}',
  'Patient presents with clinical findings consistent with {{primary_diagnosis}}.

CONTRIBUTING FACTORS:
- {{biomechanical_factors}}
- {{footwear_contribution}}
- {{muscle_imbalances}}
- {{movement_pattern_dysfunction}}
- {{weight_bearing_abnormalities}}
- {{training_factors}}

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
2. Edema Control: {{edema_management}}
3. Manual Therapy: {{manual_therapy_techniques}}
4. Joint Mobilization: {{joint_mobilization_techniques}}
5. Strengthening: {{strengthening_exercises}}
6. Range of Motion: {{rom_exercises}}
7. Balance/Proprioception: {{balance_training}}
8. Gait Training: {{gait_training}}
9. Modalities: {{modalities}}

HOME EXERCISE PROGRAM:
{{home_exercise_details}}

WEIGHT-BEARING STATUS & ACTIVITY MODIFICATIONS:
{{weight_bearing_instructions}}
{{activity_modifications}}

ORTHOTICS/BRACING RECOMMENDATIONS:
{{orthotic_recommendations}}
{{bracing_recommendations}}

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
