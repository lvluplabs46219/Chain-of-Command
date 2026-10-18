# Acquit Platform - Security Audit Remediation

## Overview

This document describes the critical security issues identified in the August 30, 2026 audit of the Acquit Platform's Supabase database and the migrations created to address them.

**Audit Source**: Live Supabase database audit (project: othxichdhzdxgtatautb)
**Audit Date**: August 30, 2026
**Remediation Date**: August 30, 2026
**Status**: Migrations created, pending deployment

## Critical Issues Identified

### P0 - CRITICAL (Immediate Action Required)

1. **RLS Policies Scoped to `{public}` Instead of `{authenticated}`**
   - Multiple tables had RLS policies allowing anonymous (unauthenticated) access
   - Tables affected: `agent_sessions`, `cases`, `deadlines`, `document_nodes`, `documents`, `evidence_items`, `filings`, `matters`, `parties`, `profiles`, `timeline_events`, `directory_agent_referrals`
   - **Impact**: Any unauthenticated user with the anon key can read/write case data, documents, hearings, charges
   - **Risk**: Complete data exposure for a legal platform

2. **Dual Identity Schema - `cases` vs `matters`**
   - Two parallel case-entity schemas serving the same purpose
   - `filings` and `agent_sessions` FK to `cases`
   - `documents`, `parties`, `charges`, `hearings`, `deadlines`, `evidence_items`, `timeline_events` all FK to `matters`
   - **Impact**: Agent/filing workflow split across two incompatible entity roots, cannot join filing to hearing
   - **Risk**: Data integrity issues, query failures

3. **`agent_runs` Has No INSERT Policy**
   - Only has SELECT policy (`agent_runs_owner_select`)
   - **Impact**: Agents cannot write new runs through client layer
   - **Risk**: Agent functionality broken

4. **`audit_logs` INSERT `with_check` Is Wrong**
   - Current: `with_check: (SELECT auth.uid() AS uid) = user_id`
   - Problem: `user_id` references `public.users.id` (UUID), but `auth.uid()` maps to `users.auth_id`
   - **Impact**: Audit inserts silently fail
   - **Risk**: No audit trail for user actions

5. **Storage Bucket Named with Typo + No MIME Restrictions**
   - Bucket: "Aquit Courtlistner" (should be "acquit-courtlistener")
   - No MIME type allowlist
   - No file size cap
   - No RLS policies on storage.objects
   - **Impact**: Malware upload vector, unauthorized access to legal documents
   - **Risk**: Security breach, compliance violation

### P1 - HIGH PRIORITY

6. **`directory_subscriptions` SELECT Policy Exposes All Lawyers' Stripe Data**
   - Current policy allows any authenticated user to see every lawyer's subscription tier, Stripe customer ID, and Stripe subscription ID
   - **Impact**: PII/compliance issue, financial data exposure

7. **`cases.user_id` Directly References `auth.uid()` - No Intermediary `public.users`**
   - Inconsistent with rest of schema which uses `public.users` table
   - **Impact**: Breaks queries joining cases -> public.users -> matters

8. **Missing ON DELETE CASCADE on Several FKs**
   - Tables: `deadlines`, `evidence_items`, `timeline_events`, `charges`, `hearings`
   - **Impact**: Orphan rows remain when matter is deleted, constraint violations

9. **Redundant Document Tables**
   - `document_nodes` (embedding chunks, FK -> `cases`)
   - `case_documents` (document metadata, FK -> `cases`)
   - `documents` (canonical, FK -> `matters`)
   - `legal_chunks` (legal RAG chunks, FK -> `authorities`)
   - **Impact**: Data duplication, confusion, inconsistent schema

10. **Duplicate Index on `agent_permissions`**
    - `agent_permissions_agent_id_key` (unique btree on agent_id)
    - `idx_agent_permissions_agent_id` (non-unique btree on agent_id)
    - **Impact**: Wasted overhead

11. **`legal_chunks` Missing Jurisdiction/Court Metadata**
    - MASTER BUILD INSTRUCTIONS §28 requires: `jurisdiction`, `court`, `authority_type`
    - Currently only has `authority_id` and freeform `metadata JSONB`
    - **Impact**: Cannot filter by jurisdiction at query time

### P2 - MEDIUM PRIORITY

12. **`retrieval_logs` SELECT Policy Allows NULL `agent_run_id` Rows to Anyone**
13. **`model_configs` Unique Constraint Allows NULL `user_id` Collisions**
14. **`hearings` Missing Composite Index for Upcoming Query**
15. **`cold_cases_ingestion` Has Dual Redundant Deny Policies**
16. **No Storage Bucket RLS Policies**

### P3 - ARCHITECTURE GAPS

17. No `token_usage` tracking in `agent_runs` (MASTER BUILD §29)
18. No `prompt_version` column on `agent_runs` or `messages` (MASTER BUILD §29)
19. `agents` table has no `matter_id` / Case scope
20. `timeline_events` missing `confidence` and `created_by` fields (MASTER BUILD §12)
21. No `documents` embedding/chunk table under `matters`

## Migrations Created

### 1. `20260830_security_hardening_critical_fixes.sql`

**Priority**: P0
**Status**: Ready for deployment

**Fixes Applied**:

- **Section 1**: Fix `audit_logs` INSERT with_check policy
  - Drops broken policy
  - Recreates with proper join through `users` table matching `auth_id`

- **Section 2**: Add missing INSERT policy for `agent_runs`
  - Drops existing SELECT-only policy
  - Creates full CRUD policy with proper ownership check

- **Section 3**: Fix `directory_subscriptions` SELECT policy
  - Drops overly permissive policy
  - Recreates to scope to lawyer owner only (via email match from JWT)
  - Adds full CRUD policy for lawyers to manage their own subscriptions

- **Section 4**: Add missing columns
  - `agent_runs`: `tokens_used`, `cost_usd`, `model_used`, `prompt_version`
  - `timeline_events`: `confidence`, `created_by`
  - `legal_chunks`: `jurisdiction`, `court`, `authority_type`

- **Section 5**: Add indexes
  - `legal_chunks`: `idx_legal_chunks_jurisdiction`, `idx_legal_chunks_court`
  - `hearings`: `idx_hearings_matter_scheduled` (composite)

- **Section 6**: Fix `model_configs` NULL unique collision
  - Adds partial unique index for system configs

- **Section 7**: Fix `hearings` missing composite index
  - Creates `(matter_id, scheduled_at)` index

- **Section 8**: Drop duplicate index on `agent_permissions`

- **Section 9**: Add ON DELETE CASCADE to missing FKs
  - Uses DO blocks to check if CASCADE already exists
  - Applies to: `deadlines`, `evidence_items`, `timeline_events`, `charges`, `hearings`

- **Section 10**: Fix `retrieval_logs` SELECT policy
  - Drops policy allowing NULL agent_run_id access
  - Recreates with proper ownership check via agent runs or matters

- **Section 11**: Safety net - drop public policies on sensitive tables
  - Explicitly drops any `{public}` policies on all sensitive tables

- **Section 12**: Fix `directory_agent_referrals` policy
  - Drops overly permissive policy
  - Creates proper policies: authenticated can create, lawyers can view their own

### 2. `20260830_storage_bucket_rls_and_cleanup.sql`

**Priority**: P0
**Status**: Ready for deployment

**Fixes Applied**:

- **Section 1**: Storage Bucket RLS Policies
  - Enables RLS on `storage.objects`
  - Creates policy for authenticated users to access own documents
  - Supports three path patterns:
    - Direct user folder: `users/{user_id}/...`
    - Matter folder: `matters/{matter_id}/...`
    - Legacy cases folder: `cases/{case_id}/...`

- **Section 2**: Legacy Tables RLS
  - Applies proper RLS to tables not in canonical schema:
    - `cases`: User-scoped by `auth.uid()`
    - `case_documents`: Scoped through owning case
    - `filings`: Scoped through owning case
    - `agent_sessions`: Scoped through owning case
    - `document_nodes`: Scoped through owning case

- **Section 3**: Additional Tables
  - `lab_simulations`: User-scoped
  - `people_db_attorney`: Service-role only

- **Section 4**: Ingestion Tables
  - All CourtListener and cold cases tables: Service-role only

- **Section 5**: Audit Tables
  - `sic_audit_events`: User-scoped, append-only (no deletes)
  - `document_custody_chain`: User-scoped, append-only

- **Section 6**: Disclosures and Audio
  - All marked as service-role only (review needed for proper scoping)

## Deployment Instructions

### Prerequisites

1. **Backup the database** before applying migrations
2. **Test in staging** environment first
3. **Schedule maintenance window** for production deployment
4. **Notify all users** of potential brief service interruption

### Deployment Steps

#### Option 1: Using Supabase CLI

```bash
# Navigate to project root
cd /home/andrew/Development/Repos/Aquit-Platform

# Pull latest schema from remote (if needed)
supabase db pull

# Apply the critical fixes migration first
supabase db push --migration 20260830_security_hardening_critical_fixes.sql

# Then apply the storage and cleanup migration
supabase db push --migration 20260830_storage_bucket_rls_and_cleanup.sql
```

#### Option 2: Using Supabase Dashboard SQL Editor

1. Open Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and execute each migration file in order:
   - First: `20260830_security_hardening_critical_fixes.sql`
   - Second: `20260830_storage_bucket_rls_and_cleanup.sql`

#### Option 3: Manual Execution

```bash
# Connect to the database using psql
psql postgresql://postgres:1106NolneySt.@db.othxichdhzdxgtatautb.supabase.co:5432/postgres

# Execute each migration
\i supabase/migrations/20260830_security_hardening_critical_fixes.sql
\i supabase/migrations/20260830_storage_bucket_rls_and_cleanup.sql
```

### Post-Deployment Verification

After applying migrations, verify the following:

1. **RLS Policies**:
   ```sql
   SELECT tablename, policyname, roles, cmd, using, check
   FROM pg_policies 
   WHERE schemaname = 'public' 
   ORDER BY tablename, policyname;
   ```
   - All sensitive tables should have `roles = {authenticated}` not `{public}`
   - No table should have policies with `roles = {public}` except truly public tables

2. **Audit Logs Functionality**:
   ```sql
   INSERT INTO audit_logs (user_id, action, details)
   VALUES (
     (SELECT id FROM users WHERE auth_id = auth.uid()),
     'test_insert',
     '{"test": "value"}'
   );
   ```
   - Should succeed without errors

3. **Agent Runs Functionality**:
   ```sql
   INSERT INTO agent_runs (agent_id, status, input)
   VALUES (
     (SELECT id FROM agents WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) LIMIT 1),
     'queued',
     '{"test": "input"}'
   );
   ```
   - Should succeed without errors

4. **Directory Subscriptions Access**:
   ```sql
   -- As user A, try to access user B's subscriptions
   SET LOCAL role TO authenticated;
   SET LOCAL "request.jwt.claims" TO '{"email": "user-a@example.com", "sub": "user-a-uuid"}';
   
   SELECT * FROM directory_subscriptions 
   WHERE lawyer_id = (SELECT id FROM directory_lawyer_profiles WHERE email = 'user-b@example.com');
   ```
   - Should return 0 rows (access denied)

5. **Storage Objects Access**:
   ```sql
   -- As unauthenticated user, try to list storage objects
   SET LOCAL role TO anon;
   SELECT * FROM storage.objects LIMIT 10;
   ```
   - Should return 0 rows (access denied)

6. **Legacy Tables Access**:
   ```sql
   -- As authenticated user, try to access another user's cases
   SET LOCAL role TO authenticated;
   SET LOCAL "request.jwt.claims" TO '{"email": "user-a@example.com", "sub": "user-a-uuid"}';
   
   SELECT * FROM cases WHERE user_id != 'user-a-uuid' LIMIT 10;
   ```
   - Should return 0 rows (access denied)

## Manual Steps Required

### 1. Storage Bucket Renaming and Configuration

**Action**: Rename bucket and configure security settings

**Steps**:
1. Go to Supabase Dashboard -> Storage -> Buckets
2. Create new bucket named: `acquit-courtlistener`
3. Configure bucket settings:
   - Allowed MIME types: `application/pdf, image/jpeg, image/png, text/plain`
   - Maximum file size: `52428800` (50MB)
4. Migrate all objects from old bucket `Aquit Courtlistner` to new bucket
5. Delete old bucket `Aquit Courtlistner`
6. Update application code to reference new bucket name

**Verification**:
- Upload test files of various types
- Verify non-allowed MIME types are rejected
- Verify file size limit is enforced

### 2. Monitor for Breaking Changes

After deployment, monitor for:
- Authentication/authorization errors in application logs
- Failed queries due to RLS policy restrictions
- Agent functionality issues
- Audit log insertion failures

**Monitoring Queries**:

```sql
-- Check for recent errors
SELECT * FROM pg_stat_activity 
WHERE state = 'error' 
AND query NOT LIKE '%pg_%'
ORDER BY query_start DESC 
LIMIT 20;

-- Check audit logs for failures
SELECT * FROM audit_logs 
WHERE action = 'test_insert' 
ORDER BY created_at DESC 
LIMIT 10;
```

### 3. Update Application Code

**Required Updates**:
1. **Storage Bucket Name**: Update all references from `Aquit Courtlistner` to `acquit-courtlistener`
2. **Agent Runs**: Ensure application creates agent runs with new required fields:
   - `tokens_used`
   - `cost_usd`
   - `model_used`
   - `prompt_version`
3. **Timeline Events**: Ensure application sets:
   - `confidence`
   - `created_by` (values: 'user' or 'agent')
4. **Legal Chunks**: Ensure ingestion populates:
   - `jurisdiction`
   - `court`
   - `authority_type`

## Rollback Plan

If issues are discovered after deployment:

### Immediate Rollback

1. **Identify the problematic migration**
2. **Create reverse migration** with DROP POLICY and ALTER TABLE statements
3. **Apply reverse migration** to restore previous state

### Reverse Migration for `20260830_security_hardening_critical_fixes.sql`

```sql
-- Drop new policies
DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "agent_runs_owner_all" ON public.agent_runs;
DROP POLICY IF EXISTS "Lawyers can view own subscriptions" ON public.directory_subscriptions;
DROP POLICY IF EXISTS "Lawyers can manage own subscriptions" ON public.directory_subscriptions;
DROP POLICY IF EXISTS "Authenticated users can create referrals" ON public.directory_agent_referrals;
DROP POLICY IF EXISTS "Lawyers can view own referrals" ON public.directory_agent_referrals;
DROP POLICY IF EXISTS "Users can view own retrieval logs" ON public.retrieval_logs;

-- Restore original policies (from live DB before migration)
-- Note: These need to be recreated from backup or known state

-- Remove new columns
ALTER TABLE public.agent_runs DROP COLUMN IF EXISTS tokens_used;
ALTER TABLE public.agent_runs DROP COLUMN IF EXISTS cost_usd;
ALTER TABLE public.agent_runs DROP COLUMN IF EXISTS model_used;
ALTER TABLE public.agent_runs DROP COLUMN IF EXISTS prompt_version;
ALTER TABLE public.timeline_events DROP COLUMN IF EXISTS confidence;
ALTER TABLE public.timeline_events DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.legal_chunks DROP COLUMN IF EXISTS jurisdiction;
ALTER TABLE public.legal_chunks DROP COLUMN IF EXISTS court;
ALTER TABLE public.legal_chunks DROP COLUMN IF EXISTS authority_type;

-- Drop new indexes
DROP INDEX IF EXISTS idx_legal_chunks_jurisdiction;
DROP INDEX IF EXISTS idx_legal_chunks_court;
DROP INDEX IF EXISTS idx_hearings_matter_scheduled;
DROP INDEX IF EXISTS model_configs_system_unique;

-- Restore original CASCADE settings
-- (This requires knowing the original state)
```

### Reverse Migration for `20260830_storage_bucket_rls_and_cleanup.sql`

```sql
-- Drop all new policies on legacy tables
DROP POLICY IF EXISTS "Users can manage own cases" ON public.cases;
DROP POLICY IF EXISTS "Users can manage own case_documents" ON public.case_documents;
DROP POLICY IF EXISTS "Users can manage own filings" ON public.filings;
DROP POLICY IF EXISTS "Users can manage own agent_sessions" ON public.agent_sessions;
DROP POLICY IF EXISTS "Users can manage own document_nodes" ON public.document_nodes;
DROP POLICY IF EXISTS "Users can view own lab_simulations" ON public.lab_simulations;
DROP POLICY IF EXISTS "Service role only for people_db_attorney" ON public.people_db_attorney;

-- Restore original policies (from backup)

-- Drop storage objects policy
DROP POLICY IF EXISTS "Users can access own storage objects" ON storage.objects;
DISABLE ROW LEVEL SECURITY ON storage.objects;

-- Restore other table policies
DROP POLICY IF EXISTS "Service role only for cold_cases_ingestion" ON public.cold_cases_ingestion;
-- etc.
```

## Long-Term Remediation Plan

### 1. Consolidate Dual Schema (cases vs matters)

**Goal**: Migrate all data from `cases` schema to `matters` schema

**Steps**:
1. Create data migration script to copy:
   - `cases` -> `matters`
   - `case_documents` -> `documents`
   - `filings` -> new `filings` table with FK to `matters`
   - `agent_sessions` -> new `agent_sessions` table with FK to `matters`
   - `document_nodes` -> consolidate with `legal_chunks` or create new chunk table under `matters`

2. Update application code to use `matters` exclusively

3. Verify all queries work with new schema

4. Drop old tables after successful migration

**Timeline**: 2-4 weeks
**Risk**: High - requires careful testing and coordination

### 2. Implement Proper Storage Bucket Management

**Goal**: Ensure all legal documents are stored securely with proper access controls

**Steps**:
1. Create separate buckets for different document types:
   - `matters-documents`: User-uploaded case documents
   - `legal-library`: Court opinions and legal authorities
   - `user-avatars`: Profile pictures
   - `temp-uploads`: Temporary upload staging

2. Apply appropriate RLS policies to each bucket

3. Configure MIME type restrictions per bucket

4. Implement file size limits

5. Set up bucket lifecycle policies (retention, cleanup)

**Timeline**: 1-2 weeks
**Risk**: Medium

### 3. Implement Comprehensive Audit Trail

**Goal**: Full auditability for all user actions (MASTER BUILD §29)

**Steps**:
1. Review all audit log insertions in application code
2. Ensure all critical actions are logged:
   - Document upload/delete
   - Agent run start/complete/fail
   - User authentication events
   - Data modifications
   - API calls

3. Implement audit log retention policy

4. Create audit log review dashboard

**Timeline**: 2 weeks
**Risk**: Low

### 4. Implement Token Usage Tracking

**Goal**: Track AI model costs and usage (MASTER BUILD §29)

**Steps**:
1. Update agent runtime to track:
   - Input tokens
   - Output tokens
   - Total tokens
   - Cost calculation based on model pricing

2. Create token usage reporting dashboard

3. Implement cost alerts and budget tracking

**Timeline**: 1 week
**Risk**: Low

### 5. Review and Standardize All RLS Policies

**Goal**: Ensure consistent, secure RLS across all tables

**Steps**:
1. Create RLS policy template/standard
2. Review all existing policies against standard
3. Update non-compliant policies
4. Document all policies in central registry
5. Implement automated testing for RLS policies

**Timeline**: 2 weeks
**Risk**: Medium

## Testing Checklist

### Before Deployment

- [ ] Backup database
- [ ] Test migrations in staging environment
- [ ] Verify all application tests pass
- [ ] Test authentication flows
- [ ] Test agent functionality
- [ ] Test document upload/download
- [ ] Test audit log creation
- [ ] Test directory subscription access

### After Deployment

- [ ] Verify no authentication errors in production logs
- [ ] Verify agent runs can be created
- [ ] Verify audit logs are being written
- [ ] Verify users can only access their own data
- [ ] Verify unauthenticated users cannot access sensitive data
- [ ] Verify storage access works correctly
- [ ] Verify directory subscriptions are properly scoped

## Contact and Support

**Primary Contact**: Andrew (andrew@acquit.ai)
**Backup Contact**: Platform Team

**Escalation Path**:
1. Primary contact (first 15 minutes)
2. Platform team (next 30 minutes)
3. Supabase support (if database-level issue)
4. Executive team (if security incident)

## References

- [MASTER BUILD INSTRUCTIONS](link-to-internal-docs)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [SCHEMA_RECONCILIATION.md](../SCHEMA_RECONCILIATION.md)

## File History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-08-30 | Mistral Vibe | Initial version based on audit findings |

---

**Document Status**: Ready for review
**Next Review Date**: 2026-09-06
**Classification**: Internal - Security Sensitive

---

*This document is maintained as part of the Acquit Platform's security and compliance program.*
