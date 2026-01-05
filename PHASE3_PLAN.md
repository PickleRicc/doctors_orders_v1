# Phase 3: Database & Session Security

## 🎯 **Objectives**
1. Enable SSL validation for production database connections
2. Implement session timeout (1 hour)
3. Fix audit logging completeness
4. Test all database operations with SSL

---

## 📋 **Tasks**

### **1. Enable SSL Validation** ⏳
**Priority:** HIGH  
**Impact:** Database connection security

**Actions:**
- ✅ Already configurable via `ENABLE_SSL_VALIDATION` env var
- [ ] Document SSL certificate requirements
- [ ] Test database connectivity with SSL enabled
- [ ] Verify all CRUD operations work with SSL
- [ ] Add SSL error handling

**Files:**
- `src/lib/db.js` (already updated)
- `.env.local` (set `ENABLE_SSL_VALIDATION=true` for production)

---

### **2. Implement Session Timeout**
**Priority:** HIGH  
**Impact:** Prevent unauthorized access from idle sessions

**Actions:**
- [ ] Add session timeout logic (1 hour)
- [ ] Implement auto-logout on timeout
- [ ] Add warning before timeout (5 min warning)
- [ ] Refresh session on activity
- [ ] Test timeout behavior

**Implementation:**
- Use Supabase session expiry (already set to 3600s in `supabase.js`)
- Add client-side timeout detector
- Add session refresh on user activity
- Add warning modal before logout

**Files to Create/Update:**
- `src/hooks/useSessionTimeout.js` (NEW)
- `src/components/SessionTimeoutWarning.jsx` (NEW)
- `src/hooks/useAuth.js` (UPDATE - add timeout logic)

---

### **3. Fix Audit Logging Completeness**
**Priority:** MEDIUM  
**Impact:** HIPAA compliance audit trail

**Current State:**
- ✅ Audit logging exists in `db.js`
- ⚠️  Not consistently applied to all PHI access
- ⚠️  Limited data captured

**Actions:**
- [ ] Audit all PHI endpoints for logging
- [ ] Add missing audit logs
- [ ] Enhance audit data (IP address, user agent)
- [ ] Add audit log viewer for admins
- [ ] Test audit trail accuracy

**Enhanced Audit Data:**
```javascript
{
  encounter_id: 'uuid',
  actor_id: 'uuid',
  event: 'CREATE|READ|UPDATE|DELETE',
  ip_address: '192.168.1.1',
  user_agent: 'Browser info',
  timestamp: 'ISO timestamp',
  changes: { field: 'old->new' } // For updates
}
```

**Files to Update:**
- `src/lib/db.js` - Enhance `logAudit()` function
- `src/pages/api/phi/encounters.js` - Add comprehensive logging
- `src/pages/api/phi/encounters/[id].js` - Add comprehensive logging
- `src/pages/api/phi/custom-templates.js` - Add audit logging

---

### **4. Enhanced Error Handling**
**Priority:** MEDIUM  
**Impact:** Better debugging and user experience

**Actions:**
- [ ] Add structured error logging
- [ ] Implement error boundaries
- [ ] Add user-friendly error messages
- [ ] Test error scenarios

---

## 🧪 **Testing Checklist**

### **SSL Validation Tests:**
- [ ] Connect to database with SSL enabled
- [ ] Verify certificate validation works
- [ ] Test with invalid certificate (should fail)
- [ ] Verify all CRUD operations work
- [ ] Test connection pooling with SSL

### **Session Timeout Tests:**
- [ ] Wait for 1 hour timeout (or reduce for testing)
- [ ] Verify auto-logout occurs
- [ ] Test 5-minute warning appears
- [ ] Test session refresh on activity
- [ ] Verify protected routes redirect after timeout

### **Audit Logging Tests:**
- [ ] Create encounter - verify audit log
- [ ] Read encounter - verify audit log
- [ ] Update encounter - verify audit log
- [ ] Delete encounter - verify audit log (if implemented)
- [ ] Verify all audit fields populated
- [ ] Check audit log queries work

---

## 📝 **Environment Variables**

```bash
# Phase 3 Settings
ENABLE_SSL_VALIDATION=true  # Enable in production
SESSION_TIMEOUT_SECONDS=3600  # 1 hour
SESSION_WARNING_SECONDS=300   # 5 minutes before timeout
ENABLE_ENHANCED_AUDIT=true
```

---

## 🚀 **Implementation Order**

1. **SSL Validation Testing** (Quick - 30 min)
   - Test with current setup
   - Document requirements
   - Verify works in production

2. **Session Timeout** (Moderate - 2 hours)
   - Create session timeout hook
   - Add warning component
   - Integrate with auth flow
   - Test thoroughly

3. **Enhanced Audit Logging** (Moderate - 2 hours)
   - Update logAudit function
   - Add to all endpoints
   - Test audit trail
   - Create audit viewer (optional)

4. **Error Handling** (Quick - 1 hour)
   - Add error boundaries
   - Improve error messages
   - Test error scenarios

---

## ✅ **Success Criteria**

- [ ] SSL validation working in production
- [ ] Session timeout at 1 hour
- [ ] Warning shown 5 minutes before timeout
- [ ] All PHI access audited
- [ ] Enhanced audit data captured
- [ ] All tests passing
- [ ] No breaking changes

---

## 📊 **Progress Tracking**

**Phase 3 Status:** Not Started  
**Estimated Time:** 4-6 hours  
**Priority:** HIGH for production readiness

---

## 🔄 **After Phase 3**

Move to Phase 4:
- Integration testing
- Staging deployment
- Security testing
- Performance testing

