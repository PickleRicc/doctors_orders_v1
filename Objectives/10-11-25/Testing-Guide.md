# Phase 1 Testing Guide

## 🚀 How to Test the New Single-Page App

### Step 1: Start the Development Server
```bash
cd pt-soap-generator
npm run dev
```

### Step 2: Navigate to New Page
Open browser to: `http://localhost:3000/index-new`

---

## ✅ Testing Checklist

### Initial Load
- [ ] Page loads without errors
- [ ] Sidebar visible on left (desktop)
- [ ] Blob placeholder visible and animating
- [ ] Template selector shows 6 buttons
- [ ] Header shows "PT SOAP Generator"

### Template Selection
- [ ] Click "Knee" → blob changes to blue
- [ ] Click "Shoulder" → blob changes to purple
- [ ] Click "Back" → blob changes to green
- [ ] Click "Hip" → blob changes to orange
- [ ] Click "Ankle/Foot" → blob changes to teal
- [ ] Click "Neck" → blob changes to pink
- [ ] Selected template shows checkmark
- [ ] "Start Recording" button appears

### Recording Flow
- [ ] Click "Start Recording" → microphone permission requested
- [ ] Timer starts counting (00:00, 00:01, etc.)
- [ ] Waveform animates (20 bars pulsing)
- [ ] Click stop button → recording stops
- [ ] Session name input appears
- [ ] Enter name (e.g., "Test Session")
- [ ] Click "Generate SOAP Note"
- [ ] Processing state shows (spinner)
- [ ] After 2 seconds, SOAP editor appears

### SOAP Editor
- [ ] SOAP editor slides up from bottom
- [ ] All sections visible (S/O/A/P)
- [ ] Can edit content
- [ ] "New Note" button in header
- [ ] Click "New Note" → returns to blob view

### Sidebar
- [ ] Sidebar shows "Previous Notes"
- [ ] Search box visible
- [ ] Notes list loads (if any exist)
- [ ] Click a note → loads in SOAP editor
- [ ] Note shows template icon and color
- [ ] Date/time formatted correctly

### Mobile (Resize browser to <768px)
- [ ] Sidebar hidden by default
- [ ] Hamburger menu visible
- [ ] Click hamburger → sidebar slides in
- [ ] Sidebar overlays content
- [ ] Click backdrop → sidebar closes
- [ ] Template buttons stack vertically
- [ ] Recording interface responsive
- [ ] SOAP editor scrolls properly

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot access microphone"
**Fix:** Allow microphone permissions in browser settings

### Issue: Sidebar doesn't show notes
**Fix:** Check if `/api/phi/encounters` endpoint is working
```bash
# Test API directly
curl http://localhost:3000/api/phi/encounters
```

### Issue: SOAP editor doesn't appear
**Fix:** Check browser console for errors, ensure SOAPEditor component exists

### Issue: Blob doesn't change color
**Fix:** Check StateManager is properly providing context

---

## 🔍 What to Look For

### Smooth Transitions
- Blob fades out when SOAP editor appears
- SOAP editor slides up smoothly
- No jarring jumps or flashes

### State Management
- App state changes correctly
- Selected template persists
- Session name saves

### Performance
- No lag when animating
- Sidebar scrolls smoothly
- Recording timer accurate

---

## 📸 Screenshot Checklist

Take screenshots of:
1. Initial idle state with blob
2. Template selected (blob colored)
3. Recording in progress
4. Session name input
5. Processing state
6. SOAP editor view
7. Sidebar with notes
8. Mobile view with sidebar open

---

## ✅ Ready for Phase 2 When:

- [ ] All desktop tests pass
- [ ] All mobile tests pass
- [ ] No console errors
- [ ] Transitions are smooth
- [ ] State management works
- [ ] Can create and view notes
- [ ] Sidebar loads notes correctly

**Once all checked, we're ready to add the 3D blob!** 🎨
