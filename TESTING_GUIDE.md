# Testing Guide for HIPAA Security Implementation

## Overview

This guide provides comprehensive testing procedures for all security changes. Each change must pass all relevant tests before proceeding to the next phase.

---

## Test Environment Setup

### Local Development
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
# Fill in your values

# Run development server
npm run dev
```

### Staging Environment
- Separate Vercel project
- Separate database instances
- Feature flags set to test new features
- Mirror production configuration

---

## Test Suites

### 1. Authentication Tests

**Test File**: `src/tests/auth-test.js`

**Manual Tests**:
1. User Registration
   - [ ] Can create new account
   - [ ] Email validation works
   - [ ] Password requirements enforced
   - [ ] Receives confirmation email

2. User Login
   - [ ] Can log in with valid credentials
   - [ ] Invalid credentials rejected
   - [ ] Session persists across page reloads
   - [ ] Token refresh works

3. Protected Routes
   - [ ] Unauthenticated users redirected
   - [ ] Authenticated users can access
   - [ ] Session expiry handled correctly

4. Logout
   - [ ] Session cleared on logout
   - [ ] Redirected to landing page
   - [ ] Cannot access protected routes after logout

**Automated Tests**:
```bash
npm run test:auth
```

---

### 2. PHI API Tests

**Endpoints to Test**:
- `GET /api/phi/encounters`
- `POST /api/phi/encounters`
- `GET /api/phi/encounters/[id]`
- `PUT /api/phi/encounters/[id]`

**Test Cases**:
1. Authentication Required
   - [ ] Returns 401 without token
   - [ ] Accepts valid JWT token
   - [ ] Rejects expired token

2. CRUD Operations
   - [ ] Can create encounter
   - [ ] Can retrieve encounter
   - [ ] Can update encounter
   - [ ] Can list encounters

3. Authorization
   - [ ] Users can only access own encounters
   - [ ] Cannot access other users' encounters

4. Data Validation
   - [ ] Validates required fields
   - [ ] Rejects invalid data types
   - [ ] Sanitizes inputs

**Run Tests**:
```bash
# Start local server
npm run dev

# Run API tests
npm run test:api

# Or use curl
curl http://localhost:3000/api/health
```

---

### 3. Database Connectivity Tests

**Test Cases**:
1. Connection Pool
   - [ ] Can establish connection
   - [ ] Connection pool works
   - [ ] Handles connection errors
   - [ ] SSL/TLS configured

2. CRUD Operations
   - [ ] Can insert data
   - [ ] Can query data
   - [ ] Can update data
   - [ ] Can delete data

3. Transactions
   - [ ] Transactions commit correctly
   - [ ] Rollback on error

4. Performance
   - [ ] Queries complete in < 100ms
   - [ ] No connection leaks
   - [ ] Pool sizing appropriate

**Run Tests**:
```bash
npm run test:db
```

---

### 4. Security Tests

**Test Cases**:
1. No Hardcoded Credentials
   - [ ] Check client bundle for credentials
   - [ ] Environment variables used
   - [ ] No secrets in logs

2. CORS Configuration
   - [ ] Only allowed origins accepted
   - [ ] Credentials handled correctly
   - [ ] Preflight requests work

3. Rate Limiting
   - [ ] Normal usage not blocked
   - [ ] Excessive requests blocked
   - [ ] Rate limits reset correctly

4. Input Validation
   - [ ] XSS attempts blocked
   - [ ] SQL injection prevented
   - [ ] File upload size limits
   - [ ] Invalid data rejected

5. PHI Protection
   - [ ] No PHI in logs
   - [ ] No PHI in error messages
   - [ ] No PHI in URLs
   - [ ] Proper audit logging

**Run Tests**:
```bash
npm run test:security
```

---

### 5. Recording & Transcription Tests

**Test Cases**:
1. Audio Recording
   - [ ] Can start recording
   - [ ] Can pause/resume
   - [ ] Can stop recording
   - [ ] Audio quality acceptable

2. Transcription
   - [ ] Audio transcribed correctly
   - [ ] Handles background noise
   - [ ] Handles multiple speakers
   - [ ] Error handling for bad audio

3. SOAP Generation
   - [ ] Generates all sections (S/O/A/P)
   - [ ] Format is correct
   - [ ] All template types work
   - [ ] Handles missing data gracefully

**Manual Test Procedure**:
1. Navigate to recording page
2. Select template
3. Start recording
4. Speak test transcript
5. Stop recording
6. Verify transcription
7. Verify SOAP generation
8. Check all sections populated

---

### 6. Performance Tests

**Metrics to Monitor**:
- API response time (p50, p95, p99)
- Database query time
- Page load time
- Time to interactive (TTI)
- First contentful paint (FCP)

**Load Testing**:
```bash
# Using Artillery
npm install -g artillery
artillery run load-test.yml

# Or using k6
k6 run load-test.js
```

**Performance Benchmarks**:
- API endpoints: < 200ms (p95)
- Database queries: < 100ms (p95)
- Page load: < 2s (p95)
- TTI: < 3s (p95)

---

### 7. Integration Tests

**End-to-End User Flows**:

1. **New User Onboarding**
   - [ ] Register account
   - [ ] Verify email
   - [ ] Complete profile
   - [ ] Create first SOAP note

2. **Create SOAP Note**
   - [ ] Select template
   - [ ] Record audio
   - [ ] Review transcription
   - [ ] Review generated SOAP
   - [ ] Edit if needed
   - [ ] Save note
   - [ ] Export to PDF

3. **Edit Existing Note**
   - [ ] View sessions list
   - [ ] Open existing note
   - [ ] Edit sections
   - [ ] Save changes
   - [ ] Verify changes persisted

4. **Session Management**
   - [ ] View all sessions
   - [ ] Search sessions
   - [ ] Delete session
   - [ ] Verify deletion

**Run E2E Tests**:
```bash
# Using Playwright
npm run test:e2e

# Or Cypress
npm run cypress:open
```

---

## Test Execution Order

For each phase, run tests in this order:

1. **Unit Tests** - Test individual functions
2. **Integration Tests** - Test component interactions
3. **API Tests** - Test API endpoints
4. **Security Tests** - Test security measures
5. **E2E Tests** - Test complete user flows
6. **Performance Tests** - Test under load
7. **Manual Testing** - Human verification

---

## Test Data

### Use Realistic But Fake Data

```javascript
// Good test data
const testUser = {
  email: 'test.therapist@example.com',
  name: 'Test Therapist',
  profession: 'physical_therapy'
};

const testTranscript = `
Patient reports decreased pain in left knee. 
ROM measurements: Flexion 120 degrees, Extension -5 degrees.
Strength testing 4/5.
Assessment: Progress noted, continue current plan.
Plan: Continue strengthening exercises, return in 2 weeks.
`;

// NEVER use real PHI in tests
```

---

## Regression Testing Checklist

After each change, verify these still work:

- [ ] Login/logout
- [ ] Session creation
- [ ] Audio recording
- [ ] Transcription
- [ ] SOAP generation
- [ ] SOAP editing
- [ ] Export functionality
- [ ] Session management
- [ ] Search functionality
- [ ] Profile settings
- [ ] Template selection

---

## Test Reporting

### Generate Test Report
```bash
npm run test:report
```

### Report Format
```
=== Test Run Report ===
Date: 2025-01-04
Environment: Staging
Branch: security-fixes

Summary:
✅ Passed: 245
❌ Failed: 3
⚠️  Warnings: 12
⏭️  Skipped: 5

Details:
[List of failed tests with details]

Performance:
API Response Time (p95): 156ms ✅
Database Query Time (p95): 87ms ✅
Page Load Time (p95): 1.8s ✅
```

---

## Continuous Testing

### Pre-Commit Tests
```bash
# Add to .husky/pre-commit
npm run test:quick
npm run lint
```

### CI/CD Pipeline
```yaml
# .github/workflows/test.yml
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm test
      - run: npm run test:integration
      - run: npm run test:security
```

---

## Monitoring After Deployment

### Metrics to Track
- Error rate
- Response times
- User sessions
- Failed authentications
- Rate limit hits
- Database connection pool usage

### Alerts
- Error rate > 1%
- Response time > 2s
- Failed auth > 10/min
- Database connections > 80%

---

## Common Issues & Solutions

### Test Failures

**Issue**: Tests fail after credential changes  
**Solution**: Update test environment variables

**Issue**: Database tests fail  
**Solution**: Check database connectivity and credentials

**Issue**: API tests timeout  
**Solution**: Increase timeout or check server running

### Performance Issues

**Issue**: Slow API responses  
**Solution**: Check database queries, add indexes

**Issue**: High memory usage  
**Solution**: Check for memory leaks, optimize queries

---

## Test Environment Variables

```bash
# .env.test
NODE_ENV=test
NEXT_PUBLIC_SUPABASE_URL=test_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=test_supabase_key
PGHOST=localhost
PGPORT=5432
PGDATABASE=test_db
PGUSER=test_user
PGPASSWORD=test_password
```

---

## Next Steps

1. Set up test environment
2. Run baseline tests
3. Document current performance
4. Create test data fixtures
5. Set up CI/CD pipeline
6. Configure monitoring
7. Schedule regular test runs

---

**Remember**: Every line of code should have a test. Every test should pass before deployment.

