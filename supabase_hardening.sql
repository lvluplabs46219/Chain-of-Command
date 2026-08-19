-- ====================================================================
-- Acquit.ai Supabase Security & Hardening Script
-- Resolves linter warnings: vector schema, security definer, RLS policies
-- ====================================================================

-- 1. Relocate pgvector extension to dedicated schema
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION vector SET SCHEMA extensions;

-- 2. Revoke public/anon/authenticated execution on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.user_owns_matter(uuid) FROM anon, authenticated, public;

-- Recreate with SECURITY INVOKER if authenticated users must evaluate ownership
CREATE OR REPLACE FUNCTION public.user_owns_matter(check_matter_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.matters
    WHERE id = check_matter_id AND user_id = auth.uid()
  );
$$;

-- 3. Idempotent unique constraint on legal source hash
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sources_source_hash_unique'
  ) THEN
    ALTER TABLE public.sources ADD CONSTRAINT sources_source_hash_unique UNIQUE (source_hash);
  END IF;
END $$;

-- 4. Foreign key indexes for query performance
CREATE INDEX IF NOT EXISTS idx_matters_case_number ON public.matters (case_number);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON public.audit_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_legal_chunks_authority ON public.legal_chunks (authority_id);

-- 5. Automatic updated_at trigger for matters
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_matters_updated_at ON public.matters;
CREATE TRIGGER update_matters_updated_at
BEFORE UPDATE ON public.matters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Staging & Webhook Tables RLS Hardening (Service-Role Only)
ALTER TABLE public.cold_cases_ingestion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cold_cases_ingestion_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courtlistener_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS service_role_all_ingestion ON public.cold_cases_ingestion;
CREATE POLICY service_role_all_ingestion ON public.cold_cases_ingestion
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS service_role_all_ingestion_state ON public.cold_cases_ingestion_state;
CREATE POLICY service_role_all_ingestion_state ON public.cold_cases_ingestion_state
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS service_role_all_webhooks ON public.courtlistener_webhook_events;
CREATE POLICY service_role_all_webhooks ON public.courtlistener_webhook_events
  FOR ALL USING (auth.role() = 'service_role');
