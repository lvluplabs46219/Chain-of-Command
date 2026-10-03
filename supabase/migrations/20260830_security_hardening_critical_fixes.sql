-- Migration: 20260830_security_hardening_critical_fixes
-- Description: Critical security fixes for RLS policies, audit logs, and data exposure issues
-- Priority: P0 - Must be applied immediately

-- ====================================================================
-- SECTION 1: Fix audit_logs INSERT with_check policy
-- Issue: Current with_check uses auth.uid() directly against user_id (UUID)
--        but user_id references public.users.id, not auth_id
-- ====================================================================

-- First, drop the broken policy if it exists
DROP POLICY IF EXISTS "Users can insert audit logs" ON public.audit_logs;

-- Recreate with proper check: join through users table to match auth_id
CREATE POLICY "Users can insert own audit logs" ON public.audit_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE public.users.id = audit_logs.user_id 
      AND public.users.auth_id = auth.uid()
    )
    OR (
      EXISTS (
        SELECT 1 FROM public.matters 
        JOIN public.users ON public.users.id = public.matters.user_id
        WHERE public.matters.id = audit_logs.matter_id 
        AND public.users.auth_id = auth.uid()
      )
    )
  );

-- ====================================================================
-- SECTION 2: Add missing INSERT policy for agent_runs
-- Issue: Only SELECT policy exists, no INSERT/UPDATE/DELETE
-- ====================================================================

-- Drop existing if needed and recreate with full CRUD
DROP POLICY IF EXISTS "agent_runs_owner_select" ON public.agent_runs;

CREATE POLICY "agent_runs_owner_all" ON public.agent_runs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.agents a
      JOIN public.users u ON u.id = a.user_id
      WHERE a.id = agent_runs.agent_id AND u.auth_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agents a
      JOIN public.users u ON u.id = a.user_id
      WHERE a.id = agent_runs.agent_id AND u.auth_id = auth.uid()
    )
  );

-- ====================================================================
-- SECTION 3: Fix directory_subscriptions SELECT policy
-- Issue: Current policy exposes ALL lawyers' Stripe subscription data
-- ====================================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public read for subscriptions" ON public.directory_subscriptions;
DROP POLICY IF EXISTS "Users can view all subscriptions" ON public.directory_subscriptions;

-- Recreate: Only the owning lawyer can see their own subscriptions
CREATE POLICY "Lawyers can view own subscriptions" ON public.directory_subscriptions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.directory_lawyer_profiles p
      WHERE p.id = directory_subscriptions.lawyer_id
      AND p.email = auth.jwt() ->> 'email'
    )
  );

-- Lawyer can insert/update their own subscriptions
CREATE POLICY "Lawyers can manage own subscriptions" ON public.directory_subscriptions
  FOR ALL TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.directory_lawyer_profiles p
      WHERE p.id = directory_subscriptions.lawyer_id
      AND p.email = auth.jwt() ->> 'email'
    )
  );

-- ====================================================================
-- SECTION 4: Add missing columns for auditability and cost tracking
-- ====================================================================

-- Add token usage tracking to agent_runs (MASTER BUILD §29)
ALTER TABLE public.agent_runs ADD COLUMN IF NOT EXISTS tokens_used INTEGER;
ALTER TABLE public.agent_runs ADD COLUMN IF NOT EXISTS cost_usd NUMERIC(10,6);
ALTER TABLE public.agent_runs ADD COLUMN IF NOT EXISTS model_used TEXT;

-- Add prompt version tracking to agent_runs (MASTER BUILD §29)
ALTER TABLE public.agent_runs ADD COLUMN IF NOT EXISTS prompt_version TEXT;

-- Add confidence and created_by to timeline_events (MASTER BUILD §12)
ALTER TABLE public.timeline_events ADD COLUMN IF NOT EXISTS confidence FLOAT;
ALTER TABLE public.timeline_events ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'user';

-- ====================================================================
-- SECTION 5: Fix legal_chunks missing jurisdiction/court metadata (MASTER BUILD §28)
-- ====================================================================

ALTER TABLE public.legal_chunks ADD COLUMN IF NOT EXISTS jurisdiction TEXT;
ALTER TABLE public.legal_chunks ADD COLUMN IF NOT EXISTS court TEXT;
ALTER TABLE public.legal_chunks ADD COLUMN IF NOT EXISTS authority_type TEXT;

-- Create index on jurisdiction for filtering
CREATE INDEX IF NOT EXISTS idx_legal_chunks_jurisdiction ON public.legal_chunks(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_legal_chunks_court ON public.legal_chunks(court);

-- ====================================================================
-- SECTION 6: Fix model_configs NULL unique collision
-- ====================================================================

-- Add partial unique index for system configs (where user_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS model_configs_system_unique 
  ON public.model_configs(provider, model_id, use_case) 
  WHERE user_id IS NULL;

-- ====================================================================
-- SECTION 7: Fix hearings missing composite index
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_hearings_matter_scheduled ON public.hearings(matter_id, scheduled_at);

-- ====================================================================
-- SECTION 8: Drop duplicate index on agent_permissions
-- ====================================================================

DROP INDEX IF EXISTS idx_agent_permissions_agent_id;

-- ====================================================================
-- SECTION 9: Add ON DELETE CASCADE to missing foreign keys
-- ====================================================================

-- Check and add CASCADE to deadlines.matter_id if not present
DO $$
BEGIN
  PERFORM 1 FROM pg_constraint 
  WHERE conrelid = 'public.deadlines'::regclass 
  AND confrelid = 'public.matters'::regclass 
  AND confdeltype = 'c'::"char"; -- 'c' = CASCADE
  
  IF NOT FOUND THEN
    ALTER TABLE public.deadlines 
    DROP CONSTRAINT IF EXISTS deadlines_matter_id_fkey,
    ADD CONSTRAINT deadlines_matter_id_fkey 
      FOREIGN KEY (matter_id) REFERENCES public.matters(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Check and add CASCADE to evidence_items.matter_id
DO $$
BEGIN
  PERFORM 1 FROM pg_constraint 
  WHERE conrelid = 'public.evidence_items'::regclass 
  AND confrelid = 'public.matters'::regclass 
  AND confdeltype = 'c'::"char";
  
  IF NOT FOUND THEN
    ALTER TABLE public.evidence_items 
    DROP CONSTRAINT IF EXISTS evidence_items_matter_id_fkey,
    ADD CONSTRAINT evidence_items_matter_id_fkey 
      FOREIGN KEY (matter_id) REFERENCES public.matters(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Check and add CASCADE to timeline_events.matter_id
DO $$
BEGIN
  PERFORM 1 FROM pg_constraint 
  WHERE conrelid = 'public.timeline_events'::regclass 
  AND confrelid = 'public.matters'::regclass 
  AND confdeltype = 'c'::"char";
  
  IF NOT FOUND THEN
    ALTER TABLE public.timeline_events 
    DROP CONSTRAINT IF EXISTS timeline_events_matter_id_fkey,
    ADD CONSTRAINT timeline_events_matter_id_fkey 
      FOREIGN KEY (matter_id) REFERENCES public.matters(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Check and add CASCADE to charges.matter_id
DO $$
BEGIN
  PERFORM 1 FROM pg_constraint 
  WHERE conrelid = 'public.charges'::regclass 
  AND confrelid = 'public.matters'::regclass 
  AND confdeltype = 'c'::"char";
  
  IF NOT FOUND THEN
    ALTER TABLE public.charges 
    DROP CONSTRAINT IF EXISTS charges_matter_id_fkey,
    ADD CONSTRAINT charges_matter_id_fkey 
      FOREIGN KEY (matter_id) REFERENCES public.matters(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Check and add CASCADE to hearings.matter_id
DO $$
BEGIN
  PERFORM 1 FROM pg_constraint 
  WHERE conrelid = 'public.hearings'::regclass 
  AND confrelid = 'public.matters'::regclass 
  AND confdeltype = 'c'::"char";
  
  IF NOT FOUND THEN
    ALTER TABLE public.hearings 
    DROP CONSTRAINT IF EXISTS hearings_matter_id_fkey,
    ADD CONSTRAINT hearings_matter_id_fkey 
      FOREIGN KEY (matter_id) REFERENCES public.matters(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ====================================================================
-- SECTION 10: Fix retrieval_logs SELECT policy
-- Issue: Allows reading NULL agent_run_id rows by anyone
-- ====================================================================

DROP POLICY IF EXISTS "Users can view retrieval logs" ON public.retrieval_logs;

CREATE POLICY "Users can view own retrieval logs" ON public.retrieval_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.agent_runs r
      JOIN public.agents a ON a.id = r.agent_id
      JOIN public.users u ON u.id = a.user_id
      WHERE r.id = retrieval_logs.agent_run_id 
      AND u.auth_id = auth.uid()
    )
    OR (
      EXISTS (
        SELECT 1 FROM public.matters m
        JOIN public.users u ON u.id = m.user_id
        WHERE m.id = retrieval_logs.matter_id 
        AND u.auth_id = auth.uid()
      )
    )
  );

-- ====================================================================
-- SECTION 11: Ensure all sensitive tables have authenticated-only policies
-- This is a safety net - explicitly set TO authenticated for core tables
-- ====================================================================

-- Matters: Ensure all policies are to authenticated
DROP POLICY IF EXISTS "Public can view matters" ON public.matters;
DROP POLICY IF EXISTS "Anyone can manage matters" ON public.matters;

-- Documents: Ensure all policies are to authenticated  
DROP POLICY IF EXISTS "Public can view documents" ON public.documents;
DROP POLICY IF EXISTS "Anyone can manage documents" ON public.documents;

-- Parties: Ensure all policies are to authenticated
DROP POLICY IF EXISTS "Public can view parties" ON public.parties;

-- Evidence items: Ensure all policies are to authenticated
DROP POLICY IF EXISTS "Public can view evidence" ON public.evidence_items;

-- Timeline events: Ensure all policies are to authenticated
DROP POLICY IF EXISTS "Public can view timeline" ON public.timeline_events;

-- Deadlines: Ensure all policies are to authenticated
DROP POLICY IF EXISTS "Public can view deadlines" ON public.deadlines;

-- Charges: Ensure all policies are to authenticated
DROP POLICY IF EXISTS "Public can view charges" ON public.charges;

-- Hearings: Ensure all policies are to authenticated
DROP POLICY IF EXISTS "Public can view hearings" ON public.hearings;

-- Filings: Ensure all policies are to authenticated
DROP POLICY IF EXISTS "Public can view filings" ON public.filings;

-- Agent sessions: Ensure all policies are to authenticated
DROP POLICY IF EXISTS "Public can view agent sessions" ON public.agent_sessions;

-- Document nodes: Ensure all policies are to authenticated
DROP POLICY IF EXISTS "Public can view document nodes" ON public.document_nodes;

-- Case documents: Ensure all policies are to authenticated
DROP POLICY IF EXISTS "Public can view case documents" ON public.case_documents;

-- ====================================================================
-- SECTION 12: Fix directory_agent_referrals policy
-- Issue: May be too permissive
-- ====================================================================

DROP POLICY IF EXISTS "Anyone can create referrals" ON public.directory_agent_referrals;

-- Allow authenticated users to create referrals for any lawyer
CREATE OR REPLACE POLICY "Authenticated users can create referrals" ON public.directory_agent_referrals
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Lawyers can view referrals for their own profile
CREATE OR REPLACE POLICY "Lawyers can view own referrals" ON public.directory_agent_referrals
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.directory_lawyer_profiles p
      WHERE p.id = directory_agent_referrals.lawyer_id
      AND p.email = auth.jwt() ->> 'email'
    )
  );

COMMENT ON POLICY "Lawyers can view own referrals" ON public.directory_agent_referrals IS 'Only the referred lawyer can view their own referrals';
