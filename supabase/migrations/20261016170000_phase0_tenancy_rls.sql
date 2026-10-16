-- Phase 0 foundation: tenancy + RLS backstop (COC-294 / COC-095 / COC-113)
-- Accept criterion: cross-tenant access impossible at the query layer.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ---------------------------------------------------------------------------
-- Tenants
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenants (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  residency   text,                          -- e.g. 'us-east-1'
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Ensure tenant_id on core tables (additive; safe if already present)
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='tenant_id') THEN
    ALTER TABLE users ADD COLUMN tenant_id uuid REFERENCES tenants(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='matters' AND column_name='tenant_id') THEN
    ALTER TABLE matters ADD COLUMN tenant_id uuid REFERENCES tenants(id);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Audit events (append-only, hash-chained)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id),
  at            timestamptz NOT NULL DEFAULT now(),
  actor_type    text NOT NULL,
  actor_id      text NOT NULL,
  action        text NOT NULL,
  target_type   text,
  target_id     text,
  case_id       uuid,
  agent_id      text,
  agent_run_id  text,
  model_id      text,
  model_version text,
  prompt_version text,
  trace_id      text,
  result        text NOT NULL,
  error_code    text,
  prev_hash     text NOT NULL,
  hash          text NOT NULL,
  metadata      jsonb
);

CREATE INDEX IF NOT EXISTS audit_events_tenant_at_idx ON audit_events (tenant_id, at DESC);
CREATE INDEX IF NOT EXISTS audit_events_case_idx ON audit_events (case_id) WHERE case_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Session helpers for RLS (set by the API on every request)
-- ---------------------------------------------------------------------------
-- SELECT set_config('app.tenant_id', '<uuid>', true);
-- SELECT set_config('app.user_id',   '<uuid>', true);

-- ---------------------------------------------------------------------------
-- RLS policies (deny-by-default)
-- ---------------------------------------------------------------------------
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Tenants: a user may only see their own tenant
DROP POLICY IF EXISTS tenants_isolation ON tenants;
CREATE POLICY tenants_isolation ON tenants
  FOR ALL
  USING (id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- Audit: tenant isolation; no updates/deletes (append-only enforced in app + revoke)
DROP POLICY IF EXISTS audit_tenant_isolation ON audit_events;
CREATE POLICY audit_tenant_isolation ON audit_events
  FOR SELECT
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

DROP POLICY IF EXISTS audit_insert_own_tenant ON audit_events;
CREATE POLICY audit_insert_own_tenant ON audit_events
  FOR INSERT
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- Explicitly deny UPDATE/DELETE on audit (append-only)
REVOKE UPDATE, DELETE ON audit_events FROM PUBLIC;

-- ---------------------------------------------------------------------------
-- Feature flags (minimal)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feature_flags (
  key         text PRIMARY KEY,
  description text,
  enabled     boolean NOT NULL DEFAULT false,
  tenant_id   uuid REFERENCES tenants(id),   -- null = global
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS feature_flags_read ON feature_flags;
CREATE POLICY feature_flags_read ON feature_flags
  FOR SELECT
  USING (
    tenant_id IS NULL
    OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
  );
