# Rollback Procedures

## Quick Reference

**If something breaks in production:**

1. **Immediate (< 5 min)**: Disable feature flag or rollback deployment
2. **Communication (< 30 min)**: Notify users if needed
3. **Investigation (< 2 hours)**: Identify root cause
4. **Fix (< 24 hours)**: Implement proper fix
5. **Post-Mortem (< 48 hours)**: Document and improve

---

## Emergency Rollback Commands

### 1. Rollback via Vercel Dashboard

```bash
# Instant rollback to previous deployment
vercel rollback

# Rollback to specific deployment
vercel rollback <deployment-url>
```

### 2. Disable Feature Flag

```bash
# Production
vercel env add ENABLE_FEATURE_NAME false production

# Preview/Staging
vercel env add ENABLE_FEATURE_NAME false preview
```

### 3. Redeploy Specific Git Commit

```bash
# Checkout last known good commit
git checkout <commit-hash>

# Force deploy to production
vercel --prod --force

# Return to main branch
git checkout main
```

---

## Feature-Specific Rollback Procedures

### Hardcoded Credentials Fix

**If auth breaks:**

```bash
# 1. Immediate rollback
vercel rollback

# 2. Or revert commit
git revert <commit-hash>
git push origin main

# 3. Redeploy
vercel --prod
```

**Verification:**
- Test login/logout
- Check session persistence
- Verify no 401 errors

### CORS Configuration

**If API calls fail:**

```bash
# 1. Revert CORS changes
git revert <cors-commit-hash>

# 2. Redeploy
vercel --prod
```

**Verification:**
- Test PHI API endpoints
- Check browser console for CORS errors
- Test from different browsers

### Server-Side OpenAI

**If transcription/SOAP generation fails:**

```bash
# 1. Disable feature flag
vercel env add ENABLE_SERVER_SIDE_OPENAI false production

# 2. Redeploy to activate change
vercel --prod
```

**Verification:**
- Test audio transcription
- Test SOAP generation
- Check API endpoint responses

### SSL Certificate Validation

**If database connection fails:**

```bash
# 1. Update environment variable
vercel env add ENABLE_SSL_VALIDATION false production

# 2. Or revert code change
git revert <ssl-commit-hash>
git push origin main
vercel --prod
```

**Verification:**
- Test database connectivity
- Check PostgreSQL logs
- Verify all CRUD operations work

### Rate Limiting

**If legitimate users are blocked:**

```bash
# 1. Disable rate limiting
vercel env add ENABLE_RATE_LIMITING false production

# 2. Adjust limits in code
# Edit rate limit configuration
git commit -m "Adjust rate limits"
git push origin main
vercel --prod
```

**Verification:**
- Test normal usage patterns
- Monitor rate limit headers
- Check error logs

### Input Validation

**If valid inputs are rejected:**

```bash
# 1. Disable validation temporarily
vercel env add ENABLE_INPUT_VALIDATION false production

# 2. Fix validation schemas
# Update Zod schemas
git commit -m "Fix validation schemas"
git push origin main

# 3. Re-enable validation
vercel env add ENABLE_INPUT_VALIDATION true production
```

**Verification:**
- Test all forms
- Test API endpoints
- Check validation error messages

---

## Database Rollback Procedures

### Before Making Database Changes

```bash
# 1. Backup Azure PostgreSQL
pg_dump -h $PGHOST -U $PGUSER -d $PGDATABASE > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Export Supabase data
# Use Supabase dashboard or CLI
supabase db dump > supabase_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore from Backup

```bash
# Restore Azure PostgreSQL
psql -h $PGHOST -U $PGUSER -d $PGDATABASE < backup_file.sql

# Restore Supabase
# Use Supabase dashboard to restore
```

### Rollback SQL Migration

```sql
-- If you have a rollback script
\i rollback_migration_YYYYMMDD.sql

-- Verify rollback
SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1;
```

---

## Verification Checklist

After any rollback, verify:

- [ ] Application loads successfully
- [ ] Users can log in
- [ ] Core features work (recording, transcription, SOAP generation)
- [ ] No errors in browser console
- [ ] No errors in server logs
- [ ] Database connections stable
- [ ] API endpoints responding
- [ ] No user data lost

---

## Rollback Decision Matrix

| Issue Severity | Response Time | Action |
|----------------|---------------|--------|
| **Critical** - App down | < 5 min | Immediate rollback |
| **High** - Core feature broken | < 15 min | Disable feature flag |
| **Medium** - Non-critical issue | < 1 hour | Schedule hotfix |
| **Low** - Minor bug | < 24 hours | Fix in next release |

---

## Communication Templates

### User Notification (Critical Issue)

```
Subject: Brief Service Interruption

We're experiencing a temporary issue with [feature name]. 
We've rolled back the change and service is now restored.

No data was lost. We apologize for the inconvenience.

- The Team
```

### Status Page Update

```
[RESOLVED] Database Connection Issue
Started: 2:30 PM EST
Resolved: 2:35 PM EST

We identified and resolved a database connectivity issue by 
rolling back a recent SSL configuration change. All systems 
are now operating normally.
```

### Internal Incident Report

```
Incident: [Brief description]
Time Detected: [timestamp]
Time Resolved: [timestamp]
Root Cause: [description]
Rollback Action: [what was done]
Users Affected: [number/percentage]
Data Loss: [Yes/No, description]
Prevention: [how to prevent in future]
```

---

## Post-Rollback Actions

1. **Immediate (within 1 hour)**
   - [ ] Document what happened
   - [ ] Notify team
   - [ ] Verify system stability
   - [ ] Monitor metrics

2. **Short-term (within 24 hours)**
   - [ ] Identify root cause
   - [ ] Create fix in development
   - [ ] Add tests to catch this issue
   - [ ] Update rollback procedures if needed

3. **Long-term (within 1 week)**
   - [ ] Conduct post-mortem meeting
   - [ ] Document lessons learned
   - [ ] Improve monitoring/alerting
   - [ ] Share knowledge with team

---

## Emergency Contacts

### Internal
- **Primary On-Call**: [Your contact]
- **Backup**: [Backup contact]
- **Technical Lead**: [Lead contact]

### External
- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.com
- **Azure Support**: Via Azure Portal

---

## Testing Rollback Procedures

**Schedule quarterly drills:**

1. Pick a non-critical feature
2. Deploy a breaking change to staging
3. Practice rollback procedure
4. Time the rollback
5. Document any issues
6. Update procedures as needed

**Next drill date**: _____________

---

## Version History

| Date | Change | Author |
|------|--------|--------|
| 2025-01-04 | Initial creation | Security Team |
| | | |
| | | |

---

**Remember**: It's better to rollback quickly than to debug in production. 
When in doubt, rollback and investigate safely.

