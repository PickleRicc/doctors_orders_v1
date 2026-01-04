# Phase 1 Production Testing Checklist

## Pre-Deployment Verification

Before deploying to production:

### 1. Code Review
- [ ] All Phase 1 changes reviewed
- [ ] No hardcoded credentials in code
- [ ] No wildcard CORS headers
- [ ] Environment variables documented
- [ ] Rollback procedures ready

### 2. Development Testing
- [ ] All dev tests passed
- [ ] Manual testing completed in dev
- [ ] No errors in dev server logs
- [ ] Performance acceptable

### 3. Build Verification
```bash
# Clean build
rm -rf .next
npm run build

# Check build output
ls -la .next/

# Verify no credentials in build
grep -r "oozghvnctxihtbqzktdv" .next/ || echo "✅ No credentials found"
```

---

## Deployment Steps

### Step 1: Backup Current Production

1. Document current deployment URL:
   ```
   Current URL: _____________________
   Deployment ID: _____________________
   ```

2. Take screenshot of Vercel dashboard

3. Export environment variables:
   ```bash
   vercel env pull .env.production.backup
   ```

### Step 2: Set Environment Variables in Vercel

1. Login to Vercel dashboard

2. Navigate to project Settings → Environment Variables

3. Add/update these variables for **Production**:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY = your-service-role-key-here
   ```

4. **IMPORTANT**: Make sure these are set for "Production" environment

5. Screenshot the environment variables page (hide sensitive values)

### Step 3: Deploy to Production

```bash
# From security-fixes-backup branch
git push origin security-fixes-backup

# Deploy to production
vercel --prod

# Or via Vercel dashboard: Deploy → Deploy Branch
```

**Deployment URL**: _____________________
**Deployment Time**: _____________________

### Step 4: Wait for Deployment

- Monitor Vercel dashboard
- Wait for "Ready" status
- Check build logs for errors

---

## Post-Deployment Testing

### Test 1: Health Check

```bash
# Test health endpoint
curl https://your-domain.vercel.app/api/health

# Expected: HTTP 200 or 503 with status info
```

**Result**: ✅ PASS / ❌ FAIL

**Response**: _____________________

---

### Test 2: Authentication Flow (Production)

#### 2.1 Registration
1. Navigate to https://your-domain.vercel.app/auth
2. Create new account with test email
3. Verify success

**Result**: ✅ PASS / ❌ FAIL

#### 2.2 Login
1. Login with test account
2. Verify redirect to dashboard
3. Check browser console for errors

**Result**: ✅ PASS / ❌ FAIL

#### 2.3 Session Persistence
1. Reload page
2. Verify still logged in

**Result**: ✅ PASS / ❌ FAIL

#### 2.4 Protected Routes
1. Open incognito window
2. Try to access /dashboard
3. Verify redirect to auth

**Result**: ✅ PASS / ❌ FAIL

---

### Test 3: PHI API Endpoints (Production)

```bash
# Test without auth (should fail)
curl -X GET https://your-domain.vercel.app/api/phi/encounters

# Expected: HTTP 401
```

**Result**: ✅ PASS / ❌ FAIL

```bash
# Test with auth token
curl -X GET https://your-domain.vercel.app/api/phi/encounters \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: HTTP 200, returns user's data
```

**Result**: ✅ PASS / ❌ FAIL

---

### Test 4: CORS Verification (Production)

1. Login to production site
2. Open DevTools → Console
3. Navigate through app
4. Check for CORS errors

**Expected**:
- No CORS errors
- All API calls succeed

**Result**: ✅ PASS / ❌ FAIL

**Console Output**: _____________________

---

### Test 5: Client Bundle (Production)

1. Open DevTools → Sources
2. Search bundle files for:
   - Hardcoded URLs
   - API keys
   - Credentials

**Expected**:
- No hardcoded credentials
- Only env var references

**Result**: ✅ PASS / ❌ FAIL

---

### Test 6: Real User Testing

Have 2-3 real users test:

#### User 1:
- Name: _____________________
- Tested: [ ] Registration [ ] Login [ ] Sessions [ ] Logout
- Issues: _____________________
- Status: ✅ APPROVED / ❌ ISSUES

#### User 2:
- Name: _____________________
- Tested: [ ] Registration [ ] Login [ ] Sessions [ ] Logout
- Issues: _____________________
- Status: ✅ APPROVED / ❌ ISSUES

#### User 3:
- Name: _____________________
- Tested: [ ] Registration [ ] Login [ ] Sessions [ ] Logout
- Issues: _____________________
- Status: ✅ APPROVED / ❌ ISSUES

---

## Monitoring (First 24 Hours)

### Hour 1
- [ ] Check error logs
- [ ] Monitor response times
- [ ] Check failed auth attempts
- [ ] Verify no 500 errors

**Status**: _____________________

### Hour 4
- [ ] Review metrics
- [ ] Check user feedback
- [ ] Monitor error rates
- [ ] Verify API performance

**Status**: _____________________

### Hour 12
- [ ] Comprehensive log review
- [ ] Performance analysis
- [ ] User satisfaction check
- [ ] Security scan

**Status**: _____________________

### Hour 24
- [ ] Full system health check
- [ ] Error rate analysis
- [ ] User feedback summary
- [ ] Decision: Continue or rollback

**Status**: _____________________

---

## Performance Metrics

### Before Deployment
- Auth response time: _____ ms
- API response time: _____ ms
- Error rate: _____ %

### After Deployment
- Auth response time: _____ ms
- API response time: _____ ms
- Error rate: _____ %

### Analysis
- Performance impact: _____________________
- Any degradation: _____________________
- Action needed: _____________________

---

## Rollback Procedure (If Needed)

### Immediate Rollback (< 5 minutes)

```bash
# Option 1: Vercel dashboard
# Go to Deployments → Find previous deployment → Promote to Production

# Option 2: CLI
vercel rollback
```

### Code Rollback

```bash
# Revert Phase 1 changes
git revert e3fdd4a e7fa3e3

# Push to trigger new deployment
git push origin main
vercel --prod
```

### Post-Rollback
1. [ ] Verify old version working
2. [ ] Notify users if needed
3. [ ] Document issues
4. [ ] Plan fixes
5. [ ] Schedule re-deployment

---

## Issues Log

### Critical Issues (Immediate Rollback)
| Time | Issue | Impact | Action |
|------|-------|--------|--------|
| | | | |

### High Priority Issues (Fix ASAP)
| Time | Issue | Impact | Action |
|------|-------|--------|--------|
| | | | |

### Low Priority Issues (Fix Later)
| Time | Issue | Impact | Action |
|------|-------|--------|--------|
| | | | |

---

## Decision

### After 24 Hours

**Recommendation**: 
- [ ] ✅ APPROVE - Proceed to Phase 2
- [ ] ⚠️ MONITOR - Continue monitoring, proceed with caution
- [ ] ❌ ROLLBACK - Critical issues found, rollback immediately

**Justification**: _____________________

**Approved By**: _____________________
**Date**: _____________________
**Time**: _____________________

---

## Communication

### User Notification

If issues found:
```
Subject: Brief Service Update

We recently deployed security improvements to our application. 
Some users may have experienced [describe issue briefly].

The issue has been [resolved/is being investigated].
No data was lost or compromised.

We apologize for any inconvenience.

- The Team
```

### Team Notification

```
Phase 1 Production Deployment - Status Update

Deployed: [timestamp]
Status: [Success/Issues/Rollback]

Key Metrics:
- Error rate: [x%]
- Auth success rate: [x%]
- User reports: [x issues]

Action Items:
1. [item]
2. [item]

Next Steps:
[describe next steps]
```

---

## Lessons Learned

### What Went Well
1. _____________________
2. _____________________
3. _____________________

### What Could Be Improved
1. _____________________
2. _____________________
3. _____________________

### Process Improvements
1. _____________________
2. _____________________
3. _____________________

---

**Production Testing Completed**: [ ] YES / [ ] NO
**Ready for Phase 2**: [ ] YES / [ ] NO

**Notes**: _____________________

