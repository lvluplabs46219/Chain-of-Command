-- Entitlements, agent loadouts, knowledge packs (versioned + stamped)
-- Server-side equip only. Never trust client wallet state alone.

-- ---------------------------------------------------------------------------
-- Knowledge packs (jurisdiction digests, etc.) — must carry verification stamp
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

COMMENT ON COLUMN public.knowledge_packs.verification_stamp IS
  'Required: { reviewer, method, confidence, notes }. No pack without stamp.';

CREATE INDEX IF NOT EXISTS knowledge_packs_jurisdiction_idx
  ON public.knowledge_packs (jurisdiction);

-- ---------------------------------------------------------------------------
-- Entitlements (wallet or account subject)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.entitlements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type    text NOT NULL CHECK (subject_type IN ('wallet', 'account')),
  subject_id      text NOT NULL,
  grant_type      text NOT NULL CHECK (grant_type IN ('gear', 'kit', 'pack', 'credit_balance', 'seat', 'sku')),
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
-- Agent loadout equip state (what is currently equipped per agent instance)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agent_loadouts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid,
  user_id         uuid,
  agent_instance_id text NOT NULL,
  agent_title_id  text NOT NULL,
  primary_gear_id text,
  secondary_gear  text[] NOT NULL DEFAULT '{}',
  tools_gear      text[] NOT NULL DEFAULT '{}',
  knowledge_gear  text[] NOT NULL DEFAULT '{}',
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at      timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS agent_loadouts_instance_uidx
  ON public.agent_loadouts (agent_instance_id);

CREATE INDEX IF NOT EXISTS agent_loadouts_user_idx
  ON public.agent_loadouts (user_id);

-- ---------------------------------------------------------------------------
-- Payment / checkout ledger (Base USDC)
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

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.knowledge_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_loadouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_payments ENABLE ROW LEVEL SECURITY;

-- Knowledge packs: readable by authenticated; writes service_role only
DROP POLICY IF EXISTS knowledge_packs_select ON public.knowledge_packs;
CREATE POLICY knowledge_packs_select ON public.knowledge_packs
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS knowledge_packs_service ON public.knowledge_packs;
CREATE POLICY knowledge_packs_service ON public.knowledge_packs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Entitlements: subject can read own; writes via service_role / SECURITY DEFINER
DROP POLICY IF EXISTS entitlements_select_own ON public.entitlements;
CREATE POLICY entitlements_select_own ON public.entitlements
  FOR SELECT TO authenticated
  USING (
    (subject_type = 'account' AND subject_id = public.current_app_user_id()::text)
    OR (subject_type = 'wallet' AND subject_id = lower(coalesce(auth.jwt() ->> 'wallet_address', '')))
  );

DROP POLICY IF EXISTS entitlements_service ON public.entitlements;
CREATE POLICY entitlements_service ON public.entitlements
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Agent loadouts: owner only
DROP POLICY IF EXISTS agent_loadouts_own ON public.agent_loadouts;
CREATE POLICY agent_loadouts_select ON public.agent_loadouts
  FOR SELECT TO authenticated
  USING (user_id = public.current_app_user_id());
CREATE POLICY agent_loadouts_mutate ON public.agent_loadouts
  FOR ALL TO authenticated
  USING (user_id = public.current_app_user_id())
  WITH CHECK (user_id = public.current_app_user_id());

DROP POLICY IF EXISTS agent_loadouts_service ON public.agent_loadouts;
CREATE POLICY agent_loadouts_service ON public.agent_loadouts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Payments: subject read own
DROP POLICY IF EXISTS crypto_payments_select_own ON public.crypto_payments;
CREATE POLICY crypto_payments_select_own ON public.crypto_payments
  FOR SELECT TO authenticated
  USING (
    (subject_type = 'account' AND subject_id = public.current_app_user_id()::text)
    OR (subject_type = 'wallet' AND subject_id = lower(coalesce(auth.jwt() ->> 'wallet_address', '')))
  );

DROP POLICY IF EXISTS crypto_payments_service ON public.crypto_payments;
CREATE POLICY crypto_payments_service ON public.crypto_payments
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Server-side helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_active_entitlement(
  p_subject_type text,
  p_subject_id text,
  p_grant_type text,
  p_grant_id text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.entitlements e
    WHERE e.subject_type = p_subject_type
      AND e.subject_id = p_subject_id
      AND e.grant_type = p_grant_type
      AND e.grant_id = p_grant_id
      AND (e.expires_at IS NULL OR e.expires_at > now())
  );
$$;

REVOKE ALL ON FUNCTION public.has_active_entitlement(text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_active_entitlement(text, text, text, text) TO authenticated, service_role;

-- Equip gear onto an agent loadout (validates entitlement server-side)
CREATE OR REPLACE FUNCTION public.equip_gear(
  p_agent_instance_id text,
  p_agent_title_id text,
  p_slot text,
  p_gear_id text,
  p_subject_type text DEFAULT 'account',
  p_subject_id text DEFAULT NULL
)
RETURNS public.agent_loadouts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := public.current_app_user_id();
  v_subject_id text := COALESCE(p_subject_id, v_user_id::text);
  v_row public.agent_loadouts;
  v_allowed boolean;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF p_slot NOT IN ('primary', 'secondary', 'tools', 'knowledge') THEN
    RAISE EXCEPTION 'invalid slot %', p_slot;
  END IF;

  -- Default gear always allowed; otherwise require entitlement (gear or kit/sku)
  v_allowed := public.has_active_entitlement(p_subject_type, v_subject_id, 'gear', p_gear_id)
            OR public.has_active_entitlement(p_subject_type, v_subject_id, 'kit', p_gear_id)
            OR public.has_active_entitlement(p_subject_type, v_subject_id, 'sku', p_gear_id)
            OR public.has_active_entitlement(p_subject_type, v_subject_id, 'default', p_gear_id);

  -- Free baseline titles: allow common starter ids without purchase
  IF NOT v_allowed AND p_gear_id IN (
    'task-stamp', 'yellow-pad', 'case-file', 'desk-calendar', 'rolodex',
    'law-reporter', 'sticky-tabs', 'reading-glasses', 'fountain-pen',
    'speakerphone', 'envelope', 'circuit-binder', 'ledger-viewer', 'wallet-checklist', 'lockbox'
  ) THEN
    v_allowed := true;
  END IF;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'no entitlement for gear %', p_gear_id
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.agent_loadouts AS al (
    agent_instance_id, agent_title_id, user_id, primary_gear_id, secondary_gear, tools_gear, knowledge_gear
  ) VALUES (
    p_agent_instance_id, p_agent_title_id, v_user_id,
    CASE WHEN p_slot = 'primary' THEN p_gear_id ELSE NULL END,
    CASE WHEN p_slot = 'secondary' THEN ARRAY[p_gear_id] ELSE '{}'::text[] END,
    CASE WHEN p_slot = 'tools' THEN ARRAY[p_gear_id] ELSE '{}'::text[] END,
    CASE WHEN p_slot = 'knowledge' THEN ARRAY[p_gear_id] ELSE '{}'::text[] END
  )
  ON CONFLICT (agent_instance_id) DO UPDATE SET
    agent_title_id = EXCLUDED.agent_title_id,
    user_id = v_user_id,
    primary_gear_id = CASE
      WHEN p_slot = 'primary' THEN p_gear_id
      ELSE al.primary_gear_id
    END,
    secondary_gear = CASE
      WHEN p_slot = 'secondary' THEN
        (SELECT ARRAY(
          SELECT DISTINCT g FROM unnest(al.secondary_gear || ARRAY[p_gear_id]) AS g
        ))
      ELSE al.secondary_gear
    END,
    tools_gear = CASE
      WHEN p_slot = 'tools' THEN
        (SELECT ARRAY(SELECT DISTINCT g FROM unnest(al.tools_gear || ARRAY[p_gear_id]) AS g))
      ELSE al.tools_gear
    END,
    knowledge_gear = CASE
      WHEN p_slot = 'knowledge' THEN
        (SELECT ARRAY(SELECT DISTINCT g FROM unnest(al.knowledge_gear || ARRAY[p_gear_id]) AS g))
      ELSE al.knowledge_gear
    END,
    updated_at = now()
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.equip_gear(text, text, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.equip_gear(text, text, text, text, text, text) TO authenticated, service_role;

-- Grant entitlement after confirmed payment (service role / backend)
CREATE OR REPLACE FUNCTION public.grant_entitlement_from_payment(
  p_payment_id uuid
)
RETURNS public.entitlements
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_pay public.crypto_payments;
  v_ent public.entitlements;
  v_grant_type text;
  v_grant_id text;
BEGIN
  SELECT * INTO v_pay FROM public.crypto_payments WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'payment not found';
  END IF;
  IF v_pay.status <> 'confirmed' THEN
    RAISE EXCEPTION 'payment not confirmed';
  END IF;

  v_grant_type := COALESCE(v_pay.grant_payload ->> 'grant_type', 'sku');
  v_grant_id := COALESCE(v_pay.grant_payload ->> 'grant_id', v_pay.sku_id);

  INSERT INTO public.entitlements (
    subject_type, subject_id, grant_type, grant_id, source, source_ref, quantity, expires_at, metadata
  ) VALUES (
    v_pay.subject_type,
    v_pay.subject_id,
    v_grant_type,
    v_grant_id,
    'purchase',
    v_pay.tx_hash,
    COALESCE((v_pay.grant_payload ->> 'quantity')::numeric, 1),
    CASE
      WHEN (v_pay.grant_payload ->> 'expires_at') IS NOT NULL
        THEN (v_pay.grant_payload ->> 'expires_at')::timestamptz
      WHEN (v_pay.grant_payload ->> 'duration_days') IS NOT NULL
        THEN now() + ((v_pay.grant_payload ->> 'duration_days')::int || ' days')::interval
      ELSE NULL
    END,
    jsonb_build_object('payment_id', v_pay.id, 'sku_id', v_pay.sku_id)
  )
  ON CONFLICT DO NOTHING
  RETURNING * INTO v_ent;

  IF v_ent.id IS NULL THEN
    SELECT * INTO v_ent FROM public.entitlements
    WHERE subject_type = v_pay.subject_type
      AND subject_id = v_pay.subject_id
      AND grant_type = v_grant_type
      AND grant_id = v_grant_id
    LIMIT 1;
  END IF;

  RETURN v_ent;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_entitlement_from_payment(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grant_entitlement_from_payment(uuid) TO service_role;
