# Backup Strategy

## Overview

This document outlines the backup strategy for safe implementation of HIPAA security fixes. Multiple layers of backups ensure we can recover from any issue.

---

## Git Branches

### Backup Branches Created

1. **security-fixes-backup** - Created: 2025-01-04
   - Purpose: Snapshot of code before starting security fixes
   - Contains: All current working code
   - Use: Rollback point if major issues occur

2. **main** - Production code
   - Always contains last known good production code
   - Never force push to this branch
   - All changes go through security-fixes branch first

### Branch Strategy

```
main (production)
  ├── security-fixes-backup (backup snapshot)
  └── security-fixes (work branch)
       ├── feature/remove-hardcoded-creds
       ├── feature/fix-cors
       ├── feature/server-side-openai
       └── ... (other features)
```

### Creating New Feature Branches

```bash
# Always branch from security-fixes
git checkout security-fixes
git pull origin security-fixes
git checkout -b feature/your-feature-name
```

---

## Database Backups

### Azure PostgreSQL

**Before any schema changes:**

```bash
# Full backup
pg_dump -h $PGHOST -U $PGUSER -d $PGDATABASE -F c -f backup_$(date +%Y%m%d_%H%M%S).dump

# Or SQL format
pg_dump -h $PGHOST -U $PGUSER -d $PGDATABASE > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Scheduled Backups:**
- Daily: 2 AM UTC
- Weekly: Sunday 2 AM UTC
- Before each phase: Manual backup
- Retention: 30 days

**Backup Location:**
- Local: `./backups/postgres/`
- Azure Blob Storage: Container `backups/postgres/`

### Supabase

**Backup via Supabase CLI:**

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Backup
supabase db dump > supabase_backup_$(date +%Y%m%d_%H%M%S).sql
```

**Scheduled Backups:**
- Supabase handles automatic backups
- Manual backups before major changes
- Export via dashboard: Database → Backups

---

## Environment Variables Backup

**Before making changes:**

```bash
# Export current environment variables
vercel env pull .env.backup

# Or manually document
cp .env.local .env.local.backup.$(date +%Y%m%d)
```

**Store securely:**
- DO NOT commit to git
- Store in password manager (1Password, LastPass, etc.)
- Keep offline backup in secure location

---

## File System Backups

### Source Code

```bash
# Create tarball of entire project
tar -czf ../pt-soap-generator-backup-$(date +%Y%m%d).tar.gz .

# Or zip
zip -r ../pt-soap-generator-backup-$(date +%Y%m%d).zip . -x "node_modules/*" ".git/*"
```

### Configuration Files

**Critical files to backup:**
- `package.json`
- `package-lock.json`
- `next.config.mjs`
- `tailwind.config.js`
- `vercel.json` (if exists)

```bash
# Backup configuration
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup
cp next.config.mjs next.config.mjs.backup
```

---

## Vercel Deployment Backups

### Deployment History

Vercel automatically keeps deployment history:
- Every deployment is immutable
- Can rollback to any previous deployment
- Access via dashboard or CLI

### Export Deployment Info

```bash
# List deployments
vercel ls

# Get deployment details
vercel inspect <deployment-url>
```

### Before Major Changes

1. Document current deployment URL
2. Test rollback procedure
3. Note environment variables
4. Screenshot dashboard settings

---

## Testing Environment Backup

### Staging Environment

1. **Separate Vercel Project**: `pt-soap-generator-staging`
2. **Separate Databases**: 
   - Azure PostgreSQL: `staging` database
   - Supabase: Staging project
3. **Environment Variables**: Separate from production

### Test Data Backup

```bash
# Export test data
pg_dump -h $STAGING_PGHOST -U $PGUSER -d staging -t test_data > test_data_backup.sql

# Import to fresh staging
psql -h $STAGING_PGHOST -U $PGUSER -d staging < test_data_backup.sql
```

---

## Recovery Procedures

### Recover from Git

```bash
# Recover to backup branch
git checkout security-fixes-backup
git branch -D security-fixes
git checkout -b security-fixes

# Or cherry-pick specific commits
git checkout security-fixes
git log # find commit hash
git revert <commit-hash>
```

### Recover Database

```bash
# PostgreSQL
psql -h $PGHOST -U $PGUSER -d $PGDATABASE < backup_file.sql

# Or using custom format
pg_restore -h $PGHOST -U $PGUSER -d $PGDATABASE backup_file.dump
```

### Recover Vercel Deployment

```bash
# Rollback to previous deployment
vercel rollback

# Or to specific deployment
vercel rollback <deployment-url>
```

### Recover Environment Variables

```bash
# From backup file
vercel env add < .env.backup

# Or manually via dashboard
# Vercel Dashboard → Project → Settings → Environment Variables
```

---

## Backup Verification

### Weekly Verification

- [ ] Test database restore on staging
- [ ] Verify git backup branches exist
- [ ] Check backup file integrity
- [ ] Test deployment rollback procedure
- [ ] Verify environment variable backups

### Monthly Verification

- [ ] Full disaster recovery test
- [ ] Document any issues
- [ ] Update procedures as needed
- [ ] Train team on recovery procedures

---

## Backup Checklist

### Before Starting Each Phase

- [ ] Create git branch backup
- [ ] Backup databases (Azure + Supabase)
- [ ] Export environment variables
- [ ] Document current deployment URL
- [ ] Verify backups are accessible
- [ ] Test restore procedure
- [ ] Document baseline metrics

### After Completing Each Phase

- [ ] Verify changes work
- [ ] Create new backup point
- [ ] Tag git commit
- [ ] Update documentation
- [ ] Remove old backups (>30 days)

---

## Backup Schedule

| Frequency | What | When | Retention |
|-----------|------|------|-----------|
| Hourly | Git commits | Automatic | Forever |
| Daily | Azure PostgreSQL | 2 AM UTC | 30 days |
| Daily | Supabase | Automatic | 7 days |
| Weekly | Full system | Sunday 2 AM | 90 days |
| Before changes | Manual backup | As needed | 30 days |
| After phase | Tagged backup | After testing | Forever |

---

## Backup Storage

### Primary Storage
- **Git**: GitHub repository
- **Databases**: Azure Blob Storage
- **Files**: Local + Azure Blob Storage

### Backup Storage (Offsite)
- **Git**: GitLab mirror (optional)
- **Databases**: AWS S3 (optional)
- **Files**: External drive (encrypted)

---

## Disaster Recovery Plan

### Scenario 1: Code Issue

1. Identify problematic commit
2. Revert commit or checkout backup branch
3. Test in staging
4. Deploy to production
5. Verify system works
6. Post-mortem analysis

### Scenario 2: Database Corruption

1. Stop write operations
2. Assess damage
3. Restore from latest backup
4. Verify data integrity
5. Resume operations
6. Investigate root cause

### Scenario 3: Complete System Failure

1. Deploy backup branch to new Vercel project
2. Restore databases from backup
3. Configure environment variables
4. Test system functionality
5. Update DNS if needed
6. Communicate with users

---

## Contact Information

### Backup Locations
- **Git Repository**: https://github.com/your-org/pt-soap-generator
- **Azure Storage**: Container `backups`
- **Local Backups**: `./backups/` (not in git)

### Access
- **GitHub**: Team account access
- **Azure**: Admin access required
- **Vercel**: Team member access
- **Supabase**: Project owner access

---

## Backup Log

| Date | Type | Size | Location | Verified |
|------|------|------|----------|----------|
| 2025-01-04 | Git Branch | N/A | security-fixes-backup | ✅ |
| | | | | |
| | | | | |

---

## Notes

- All backups contain PHI - handle securely
- Encrypt backups at rest and in transit
- Test restore procedures regularly
- Document all backup/restore operations
- Keep this document updated

---

**Last Updated**: 2025-01-04  
**Next Review**: 2025-02-04

