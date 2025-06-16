-- Migration: Add More Default Templates
-- Description: Adds additional default SOAP templates for Neck, Ankle/Foot, Hip, and Wrist/Hand
-- These templates expand the library of default templates available to users

-- Insert Neck Evaluation Template
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
  'Neck Evaluation',
  'neck',
  'evaluation',
  'Patient presents with {{duration}} of {{pain_location}} neck pain. Pain is rated {{pain_scale}}/10 at worst and {{pain_scale_best}}/10 at best.

Pain is described as {{pain_quality}} and {{pain_pattern}}. Patient reports {{radiation_symptoms}} radiation to {{radiation_location}}.

Onset: {{mechanism_of_injury}}. Aggravating factors include {{aggravating_factors}}. Relieving factors include {{relieving_factors}}.

Patient reports {{associated_symptoms}}. Prior interventions have included {{prior_treatments}} with {{treatment_effectiveness}}.

Medical history significant for {{relevant_medical_history}}. Recent imaging: {{diagnostic_imaging_results}}.

Sleep is {{sleep_quality}} due to pain. Work status: {{work_status}} with {{work_modifications}} modifications.

Patient''s primary goals for therapy are {{patient_goals}}.

Functional limitations include difficulty with {{functional_limitations}} and impact on {{daily_activity_impact}}.',
  'OBSERVATION:
Patient presents with {{posture_observations}} and {{forward_head_position}}. Visible {{muscle_guarding_location}} noted.

RANGE OF MOTION (in degrees with normal values):
- Flexion: {{flexion_rom}} (0-45Â°) {{flexion_symptoms}}
- Extension: {{extension_rom}} (0-45Â°) {{extension_symptoms}}
- R Rotation: {{r_rotation}} (0-80Â°) {{r_rotation_symptoms}}
- L Rotation: {{l_rotation}} (0-80Â°) {{l_rotation_symptoms}}
- R Lateral Flexion: {{r_side_bend}} (0-45Â°) {{r_side_bend_symptoms}}
- L Lateral Flexion: {{l_side_bend}} (0-45Â°) {{l_side_bend_symptoms}}

NEUROLOGICAL ASSESSMENT:
- Upper Limb Tension Tests: {{ult_findings}}
- Sensory: {{sensory_findings}}
- Motor: {{motor_findings}}
- Reflexes: {{reflex_findings}}

SPECIAL TESTS:
- Spurling''s Test: {{spurlings_test}}
- Distraction Test: {{distraction_test}}
- Upper Limb Tension Test: {{ultt_test}}
- Vertebral Artery Test: {{vat_test}}

STRENGTH ASSESSMENT (0-5 scale):
- Cervical Flexors: {{cervical_flexor_strength}}
- Cervical Extensors: {{cervical_extensor_strength}}
- Deep Neck Flexors: {{deep_neck_flexor_strength}}
- Scapular Stabilizers: {{scapular_stabilizer_strength}}

PALPATION:
{{palpation_findings}}

JOINT MOBILITY:
{{joint_mobility_findings}}',
  'Patient presents with clinical findings consistent with {{primary_diagnosis}}.

CONTRIBUTING FACTORS:
- {{posture_contribution}}
- {{muscle_imbalances}}
- {{movement_pattern_dysfunction}}
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
3. Deep Neck Flexor Training: {{dnf_exercises}}
4. Postural Re-education: {{postural_training}}
5. Cervical Stabilization: {{cervical_stabilization}}
6. Scapular Stabilization: {{scapular_exercises}}
7. Movement Pattern Correction: {{movement_retraining}}
8. Modalities: {{modalities}}

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
  'ankle/foot',
  'evaluation',
  'Patient presents with {{duration}} of {{pain_location}} pain in the {{affected_side}} ankle/foot. Pain is rated {{pain_scale}}/10 at worst and {{pain_scale_best}}/10 at best.

Mechanism of injury: {{mechanism_of_injury}}. Pain is described as {{pain_quality}} and {{pain_pattern}}.

Aggravating factors include {{aggravating_factors}}. Relieving factors include {{relieving_factors}}.

Patient reports {{associated_symptoms}} associated with the ankle/foot pain. Prior interventions have included {{prior_treatments}} with {{treatment_effectiveness}}.

Medical history significant for {{relevant_medical_history}}. Patient has history of {{prior_ankle_injuries}}. Recent imaging: {{diagnostic_imaging_results}}.

Weight bearing status: {{weight_bearing_status}}. Ambulation: {{ambulation_status}} {{assistive_device}}.

Footwear: {{footwear_description}}.

Patient''s goals for therapy are {{patient_goals}}. Functional limitations include difficulty with {{functional_limitations}}.',
  'OBSERVATION:
General: {{general_presentation}} with {{edema_description}} and {{skin_color_changes}}. {{footwear_assessment}}. {{gait_deviations}} noted during ambulation.

RANGE OF MOTION (in degrees with normal values):
- Ankle Dorsiflexion: {{ankle_df_rom}} (0-20Â°) {{df_symptoms}}
- Ankle Plantarflexion: {{ankle_pf_rom}} (0-50Â°) {{pf_symptoms}}
- Subtalar Inversion: {{inversion_rom}} (0-35Â°) {{inversion_symptoms}}
- Subtalar Eversion: {{eversion_rom}} (0-15Â°) {{eversion_symptoms}}
- MTP Extension: {{mtp_extension}} {{mtp_extension_symptoms}}
- MTP Flexion: {{mtp_flexion}} {{mtp_flexion_symptoms}}

STRENGTH ASSESSMENT (0-5 scale):
- Ankle Dorsiflexors: {{dorsiflexor_strength}}
- Ankle Plantarflexors: {{plantarflexor_strength}}
- Ankle Invertors: {{invertor_strength}}
- Ankle Evertors: {{evertor_strength}}
- Great Toe Extension: {{toe_extensor_strength}}
- Intrinsic Foot Muscles: {{intrinsic_strength}}

SPECIAL TESTS:
- Anterior Drawer Test: {{anterior_drawer}}
- Talar Tilt Test: {{talar_tilt}}
- Thompson Test: {{thompson_test}}
- Syndesmosis Squeeze Test: {{syndesmosis_test}}
- Navicular Drop Test: {{navicular_drop}}
- Morton''s Test: {{mortons_test}}

JOINT MOBILITY:
{{joint_mobility_findings}}

PALPATION:
{{palpation_findings}}

NEUROVASCULAR STATUS:
{{neurovascular_status}}

GAIT ASSESSMENT:
{{gait_assessment_details}}',
  'Patient presents with clinical findings consistent with {{primary_diagnosis}}.

CONTRIBUTING FACTORS:
- {{biomechanical_factors}}
- {{foot_type_contribution}}
- {{movement_pattern_dysfunction}}
- {{footwear_contribution}}
- {{activity_related_factors}}

FUNCTIONAL LIMITATIONS:
Patient demonstrates difficulty with {{specific_functional_limitations}} due to {{underlying_impairments}}. These limitations impact patient''s ability to {{impact_on_daily_functioning}}.

STAGE OF HEALING:
{{healing_stage}} with {{tissue_quality_assessment}}.

REHABILITATION POTENTIAL:
{{rehab_potential}} for improvement with physical therapy intervention. Prognosis is {{prognosis}} based on {{prognostic_factors}}.',
  'FREQUENCY & DURATION:
Recommend {{visit_frequency}} for {{treatment_duration}}.

TREATMENT INTERVENTIONS:
1. Pain Management: {{pain_management_strategies}}
2. Edema Management: {{edema_control}}
3. Manual Therapy: {{manual_therapy_techniques}}
4. Joint Mobilization: {{joint_mobilization}}
5. Range of Motion: {{rom_exercises}}
6. Progressive Strengthening: {{strengthening_progression}}
7. Balance/Proprioception: {{balance_training}}
8. Gait Training: {{gait_training}}
9. Modalities: {{modalities}}

HOME EXERCISE PROGRAM:
{{home_exercise_details}}

ACTIVITY MODIFICATIONS:
{{activity_modifications}}

FOOTWEAR RECOMMENDATIONS:
{{footwear_recommendations}}

ORTHOTIC CONSIDERATIONS:
{{orthotic_considerations}}

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
- -   I n s e r t   H i p   E v a l u a t i o n   T e m p l a t e  
 I N S E R T   I N T O   t e m p l a t e s   (  
     t e m p l a t e _ k e y ,  
     u s e r _ i d ,  
     n a m e ,  
     b o d y _ r e g i o n ,  
     s e s s i o n _ t y p e ,  
     s u b j e c t i v e ,  
     o b j e c t i v e ,  
     a s s e s s m e n t ,  
     p l a n ,  
     i s _ d e f a u l t  
 )   V A L U E S   (  
     g e n _ r a n d o m _ u u i d ( ) ,  
     ( S E L E C T   i d   F R O M   a u t h . u s e r s   O R D E R   B Y   c r e a t e d _ a t   A S C   L I M I T   1 ) ,   - -   U s e   t h e   f i r s t   u s e r   i n   t h e   s y s t e m  
     ' H i p   E v a l u a t i o n ' ,  
     ' h i p ' ,  
     ' e v a l u a t i o n ' ,  
     ' P a t i e n t   p r e s e n t s   w i t h   { { d u r a t i o n } }   o f   { { p a i n _ l o c a t i o n } }   h i p   p a i n   i n   t h e   { { a f f e c t e d _ s i d e } }   h i p .   P a i n   i s   r a t e d   { { p a i n _ s c a l e } } / 1 0   a t   w o r s t   a n d   { { p a i n _ s c a l e _ b e s t } } / 1 0   a t   b e s t .  
  
 P a i n   i s   d e s c r i b e d   a s   { { p a i n _ q u a l i t y } }   a n d   { { p a i n _ p a t t e r n } } .   P a t i e n t   r e p o r t s   { { r a d i a t i o n _ s y m p t o m s } }   r a d i a t i o n   t o   { { r a d i a t i o n _ l o c a t i o n } } .  
  
 O n s e t :   { { m e c h a n i s m _ o f _ i n j u r y } } .   A g g r a v a t i n g   f a c t o r s   i n c l u d e   { { a g g r a v a t i n g _ a c t i v i t i e s } } .   R e l i e v i n g   f a c t o r s   i n c l u d e   { { r e l i e v i n g _ f a c t o r s } } .  
  
 P a t i e n t   r e p o r t s   { { a s s o c i a t e d _ s y m p t o m s } } .   P r i o r   i n t e r v e n t i o n s   h a v e   i n c l u d e d   { { p r i o r _ t r e a t m e n t s } }   w i t h   { { t r e a t m e n t _ e f f e c t i v e n e s s } } .  
  
 M e d i c a l   h i s t o r y   s i g n i f i c a n t   f o r   { { r e l e v a n t _ m e d i c a l _ h i s t o r y } } .   S u r g i c a l   h i s t o r y :   { { s u r g i c a l _ h i s t o r y } } .   R e c e n t   i m a g i n g :   { { d i a g n o s t i c _ i m a g i n g _ r e s u l t s } } .  
  
 A m b u l a t i o n   s t a t u s :   { { a m b u l a t i o n _ s t a t u s } }   { { a s s i s t i v e _ d e v i c e } } .   { { s t a i r _ n e g o t i a t i o n _ s t a t u s } } .  
  
 P a t i e n t ' ' s   g o a l s   f o r   t h e r a p y :   { { p a t i e n t _ g o a l s } } .   F u n c t i o n a l   l i m i t a t i o n s   i n c l u d e   d i f f i c u l t y   w i t h   { { f u n c t i o n a l _ l i m i t a t i o n s } }   a n d   i m p a c t   o n   { { i m p a c t _ o n _ a c t i v i t i e s } } . ' ,  
     ' O B S E R V A T I O N :  
 G e n e r a l :   { { p o s t u r e _ o b s e r v a t i o n s } } .   { { g a i t _ p a t t e r n } }   w i t h   { { w e i g h t _ b e a r i n g _ s t a t u s } } .   { { s i t t i n g _ r i s i n g _ a s s e s s m e n t } }   f r o m   c h a i r .  
  
 R A N G E   O F   M O T I O N   ( i n   d e g r e e s   w i t h   n o r m a l   v a l u e s ) :  
 -   H i p   F l e x i o n :   { { h i p _ f l e x i o n _ r o m } }   ( 0 - 1 2 0 Â ° )   { { f l e x i o n _ s y m p t o m s } }  
 -   H i p   E x t e n s i o n :   { { h i p _ e x t e n s i o n _ r o m } }   ( 0 - 3 0 Â ° )   { { e x t e n s i o n _ s y m p t o m s } }  
 -   H i p   A b d u c t i o n :   { { h i p _ a b d u c t i o n _ r o m } }   ( 0 - 4 5 Â ° )   { { a b d u c t i o n _ s y m p t o m s } }  
 -   H i p   A d d u c t i o n :   { { h i p _ a d d u c t i o n _ r o m } }   ( 0 - 3 0 Â ° )   { { a d d u c t i o n _ s y m p t o m s } }  
 -   H i p   I n t e r n a l   R o t a t i o n :   { { h i p _ i r _ r o m } }   ( 0 - 4 5 Â ° )   { { i r _ s y m p t o m s } }  
 -   H i p   E x t e r n a l   R o t a t i o n :   { { h i p _ e r _ r o m } }   ( 0 - 4 5 Â ° )   { { e r _ s y m p t o m s } }  
 -   T h o m a s   T e s t :   { { t h o m a s _ t e s t _ r e s u l t } }  
 -   O b e r ' ' s   T e s t :   { { o b e r s _ t e s t _ r e s u l t } }  
  
 S T R E N G T H   A S S E S S M E N T   ( 0 - 5   s c a l e ) :  
 -   H i p   F l e x o r s :   { { h i p _ f l e x o r _ s t r e n g t h } }  
 -   H i p   E x t e n s o r s :   { { h i p _ e x t e n s o r _ s t r e n g t h } }  
 -   H i p   A b d u c t o r s :   { { h i p _ a b d u c t o r _ s t r e n g t h } }  
 -   H i p   A d d u c t o r s :   { { h i p _ a d d u c t o r _ s t r e n g t h } }  
 -   H i p   E x t e r n a l   R o t a t o r s :   { { h i p _ e r _ s t r e n g t h } }  
 -   H i p   I n t e r n a l   R o t a t o r s :   { { h i p _ i r _ s t r e n g t h } }  
 -   C o r e / T r u n k   S t a b i l i t y :   { { c o r e _ s t a b i l i t y } }  
  
 S P E C I A L   T E S T S :  
 -   F A B E R / P a t r i c k   T e s t :   { { f a b e r _ t e s t } }  
 -   F A D I R   T e s t :   { { f a d i r _ t e s t } }  
 -   S c o u r   T e s t :   { { s c o u r _ t e s t } }  
 -   T r e n d e l e n b u r g   T e s t :   { { t r e n d e l e n b u r g _ t e s t } }  
 -   S t r a i g h t   L e g   R a i s e :   { { s l r _ t e s t } }  
 -   S a c r o i l i a c   J o i n t   P r o v o c a t i o n :   { { s i j _ t e s t s } }  
  
 P A L P A T I O N :  
 { { p a l p a t i o n _ f i n d i n g s } }  
  
 J O I N T   M O B I L I T Y :  
 { { j o i n t _ m o b i l i t y _ f i n d i n g s } }  
  
 N E U R O L O G I C A L   S C R E E N :  
 { { n e u r o l o g i c a l _ f i n d i n g s } }  
  
 F U N C T I O N A L   A S S E S S M E N T :  
 { { f u n c t i o n a l _ m o v e m e n t _ a s s e s s m e n t } }  
 { { g a i t _ a s s e s s m e n t _ d e t a i l s } } ' ,  
     ' P a t i e n t   p r e s e n t s   w i t h   c l i n i c a l   f i n d i n g s   c o n s i s t e n t   w i t h   { { p r i m a r y _ d i a g n o s i s } } .  
  
 C O N T R I B U T I N G   F A C T O R S :  
 -   { { b i o m e c h a n i c a l _ f a c t o r s } }  
 -   { { m u s c l e _ i m b a l a n c e s } }  
 -   { { m o v e m e n t _ p a t t e r n _ d y s f u n c t i o n } }  
 -   { { p o s t u r a l _ f a c t o r s } }  
 -   { { a c t i v i t y _ r e l a t e d _ f a c t o r s } }  
  
 F U N C T I O N A L   L I M I T A T I O N S :  
 P a t i e n t   d e m o n s t r a t e s   d i f f i c u l t y   w i t h   { { s p e c i f i c _ f u n c t i o n a l _ l i m i t a t i o n s } }   d u e   t o   { { u n d e r l y i n g _ i m p a i r m e n t s } } .   T h e s e   l i m i t a t i o n s   i m p a c t   p a t i e n t ' ' s   a b i l i t y   t o   { { i m p a c t _ o n _ d a i l y _ f u n c t i o n i n g } } .  
  
 H I P   J O I N T   S T A T U S :  
 { { j o i n t _ s t a t u s _ a s s e s s m e n t } }  
  
 R E H A B I L I T A T I O N   P O T E N T I A L :  
 { { r e h a b _ p o t e n t i a l } }   f o r   i m p r o v e m e n t   w i t h   p h y s i c a l   t h e r a p y   i n t e r v e n t i o n .   P r o g n o s i s   i s   { { p r o g n o s i s } }   b a s e d   o n   { { p r o g n o s t i c _ f a c t o r s } } . ' ,  
     ' F R E Q U E N C Y   &   D U R A T I O N :  
 R e c o m m e n d   { { v i s i t _ f r e q u e n c y } }   f o r   { { t r e a t m e n t _ d u r a t i o n } } .  
  
 T R E A T M E N T   I N T E R V E N T I O N S :  
 1 .   P a i n   M a n a g e m e n t :   { { p a i n _ m a n a g e m e n t _ s t r a t e g i e s } }  
 2 .   M a n u a l   T h e r a p y :   { { m a n u a l _ t h e r a p y _ t e c h n i q u e s } }  
 3 .   J o i n t   M o b i l i z a t i o n :   { { j o i n t _ m o b i l i z a t i o n _ t e c h n i q u e s } }  
 4 .   S o f t   T i s s u e   M o b i l i z a t i o n :   { { s o f t _ t i s s u e _ t e c h n i q u e s } }  
 5 .   R a n g e   o f   M o t i o n   E x e r c i s e s :   { { r o m _ e x e r c i s e s } }  
 6 .   P r o g r e s s i v e   S t r e n g t h e n i n g :   { { s t r e n g t h e n i n g _ p r o g r a m } }  
 7 .   C o r e   S t a b i l i z a t i o n :   { { c o r e _ s t a b i l i z a t i o n } }  
 8 .   G a i t   T r a i n i n g :   { { g a i t _ t r a i n i n g } }  
 9 .   F u n c t i o n a l   T r a i n i n g :   { { f u n c t i o n a l _ e x e r c i s e s } }  
 1 0 .   M o d a l i t i e s :   { { m o d a l i t i e s } }  
  
 H O M E   E X E R C I S E   P R O G R A M :  
 { { h o m e _ e x e r c i s e _ d e t a i l s } }  
  
 A C T I V I T Y   M O D I F I C A T I O N S :  
 { { a c t i v i t y _ m o d i f i c a t i o n s } }  
  
 S H O R T - T E R M   G O A L S   ( 1 - 2   w e e k s ) :  
 1 .   { { s h o r t _ t e r m _ g o a l _ 1 } }  
 2 .   { { s h o r t _ t e r m _ g o a l _ 2 } }  
 3 .   { { s h o r t _ t e r m _ g o a l _ 3 } }  
  
 L O N G - T E R M   G O A L S   ( 4 - 6   w e e k s ) :  
 1 .   { { l o n g _ t e r m _ g o a l _ 1 } }  
 2 .   { { l o n g _ t e r m _ g o a l _ 2 } }  
 3 .   { { l o n g _ t e r m _ g o a l _ 3 } }  
  
 P A T I E N T   E D U C A T I O N :  
 { { p a t i e n t _ e d u c a t i o n _ t o p i c s } }  
  
 N E X T   A P P O I N T M E N T :  
 { { n e x t _ a p p o i n t m e n t } } ' ,  
     t r u e   - -   i s _ d e f a u l t  
 )   O N   C O N F L I C T   D O   N O T H I N G ;  
  
 - -   I n s e r t   W r i s t / H a n d   E v a l u a t i o n   T e m p l a t e  
 I N S E R T   I N T O   t e m p l a t e s   (  
     t e m p l a t e _ k e y ,  
     u s e r _ i d ,  
     n a m e ,  
     b o d y _ r e g i o n ,  
     s e s s i o n _ t y p e ,  
     s u b j e c t i v e ,  
     o b j e c t i v e ,  
     a s s e s s m e n t ,  
     p l a n ,  
     i s _ d e f a u l t  
 )   V A L U E S   (  
     g e n _ r a n d o m _ u u i d ( ) ,  
     ( S E L E C T   i d   F R O M   a u t h . u s e r s   O R D E R   B Y   c r e a t e d _ a t   A S C   L I M I T   1 ) ,   - -   U s e   t h e   f i r s t   u s e r   i n   t h e   s y s t e m  
     ' W r i s t / H a n d   E v a l u a t i o n ' ,  
     ' w r i s t / h a n d ' ,  
     ' e v a l u a t i o n ' ,  
     ' P a t i e n t   p r e s e n t s   w i t h   { { d u r a t i o n } }   o f   { { p a i n _ l o c a t i o n } }   p a i n   i n   t h e   { { a f f e c t e d _ s i d e } }   w r i s t / h a n d .   P a i n   i s   r a t e d   { { p a i n _ s c a l e } } / 1 0   a t   w o r s t   a n d   { { p a i n _ s c a l e _ b e s t } } / 1 0   a t   b e s t .  
  
 M e c h a n i s m   o f   i n j u r y :   { { m e c h a n i s m _ o f _ i n j u r y } } .   P a i n   i s   d e s c r i b e d   a s   { { p a i n _ q u a l i t y } }   a n d   { { p a i n _ p a t t e r n } } .  
  
 A g g r a v a t i n g   f a c t o r s   i n c l u d e   { { a g g r a v a t i n g _ f a c t o r s } }   e s p e c i a l l y   d u r i n g   { { a g g r a v a t i n g _ a c t i v i t i e s } } .   R e l i e v i n g   f a c t o r s   i n c l u d e   { { r e l i e v i n g _ f a c t o r s } } .  
  
 P a t i e n t   r e p o r t s   { { a s s o c i a t e d _ s y m p t o m s } } .   P r i o r   i n t e r v e n t i o n s   h a v e   i n c l u d e d   { { p r i o r _ t r e a t m e n t s } }   w i t h   { { t r e a t m e n t _ e f f e c t i v e n e s s } } .  
  
 M e d i c a l   h i s t o r y   s i g n i f i c a n t   f o r   { { r e l e v a n t _ m e d i c a l _ h i s t o r y } } .   P r i o r   h a n d / w r i s t   i s s u e s :   { { p r i o r _ h a n d _ i n j u r i e s } } .   R e c e n t   i m a g i n g :   { { d i a g n o s t i c _ i m a g i n g _ r e s u l t s } } .  
  
 O c c u p a t i o n :   { { o c c u p a t i o n } }   w i t h   { { h a n d _ u s e _ o c c u p a t i o n } } .   H o b b i e s / A c t i v i t i e s :   { { r e l e v a n t _ a c t i v i t i e s } } .  
  
 P a t i e n t ' ' s   g o a l s   f o r   t h e r a p y   a r e   { { p a t i e n t _ g o a l s } } .   F u n c t i o n a l   l i m i t a t i o n s   i n c l u d e   d i f f i c u l t y   w i t h   { { f u n c t i o n a l _ l i m i t a t i o n s } }   a n d   i m p a c t   o n   { { i m p a c t _ o n _ a c t i v i t i e s } } . ' ,  
     ' O B S E R V A T I O N :  
 G e n e r a l :   { { g e n e r a l _ p r e s e n t a t i o n } }   w i t h   { { v i s i b l e _ d e f o r m i t y } } ,   { { s w e l l i n g _ l o c a t i o n } } ,   a n d   { { s k i n _ c h a n g e s } } .   { { p o s t u r e _ o b s e r v a t i o n s } } .  
  
 R A N G E   O F   M O T I O N   ( i n   d e g r e e s   w i t h   n o r m a l   v a l u e s ) :  
 -   W r i s t   F l e x i o n :   { { w r i s t _ f l e x i o n } }   ( 0 - 8 0 Â ° )   { { w r i s t _ f l e x i o n _ s y m p t o m s } }  
 -   W r i s t   E x t e n s i o n :   { { w r i s t _ e x t e n s i o n } }   ( 0 - 7 0 Â ° )   { { w r i s t _ e x t e n s i o n _ s y m p t o m s } }  
 -   W r i s t   R a d i a l   D e v i a t i o n :   { { r a d i a l _ d e v i a t i o n } }   ( 0 - 2 0 Â ° )   { { r a d i a l _ d e v i a t i o n _ s y m p t o m s } }  
 -   W r i s t   U l n a r   D e v i a t i o n :   { { u l n a r _ d e v i a t i o n } }   ( 0 - 3 0 Â ° )   { { u l n a r _ d e v i a t i o n _ s y m p t o m s } }  
 -   F o r e a r m   P r o n a t i o n :   { { p r o n a t i o n } }   ( 0 - 8 0 Â ° )   { { p r o n a t i o n _ s y m p t o m s } }  
 -   F o r e a r m   S u p i n a t i o n :   { { s u p i n a t i o n } }   ( 0 - 8 0 Â ° )   { { s u p i n a t i o n _ s y m p t o m s } }  
  
 F I N G E R   R O M :  
 -   M C P   F l e x i o n :   { { m c p _ f l e x i o n } }   ( 0 - 9 0 Â ° )   { { m c p _ f l e x i o n _ s y m p t o m s } }  
 -   P I P   F l e x i o n :   { { p i p _ f l e x i o n } }   ( 0 - 1 0 0 Â ° )   { { p i p _ f l e x i o n _ s y m p t o m s } }  
 -   D I P   F l e x i o n :   { { d i p _ f l e x i o n } }   ( 0 - 9 0 Â ° )   { { d i p _ f l e x i o n _ s y m p t o m s } }  
 -   T h u m b   O p p o s i t i o n :   { { t h u m b _ o p p o s i t i o n } }   { { o p p o s i t i o n _ s y m p t o m s } }  
 -   T o t a l   F i s t   C l o s u r e :   { { f i s t _ c l o s u r e _ q u a l i t y } }   w i t h   { { g a p _ m e a s u r e m e n t } }  
  
 S T R E N G T H   A S S E S S M E N T   ( 0 - 5   s c a l e ) :  
 -   G r i p   S t r e n g t h :   { { g r i p _ s t r e n g t h } }   ( { { c o m p a r e d _ t o _ u n a f f e c t e d } } )  
 -   P i n c h   S t r e n g t h :   { { p i n c h _ s t r e n g t h } }   ( { { p i n c h _ c o m p a r e d _ t o _ u n a f f e c t e d } } )  
 -   W r i s t   F l e x o r s :   { { w r i s t _ f l e x o r _ s t r e n g t h } }  
 -   W r i s t   E x t e n s o r s :   { { w r i s t _ e x t e n s o r _ s t r e n g t h } }  
 -   F i n g e r   F l e x o r s :   { { f i n g e r _ f l e x o r _ s t r e n g t h } }  
 -   F i n g e r   E x t e n s o r s :   { { f i n g e r _ e x t e n s o r _ s t r e n g t h } }  
 -   T h u m b   M u s c l e s :   { { t h u m b _ m u s c l e _ s t r e n g t h } }  
 -   I n t r i n s i c   H a n d   M u s c l e s :   { { i n t r i n s i c _ s t r e n g t h } }  
  
 S P E C I A L   T E S T S :  
 -   F i n k e l s t e i n   T e s t :   { { f i n k e l s t e i n _ t e s t } }  
 -   P h a l e n ' ' s   T e s t :   { { p h a l e n s _ t e s t } }  
 -   T i n e l ' ' s   S i g n :   { { t i n e l s _ s i g n } }   a t   { { t i n e l s _ l o c a t i o n } }  
 -   A l l e n   T e s t :   { { a l l e n _ t e s t } }  
 -   W a t s o n   S h i f t   T e s t :   { { w a t s o n _ t e s t } }  
 -   G r i n d   T e s t   ( C M C / 1 s t ) :   { { g r i n d _ t e s t } }  
  
 P A L P A T I O N :  
 { { p a l p a t i o n _ f i n d i n g s } }  
  
 J O I N T   M O B I L I T Y :  
 { { j o i n t _ m o b i l i t y _ f i n d i n g s } }  
  
 S E N S A T I O N :  
 { { s e n s a t i o n _ f i n d i n g s } }  
  
 F U N C T I O N A L   A S S E S S M E N T :  
 { { f u n c t i o n a l _ t a s k _ a s s e s s m e n t } } ' ,  
     ' P a t i e n t   p r e s e n t s   w i t h   c l i n i c a l   f i n d i n g s   c o n s i s t e n t   w i t h   { { p r i m a r y _ d i a g n o s i s } } .  
  
 C O N T R I B U T I N G   F A C T O R S :  
 -   { { b i o m e c h a n i c a l _ f a c t o r s } }  
 -   { { r e p e t i t i v e _ m o v e m e n t _ p a t t e r n s } }  
 -   { { o c c u p a t i o n a l _ f a c t o r s } }  
 -   { { p o s t u r a l _ f a c t o r s } }  
 -   { { a c t i v i t y _ r e l a t e d _ f a c t o r s } }  
  
 F U N C T I O N A L   L I M I T A T I O N S :  
 P a t i e n t   d e m o n s t r a t e s   d i f f i c u l t y   w i t h   { { s p e c i f i c _ f u n c t i o n a l _ l i m i t a t i o n s } }   d u e   t o   { { u n d e r l y i n g _ i m p a i r m e n t s } } .   T h e s e   l i m i t a t i o n s   i m p a c t   p a t i e n t ' ' s   a b i l i t y   t o   { { i m p a c t _ o n _ d a i l y _ f u n c t i o n i n g } } .  
  
 S T A G E   O F   H E A L I N G :  
 { { h e a l i n g _ s t a g e } }   w i t h   { { t i s s u e _ q u a l i t y _ a s s e s s m e n t } } .  
  
 R E H A B I L I T A T I O N   P O T E N T I A L :  
 { { r e h a b _ p o t e n t i a l } }   f o r   i m p r o v e m e n t   w i t h   p h y s i c a l   t h e r a p y   i n t e r v e n t i o n .   P r o g n o s i s   i s   { { p r o g n o s i s } }   b a s e d   o n   { { p r o g n o s t i c _ f a c t o r s } } . ' ,  
     ' F R E Q U E N C Y   &   D U R A T I O N :  
 R e c o m m e n d   { { v i s i t _ f r e q u e n c y } }   f o r   { { t r e a t m e n t _ d u r a t i o n } } .  
  
 T R E A T M E N T   I N T E R V E N T I O N S :  
 1 .   P a i n   M a n a g e m e n t :   { { p a i n _ m a n a g e m e n t _ s t r a t e g i e s } }  
 2 .   E d e m a   M a n a g e m e n t :   { { e d e m a _ c o n t r o l } }  
 3 .   M a n u a l   T h e r a p y :   { { m a n u a l _ t h e r a p y _ t e c h n i q u e s } }  
 4 .   J o i n t   M o b i l i z a t i o n :   { { j o i n t _ m o b i l i z a t i o n _ t e c h n i q u e s } }  
 5 .   R a n g e   o f   M o t i o n :   { { r a n g e _ o f _ m o t i o n _ e x e r c i s e s } }  
 6 .   P r o g r e s s i v e   S t r e n g t h e n i n g :   { { s t r e n g t h e n i n g _ p r o g r a m } }  
 7 .   N e r v e   G l i d i n g / M o b i l i z a t i o n :   { { n e r v e _ m o b i l i z a t i o n } }  
 8 .   F u n c t i o n a l   A c t i v i t i e s :   { { f u n c t i o n a l _ r e t r a i n i n g } }  
 9 .   M o d a l i t i e s :   { { m o d a l i t i e s } }  
  
 H O M E   E X E R C I S E   P R O G R A M :  
 { { h o m e _ e x e r c i s e _ d e t a i l s } }  
  
 O R T H O T I C   C O N S I D E R A T I O N S :  
 { { o r t h o t i c _ r e c o m m e n d a t i o n s } }  
  
 E R G O N O M I C   R E C O M M E N D A T I O N S :  
 { { e r g o n o m i c _ m o d i f i c a t i o n s } }  
  
 S H O R T - T E R M   G O A L S   ( 1 - 2   w e e k s ) :  
 1 .   { { s h o r t _ t e r m _ g o a l _ 1 } }  
 2 .   { { s h o r t _ t e r m _ g o a l _ 2 } }  
 3 .   { { s h o r t _ t e r m _ g o a l _ 3 } }  
  
 L O N G - T E R M   G O A L S   ( 4 - 6   w e e k s ) :  
 1 .   { { l o n g _ t e r m _ g o a l _ 1 } }  
 2 .   { { l o n g _ t e r m _ g o a l _ 2 } }  
 3 .   { { l o n g _ t e r m _ g o a l _ 3 } }  
  
 P A T I E N T   E D U C A T I O N :  
 { { p a t i e n t _ e d u c a t i o n _ t o p i c s } }  
  
 N E X T   A P P O I N T M E N T :  
 { { n e x t _ a p p o i n t m e n t } } ' ,  
     t r u e   - -   i s _ d e f a u l t  
 )   O N   C O N F L I C T   D O   N O T H I N G ;  
 