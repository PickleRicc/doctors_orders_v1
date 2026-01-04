# Security Implementation Checklist

## Phase 1: Critical Fixes - Credentials & CORS

### 1.1 Remove Hardcoded Credentials ✅

**Files Modified:**
- ✅ `src/lib/supabase.js` - Now uses `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `src/services/supabase.js` - Already using environment variables (verified)

**Security Improvements:**
- ✅ No credentials in source code
- ✅ Environment variable validation
- ✅ URL format validation
- ✅ Clear error messages when credentials missing
- ✅ Verification script created

**Testing Required:**
- [ ] Login/logout flow works
- [ ] Session persistence works
- [ ] Token refresh works
- [ ] Protected routes work
- [ ] No credentials in client bundle (run verification script)

**Verification:**
```bash
# Check for hardcoded credentials
node scripts/verify-no-hardcoded-creds.js

# Inspect client bundle
npm run build
# Check .next/static for exposed credentials
```

**Environment Variables Required:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Rollback Procedure:**
If auth breaks, revert commit and redeploy previous version immediately.

---

### 1.2 Fix CORS Configuration

**Status:** Pending

**Files to Modify:**
- `src/pages/api/phi/encounters/[id].js` - Remove wildcard CORS

**Current Issue:**
```javascript
res.setHeader('Access-Control-Allow-Origin', '*'); // ❌ Too permissive
```

**Fix:**
```javascript
// Next.js API routes don't need CORS for same-origin requests
// Remove CORS headers entirely, or restrict to specific origins
```

**Testing Required:**
- [ ] All PHI API endpoints work
- [ ] Test from different browsers
- [ ] No CORS errors in console
- [ ] OPTIONS preflight requests work

---

## Phase 2: Server-Side Security

### 2.1 Move OpenAI to Server-Side

**Status:** Pending

**Files to Create:**
- `src/pages/api/transcribe.js` - Server-side transcription endpoint
- `src/pages/api/generate-soap.js` - Server-side SOAP generation

**Files to Modify:**
- `src/services/aiClient.js` - Remove client-side initialization
- Frontend components - Call API endpoints instead

**Security Improvements:**
- API key never exposed in client bundle
- Rate limiting possible
- Better error handling
- Audit logging of AI operations

**Testing Required:**
- [ ] Audio transcription works
- [ ] SOAP generation works for all templates
- [ ] Error handling works
- [ ] Performance acceptable
- [ ] API key not in client bundle

---

### 2.2 Enable SSL Certificate Validation

**Status:** Pending

**Files to Modify:**
- `src/lib/db.js` - Change `rejectUnauthorized: true`

**Current Issue:**
```javascript
ssl: { 
  rejectUnauthorized: false // ❌ Vulnerable to MITM
}
```

**Fix:**
```javascript
ssl: { 
  rejectUnauthorized: true // ✅ Validates certificates
}
```

**Testing Required:**
- [ ] Database connection works
- [ ] All CRUD operations work
- [ ] Connection pooling works
- [ ] Monitor for SSL errors

---

### 2.3 Implement PHI-Safe Logging

**Status:** Pending

**Files to Create:**
- `src/lib/logger.js` - Safe logging utility with PHI redaction

**Files to Modify:**
- All files with `console.log` (319 occurrences across 59 files)

**Implementation:**
- Create logging utility with levels (debug, info, warn, error)
- Add PHI redaction patterns
- Structured logging format
- No PHI in logs

**Testing Required:**
- [ ] Review all log outputs
- [ ] No PHI in logs
- [ ] Debug logging works in development
- [ ] Production logs clean

---

## Phase 3: Security Hardening

### 3.1 Add Rate Limiting

**Status:** Pending

**Package to Install:**
```bash
npm install express-rate-limit
```

**Files to Create:**
- `src/middleware/rateLimit.js` - Rate limiting middleware

**Configuration:**
- Global: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- PHI API: 60 requests per minute
- Transcription: 10 requests per hour

**Testing Required:**
- [ ] Normal usage not blocked
- [ ] Excessive requests blocked
- [ ] Rate limit headers present
- [ ] Error messages user-friendly

---

### 3.2 Input Validation

**Status:** Pending

**Package to Install:**
```bash
npm install zod
```

**Files to Create:**
- `src/schemas/` - Zod validation schemas

**Schemas Needed:**
- User registration
- Session creation
- SOAP note updates
- API inputs

**Testing Required:**
- [ ] Valid inputs pass
- [ ] Invalid inputs rejected
- [ ] XSS attempts blocked
- [ ] SQL injection prevented

---

### 3.3 Fix Audit Logging

**Status:** Pending

**Files to Modify:**
- `src/pages/api/phi/encounters/[id].js` - Use real user ID
- `src/lib/db.js` - Update logAudit function

**Current Issue:**
```javascript
await logAudit(id, '00000000-0000-0000-0000-000000000001', 'READ'); // ❌ Hardcoded
```

**Fix:**
```javascript
const user = await getCurrentUser(req);
await logAudit(id, user.id, 'READ'); // ✅ Real user ID
```

**Testing Required:**
- [ ] Audit logs have correct user IDs
- [ ] All PHI operations logged
- [ ] Query audit logs for completeness

---

### 3.4 Session Timeout

**Status:** Pending

**Files to Create:**
- `src/hooks/useSessionTimeout.js` - Session timeout hook
- `src/components/SessionTimeoutWarning.jsx` - Warning modal

**Implementation:**
- Track user activity
- Warn before timeout (5 min warning)
- Auto-logout after inactivity (60 min)
- Clear session data

**Testing Required:**
- [ ] Timeout after inactivity
- [ ] Warning appears
- [ ] User can extend session
- [ ] Auto-logout works

---

## Testing Commands

### Run All Security Checks
```bash
# Check for hardcoded credentials
npm run security:check-creds

# Run security tests
npm run test:security

# Check for vulnerabilities
npm audit

# Full security scan
npm run security:full
```

### Build Verification
```bash
# Build and check bundle
npm run build

# Analyze bundle
npm run analyze

# Check bundle size
npm run build:analyze
```

---

## Deployment Checklist

Before deploying to production:

### Code Quality
- [ ] All tests passing
- [ ] No linter errors
- [ ] Code reviewed
- [ ] No hardcoded credentials
- [ ] No console.log with PHI

### Security
- [ ] Security scan passed
- [ ] No critical vulnerabilities
- [ ] SSL/TLS configured
- [ ] Rate limiting active
- [ ] Audit logging working
- [ ] No PHI in logs

### Environment
- [ ] Environment variables set
- [ ] Feature flags configured
- [ ] Monitoring enabled
- [ ] Alerts configured
- [ ] Rollback plan ready

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Security tests pass
- [ ] Performance acceptable

---

## Security Metrics

Track these metrics post-deployment:

- Failed authentication attempts
- Rate limit violations
- API error rates
- Response times
- Audit log completeness
- Security scan results

---

## Emergency Procedures

If security issue detected:

1. **Immediate**: Disable affected feature via feature flag
2. **Within 1 hour**: Assess impact and notify team
3. **Within 4 hours**: Deploy hotfix or rollback
4. **Within 24 hours**: Notify users if needed
5. **Within 48 hours**: Post-mortem and improvements

---

## Compliance Status

| Requirement | Status | Notes |
|------------|--------|-------|
| No hardcoded credentials | ✅ Complete | Verified with script |
| CORS configuration | ⏳ Pending | Next task |
| Server-side API keys | ⏳ Pending | Phase 2 |
| SSL validation | ⏳ Pending | Phase 2 |
| PHI-safe logging | ⏳ Pending | Phase 2 |
| Rate limiting | ⏳ Pending | Phase 3 |
| Input validation | ⏳ Pending | Phase 3 |
| Audit logging | ⏳ Pending | Phase 3 |
| Session timeout | ⏳ Pending | Phase 3 |

---

**Last Updated**: 2025-01-04  
**Next Review**: After each phase completion

