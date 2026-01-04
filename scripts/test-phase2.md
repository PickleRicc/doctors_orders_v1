# Phase 2 Testing Guide

## ✅ **Phase 2 Completed:**
- Server-side OpenAI (transcription + SOAP generation)
- PHI-safe logging
- Rate limiting
- Input validation

## 🧪 **Manual Tests Required**

### **Test 1: Server-Side Transcription**
1. Log into http://localhost:3001
2. Navigate to create new session
3. Record a short audio clip (10-15 seconds)
4. Click "Transcribe"
5. ✓ Verify transcription works
6. ✓ Check browser console - should NOT see OpenAI API key
7. ✓ Check server logs - should see PHI-safe logging (no patient names)

**Expected:**
- Transcription succeeds
- No API keys exposed in browser
- Logs show `[REDACTED_NAME]` instead of actual names

---

### **Test 2: Server-Side SOAP Generation**
1. After transcription, select a template (e.g., Knee Evaluation)
2. Click "Generate SOAP"
3. ✓ Verify SOAP note generates successfully
4. ✓ Check browser DevTools Network tab - no OpenAI API key in requests
5. ✓ Verify SOAP data displays correctly

**Expected:**
- SOAP generation works
- No API keys in client-side code
- Structured SOAP data returned

---

### **Test 3: PHI-Safe Logging**
1. Open server terminal (where `npm run dev` is running)
2. Perform transcription with patient name mentioned
3. ✓ Check logs - patient names should be `[REDACTED_NAME]`
4. ✓ Check logs - dates should be `[REDACTED_DATE]`
5. ✓ Check logs - phone numbers should be `[REDACTED_PHONE]`

**Expected:**
- All PHI redacted in logs
- Logs still useful for debugging
- No sensitive data visible

---

### **Test 4: Rate Limiting**
1. Open browser DevTools > Network tab
2. Make multiple rapid API calls (refresh page 10+ times quickly)
3. ✓ Check for 429 (Too Many Requests) response
4. ✓ Check response headers for `X-RateLimit-*` headers
5. Wait 1 minute and try again
6. ✓ Verify requests work again

**Expected:**
- Rate limits enforced
- 429 status code when exceeded
- Rate limit headers present
- Normal usage not blocked

---

### **Test 5: Input Validation**
1. Try to create encounter with invalid data:
   - Very long session title (>255 chars)
   - Invalid UUID format
   - Empty required fields
2. ✓ Verify 400 Bad Request responses
3. ✓ Check error messages are helpful
4. Try valid data
5. ✓ Verify it works correctly

**Expected:**
- Invalid inputs rejected with 400
- Clear error messages
- Valid inputs accepted

---

### **Test 6: Complete Recording Workflow**
1. Start fresh session
2. Record audio (30+ seconds with patient info)
3. Transcribe
4. Generate SOAP
5. Save encounter
6. View saved encounter
7. Edit encounter
8. ✓ Verify entire flow works end-to-end

**Expected:**
- Complete workflow functional
- No errors at any step
- Data persists correctly

---

## 📊 **Checklist**

- [ ] Server-side transcription works
- [ ] Server-side SOAP generation works
- [ ] No API keys exposed in browser
- [ ] PHI redacted in logs
- [ ] Rate limiting active
- [ ] Input validation working
- [ ] Complete workflow functional
- [ ] No breaking changes

---

## 🐛 **If Issues Found:**

1. Note the specific test that failed
2. Check browser console for errors
3. Check server terminal for error logs
4. Document the issue
5. Report back for fixes

---

## ✅ **When All Tests Pass:**

Mark Phase 2 complete and proceed to Phase 3:
- Enable SSL validation
- Test database operations
- Session timeout implementation

