-- PlanetScale Postgres / Hyperdrive origin
-- Entitlements, loadouts, knowledge packs, crypto payments
-- Authorization is enforced in the Worker (app layer), not Supabase RLS.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Knowledge packs (require version + verification stamp before sell)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.knowledge_packs (
  id                text PRIMARY KEY,
  name              text NOT NULL,
  description       text,
  jurisdiction      text,
  pack_type         text NOT NULL DEFAULT 'digest'
                      CHECK (pack_type IN ('digest', 'glossary', 'templates', 'safety', 'schema')),
  version           text NOT NULL,
  source            text NOT NULL,
  last_reviewed     date NOT NULL,
  verification_stamp jsonb NOT NULL DEFAULT '{}'::jsonb,
  staleness_days    int NOT NULL DEFAULT 180,
  content_uri       text,
  metadata          jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS knowledge_packs_jurisdiction_idx
  ON public.knowledge_packs (jurisdiction);

-- ---------------------------------------------------------------------------
-- Entitlements
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.entitlements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type    text NOT NULL CHECK (subject_type IN ('wallet', 'account')),
  subject_id      text NOT NULL,
  grant_type      text NOT NULL CHECK (grant_type IN ('gear', 'kit', 'pack', 'credit_balance', 'seat', 'sku', 'default')),
  grant_id        text NOT NULL,
  source          text NOT NULL CHECK (source IN ('purchase', 'nft', 'soulbound', 'promo', 'admin', 'default')),
  source_ref      text,
  quantity        numeric NOT NULL DEFAULT 1,
  expires_at      timestamptz,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS entitlements_unique_active
  ON public.entitlements (subject_type, subject_id, grant_type, grant_id)
  WHERE expires_at IS NULL OR expires_at > now();

CREATE INDEX IF NOT EXISTS entitlements_subject_idx
  ON public.entitlements (subject_type, subject_id);

CREATE INDEX IF NOT EXISTS entitlements_grant_idx
  ON public.entitlements (grant_type, grant_id);

-- ---------------------------------------------------------------------------
-- Agent loadouts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agent_loadouts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid,
  user_id           text,
  agent_instance_id text NOT NULL,
  agent_title_id    text NOT NULL,
  primary_gear_id   text,
  secondary_gear    text[] NOT NULL DEFAULT '{}',
  tools_gear        text[] NOT NULL DEFAULT '{}',
  knowledge_gear    text[] NOT NULL DEFAULT '{}',
  metadata          jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at        timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS agent_loadouts_instance_uidx
  ON public.agent_loadouts (agent_instance_id);

CREATE INDEX IF NOT EXISTS agent_loadouts_user_idx
  ON public.agent_loadouts (user_id);

-- ---------------------------------------------------------------------------
-- Crypto payments (Base USDC)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crypto_payments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type    text NOT NULL CHECK (subject_type IN ('wallet', 'account')),
  subject_id      text NOT NULL,
  chain           text NOT NULL DEFAULT 'base',
  token           text NOT NULL DEFAULT 'USDC',
  amount_usdc     numeric NOT NULL,
  tx_hash         text,
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'failed', 'refunded')),
  sku_id          text,
  grant_payload   jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  confirmed_at    timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS crypto_payments_tx_hash_uidx
  ON public.crypto_payments (tx_hash)
  WHERE tx_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS crypto_payments_subject_idx
  ON public.crypto_payments (subject_type, subject_id);
