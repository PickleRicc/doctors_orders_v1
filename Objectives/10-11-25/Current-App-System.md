# Current App System - PT SOAP Generator

## Frontend Architecture

### Framework
- **Next.js 13+** (React framework)
- **Vercel** hosting (non-PHI only)
- **Client-side rendering** for all UI components

### Key Pages
- `/` - Landing/Dashboard
- `/soap/new` - Create new SOAP note (recording interface)
- `/soap/generate` - Edit/view SOAP note
- `/test-templates` - Template testing interface

### Core Components
**Location:** `src/components/soap/`

- **SOAPEditor.jsx** - Main editing interface, handles all SOAP sections
- **ObjectiveTable.jsx** - Categorized test/result/notes table with dropdowns
- **WYSIWYGEditor.jsx** - Rich text editor for Subjective/Assessment sections
- **GoalsList.jsx** - Short-term and long-term goals management
- **InterventionsList.jsx** - Plan interventions/progressions/regressions

### State Management
- **React hooks** (useState, useEffect)
- **Local state** for editing
- **No Redux** - kept simple

---

## Backend Architecture

### PHI Data (Azure)
**Location:** Azure PostgreSQL + Azure Blob Storage

**Database Schema:**
- `phi.encounters` - SOAP notes (JSONB), session metadata
- `phi.transcripts` - Audio file references
- `phi.audit_events` - HIPAA compliance audit trail

**API Routes:** `src/pages/api/phi/`
- `encounters.js` - CRUD for SOAP notes
- `transcribe.js` - Audio transcription
- `generate.js` - AI SOAP generation

**Connection:** `src/lib/db.js`
- PostgreSQL connection pool
- Environment: `AZURE_POSTGRES_URL`

### Non-PHI Data (Supabase)
**Location:** Supabase PostgreSQL

**Tables:**
- `users` - Therapist accounts (Supabase Auth)
- `organizations` - Clinic/practice info
- `subscriptions` - Billing/plan data

**Client:** `src/lib/supabase.js`
- Supabase client for auth and non-PHI queries

---

## Template System

### Hook-Based Templates
**Location:** `src/hooks/templates/`

**6 Body-Region Templates:**
1. `useKneeEvaluation.js`
2. `useShoulderEvaluation.js`
3. `useBackEvaluation.js`
4. `useHipEvaluation.js`
5. `useAnkleFootEvaluation.js`
6. `useNeckEvaluation.js`

**Each Template Provides:**
- `getSchema()` - Data structure for SOAP sections
- `createPrompt()` - AI prompt with categorized examples
- `generateSOAP()` - Calls AI service, returns structured JSON
- `validateSOAP()` - Validates generated data

### Template Structure
```javascript
{
  subjective: { type: 'wysiwyg', content: '' },
  objective: { 
    type: 'table',
    categories: [
      { name: 'Observation', rows: [...] },
      { name: 'Palpation', rows: [...] },
      { name: 'Range of Motion', rows: [...] },
      { name: 'Strength Testing', rows: [...] },
      { name: 'Special Tests', rows: [...] },
      { name: 'Functional Testing', rows: [...] }
    ]
  },
  assessment: {
    clinical_impression: { type: 'wysiwyg' },
    short_term_goals: { type: 'list', items: [] },
    long_term_goals: { type: 'list', items: [] }
  },
  plan: {
    interventions: { type: 'list', items: [] },
    progressions: { type: 'list', items: [] },
    regressions: { type: 'list', items: [] },
    frequency_duration: { type: 'wysiwyg' },
    patient_education: { type: 'wysiwyg' }
  }
}
```

---

## AI Integration

### Service
**Location:** `src/services/aiService.js`

**Provider:** Anthropic Claude (via API)
- Model: `claude-3-5-sonnet-20241022`
- Environment: `ANTHROPIC_API_KEY`

### Flow
1. User records audio → uploads to Azure Blob
2. Azure Speech-to-Text → transcript
3. Transcript + Template prompt → Claude API
4. Claude returns structured JSON matching template schema
5. Frontend renders in SOAPEditor

---

## Data Flow

### Creating a SOAP Note
```
User → /soap/new
  → Select template (knee/shoulder/etc)
  → Record audio
  → Upload to Azure Blob (SAS URL)
  → POST /api/phi/transcribe
    → Azure Speech-to-Text
  → POST /api/phi/generate
    → Template hook creates prompt
    → Claude API generates JSON
    → Save to phi.encounters
  → Redirect to /soap/generate?sessionId={id}
```

### Editing a SOAP Note
```
User → /soap/generate?sessionId={id}
  → GET /api/phi/encounters/{id}
  → Load SOAP JSON from Azure DB
  → Render in SOAPEditor
  → User edits (auto-save every 30s)
  → PUT /api/phi/encounters/{id}
  → Update phi.encounters
```

### Exporting
```
User clicks Export
  → formatSOAPForText() or formatSOAPForPDF()
  → Traverse categories/goals/interventions
  → Generate formatted output
  → Copy to clipboard or download PDF
```

---

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_PHI_API=/api/phi
```

### Backend (Vercel/Local)
```
AZURE_POSTGRES_URL=
AZURE_STORAGE_ACCOUNT=
AZURE_STORAGE_CONTAINER=
ANTHROPIC_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
```

---

## Security & Compliance

### PHI Separation
- **Azure:** All PHI (SOAP notes, transcripts, audio)
- **Supabase:** No PHI (auth, billing, preferences)
- **Vercel:** No PHI stored, only proxies API calls

### Authentication
- **Supabase Auth** for user login
- **JWT tokens** passed to Azure API
- **No PHI in tokens**

### Audit Trail
- All PHI access logged to `phi.audit_events`
- Actor ID, event type, timestamp

---

## Key Files Reference

### Configuration
- `src/lib/db.js` - Azure PostgreSQL connection
- `src/lib/supabase.js` - Supabase client
- `src/services/aiService.js` - Claude AI integration

### API Routes
- `src/pages/api/phi/encounters.js` - SOAP CRUD
- `src/pages/api/phi/transcribe.js` - Audio → text
- `src/pages/api/phi/generate.js` - AI generation

### Components
- `src/components/soap/SOAPEditor.jsx` - Main editor
- `src/components/soap/ObjectiveTable.jsx` - Test results table

### Templates
- `src/hooks/templates/use*Evaluation.js` - 6 body-region templates

---

## Current Status
✅ All 6 templates working with categorized objective data
✅ Azure PostgreSQL storing PHI
✅ Supabase handling auth/billing
✅ Export (PDF/Copy) functioning
✅ Auto-save implemented
✅ Template validation active
