-- Migration: 20260830_storage_bucket_rls_and_cleanup
-- Description: Storage bucket security policies and cleanup of legacy tables
-- Priority: P0 - Storage security is critical

-- ====================================================================
-- SECTION 1: Storage Bucket RLS Policies
-- Issue: No RLS policies on storage.objects for the legal documents bucket
-- ====================================================================

-- Enable RLS on storage objects if not already enabled
ALTER TABLE IF EXISTS storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to access their own matter documents
-- This assumes documents are stored with a path like: matters/{matter_id}/... or users/{user_id}/...
CREATE OR REPLACE POLICY "Users can access own storage objects" ON storage.objects
  FOR ALL TO authenticated
  USING (
    -- Direct user folder access
    name LIKE '%' || auth.uid() || '%'
    OR 
    -- Matter folder access (if using matter-based paths)
    EXISTS (
      SELECT 1 FROM public.matters m
      JOIN public.users u ON u.id = m.user_id
      WHERE m.id::TEXT = regexp_replace(name, '^.*/matters/([^/]+).*', '\\1')
      AND u.auth_id = auth.uid()
    )
    OR
    -- Legacy cases folder access
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id::TEXT = regexp_replace(name, '^.*/cases/([^/]+).*', '\\1')
      AND c.user_id = auth.uid()
    )
  );

-- ====================================================================
-- SECTION 2: Legacy Tables - Apply proper RLS
-- Issue: Tables like cases, case_documents, filings, agent_sessions exist
--        in live DB but aren't in the canonical matters-based schema
-- ====================================================================

-- Cases table: Ensure proper RLS (user_id should match auth.uid())
ALTER TABLE IF EXISTS public.cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can manage cases" ON public.cases;
DROP POLICY IF EXISTS "Anyone can view cases" ON public.cases;

CREATE POLICY "Users can manage own cases" ON public.cases
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Case_documents table: Link to cases
ALTER TABLE IF EXISTS public.case_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view case_documents" ON public.case_documents;

CREATE POLICY "Users can manage own case_documents" ON public.case_documents
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = case_documents.case_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = case_documents.case_id AND c.user_id = auth.uid()
    )
  );

-- Filings table: Link to cases
ALTER TABLE IF EXISTS public.filings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view filings" ON public.filings;

CREATE POLICY "Users can manage own filings" ON public.filings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = filings.case_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = filings.case_id AND c.user_id = auth.uid()
    )
  );

-- Agent_sessions table: Link to cases
ALTER TABLE IF EXISTS public.agent_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view agent_sessions" ON public.agent_sessions;

CREATE POLICY "Users can manage own agent_sessions" ON public.agent_sessions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = agent_sessions.case_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = agent_sessions.case_id AND c.user_id = auth.uid()
    )
  );

-- Document_nodes table: Link to cases
ALTER TABLE IF EXISTS public.document_nodes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view document_nodes" ON public.document_nodes;

CREATE POLICY "Users can manage own document_nodes" ON public.document_nodes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = document_nodes.case_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = document_nodes.case_id AND c.user_id = auth.uid()
    )
  );

-- ====================================================================
-- SECTION 3: Additional Tables from SCHEMA_RECONCILIATION.md
-- ====================================================================

-- lab_simulations table
ALTER TABLE IF EXISTS public.lab_simulations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view lab_simulations" ON public.lab_simulations;
CREATE POLICY "Users can view own lab_simulations" ON public.lab_simulations
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- people_db_attorney table (from directory)
ALTER TABLE IF EXISTS public.people_db_attorney ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view people_db_attorney" ON public.people_db_attorney;
CREATE POLICY "Service role only for people_db_attorney" ON public.people_db_attorney
  FOR ALL USING (auth.role() = 'service_role');

-- ====================================================================
-- SECTION 4: Ingestion Tables - Service Role Only
-- ====================================================================

ALTER TABLE IF EXISTS public.cold_cases_ingestion ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view cold_cases_ingestion" ON public.cold_cases_ingestion;
CREATE POLICY "Service role only for cold_cases_ingestion" ON public.cold_cases_ingestion
  FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE IF EXISTS public.cold_cases_ingestion_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view cold_cases_ingestion_state" ON public.cold_cases_ingestion_state;
CREATE POLICY "Service role only for cold_cases_ingestion_state" ON public.cold_cases_ingestion_state
  FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE IF EXISTS public.courtlistener_webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view courtlistener_webhook_events" ON public.courtlistener_webhook_events;
CREATE POLICY "Service role only for courtlistener_webhook_events" ON public.courtlistener_webhook_events
  FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE IF EXISTS public.courtlistener_webhook_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view courtlistener_webhook_config" ON public.courtlistener_webhook_config;
CREATE POLICY "Service role only for courtlistener_webhook_config" ON public.courtlistener_webhook_config
  FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE IF EXISTS public.courtlistener_webhook_secret_path ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view courtlistener_webhook_secret_path" ON public.courtlistener_webhook_secret_path;
CREATE POLICY "Service role only for courtlistener_webhook_secret_path" ON public.courtlistener_webhook_secret_path
  FOR ALL USING (auth.role() = 'service_role');

-- ====================================================================
-- SECTION 5: Audit Tables
-- ====================================================================

-- sic_audit_events - ensure proper RLS
ALTER TABLE IF EXISTS public.sic_audit_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view sic_audit_events" ON public.sic_audit_events;

CREATE POLICY "Users can view own sic_audit_events" ON public.sic_audit_events
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Deny deletes on sic_audit_events" ON public.sic_audit_events
  FOR DELETE TO authenticated
  USING (false);

-- document_custody_chain - ensure proper RLS
ALTER TABLE IF EXISTS public.document_custody_chain ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view document_custody_chain" ON public.document_custody_chain;

CREATE POLICY "Users can view own document_custody_chain" ON public.document_custody_chain
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Deny deletes on document_custody_chain" ON public.document_custody_chain
  FOR DELETE TO authenticated
  USING (false);

-- ====================================================================
-- SECTION 6: Disclosures and Audio tables
-- ====================================================================

ALTER TABLE IF EXISTS public.disclosures_financialdisclosure ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE POLICY "Service role only for disclosures_financialdisclosure" 
  ON public.disclosures_financialdisclosure
  FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE IF EXISTS public.disclosures_investment ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE POLICY "Service role only for disclosures_investment" 
  ON public.disclosures_investment
  FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE IF EXISTS public.audio_audio ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE POLICY "Service role only for audio_audio" 
  ON public.audio_audio
  FOR ALL USING (auth.role() = 'service_role');
