# PT SOAP Generator API & Component Handbook

Comprehensive reference for every public HTTP API, service, hook, and component that ships with the PT SOAP Generator. Use this as the single source of truth when integrating new clients, extending the backend, or building UI on top of the existing component system.

---

## 1. Environment & Authentication

### 1.1 Required environment variables

- **OpenAI** – `NEXT_PUBLIC_OPENAI_API_KEY` must be set before invoking the structured note generator or Whisper transcription service. Missing keys trigger explicit 500 responses before any AI calls are attempted.

```11:40:src/pages/api/generate-notes.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'OpenAI API key not configured'
      });
    }
```

- **PostgreSQL / Azure DB** – `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` power the shared connection pool used by every PHI endpoint.

```18:40:src/lib/db.js
if (!pool) {
  console.log('🔌 Creating new PostgreSQL connection pool...');
  pool = new Pool({
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT) || 5432,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: {
      rejectUnauthorized: false
    },
```

- **Supabase** – `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required by the dedicated auth service. The module deliberately throws if either value is missing so that missing credentials surface during boot.

```1:27:src/services/supabase.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  );
}
```

### 1.2 Authentication flows

- **Therapist auth** – handled by Supabase. `AuthProvider` exposes `signIn`, `signUp`, `resetPassword`, and `signOut`, and automatically redirects signed-out users to `/landing`.

```15:168:src/hooks/useAuth.js
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  ...
  const signIn = async (email, password) => { ... };
  const signUp = async (email, password, metadata = {}) => { ... };
  const signOut = async () => { ... };
  const resetPassword = async (email) => { ... };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

- **PHI fetches** – `phiFetch` transparently injects the Supabase JWT into every request so server-side endpoints can perform bearer authentication once the API enforces it.

```16:63:src/lib/phiFetch.js
export async function phiFetch(path, options = {}) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new Error('Authentication required');
  }
  const token = session.access_token;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  const response = await fetch(`${PHI_API_BASE}${path}`, { ...options, headers, credentials: 'omit', cache: 'no-store' });
```

---

## 2. HTTP API Catalog

| Endpoint | Methods | Description |
| --- | --- | --- |
| `/api/generate-notes` | `POST` | Generates structured JSON notes from transcripts and saves them to `sessions.structured_notes`. |
| `/api/phi/encounters` | `GET`, `POST`, `PUT` | Primary PHI interface for listing, creating, and updating encounters. |
| `/api/phi/encounters/[id]` | `GET`, `PUT` | HIPAA-compliant endpoint that includes audit logging per encounter. |
| `/api/phi/encounters/create` | `POST` | Legacy helper that inserts directly into `phi.encounters`. |
| `/api/phi/list-encounters` | `GET` | Simple connection test that lists encounters using a new PG pool. |
| `/api/phi/test-db` | `GET` | Diagnostics for DB connectivity and schema presence. |
| `/api/phi/test-simple` | `GET` | Simple liveness probe. |
| `phi-api-simple.js` server | `GET/POST/PUT` | Standalone Express server that mirrors the PHI endpoints for local testing. |

### 2.1 `POST /api/generate-notes`

- **Purpose** – Accepts `sessionId`, `transcript`, and either `templateId` or raw `templateData`. Fetches the template (if needed), prompts GPT-4o to fill the schema, stores the structured JSON in Supabase, and returns the saved payload.
- **Validation** – Rejects non-POST requests (405) and payloads missing required fields (400). Missing OpenAI keys return 500.
- **LLM call** – Uses the shared OpenAI client with a deterministic prompt and `temperature: 0.1`.
- **Persistence** – Writes directly to the `sessions` table via Supabase.

```34:175:src/pages/api/generate-notes.js
const { sessionId, transcript, templateId, templateData } = req.body;
if (!sessionId || !transcript || (!templateId && !templateData)) {
  return res.status(400).json({
    error: 'Missing required fields: sessionId, transcript, and either templateId or templateData'
  });
}
...
const completion = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [...],
  max_tokens: 2000,
  temperature: 0.1
});
...
await supabase
  .from('sessions')
  .update({
    structured_notes: filledStructuredData,
    updated_at: new Date().toISOString()
  })
  .eq('id', sessionId);
```

**Example**

```bash
curl -X POST https://your-app.com/api/generate-notes \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "b5b2c7d8-4f54-4f6c-9cd8-d0f887e45c11",
    "transcript": "Therapist transcript...",
    "templateId": "knee"
  }'
```

### 2.2 `/api/phi/encounters`

- **GET** – Lists recent encounters or fetches a single encounter when `?id=` is provided.
- **POST** – Inserts a draft encounter with default org/clinician IDs and optional template metadata.
- **PUT** – Updates SOAP content, status, and session title atomically.

```3:96:src/pages/api/phi/encounters.js
switch (req.method) {
  case 'GET': {
    const { limit = '50', id } = req.query;
    if (id) {
      const result = await query('SELECT * FROM phi.encounters WHERE id = $1', [id]);
      ...
    }
    const result = await query(
      'SELECT id, template_type, session_title, status, created_at FROM phi.encounters ORDER BY created_at DESC LIMIT $1',
      [parseInt(limit)]
    );
    return res.json({ success: true, encounters: result.rows, count: result.rows.length });
  }
  case 'POST': {
    const { templateType = 'knee', sessionTitle = 'New Session' } = req.body;
    const result = await query(
      `INSERT INTO phi.encounters (org_id, clinician_id, status, template_type, session_title, soap)
       VALUES ($1, $2, 'draft', $3, $4, $5) RETURNING *`,
      [testOrgId, testUserId, templateType, sessionTitle, '{}']
    );
    return res.status(201).json(result.rows[0]);
  }
  case 'PUT': {
    const { id, soap, status = 'draft', session_title } = req.body;
    ...
    const result = await query(
      \`UPDATE phi.encounters SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *\`,
      values
    );
```

**Example** – Update SOAP data:

```bash
curl -X PUT https://your-app.com/api/phi/encounters \
  -H "Content-Type: application/json" \
  -d '{
    "id": "c8f3d0fd-8a35-4be7-8a9f-91cce71caa6b",
    "soap": { "subjective": "..." },
    "status": "draft",
    "session_title": "Right knee eval"
  }'
```

### 2.3 `/api/phi/encounters/[id]`

Provides HIPAA-compliant CORS headers, fetches transcripts via a join, and logs every READ/UPDATE in `phi.audit_events`.

```8:80:src/pages/api/phi/encounters/[id].js
res.setHeader('Access-Control-Allow-Origin', '*');
...
const result = await query(
  `SELECT e.*, t.blob_url, t.duration_seconds
   FROM phi.encounters e
   LEFT JOIN phi.transcripts t ON e.id = t.encounter_id
   WHERE e.id = $1`,
  [id]
);
await logAudit(id, '00000000-0000-0000-0000-000000000001', 'READ');
...
await logAudit(id, '00000000-0000-0000-0000-000000000001', 'UPDATE');
```

### 2.4 `/api/phi/encounters/create`

Legacy helper that still accepts optional transcript text and template metadata, then logs a CREATE audit event.

```8:50:src/pages/api/phi/encounters/create.js
const {
  template_type,
  session_title,
  soap = {},
  transcript_text = null,
  org_id = '00000000-0000-0000-0000-000000000001',
  clinician_id = 'test-user'
} = req.body;
...
const result = await query(
  `INSERT INTO phi.encounters
   (org_id, clinician_id, status, soap, transcript_text, template_type, session_title, created_at, updated_at)
   VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
   RETURNING *`,
  [...]
);
await logAudit(newEncounter.id, clinician_id, 'CREATE');
```

### 2.5 `/api/phi/list-encounters`

Used primarily as a connectivity smoke test. Creates a new `pg` Pool on every request and returns limited encounter metadata.

```1:31:src/pages/api/phi/list-encounters.js
const pool = new Pool({
  host: process.env.PGHOST,
  ...
});
const result = await pool.query(
  'SELECT id, template_type, session_title, status, created_at FROM phi.encounters ORDER BY created_at DESC LIMIT $1',
  [parseInt(limit)]
);
```

### 2.6 `/api/phi/test-db`

Returns env status, schema presence, and table counts to simplify deployment debugging.

```8:82:src/pages/api/phi/test-db.js
const envCheck = { PGHOST: !!process.env.PGHOST, ... };
const timeResult = await query('SELECT NOW() as current_time, current_database() as database');
const schemaCheck = await query(`SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'phi'`);
const tableCheck = await query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'phi' AND table_name = 'encounters'`);
```

### 2.7 `/api/phi/test-simple`

Simple JSON heartbeat.

```1:3:src/pages/api/phi/test-simple.js
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello from test-simple' });
}
```

### 2.8 Standalone Express server (`phi-api-simple.js`)

When you need to run PHI APIs outside Next.js (e.g., benchmarking), start `node phi-api-simple.js`. It exposes the same routes (health, `/encounters`, `/encounters/:id`, `/encounters/:id/upload-url`, etc.) while logging every DB action.

```54:205:phi-api-simple.js
app.get('/health', (req, res) => { ... });
app.post('/encounters', async (req, res) => {
  const result = await pool.query(
    `INSERT INTO phi.encounters (org_id, clinician_id, status, template_type, session_title, soap)
     VALUES ($1, $2, 'draft', $3, $4, $5) RETURNING *`, [...]
  );
  await pool.query('INSERT INTO phi.audit_events (encounter_id, actor_id, event) VALUES ($1, $2, $3)', [..., 'CREATE']);
});
app.get('/encounters/:id', async (req, res) => { ... });
app.put('/encounters/:id', async (req, res) => { ... });
app.post('/encounters/:id/upload-url', async (req, res) => { ... });
```

---

## 3. Services & Utilities

### 3.1 Database helper (`src/lib/db.js`)

- `getPool()` – creates a low-connection pool tuned for serverless platforms.
- `query(text, params)` – wraps `pool.connect()` with logging and error instrumentation.
- `logAudit(encounterId, actorId, event)` – inserts into `phi.audit_events` but intentionally swallows errors so patient workflows continue.
- `testConnection()` – quick health check used by diagnostics.

```11:105:src/lib/db.js
export function getPool() { ... }
export async function query(text, params) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    console.log('🔍 Executing query:', text.substring(0, 100) + '...');
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}
export async function logAudit(encounterId, actorId, event) { ... }
```

### 3.2 PHI fetch utilities (`src/lib/phiFetch.js`)

- `phiFetch(path, options)` – wraps `fetch` with Supabase JWTs, disables caching, and enforces JSON responses.
- `PHIClient` – convenience class with semantic methods like `createEncounter`, `getEncounter`, `updateEncounter`, etc.
- `usePHI()` – hook that exposes loading/error state and proxies to `PHIClient`.

```72:140:src/lib/phiFetch.js
export class PHIClient {
  static async createEncounter(templateType, sessionTitle) {
    return phiFetch('/encounters', {
      method: 'POST',
      body: JSON.stringify({ templateType, sessionTitle })
    });
  }
  static async updateEncounter(id, soapData, status = 'draft') {
    return phiFetch(`/encounters/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ soap: soapData, status })
    });
  }
  ...
}
```

### 3.3 Supabase auth service (`src/services/supabase.js`)

Provides a thin wrapper over `supabase-js` with preconfigured session behavior and domain-specific helper methods (`signIn`, `signUp`, `resetPassword`, etc.). Throws on missing env to catch misconfiguration early.

### 3.4 AI client (`src/services/aiClient.js`)

- `initializeAI(apiKey)` – constructs the shared OpenAI client and allows browser usage.
- `getOpenAIClient()` / `isAIInitialized()` – guard helpers.
- `createChatCompletion(params)` – instrumentation wrapper around `client.chat.completions.create`.
- `validateApiResponse(completion)` – ensures responses contain usable content.

```17:101:src/services/aiClient.js
export const initializeAI = (apiKey) => {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }
  openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
};
export const createChatCompletion = async (params) => {
  const client = getOpenAIClient();
  const completion = await client.chat.completions.create(params);
  return completion;
};
```

### 3.5 Structured AI service (`src/services/structuredAI.js`)

`createAIService()` auto-initializes the OpenAI client (falling back to env vars) and injects strict anti-hallucination rules into every prompt. Additional exports include `generateStructuredSOAP`, `validateAIResponse`, `suggestTemplateType`, and `calculateConfidenceScores`.

```30:134:src/services/structuredAI.js
export const createAIService = () => {
  if (!isAIInitialized()) {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (apiKey) {
      initializeAI(apiKey);
    } else {
      throw new Error('⚠️ No OpenAI API key found in environment variables...');
    }
  }
  return {
    generateCompletion: async (prompt, options = {}) => {
      const enhancedPrompt = addStrictRules(prompt);
      const completion = await createChatCompletion({ messages: [...], ...normalizedOptions });
      let cleanedResponse = completion.choices[0]?.message?.content?.trim() || '';
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
      }
      return cleanedResponse;
    }
  };
};
```

### 3.6 Transcription service (`src/services/transcriptionService.js`)

Wraps Whisper (`audio.transcriptions.create`) and enforces file validation (size, format, speech detection). Throws descriptive errors for every failure path to simplify UX messaging.

```14:88:src/services/transcriptionService.js
export const transcribeAudio = async (audioBlob) => {
  const openai = getOpenAIClient();
  if (!audioBlob || audioBlob.size === 0) {
    throw new Error('Invalid audio file: empty or missing audio data');
  }
  const audioFile = new File([audioBlob], 'recording.webm', { type: audioBlob.type || 'audio/webm' });
  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
    language: "en",
    response_format: "text"
  });
  if (transcription.trim().length < 10) {
    throw new Error('Insufficient audio content - no clear speech detected. Please record a longer session.');
  }
  return transcription;
};
```

### 3.7 Export service (`src/services/exportService.js`)

- `exportToPDF(soapData, sessionInfo)` – builds a multi-section PDF with headers, tables, and footers via `jsPDF`.
- `exportToText` & `copyToClipboard` – produce formatted plain text and copy it to the user’s clipboard.
- `getExportOptions()` – metadata used by UI menus.

```15:167:src/services/exportService.js
export const exportToPDF = async (soapData, sessionInfo = {}) => {
  const pdf = new jsPDF();
  ...
  pdf.text('SUBJECTIVE', margin, yPosition);
  ...
  const filename = `SOAP_Note_${sessionInfo.sessionNumber || 'New'}_${sessionDate.replace(/\//g, '-')}.pdf`;
  pdf.save(filename);
};
```

### 3.8 Logging utilities (`src/utils/logging.js`)

Structured logging helpers (`logInfo`, `logWarning`, `logError`, `logAIProcess`) that automatically capture timestamps, contexts, and JSON payloads.

```25:77:src/utils/logging.js
export const logEvent = (level, context, message, data = {}) => {
  const logObj = { timestamp: new Date().toISOString(), level, context, message, ...data };
  if (level === LOG_LEVELS.ERROR) {
    console.error(logObj);
    return;
  }
  if (isDev || level === LOG_LEVELS.WARN) {
    if (level === LOG_LEVELS.INFO) console.info(logObj);
  }
};
export const logAIProcess = (step, message, data = {}) => {
  logInfo('AI Processing', `${step}: ${message}`, { aiProcessingStep: step, ...data });
};
```

### 3.9 Template processors & sample data

- `processTemplateData`, `applyStructuredDataToSession`, `enhanceSessionWithTemplate` convert stored JSON schemas into session-friendly structures.

```15:118:src/utils/templateProcessor.js
export const processTemplateData = (template, transcription) => {
  if (!template || !template.structured_data) {
    return { processed: false, template, structuredData: null };
  }
  const structuredData = typeof template.structured_data === 'string'
    ? JSON.parse(template.structured_data)
    : template.structured_data;
  return { processed: true, template, structuredData };
};
```

- `src/utils/testData.js` – curated transcripts for each template (knee, daily note, discharge, etc.) used by TemplateSelector “Try Example” buttons.
- `src/utils/testRunner.js` – CLI-style helpers for exercising every template hook plus the export service.

---

## 4. React Hooks

### 4.1 `useAuth` / `AuthProvider`

Manages Supabase sessions, auto-refreshes tokens, exposes auth helpers, and redirects unauthenticated users.

### 4.2 `useSessions`

High-level manager that:

- Pulls encounters from `/api/phi/encounters?limit=50`.
- Normalizes them into the legacy “session” shape.
- Saves new encounters by POSTing → PUTing SOAP content.
- Provides CRUD helpers (`saveSession`, `updateSession`, `deleteSession`, `getSession`) and sorting.

```40:223:src/hooks/useSessions.js
const fetchSessionsByDate = useCallback(async (date = new Date()) => {
  const response = await phiFetch('/encounters?limit=50');
  const data = response.encounters || response || [];
  const todayEncounters = data.filter(encounter => {
    const createdAt = new Date(encounter.created_at);
    return createdAt.toISOString().split('T')[0] === formattedDate;
  });
  const processedSessions = todayEncounters.map((encounter) => ({
    id: encounter.id,
    body_region: encounter.template_type,
    session_type: 'evaluation',
    session_title: encounter.session_title,
    soap_note: encounter.soap,
    transcript: encounter.transcript_text,
    status: encounter.status,
    created_at: encounter.created_at,
    updated_at: encounter.updated_at
  }));
  setSessions(sortSessions(processedSessions, sortOption));
}, [sortOption]);
```

### 4.3 `useTemplates`

Fetches templates from Supabase, falls back to a rich offline template, and exposes helpers for selection, CRUD, duplication, and structured data parsing.

```16:153:src/hooks/useTemplates.js
const fetchTemplates = async () => {
  if (!user) {
    setTemplates(getFallbackTemplates());
    setIsLoading(false);
    return;
  }
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false });
  const transformedData = data.map((template) => ({
    id: template.template_key,
    name: template.name,
    bodyRegion: template.body_region,
    sessionType: template.session_type,
    structured_data: template.structured_data,
    ...
  }));
  setTemplates(transformedData.length === 0 ? getFallbackTemplates() : transformedData);
};
```

### 4.4 `useTemplateManager` + template hooks

- `useTemplateManager(templateType)` lazily loads every template hook, exposes metadata, `generateSOAP`, validation helpers, and template suggestions.

```20:175:src/hooks/templates/useTemplateManager.js
const templateHooks = { knee: kneeTemplate, shoulder: shoulderTemplate, ..., discharge: dischargeTemplate };
const getAvailableTemplates = () => Object.keys(templateHooks).map(key => ({
  key,
  ...TEMPLATE_METADATA[key],
  hook: templateHooks[key]
}));
const generateSOAP = async (transcript, aiService) => {
  if (!currentTemplate) {
    throw new Error('No template loaded');
  }
  return await currentTemplate.generateSOAP(transcript, aiService);
};
```

- Each template hook (knee, shoulder, hip, ankle/foot, back, neck, daily note, discharge) exports `{ templateConfig, generateSOAP, schema }` and focuses on specialized prompts.

```7:150:src/hooks/templates/useDailyNote.js
export const useDailyNote = () => {
  const templateConfig = { id: 'daily-note', name: 'Daily Note', schema: { subjective: {...}, objective: {...}, ... } };
  const generateSOAP = async (transcript, aiService) => {
    const fullPrompt = `${templateConfig.aiPrompt}\nCRITICAL PRIVACY INSTRUCTION: ...`;
    const response = await aiService.generateCompletion(fullPrompt, { temperature: 0.3, max_tokens: 2000 });
    const soapData = JSON.parse(response);
    const structuredSOAP = { subjective: {...}, objective: {...}, assessment: {...}, plan: {...}, billing: {...} };
    return { success: true, data: structuredSOAP };
  };
  return { templateConfig, generateSOAP, schema: templateConfig.schema };
};
```

### 4.5 `useTheme`

Persists the user’s theme preference in `localStorage`, toggles the `dark` class on `<html>`, and exposes `theme`, `toggleTheme`, and `setTheme`.

```7:45:src/hooks/useTheme.js
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    ...
  }, []);
  const toggleTheme = () => { ... };
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 4.6 `useTutorial`

Stores tutorial completion state in `localStorage`, exposes helpers for opening, skipping, or resetting the onboarding flow.

```9:85:src/hooks/useTutorial.js
export const TutorialProvider = ({ children }) => {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false);
  const [shouldShowTutorialPrompt, setShouldShowTutorialPrompt] = useState(false);
  ...
  return (
    <TutorialContext.Provider value={{ isTutorialOpen, hasCompletedTutorial, shouldShowTutorialPrompt, openTutorial, closeTutorial, resetTutorial, dismissTutorialPrompt }}>
      {children}
    </TutorialContext.Provider>
  );
};
```

---

## 5. UI Components

### 5.1 Page & layout scaffolding

- **MainAppPage** – wraps `MainPage` with `ProtectedRoute` and `StateProvider`.

```8:18:src/components/pages/MainAppPage.jsx
export default function MainAppPage() {
  return (
    <ProtectedRoute>
      <StateProvider>
        <MainPage />
      </StateProvider>
    </ProtectedRoute>
  );
}
```

- **ProtectedRoute** – shows a loading spinner until auth state resolves and redirects unauthenticated visitors to `/landing`.

```15:56:src/components/auth/ProtectedRoute.jsx
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading && !user) {
      router.push('/landing');
    }
  }, [user, loading, router]);
  if (loading) { return <div className="flex items-center ...">Verifying session...</div>; }
  if (!user) return null;
  return children;
}
```

- **StateProvider / useAppState** – centralizes app states (`idle`, `templateSelected`, `recording`, etc.), current note, and helper actions such as `viewNote`, `createNewNote`, and `triggerRefresh`.

```19:105:src/components/MainPage/StateManager.jsx
export const APP_STATES = { IDLE: 'idle', TEMPLATE_SELECTED: 'templateSelected', RECORDING: 'recording', PROCESSING: 'processing', EDITING: 'editing', VIEWING: 'viewing' };
export function StateProvider({ children }) {
  const [appState, setAppState] = useState(APP_STATES.IDLE);
  const selectTemplate = (template) => { setSelectedTemplate(template); setAppState(APP_STATES.TEMPLATE_SELECTED); };
  const finishProcessing = (note) => { setCurrentNote(note); setAppState(APP_STATES.EDITING); };
  const viewNote = async (note) => { const response = await fetch(`/api/phi/encounters?id=${note.id}`); ... };
  return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
}
```

- **MainPage** – orchestrates the sidebar, template selection, recording interface, SOAP editor, tutorial modal, and settings drawer.

```19:299:src/components/MainPage/MainPage.jsx
export default function MainPage() {
  const { appState, createNewNote, currentNote, sessionName, setSessionName, triggerRefresh, updateCurrentNote } = useAppState();
  const { signOut } = useAuth();
  ...
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
      <Sidebar />
      <main className="lg:ml-80 min-h-screen">
        <nav className="sticky top-0 ...">
          ...
        </nav>
        <div className="max-w-4xl mx-auto px-8 py-12">
          <AnimatePresence mode="wait">
            {showBlob && (
              <motion.div key="blob-view" ...>
                <TemplateSelector />
                <RecordingInterface />
              </motion.div>
            )}
            {showSOAPEditor && currentNote && (
              <motion.div key="soap-editor" ...>
                <SOAPEditor ... />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <TutorialModule isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
    </div>
  );
}
```

- **Sidebar** – lists recent encounters, provides search, and supports mobile toggling.

```15:235:src/components/MainPage/Sidebar.jsx
const { viewNote, refreshTrigger } = useAppState();
useEffect(() => { fetchNotes(); }, [refreshTrigger]);
const response = await fetch('/api/phi/encounters?limit=50');
...
{filteredNotes.map((note) => (
  <motion.button key={note.id} onClick={() => viewNote(note)} className="w-full p-3 text-left">
    <h3 className="font-medium">{note.session_title || `${note.template_type} Evaluation`}</h3>
  </motion.button>
))}
```

- **TemplateSelector (MainPage)** – grid of template buttons plus “Try Example” actions that call template managers with sample transcripts.

```29:222:src/components/MainPage/TemplateSelector.jsx
const TEMPLATES = [{ id: 'daily-note', ... }, { id: 'knee', ... }];
const handleTestMode = async () => {
  const transcript = sampleTranscriptions.knee_evaluation;
  const aiService = createAIService();
  const soapResult = await kneeManager.generateSOAP(transcript, aiService);
  const encounter = await fetch('/api/phi/encounters', { method: 'POST', body: JSON.stringify({ templateType: 'knee', sessionTitle: 'AI Generated Knee Evaluation' }) }).then(r => r.json());
  await fetch('/api/phi/encounters', { method: 'PUT', body: JSON.stringify({ id: encounter.id, soap: soapResult.data, status: 'draft' }) });
  finishProcessing(updatedEncounter);
};
```

- **RecordingInterface** – manages browser recording, Whisper transcription, AI generation, PHI persistence, and UI states (recording, processing, cancellation).

```14:269:src/components/MainPage/RecordingInterface.jsx
const handleSubmitSession = async () => {
  setProcessingStatus('Transcribing audio...');
  const transcript = await transcribeAudio(audioBlob);
  const aiService = createAIService();
  const soapResult = await templateManager.generateSOAP(transcript, aiService);
  const encounter = await fetch('/api/phi/encounters', { method: 'POST', body: JSON.stringify({ templateType: selectedTemplate, sessionTitle: sessionName }) }).then(r => r.json());
  await fetch('/api/phi/encounters', {
    method: 'PUT',
    body: JSON.stringify({ id: encounter.id, soap: soapResult.data, status: 'draft' })
  });
  finishProcessing(updatedEncounter);
};
```

- **SOAPEditor** – WYSIWYG editor with section-specific widgets, save/export actions, and confidence indicators.

```16:497:src/components/soap/SOAPEditor.jsx
const SOAPEditor = ({ soapData, onSoapChange, onSave, onExport, sessionName, onSessionNameChange }) => {
  const handleSave = async () => {
    const sessionData = { ...soapData, sessionName: localSessionName || 'Untitled Session' };
    await onSave(sessionData);
  };
  return (
    <div className="soap-editor">
      <motion.div className="mb-8 ...">
        <input value={localSessionName} onChange={(e) => handleSessionNameChange(e.target.value)} />
        <button onClick={handleSave}>Save Note</button>
        <button onClick={handleCopyToClipboard}>Copy</button>
        <button onClick={handlePDFExport}>PDF</button>
      </motion.div>
      <motion.section>
        <WYSIWYGEditor content={soapData.subjective?.content || ''} ... />
      </motion.section>
      <motion.section>
        <ObjectiveTable data={soapData.objective || { headers: [], rows: [] }} ... />
      </motion.section>
      ...
    </div>
  );
};
```

- **TutorialModule** – overlay with multi-step onboarding, keyboard shortcuts, and action buttons.

```9:173:src/components/tutorial/TutorialModule.jsx
const TutorialModule = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const tutorialSteps = [{ title: "Welcome to PT SOAP Generator", ... }, ...];
  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);
  ...
};
```

- **AuthComponent** – login/signup/reset UI matching the design system; consumes callbacks passed from pages.

```12:311:src/components/auth/auth.jsx
const AuthComponent = ({ onLogin = () => {}, onSignup = () => {}, onPasswordReset = () => {} }) => {
  const [mode, setMode] = useState('login');
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'login') await onLogin(formData);
    if (mode === 'signup') await onSignup(formData);
    if (mode === 'reset') await onPasswordReset(formData.email);
  };
  return (
    <Card className="p-6 ...">
      <form onSubmit={handleSubmit}>
        <Input id="email" type="email" ... />
        ...
      </form>
    </Card>
  );
};
```

- **DashboardLayout / AppBar / Sidebar / MobileNav** – optional shell for multi-page dashboards; integrates tutorial prompts and responsive navigation.

```11:88:src/components/layout/DashboardLayout.jsx
function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isTutorialOpen, shouldShowTutorialPrompt, openTutorial, closeTutorial, dismissTutorialPrompt } = useTutorial();
  return (
    <div className="flex flex-col h-screen">
      <AppBar />
      <TutorialModule isOpen={isTutorialOpen} onClose={() => closeTutorial(true)} />
      <AnimatePresence>
        {shouldShowTutorialPrompt && (
          <TutorialPrompt onStart={openTutorial} onDismiss={dismissTutorialPrompt} />
        )}
      </AnimatePresence>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />
        <main className={`flex-1 overflow-y-auto ${sidebarCollapsed ? 'sm:ml-[72px]' : 'sm:ml-[260px]'}`}>
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
```

### 5.2 UI primitives & utilities

These components adhere to the style guide and can be reused across new features:

- **Button** – three variants (`primary`, `secondary`, `ghost`) with motion/disabled states.

```7:74:src/components/ui/button.jsx
const Button = React.forwardRef(({ variant = 'primary', size = 'medium', ... }, ref) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2';
  return (
    <button ref={ref} type={type} disabled={disabled} style={getVariantStyles(variant)} className={`${baseStyles} ${variantClasses[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
});
```

- **Input / Label / Card / Separator** – typography-aligned primitives.

```9:21:src/components/ui/input.jsx
const Input = React.forwardRef(({ className = "", type = "text", ...props }, ref) => (
  <input type={type} className={`w-full h-11 px-4 ... focus:ring-blue-primary ${className}`} ref={ref} {...props} />
));
```

- **ThemeToggle** – uses `useTheme` to swap icons and animate the toggle.

```7:23:src/components/ui/ThemeToggle.jsx
export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <motion.button onClick={toggleTheme} className={`p-2 ... ${className}`}>
      {theme === 'light' ? <Moon /> : <Sun />}
    </motion.button>
  );
}
```

- **ConfirmationDialog** – accessible modal for destructive actions.

```9:99:src/components/ui/ConfirmationDialog.jsx
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText }) => {
  if (!isOpen) return null;
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <motion.div className="relative w-full max-w-md bg-white rounded-xl shadow-xl">
        <div className="p-5 border-b flex justify-between">
          <h2>{title}</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="p-5">{message}</div>
        <div className="p-4 bg-gray-50 flex justify-end space-x-3">
          <button onClick={onClose}>{cancelText}</button>
          <button onClick={onConfirm} className={`${confirmButtonClass}`}>{confirmText}</button>
        </div>
      </motion.div>
    </motion.div>
  );
};
```

- **FloatingActionButton** – persistent mic button for mobile/desktop.

```11:55:src/components/ui/FloatingActionButton.jsx
const FloatingActionButton = () => {
  const router = useRouter();
  return (
    <motion.button className="fixed right-6 bottom-6 ..." onClick={() => router.push('/record')}>
      <Mic className="text-white w-6 h-6" />
      <motion.div className="absolute inset-0 rounded-full bg-[rgba(37,99,235,0.3)]" animate={{ scale: [0.85, 1.2, 0.85], opacity: [0.7, 0, 0.7] }} transition={{ duration: 2.5, repeat: Infinity }} />
    </motion.button>
  );
};
```

- **RecordingModal** – MUI-powered modal that routes to `/record` when the user confirms.

```13:97:src/components/ui/RecordingModal.jsx
const RecordingModal = ({ isOpen, onClose }) => {
  React.useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30" onClick={onClose}>
          <motion.div className="w-full max-w-md bg-white rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
            <Button variant="contained" onClick={handleStartRecording}>Start Recording</Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

- **DashboardCard**, **ViewToggle**, **TemplateSelector (UI)** – ready-to-use cards/toggles consistent with the design tokens.

```24:108:src/components/ui/dashboard-card.jsx
export const DashboardCard = React.forwardRef(({ icon, title, value, subtitle, trend, children, className }, ref) => (
  <motion.div ref={ref} className={cn("relative rounded-2xl p-6 ...", className)} whileHover={{ y: -4 }}>
    {icon && <div className="absolute top-4 right-4 p-2 rounded-full">{icon}</div>}
    {title && <h3 className="text-sm font-semibold uppercase text-gray-600 mb-1">{title}</h3>}
    {value && <div className="text-2xl font-bold text-gray-900">{value}</div>}
    <div className="relative z-10">{children}</div>
  </motion.div>
));
```

---

## 6. Example Workflows

### 6.1 Generate a structured SOAP note from a recording

1. Use `RecordingInterface` as reference: record audio, stop, and prompt users to name the session.
2. Transcribe the blob using `transcribeAudio`.
3. Pick the template via `useTemplateManager` and call `generateSOAP(transcript, createAIService())`.
4. Persist the encounter: `await PHIClient.createEncounter(templateType, sessionTitle)` then `await PHIClient.updateEncounter(id, soapData)`.
5. Show the result inside `SOAPEditor`.

```jsx
import { createAIService } from '@/services/structuredAI';
import { PHIClient } from '@/lib/phiFetch';
import { useTemplateManager } from '@/hooks/templates/useTemplateManager';
import { transcribeAudio } from '@/services/transcriptionService';

async function handleRecordingSubmit({ blob, templateType, sessionTitle }) {
  const transcript = await transcribeAudio(blob);
  const templateManager = useTemplateManager(templateType);
  const aiService = createAIService();
  const soap = await templateManager.generateSOAP(transcript, aiService);
  const encounter = await PHIClient.createEncounter(templateType, sessionTitle);
  await PHIClient.updateEncounter(encounter.id, soap.data, 'draft');
  return encounter.id;
}
```

### 6.2 Programmatic encounter management

```js
import { PHIClient } from '@/lib/phiFetch';

async function finalizeEncounter(encounterId) {
  const encounter = await PHIClient.getEncounter(encounterId);
  if (encounter.status !== 'final') {
    await PHIClient.updateEncounter(encounterId, encounter.soap, 'final');
  }
  return PHIClient.getEncounter(encounterId);
}
```

### 6.3 Building a dashboard with `useSessions`

```jsx
import useSessions from '@/hooks/useSessions';

export default function TodaySessions() {
  const { sessions, isLoading, fetchSessionsByDate, saveSession } = useSessions();

  useEffect(() => {
    fetchSessionsByDate(new Date());
  }, [fetchSessionsByDate]);

  if (isLoading) return <p>Loading…</p>;

  return (
    <ul>
      {sessions.map((session) => (
        <li key={session.id}>
          {session.session_title} – {session.body_region}
        </li>
      ))}
    </ul>
  );
}
```

---

## 7. Extensibility Guidelines

1. **Add new PHI endpoints** – build on `src/pages/api/phi/*` so they automatically reuse the shared PG pool and audit helpers. Enforce method guards as shown in existing handlers.
2. **Create new templates** – mirror the structure of `useDailyNote`/`useKneeEvaluation`: define a schema, AI prompt, and `generateSOAP` that coerces AI output into the schema before returning it through `useTemplateManager`.
3. **Leverage hooks** – wrap new pages with `AuthProvider`, `StateProvider`, and `ThemeProvider` to access global auth/app state/theme.
4. **UI consistency** – use the primitives in `src/components/ui` (Button, Input, Card, ThemeToggle, etc.) to match the design system. For modals or confirmations, reuse `RecordingModal` or `ConfirmationDialog`.
5. **Testing** – run `runFullTestSuite()` from `src/utils/testRunner.js` (or use the TemplateSelector “Try Example” buttons) before promoting template changes; they validate JSON integrity and export paths.

By following this handbook, every API consumer, hook, and UI surface stays consistent with the existing privacy-first architecture while remaining easy to extend.
