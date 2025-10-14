# Implementation Guide: Steps 1-6
## PT SOAP Generator - Note Editing & Enhancement

---

## Overview
This guide outlines the implementation plan for 6 critical features without breaking existing functionality. Each step includes file locations, changes needed, and testing procedures.

---

## Step 1: Confirm Notes Are Being Saved in Azure DB

### Current Status
✅ **Already Working** - Notes are being saved to Azure PostgreSQL

### Files Involved
- `src/pages/api/phi/encounters.js` (lines 59-79, 81-107)
- `src/hooks/useSessions.js` (lines 158-220)
- `src/lib/db.js` (central database connection)

### What's Happening
1. When user generates a SOAP note, `saveSession()` is called
2. Creates encounter via POST `/api/phi/encounters`
3. Updates encounter with SOAP data via PUT `/api/phi/encounters/[id]`
4. Data stored in `phi.encounters` table with JSONB `soap` column

### Testing Steps
```bash
# 1. Run the test script
node test-full-flow.js

# 2. Check Azure PostgreSQL directly
# Connect to: do-phi-2025.postgres.database.azure.com
# Run query:
SELECT id, template_type, session_title, 
       jsonb_pretty(soap) as soap_data,
       created_at 
FROM phi.encounters 
ORDER BY created_at DESC 
LIMIT 5;
```

### Verification Checklist
- [ ] Encounter created with unique UUID
- [ ] SOAP data stored as JSONB
- [ ] All 4 sections present (subjective, objective, assessment, plan)
- [ ] Audit log entry created
- [ ] Timestamps populated correctly

---

## Step 2: Make Changes to Notes After Generation & Save to DB

### Current Status
⚠️ **Partially Working** - Editing works, but need to verify save functionality

### Files Involved
1. **SOAPEditor Component**
   - `src/components/soap/SOAPEditor.jsx` (lines 30-77)
   - Handles section changes and auto-save

2. **WYSIWYG Editor**
   - `src/components/soap/WYSIWYGEditor.jsx`
   - Handles text editing for Subjective, Assessment, Plan

3. **Objective Table**
   - `src/components/soap/ObjectiveTable.jsx`
   - Handles table row editing

4. **Save Handler**
   - `src/pages/soap/generate.jsx` (lines 177-225)
   - `handleSave()` function sends updates to API

### Implementation Plan

#### A. Verify Auto-Save Works
**File:** `src/components/soap/SOAPEditor.jsx`
- Lines 42-51: Auto-save timer (2 seconds after edit)
- Lines 53-77: `handleSave()` function
- **Action:** Add more detailed logging to confirm saves

#### B. Verify Manual Save Works  
**File:** `src/pages/soap/generate.jsx`
- Lines 177-225: `handleSave()` function
- Calls `phiFetch()` with PUT method
- **Action:** Ensure response handling is correct

#### C. Test Each Editor Type
1. **WYSIWYG (Subjective/Assessment/Plan)**
   - Type text → Wait 2 seconds → Check console for save
   - Verify PUT request sent to `/api/phi/encounters/[id]`

2. **Objective Table**
   - Add row → Edit cells → Wait 2 seconds
   - Verify table data included in save

### Testing Steps
```javascript
// 1. Open browser console (F12)
// 2. Navigate to a generated note
// 3. Edit Subjective section
// 4. Watch for these console logs:
//    - "📋 SOAPEditor received data"
//    - "Saving session..."
//    - "✅ Encounter updated with SOAP data"

// 5. Refresh page - changes should persist
// 6. Check database:
SELECT soap->>'subjective' as subjective_content
FROM phi.encounters 
WHERE id = 'your-encounter-id';
```

### Potential Issues & Fixes
- **Issue:** Changes not saving
  - **Check:** `hasUnsavedChanges` state in SOAPEditor
  - **Fix:** Ensure `handleSectionChange()` sets it to true

- **Issue:** Auto-save too aggressive
  - **Fix:** Adjust timer in line 47 (currently 2000ms)

---

## Step 3: Configure Loading Ability for Each Note

### Current Status
✅ **Already Working** - Load by ID implemented

### Files Involved
1. **Load Function**
   - `src/pages/soap/generate.jsx` (lines 68-92)
   - `loadSession()` function

2. **PHI API Endpoint**
   - `src/pages/api/phi/encounters/[id].js` (lines 40-58)
   - GET endpoint returns encounter data

3. **URL Routing**
   - Route: `/soap/generate?sessionId=[ID]&templateType=[TYPE]`

### How It Works
1. User navigates to `/soap/generate?sessionId=abc-123`
2. `useEffect` triggers `loadSession()` (line 45-52)
3. Calls `phiFetch(/encounters/abc-123)`
4. Sets `soapData` state with loaded content
5. SOAPEditor renders with data

### Testing Steps
```bash
# 1. Generate a note and copy its ID from URL
# 2. Navigate away (go to dashboard)
# 3. Manually navigate to:
http://localhost:3000/soap/generate?sessionId=[PASTE-ID-HERE]&templateType=knee

# 4. Verify:
- Note loads with all content
- All 4 sections populated
- Objective table has rows
- Can edit and save changes
```

### Enhancement Needed
**Add a "Recent Notes" list on dashboard**

**Files to Update:**
- `src/pages/dashboard.jsx`
- Use `useSessions.fetchSessionsByDate()`
- Display clickable list of recent encounters

---

## Step 4: Add Short & Long Term Goals to Assessment

### Current Status
❌ **Not Implemented** - Assessment is currently just text

### Files to Update

#### A. Template Schemas (All Templates)
**Files:** (Update ALL of these identically)
- `src/hooks/templates/useKneeEvaluation.js` (lines 42-47)
- `src/hooks/templates/useShoulderEvaluation.js` (lines 43-48)
- `src/hooks/templates/useBackEvaluation.js` (lines 43-48)
- `src/hooks/templates/useHipEvaluation.js`
- `src/hooks/templates/useAnkleFootEvaluation.js`
- `src/hooks/templates/useNeckEvaluation.js`
- `src/hooks/templates/useElbowWristEvaluation.js`
- `src/hooks/templates/useBalanceTraining.js`

**Current Structure:**
```javascript
assessment: {
  type: 'wysiwyg',
  content: '',
  placeholder: 'Clinical impression, diagnosis, prognosis...'
}
```

**New Structure:**
```javascript
assessment: {
  type: 'composite', // Changed from 'wysiwyg'
  clinical_impression: {
    type: 'wysiwyg',
    content: '',
    placeholder: 'Clinical reasoning, diagnosis, contributing factors...'
  },
  short_term_goals: {
    type: 'list',
    items: [],
    placeholder: 'Goals for 2-4 weeks (e.g., Reduce pain to 3/10, Improve ROM to 120°)'
  },
  long_term_goals: {
    type: 'list',
    items: [],
    placeholder: 'Goals for 6-12 weeks (e.g., Return to sport, Independent with HEP)'
  }
}
```

#### B. AI Prompts (All Templates)
**Files:** Same template files, update `createPrompt()` function

**Current Prompt Section:**
```javascript
"assessment": {
  "content": "Clinical reasoning, likely diagnosis..."
}
```

**New Prompt Section:**
```javascript
"assessment": {
  "clinical_impression": "Clinical reasoning, likely diagnosis, contributing factors, prognosis",
  "short_term_goals": [
    "Specific, measurable goal for 2-4 weeks",
    "Another short-term goal",
    "2-4 goals total"
  ],
  "long_term_goals": [
    "Specific, measurable goal for 6-12 weeks",
    "Another long-term goal",
    "2-3 goals total"
  ]
}
```

#### C. SOAPEditor Component
**File:** `src/components/soap/SOAPEditor.jsx`

**Add New Component for Goals:**
Create `src/components/soap/GoalsList.jsx`:
```javascript
// New component to render editable goal lists
// Similar to ObjectiveTable but simpler
// - Add/remove goals
// - Edit goal text inline
// - Drag to reorder (optional)
```

**Update SOAPEditor rendering** (around line 350-380):
```javascript
{/* Assessment Section - Now with 3 parts */}
<motion.section>
  <h2>Assessment</h2>
  
  {/* Clinical Impression */}
  <WYSIWYGEditor 
    content={soapData.assessment?.clinical_impression}
    onChange={(data) => handleSectionChange('assessment', {
      ...soapData.assessment,
      clinical_impression: data
    })}
  />
  
  {/* Short Term Goals */}
  <h3>Short Term Goals (2-4 weeks)</h3>
  <GoalsList
    goals={soapData.assessment?.short_term_goals || []}
    onChange={(goals) => handleSectionChange('assessment', {
      ...soapData.assessment,
      short_term_goals: goals
    })}
  />
  
  {/* Long Term Goals */}
  <h3>Long Term Goals (6-12 weeks)</h3>
  <GoalsList
    goals={soapData.assessment?.long_term_goals || []}
    onChange={(goals) => handleSectionChange('assessment', {
      ...soapData.assessment,
      long_term_goals: goals
    })}
  />
</motion.section>
```

### Testing Steps
1. Generate new note with updated template
2. Verify AI generates goals in separate arrays
3. Edit goals in UI
4. Save and reload - verify persistence
5. Export PDF - verify goals formatted correctly

---

## Step 5: Update Plan to Bullet Points with Progression/Regression

### Current Status
❌ **Not Implemented** - Plan is currently just text

### Files to Update

#### A. Template Schemas (All Templates)
**Current Structure:**
```javascript
plan: {
  type: 'wysiwyg',
  content: '',
  placeholder: 'Treatment plan, interventions, frequency...'
}
```

**New Structure:**
```javascript
plan: {
  type: 'composite',
  interventions: {
    type: 'list',
    items: [],
    placeholder: 'Specific treatment interventions'
  },
  progressions: {
    type: 'list',
    items: [],
    placeholder: 'How to advance treatment (e.g., Increase resistance, Add balance component)'
  },
  regressions: {
    type: 'list',
    items: [],
    placeholder: 'How to modify if too difficult (e.g., Reduce ROM, Add support)'
  },
  frequency_duration: {
    type: 'text',
    content: '',
    placeholder: '2x/week for 6 weeks'
  },
  patient_education: {
    type: 'wysiwyg',
    content: '',
    placeholder: 'Home exercise program, precautions, self-management strategies'
  }
}
```

#### B. AI Prompts (All Templates)
**New Prompt Section:**
```javascript
"plan": {
  "interventions": [
    "Manual therapy technique",
    "Therapeutic exercise",
    "Modality (if applicable)",
    "3-5 specific interventions"
  ],
  "progressions": [
    "How to advance each intervention",
    "When patient improves",
    "2-3 progression strategies"
  ],
  "regressions": [
    "How to modify if too challenging",
    "Alternative approaches",
    "2-3 regression options"
  ],
  "frequency_duration": "2x/week for 6 weeks (or appropriate timeframe)",
  "patient_education": "Home exercise program details, precautions, self-management strategies"
}
```

#### C. SOAPEditor Component
**Create:** `src/components/soap/PlanSection.jsx`
- Renders interventions as editable bullet list
- Separate sections for progressions/regressions
- Collapsible sections for clean UI

**Update SOAPEditor** (around line 400-430):
```javascript
{/* Plan Section - Now structured */}
<motion.section>
  <h2>Plan</h2>
  
  <PlanSection
    plan={soapData.plan}
    onChange={(data) => handleSectionChange('plan', data)}
  />
</motion.section>
```

### Testing Steps
1. Generate note - verify AI creates structured plan
2. Add/edit interventions
3. Add progressions and regressions
4. Save and verify persistence
5. Export - verify bullet formatting

---

## Step 6: Add Subtitles for Test/Measurement Types in Objective

### Current Status
❌ **Not Implemented** - Objective is flat table

### Files to Update

#### A. Template Schemas
**Current Structure:**
```javascript
objective: {
  type: 'table',
  headers: ['Test/Measurement', 'Result', 'Notes'],
  rows: [],
  allowAddRows: true
}
```

**New Structure:**
```javascript
objective: {
  type: 'categorized_table',
  categories: [
    {
      title: 'Observation',
      rows: [],
      placeholder: 'Posture, gait, swelling, deformity'
    },
    {
      title: 'Palpation',
      rows: [],
      placeholder: 'Tenderness, muscle tone, trigger points'
    },
    {
      title: 'Range of Motion',
      rows: [],
      placeholder: 'Active/passive ROM measurements'
    },
    {
      title: 'Strength Testing',
      rows: [],
      placeholder: 'MMT grades (0-5/5)'
    },
    {
      title: 'Special Tests',
      rows: [],
      placeholder: 'Ligament tests, impingement tests, etc.'
    },
    {
      title: 'Functional Testing',
      rows: [],
      placeholder: 'Gait, stairs, squatting, reaching'
    }
  ],
  headers: ['Test/Measurement', 'Result', 'Notes'],
  allowAddRows: true
}
```

#### B. ObjectiveTable Component
**File:** `src/components/soap/ObjectiveTable.jsx`

**Major Refactor Needed:**
1. Change from single table to categorized sections
2. Each category has its own subtitle
3. Each category has its own "Add Row" button
4. Collapsible categories for clean UI

**New Component Structure:**
```javascript
<div className="objective-categorized">
  {categories.map(category => (
    <div key={category.title} className="category-section">
      <h4 className="category-title">{category.title}</h4>
      <table>
        {/* Rows for this category */}
      </table>
      <button onClick={() => addRowToCategory(category.title)}>
        + Add {category.title}
      </button>
    </div>
  ))}
</div>
```

#### C. AI Prompts
**Update to generate categorized data:**
```javascript
"objective": {
  "observation": [
    {"test": "Posture", "result": "Forward head", "notes": "Rounded shoulders"}
  ],
  "palpation": [
    {"test": "Subacromial space", "result": "Tender", "notes": "Moderate"}
  ],
  "range_of_motion": [
    {"test": "Shoulder Flexion", "result": "140°", "notes": "Pain at end range"}
  ],
  "strength_testing": [
    {"test": "Supraspinatus", "result": "4/5", "notes": "Painful"}
  ],
  "special_tests": [
    {"test": "Neer's Test", "result": "Positive", "notes": "Reproduces pain"}
  ],
  "functional_testing": [
    {"test": "Overhead reach", "result": "Limited", "notes": "Compensatory movement"}
  ]
}
```

### Testing Steps
1. Generate note with categorized objective
2. Verify categories render with subtitles
3. Add rows to different categories
4. Collapse/expand categories
5. Save and verify structure persists
6. Export PDF - verify categories formatted

---

## Testing Strategy

### Phase 1: Individual Component Testing
Test each step independently before moving to next

### Phase 2: Integration Testing
1. Generate note with ALL new features
2. Edit each section
3. Save and reload
4. Verify persistence
5. Export PDF

### Phase 3: Regression Testing
Ensure old functionality still works:
- [ ] Can still generate basic notes
- [ ] Dashboard loads
- [ ] Recording flow works
- [ ] Export functions work

---

## Rollback Plan

### If Something Breaks

1. **Git Commit Before Each Step**
   ```bash
   git add .
   git commit -m "Step X: [description]"
   ```

2. **Keep Backup of Key Files**
   - All template hooks
   - SOAPEditor.jsx
   - ObjectiveTable.jsx

3. **Feature Flags (Optional)**
   Add environment variable to toggle new features:
   ```javascript
   const USE_NEW_ASSESSMENT = process.env.NEXT_PUBLIC_USE_NEW_ASSESSMENT === 'true';
   ```

---

## Implementation Order

### Recommended Sequence:
1. ✅ Step 1 (Already done - verify only)
2. ✅ Step 2 (Mostly done - test thoroughly)
3. ✅ Step 3 (Already done - enhance dashboard)
4. 🔄 Step 4 (Assessment goals - Medium complexity)
5. 🔄 Step 5 (Plan bullets - Medium complexity)
6. 🔄 Step 6 (Objective categories - High complexity)

### Time Estimates:
- Step 1: 30 minutes (testing only)
- Step 2: 1 hour (testing + minor fixes)
- Step 3: 2 hours (add dashboard list)
- Step 4: 3-4 hours (new component + all templates)
- Step 5: 3-4 hours (new component + all templates)
- Step 6: 4-6 hours (major refactor)

**Total: ~15-20 hours**

---

## Success Criteria

### Step 1-3 (Foundation)
- [ ] Notes save to Azure DB
- [ ] Can edit and re-save notes
- [ ] Can load notes by ID
- [ ] Dashboard shows recent notes

### Step 4 (Assessment)
- [ ] AI generates separate goals
- [ ] Goals editable as lists
- [ ] Goals persist on save
- [ ] Goals export correctly

### Step 5 (Plan)
- [ ] Plan structured with bullets
- [ ] Progressions/regressions separate
- [ ] Easy to add/edit items
- [ ] Exports with proper formatting

### Step 6 (Objective)
- [ ] Categories render with subtitles
- [ ] Can add rows to each category
- [ ] Categories collapsible
- [ ] Structure persists
- [ ] PDF export formatted correctly

---

## Notes

- All changes maintain backward compatibility with existing notes
- Database schema doesn't need changes (JSONB handles new structure)
- Focus on one step at a time
- Test thoroughly before moving to next step
- Keep console logging for debugging
- Document any issues encountered
