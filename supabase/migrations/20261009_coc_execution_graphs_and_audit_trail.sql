-- Michael orchestrator persistence + chain tables (applied to Acquit.ai project othxichdhzdxgtatautb)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

CREATE TABLE IF NOT EXISTS public.execution_graphs (
  id TEXT PRIMARY KEY,
  execution_id TEXT NOT NULL UNIQUE,
  tasks JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'FAILED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  audit_trail JSONB NOT NULL DEFAULT '[]'::jsonb,
  user_id UUID NULL
);

CREATE INDEX IF NOT EXISTS execution_graphs_status_idx ON public.execution_graphs(status);
CREATE INDEX IF NOT EXISTS execution_graphs_user_idx ON public.execution_graphs(user_id);
CREATE INDEX IF NOT EXISTS execution_graphs_updated_idx ON public.execution_graphs(updated_at DESC);

CREATE TABLE IF NOT EXISTS public.audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('START', 'COMPLETE', 'FAIL', 'RETRY')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_id UUID NULL
);

CREATE INDEX IF NOT EXISTS audit_trail_execution_idx ON public.audit_trail(execution_id);
CREATE INDEX IF NOT EXISTS audit_trail_timestamp_idx ON public.audit_trail(timestamp);
CREATE INDEX IF NOT EXISTS audit_trail_user_idx ON public.audit_trail(user_id);

CREATE TABLE IF NOT EXISTS public.chain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id TEXT NOT NULL,
  sequence_number INTEGER NOT NULL,
  type TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_name TEXT,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  resource_name TEXT,
  hash TEXT NOT NULL,
  previous_hash TEXT,
  evidence_fingerprint TEXT,
  evidence_id TEXT,
  case_id TEXT,
  session_id TEXT,
  agent_run_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  signature TEXT,
  immutable BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chain_events_chain_idx ON public.chain_events(chain_id);
CREATE INDEX IF NOT EXISTS chain_events_sequence_idx ON public.chain_events(chain_id, sequence_number);
CREATE UNIQUE INDEX IF NOT EXISTS chain_events_unique_chain_sequence ON public.chain_events(chain_id, sequence_number);
CREATE INDEX IF NOT EXISTS chain_events_case_idx ON public.chain_events(case_id);
CREATE INDEX IF NOT EXISTS chain_events_hash_idx ON public.chain_events(hash);

CREATE TABLE IF NOT EXISTS public.chain_metadata (
  chain_id TEXT PRIMARY KEY,
  chain_type TEXT NOT NULL,
  name TEXT,
  description TEXT,
  case_id TEXT,
  root_hash TEXT,
  tip_hash TEXT,
  event_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.chain_verification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id TEXT NOT NULL,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_valid BOOLEAN NOT NULL,
  tip_hash TEXT,
  event_count INTEGER,
  errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  verified_by TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS chain_verification_log_chain_idx ON public.chain_verification_log(chain_id);

CREATE TABLE IF NOT EXISTS public.sic_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id UUID NOT NULL,
  user_id UUID NOT NULL,
  case_id UUID,
  agent_id UUID,
  agent_run_id UUID,
  payload JSONB NOT NULL,
  risk_score INTEGER,
  risk_flags TEXT[],
  evidentiary BOOLEAN NOT NULL DEFAULT FALSE,
  immutable BOOLEAN NOT NULL DEFAULT TRUE,
  signature TEXT,
  sic_ingested BOOLEAN NOT NULL DEFAULT FALSE,
  sic_ingested_at TIMESTAMPTZ,
  sic_event_id TEXT
);

CREATE INDEX IF NOT EXISTS sic_audit_kind_idx ON public.sic_audit_events(kind);
CREATE INDEX IF NOT EXISTS sic_audit_user_idx ON public.sic_audit_events(user_id);
CREATE INDEX IF NOT EXISTS sic_audit_case_idx ON public.sic_audit_events(case_id);

CREATE TABLE IF NOT EXISTS public.document_custody_chain (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  case_id UUID NOT NULL,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  previous_hash TEXT,
  event_hash TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS document_custody_document_idx ON public.document_custody_chain(document_id);
CREATE INDEX IF NOT EXISTS document_custody_case_idx ON public.document_custody_chain(case_id);
