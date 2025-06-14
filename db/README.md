# Database Migrations for PT SOAP Generator

This directory contains database schema migrations for the PT SOAP Generator application.

## Migration Files

- `01_create_templates_table.sql`: Creates the templates table for storing SOAP note templates
- `02_create_sessions_table.sql`: Creates the sessions table for storing anonymous session data with TTL

## How to Apply Migrations

There are two ways to apply these migrations:

### 1. Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

### 2. Using Supabase Dashboard

1. Log in to your Supabase dashboard
2. Select your project
3. Go to the SQL Editor tab
4. Copy the content of each migration file
5. Paste into the SQL Editor
6. Run the queries in order (01, 02, etc.)

## Database Schema

### Templates Table

Stores SOAP note templates for physical therapy documentation:

- `id`: Auto-incrementing primary key
- `template_key`: UUID for referencing templates (client-side)
- `user_id`: References the user who created the template
- `name`: Template name
- `body_region`: Body region this template is for (shoulder, knee, etc.)
- `session_type`: Type of session (evaluation, progress, discharge)
- `subjective`: Template text for the subjective section
- `objective`: Template text for the objective section
- `assessment`: Template text for the assessment section
- `plan`: Template text for the plan section
- `is_default`: Whether this is a system default template
- `is_example`: Whether this is an example template
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

### Sessions Table

Stores temporary session data with a 12-hour TTL for privacy:

- `id`: Auto-incrementing primary key
- `session_key`: UUID for referencing sessions (client-side)
- `user_id`: References the user who created the session
- `session_number`: Sequential number for the day
- `session_date`: Date of the session
- `body_region`: Body region for this session
- `session_type`: Type of session (evaluation, progress, discharge)
- `template_id`: References the template used (if any)
- `audio_url`: URL to the audio recording (temporary)
- `transcript`: Transcription of the audio
- `subjective`: Filled subjective section
- `objective`: Filled objective section
- `assessment`: Filled assessment section
- `plan`: Filled plan section
- `status`: Status of the session (draft, completed)
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update
- `expires_at`: Timestamp when this record will be deleted (12 hours after creation)

## Security

Both tables use Row Level Security (RLS) to ensure:

1. Users can only see their own data (and default templates)
2. Users can only modify their own data
3. Default templates cannot be modified or deleted
