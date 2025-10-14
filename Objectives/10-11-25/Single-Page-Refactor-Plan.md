# Single-Page Application Refactor Plan
**Date:** October 11, 2025

## 🎯 Goal
Consolidate the multi-page app into a single-page application with a 3D animated blob interface for recording and viewing SOAP notes.

---

## 🎨 Design Vision

### Resting State
```
┌──────────────────────────────────────────────────────────┐
│  [☰] PT SOAP Generator              [User] [Settings]   │
├────┬─────────────────────────────────────────────────────┤
│    │                                                      │
│ 📋 │              🌀 3D Animated Blob                    │
│    │           (Pulsing/breathing effect)                │
│ S  │              Abstract organic shape                 │
│ I  │                                                      │
│ D  │         [Select Template to Begin]                  │
│ E  │    [Knee] [Shoulder] [Back] [Hip] [Ankle] [Neck]  │
│ B  │                                                      │
│ A  │                                                      │
│ R  ├─────────────────────────────────────────────────────┤
│    │                                                      │
│    │  📝 Previous Notes:                                 │
│ 📝 │  ├─ Knee Eval - 10/11 10:30am                      │
│ 📝 │  ├─ Shoulder - 10/11 9:15am                        │
│ 📝 │  ├─ Back Eval - 10/10 2:45pm                       │
│    │  └─ Hip Eval - 10/10 11:20am                       │
│    │                                                      │
└────┴─────────────────────────────────────────────────────┘
```

---

## 🎯 User Journey

### New Note Flow
1. **User lands on `/`** → sees 3D animated blob + template buttons
2. **Clicks "Knee"** → 3D blob glows blue, "Start Recording" appears
3. **Clicks 🎤 Start Recording** → 3D blob pulses with recording, waveform appears
4. **Clicks Stop** → 3D blob spins (processing animation)
5. **AI generates** → 3D blob fades out, SOAP editor slides up from bottom
6. **User edits** → auto-saves to Azure
7. **Clicks Export** → PDF/Copy options
8. **Clicks "New Note" button** → returns to 3D blob resting state

### View Old Note Flow
1. **User clicks note in sidebar**
2. **3D blob fades out**
3. **SOAP editor slides in** with loaded note
4. **User can edit/export**
5. **Clicks "New Note"** → back to 3D blob

---

## 🚀 Implementation Phases

### Phase 1: Structure (No 3D yet)
**Goal:** Get the single-page flow working with placeholder

**Tasks:**
- [ ] Create new `/` page component (replace dashboard)
- [ ] Implement collapsible sidebar component
  - [ ] Note list with search/filter
  - [ ] Mobile-friendly toggle
  - [ ] Click to load note
- [ ] Build vertical layout with state management
  - [ ] Template selection state
  - [ ] Recording state
  - [ ] Editing state
  - [ ] Viewing state
- [ ] Add simple placeholder div for 3D blob
- [ ] Implement state transitions (template → record → edit → view)
- [ ] Session naming input (after recording stops)

**Components to Create:**
- `MainPage.jsx` - Single page container
- `Sidebar.jsx` - Collapsible note list
- `BlobPlaceholder.jsx` - Temporary placeholder
- `TemplateSelector.jsx` - Template button grid
- `RecordingInterface.jsx` - Recording controls
- `StateManager.jsx` - Handle app state transitions

---

### Phase 2: Add 3D Magic
**Goal:** Implement animated 3D blob with state-based animations

**Tasks:**
- [ ] Install React Three Fiber + Drei
- [ ] Create 3D blob component
  - [ ] Abstract organic shape (metaball/blob)
  - [ ] Idle animation (slow pulse, gentle rotation)
  - [ ] Template selection (color change per template)
  - [ ] Recording animation (fast pulse, waveform particles)
  - [ ] Processing animation (spinning loader)
  - [ ] Fade out transition
- [ ] Add lighting and materials
- [ ] Optimize for performance (LOD, frame rate)
- [ ] Add fallback for low-end devices

**3D Blob States:**
- **Idle:** Slow breathing pulse, neutral color
- **Template Selected:** Glows template color (blue/green/purple)
- **Recording:** Fast pulse, red glow, particle effects
- **Processing:** Spinning with gradient effect
- **Fade Out:** Smooth opacity transition

---

### Phase 3: Polish
**Goal:** Smooth animations, error handling, mobile optimization

**Tasks:**
- [ ] Smooth transitions between all states
  - [ ] Blob fade in/out
  - [ ] SOAP editor slide up
  - [ ] Sidebar slide in/out
- [ ] Loading states for all async operations
- [ ] Error handling
  - [ ] Recording failures
  - [ ] AI generation errors
  - [ ] Network timeouts
- [ ] Mobile responsive design
  - [ ] Touch-friendly controls
  - [ ] Sidebar overlay on mobile
  - [ ] Simplified 3D blob for performance
- [ ] Accessibility
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] Focus management
- [ ] Performance optimization
  - [ ] Lazy load SOAP editor
  - [ ] Virtualize note list
  - [ ] Debounce auto-save

---

## 🎨 Design Specifications

### 3D Blob
- **Shape:** Abstract organic blob (metaball style)
- **Idle State:** Slow pulse (2s cycle), gentle rotation
- **Colors:**
  - Idle: Soft blue gradient
  - Knee: Blue (#007AFF)
  - Shoulder: Purple (#5856D6)
  - Back: Green (#34C759)
  - Hip: Orange (#FF9500)
  - Ankle/Foot: Teal (#5AC8FA)
  - Neck: Pink (#FF2D55)
- **Recording:** Red glow (#FF3B30), fast pulse (0.5s)
- **Processing:** Rainbow gradient spin

### Sidebar
- **Width:** 280px (desktop), full-width overlay (mobile)
- **Collapsible:** Hamburger menu icon
- **Note Items:**
  - Template icon + color
  - Session name (user-defined)
  - Date/time
  - Hover: highlight + preview tooltip
- **Search:** Filter by template, date, or name

### Template Selector
- **Layout:** Horizontal button grid
- **Buttons:** Pill-shaped, template color on hover
- **Selected:** Solid color, checkmark icon
- **Mobile:** Stack vertically or carousel

### Recording Interface
- **Position:** Overlays blob center
- **Controls:** Large circular record button
- **Timer:** MM:SS format
- **Waveform:** Real-time audio visualization
- **Stop:** Confirm dialog with session naming

### SOAP Editor
- **Transition:** Slide up from bottom (0.4s ease-out)
- **Layout:** Same as current SOAPEditor
- **Actions:** Floating action bar at bottom
  - Save, Export, New Note buttons

---

## 📁 File Structure Changes

### New Files
```
src/
├── pages/
│   └── index.jsx (NEW - Main single page)
├── components/
│   ├── MainPage/
│   │   ├── MainPage.jsx (NEW)
│   │   ├── Sidebar.jsx (NEW)
│   │   ├── BlobPlaceholder.jsx (NEW - Phase 1)
│   │   ├── Blob3D.jsx (NEW - Phase 2)
│   │   ├── TemplateSelector.jsx (NEW)
│   │   ├── RecordingInterface.jsx (NEW)
│   │   └── StateManager.jsx (NEW)
│   └── soap/ (existing, reuse)
│       ├── SOAPEditor.jsx
│       ├── ObjectiveTable.jsx
│       └── ...
```

### Files to Deprecate
```
src/pages/
├── soap/
│   ├── new.jsx (REMOVE - functionality moves to index.jsx)
│   └── generate.jsx (REMOVE - functionality moves to index.jsx)
```

---

## 🔧 Technical Decisions

### State Management
- **React Context** for global app state
- **States:**
  - `idle` - Resting state with blob
  - `templateSelected` - Template picked, ready to record
  - `recording` - Active recording
  - `processing` - AI generating SOAP
  - `editing` - Editing new note
  - `viewing` - Viewing old note from sidebar

### 3D Library
- **React Three Fiber** - React renderer for Three.js
- **Drei** - Useful helpers for R3F
- **Fallback:** CSS 3D transforms for low-end devices

### Routing
- **Single route:** `/` for everything
- **URL params:** `/?note={id}` when viewing old note
- **State in URL:** Optional, for shareable links

### Data Fetching
- **SWR** for note list caching
- **Optimistic updates** for auto-save
- **Polling** for processing status (if needed)

---

## ✅ Success Criteria

### Phase 1
- [ ] Single page loads with sidebar and placeholder
- [ ] Can select template and start recording
- [ ] Recording saves and triggers AI generation
- [ ] SOAP editor appears with generated note
- [ ] Can view old notes from sidebar
- [ ] Can return to idle state with "New Note"

### Phase 2
- [ ] 3D blob renders and animates smoothly
- [ ] Blob changes color based on template
- [ ] Recording animation is visually engaging
- [ ] Transitions are smooth and polished

### Phase 3
- [ ] Works perfectly on mobile devices
- [ ] No performance issues (60fps)
- [ ] All error states handled gracefully
- [ ] Accessible via keyboard and screen readers

---

## 📊 Timeline Estimate

- **Phase 1:** 2-3 days (structure and flow)
- **Phase 2:** 2-3 days (3D implementation)
- **Phase 3:** 1-2 days (polish and optimization)

**Total:** ~1 week for full implementation

---

## 🎯 Next Steps

1. **Review and approve** this plan
2. **Start Phase 1** - Build structure with placeholder
3. **Test flow** before adding 3D
4. **Implement 3D** once flow is solid
5. **Polish and ship** 🚀
