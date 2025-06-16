-- Migration: Add More Default Templates
-- Description: Adds additional default SOAP templates for Neck, Ankle/Foot, Hip, and Wrist/Hand
-- These templates expand the library of default templates available to users

-- NOTE: This migration combines all individual template files from the /templates directory
-- Individual templates have been cleaned up and stored in separate files for easier maintenance

-- Import Neck Evaluation Template
\i ./templates/neck_evaluation_template.sql

-- Import Ankle/Foot Evaluation Template
\i ./templates/ankle_foot_evaluation_template.sql

-- Import Hip Evaluation Template
\i ./templates/hip_evaluation_template.sql

-- Import Wrist/Hand Evaluation Template
\i ./templates/wrist_hand_evaluation_template.sql
