# PT SOAP Generator - New System Architecture

## 🏗️ **Frontend Architecture**

### **📱 User Interface Layer**
```
src/pages/
├── dashboard.jsx                    # Main dashboard (updated for new system)
├── record/
│   ├── new.jsx                     # ✨ NEW: Modern 3-step recording wizard
│   └── index.jsx                   # Legacy recording (can be removed)
├── soap/
│   └── generate.jsx                # ✨ UPDATED: Uses new template system
├── sessions.jsx                    # Session management (works with both systems)
└── auth.jsx                        # Authentication (unchanged)
```

### **🎨 Component Library**
```
src/components/
├── soap/                           # ✨ NEW: Unified SOAP editing system
│   ├── SOAPEditor.jsx             # Main SOAP editor container
│   ├── WYSIWYGEditor.jsx          # Rich text editor for S/A/P sections
│   └── ObjectiveTable.jsx         # Interactive table for objective data
├── ui/
│   ├── TemplateSelector.jsx       # ✨ NEW: Clean template selection
│   ├── FloatingActionButton.jsx   # Existing FAB component
│   └── dashboard-card.jsx          # Existing dashboard cards
├── layout/
│   ├── DashboardLayout.jsx        # Main app layout (unchanged)
│   └── Sidebar.jsx                # Navigation sidebar (unchanged)
└── auth/
    └── ProtectedRoute.jsx          # Route protection (unchanged)
```

### **🔧 Business Logic Layer**
```
src/hooks/
├── templates/                      # ✨ NEW: Template hook system
│   ├── index.js                   # Central exports and metadata
│   ├── useTemplateManager.js      # Dynamic template loading
│   ├── useKneeEvaluation.js       # Knee-specific AI prompts & schema
│   ├── useShoulderEvaluation.js   # Shoulder-specific AI prompts & schema
│   ├── useBackEvaluation.js       # Back-specific AI prompts & schema
│   ├── useNeckEvaluation.js       # Neck-specific AI prompts & schema
│   ├── useHipEvaluation.js        # Hip-specific AI prompts & schema
│   └── useAnkleFootEvaluation.js  # Ankle/foot-specific AI prompts & schema
├── useAuth.js                      # Authentication hook (unchanged)
├── useSessions.js                  # ✨ UPDATED: Supports both template systems
└── useTemplates.js                 # ❌ OLD: Can be removed after migration
```

### **⚙️ Service Layer**
```
src/services/
├── structuredAI.js                 # ✨ NEW: Simplified AI service
├── exportService.js                # ✨ NEW: PDF/clipboard export
├── transcriptionService.js         # Audio transcription (unchanged)
├── supabase.js                     # Database client (unchanged)
├── aiClient.js                     # AI client wrapper (unchanged)
├── soapGenerationService.js        # ❌ OLD: Complex service (can remove)
└── aiOrchestrator.js              # ❌ OLD: Complex orchestrator (can remove)
```

---

## 🗄️ **Backend Architecture**

### **📊 Database Schema (New)**
```sql
-- Core Tables
sessions                            # ✨ UPDATED: Added template_type, structured_notes
├── id (BIGSERIAL PRIMARY KEY)
├── user_id (UUID, references auth.users)
├── template_type (VARCHAR)         # ✨ NEW: 'knee', 'shoulder', etc.
├── body_region (VARCHAR)           # Existing
├── session_type (VARCHAR)          # Existing
├── structured_notes (JSONB)        # ✨ NEW: Structured SOAP data
├── transcript (TEXT)               # Existing
├── template_id (UUID, nullable)    # ✨ UPDATED: Now nullable
└── ... (other existing columns)

-- Backup Tables
template_backup                     # ✨ NEW: Backup of old templates
├── All original template columns
└── Created during migration

-- Views
session_with_template_info          # ✨ NEW: Compatibility view
└── Provides template info for backward compatibility
```

### **🔄 Migration Files**
```sql
db/migrations/
├── 20250814_add_template_type_to_sessions.sql    # ✨ Step 1: Add support
├── 20250814_migrate_to_template_hooks.sql        # ✨ Step 2: Migrate data
└── 20250814_remove_template_system.sql           # ✨ Step 3: Final cleanup (future)

-- Legacy (Keep for Reference)
├── 01_create_templates_table.sql                 # Original template system
├── 02_create_sessions_table.sql                  # Original sessions
└── templates/ (directory)                        # ❌ Can remove after backup
```

---

## 🔄 **Data Flow Architecture**

### **Old System Flow** ❌
```
User → Template Selection (DB Query) → Recording → 
Complex AI Orchestration → Template Parsing → 
Mixed UI Rendering → Manual Export
```

### **New System Flow** ✅
```
User → Template Selection (Code-based) → Recording → 
Simple AI Generation → Direct JSON → 
Unified SOAP Editor → Professional Export
```

---

## 🎯 **API Endpoints (Unchanged)**
```
/api/
├── auth/                          # Supabase Auth (unchanged)
├── sessions/                      # Session CRUD (updated to handle template_type)
├── transcription/                 # Audio processing (unchanged)
└── ai/                           # AI generation (simplified internally)
```

---

## 📦 **Dependencies**

### **New Dependencies Added**
```json
{
  "@tiptap/react": "^2.x.x",           # WYSIWYG editor
  "@tiptap/starter-kit": "^2.x.x",     # TipTap extensions
  "@tiptap/extension-placeholder": "^2.x.x", # Placeholder support
  "jspdf": "^2.x.x"                    # PDF generation
}
```

### **Dependencies We Can Remove** (After full migration)
```json
{
  // Any template-specific dependencies that are no longer used
  // Check package.json for unused packages after cleanup
}
```

---

## 🔐 **Security & Permissions**

### **Database Security (Unchanged)**
```sql
-- Row Level Security (RLS) policies remain the same
-- Users can only access their own sessions
-- Template system is now code-based (no DB security needed)
```

### **API Security (Unchanged)**
```javascript
// All existing authentication and authorization remains
// Template hooks run client-side (no new security concerns)
```

---

## 🚀 **Performance Improvements**

### **Before vs After**
```
Database Queries per SOAP Generation:
❌ Old: 3-5 queries (template fetch, validation, session save)
✅ New: 1 query (session save only)

Code Complexity:
❌ Old: ~2000 lines across multiple services
✅ New: ~800 lines with cleaner separation

Bundle Size:
❌ Old: Complex template parsing logic
✅ New: Lightweight template hooks

User Experience:
❌ Old: Multiple UI paradigms, complex flows
✅ New: Unified editing, single scroll experience
```

---

## 🧪 **Testing Strategy**

### **Migration Testing**
1. **Run migrations on development database**
2. **Verify data integrity** (all sessions have template_type)
3. **Test both old and new systems** side by side
4. **Validate export functionality** (PDF, clipboard)
5. **Performance testing** (AI generation speed)

### **Rollback Plan**
1. **Keep template_backup table** until fully confident
2. **Maintain template_id column** during transition
3. **Use compatibility view** for gradual migration
4. **Easy revert** to old system if needed

---

## 📋 **Migration Checklist**

### **Phase 1: Setup** ✅
- [x] Create new template hooks
- [x] Build unified SOAP editor
- [x] Create export system
- [x] Build new recording interface

### **Phase 2: Migration** 🔄
- [ ] Run `20250814_add_template_type_to_sessions.sql`
- [ ] Run `20250814_migrate_to_template_hooks.sql`
- [ ] Test new system with existing data
- [ ] Verify all sessions work correctly

### **Phase 3: Cleanup** ⏳
- [ ] Remove old service files
- [ ] Update routing to use new pages
- [ ] Run final cleanup migration
- [ ] Remove old template files

### **Phase 4: Optimization** 🎯
- [ ] Performance monitoring
- [ ] User feedback collection
- [ ] Additional template types if needed
- [ ] Advanced AI features

---

This architecture provides a **clean separation of concerns**, **better performance**, and **easier maintenance** while maintaining all the functionality of the original system.
