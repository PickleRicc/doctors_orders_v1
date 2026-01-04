# Phase 1 Manual Testing Guide

## Overview

This guide provides step-by-step instructions for manually testing Phase 1 changes in both development and production environments.

---

## Prerequisites

### Development Environment
- ✅ `.env.local` file configured with actual credentials
- ✅ Dependencies installed (`npm install`)
- ✅ Development server running (`npm run dev`)

### Production Environment
- ✅ Code deployed to production
- ✅ Environment variables set in hosting platform (Vercel)
- ✅ Production build successful

---

## Test 1: Verify No Hardcoded Credentials

### Automated Check
```bash
# Run verification script
node scripts/verify-no-hardcoded-creds.js

# Expected output:
# ✅ SUCCESS: No hardcoded credentials found!
```

### Manual Check
```bash
# Search for Supabase URL
grep -r "oozghvnctxihtbqzktdv" src/

# Expected: No matches found (or only in comments/examples)

# Check build output
npm run build
grep -r "oozghvnctxihtbqzktdv" .next/

# Expected: No matches found
```

**Result**: ✅ PASS / ❌ FAIL

---

## Test 2: Authentication Flow

### 2.1 User Registration

1. Navigate to auth page
   - Dev: http://localhost:3000/auth
   - Prod: https://your-domain.vercel.app/auth

2. Click "Sign Up"

3. Enter test credentials:
   - Email: `test+phase1@example.com`
   - Password: `TestPassword123!`

4. Submit form

**Expected**:
- ✅ Account created successfully
- ✅ Redirected to dashboard or email confirmation
- ✅ No errors in browser console
- ✅ No credential exposure in Network tab

**Result**: ✅ PASS / ❌ FAIL

**Notes**: _____________________

---

### 2.2 User Login

1. Navigate to auth page
   - Dev: http://localhost:3000/auth
   - Prod: https://your-domain.vercel.app/auth

2. Click "Sign In"

3. Enter credentials from Test 2.1

4. Submit form

**Expected**:
- ✅ Login successful
- ✅ Redirected to dashboard
- ✅ No errors in browser console
- ✅ Session token stored (check DevTools → Application → Local Storage)
- ✅ No hardcoded credentials visible in Network tab

**Result**: ✅ PASS / ❌ FAIL

**Screenshots**:
- [ ] Network tab showing Authorization header
- [ ] Local Storage showing session

**Notes**: _____________________

---

### 2.3 Session Persistence

1. After successful login, reload the page

2. Navigate to different routes within the app

**Expected**:
- ✅ User remains logged in after reload
- ✅ Can access protected routes
- ✅ Session persists across tab reload

**Result**: ✅ PASS / ❌ FAIL

**Notes**: _____________________

---

### 2.4 Invalid Login

1. Navigate to auth page

2. Enter invalid credentials:
   - Email: `invalid@example.com`
   - Password: `WrongPassword`

3. Submit form

**Expected**:
- ✅ Login rejected
- ✅ Clear error message shown
- ✅ No access to protected routes
- ✅ No sensitive information in error message

**Result**: ✅ PASS / ❌ FAIL

**Notes**: _____________________

---

### 2.5 Protected Routes

1. Open incognito/private browser window

2. Navigate directly to protected route:
   - Dev: http://localhost:3000/dashboard
   - Prod: https://your-domain.vercel.app/dashboard

**Expected**:
- ✅ Redirected to landing or auth page
- ✅ Cannot access protected content
- ✅ Clear message about authentication required

**Result**: ✅ PASS / ❌ FAIL

**Notes**: _____________________

---

### 2.6 Logout

1. While logged in, click logout button

**Expected**:
- ✅ Successfully logged out
- ✅ Redirected to landing page
- ✅ Session cleared from Local Storage
- ✅ Cannot access protected routes after logout

**Result**: ✅ PASS / ❌ FAIL

**Notes**: _____________________

---

## Test 3: PHI API Endpoints

### 3.1 Unauthenticated Request

```bash
# Test without authentication
curl -X GET http://localhost:3000/api/phi/encounters

# Or in production
curl -X GET https://your-domain.vercel.app/api/phi/encounters
```

**Expected**:
- HTTP Status: 401 Unauthorized
- Error message: "Unauthorized" or similar
- No PHI data returned

**Result**: ✅ PASS / ❌ FAIL

**Response**: _____________________

---

### 3.2 Authenticated Request

1. Login to get session token

2. Open Browser DevTools → Network tab

3. Navigate to encounters page or make API call

4. Copy Authorization header value

5. Test API:
```bash
curl -X GET http://localhost:3000/api/phi/encounters \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected**:
- HTTP Status: 200 OK
- Returns user's encounters only
- No other users' data

**Result**: ✅ PASS / ❌ FAIL

**Response**: _____________________

---

### 3.3 CORS Verification

1. Open Browser DevTools → Console

2. Login and navigate through app

3. Check for CORS errors

**Expected**:
- ✅ No CORS errors in console
- ✅ All same-origin API calls succeed
- ✅ No "Access-Control-Allow-Origin" errors

**Result**: ✅ PASS / ❌ FAIL

**Console Errors** (if any): _____________________

---

### 3.4 Cross-Origin Request (Should Fail)

Try making request from different origin:

```javascript
// From browser console on different site (e.g., google.com)
fetch('https://your-domain.vercel.app/api/phi/encounters')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**Expected**:
- ✅ Request blocked by CORS policy
- ✅ Error in console about CORS
- ✅ No data returned

**Result**: ✅ PASS / ❌ FAIL

**Notes**: _____________________

---

## Test 4: Client Bundle Security

### 4.1 Build and Inspect

```bash
# Build production bundle
npm run build

# Search for credentials in build
find .next -type f -name "*.js" -exec grep -l "oozghvnctxihtbqzktdv" {} \;

# Expected: No files found

# Check for API keys
find .next -type f -name "*.js" -exec grep -l "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" {} \;

# Expected: No files found
```

**Result**: ✅ PASS / ❌ FAIL

**Files Found** (if any): _____________________

---

### 4.2 Browser Bundle Inspection

1. Open production site in browser

2. Open DevTools → Sources tab

3. Search through bundle files for:
   - "supabase.co"
   - "eyJhbG" (start of JWT)
   - Any hardcoded credentials

**Expected**:
- ✅ No Supabase URLs in bundle
- ✅ No API keys in bundle
- ✅ Only environment variable references

**Result**: ✅ PASS / ❌ FAIL

**Notes**: _____________________

---

## Test 5: Environment Variables

### 5.1 Development

```bash
# Check .env.local (don't commit this!)
cat .env.local | grep "NEXT_PUBLIC_SUPABASE"

# Expected: Should show configured URLs and keys
```

**Result**: ✅ CONFIGURED / ❌ MISSING

---

### 5.2 Production (Vercel)

1. Login to Vercel dashboard

2. Navigate to your project

3. Go to Settings → Environment Variables

4. Verify these are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

**Result**: ✅ CONFIGURED / ❌ MISSING

**Screenshot**: _____________________

---

## Test 6: Error Handling

### 6.1 Missing Environment Variables

1. Temporarily rename `.env.local` to `.env.local.bak`

2. Restart dev server

**Expected**:
- ✅ Clear error message about missing credentials
- ✅ Application doesn't crash
- ✅ Helpful message about setting environment variables

**Result**: ✅ PASS / ❌ FAIL

3. Restore `.env.local`

---

### 6.2 Invalid Environment Variables

1. Set invalid Supabase URL in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=http://invalid-url.com
   ```

2. Restart dev server

**Expected**:
- ✅ Validation error caught
- ✅ Falls back to empty client
- ✅ Clear error message

**Result**: ✅ PASS / ❌ FAIL

3. Restore correct values

---

## Test Summary

### Results
- Total Tests: _____ / 20
- Passed: _____
- Failed: _____

### Critical Issues
_List any critical issues found:_

1. _____________________
2. _____________________
3. _____________________

### Minor Issues
_List any minor issues found:_

1. _____________________
2. _____________________
3. _____________________

### Screenshots
_Attach relevant screenshots:_

- [ ] Network tab showing no hardcoded credentials
- [ ] Successful login
- [ ] CORS validation
- [ ] Bundle inspection
- [ ] Vercel environment variables

---

## Sign-Off

### Development Testing
- **Tester**: _____________________
- **Date**: _____________________
- **Environment**: Development
- **Status**: ✅ APPROVED / ❌ NEEDS FIXES

### Production Testing
- **Tester**: _____________________
- **Date**: _____________________
- **Environment**: Production
- **Status**: ✅ APPROVED / ❌ NEEDS FIXES

### Notes
_____________________
_____________________
_____________________

---

## Next Steps

If all tests pass:
- ✅ Document results in TEST_RESULTS.md
- ✅ Update IMPLEMENTATION_PROGRESS.md
- ✅ Proceed to Phase 2

If tests fail:
- ❌ Document failures
- ❌ Rollback if critical
- ❌ Fix issues
- ❌ Re-test

---

**Remember**: Do not proceed to Phase 2 until all Phase 1 tests pass in both development and production!

