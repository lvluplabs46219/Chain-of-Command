-- Enforce tenant_id NOT NULL after backfill

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM matters WHERE tenant_id IS NULL) THEN
    RAISE EXCEPTION 'Cannot set matters.tenant_id NOT NULL: null rows remain';
  END IF;
  IF EXISTS (SELECT 1 FROM cases WHERE tenant_id IS NULL) THEN
    RAISE EXCEPTION 'Cannot set cases.tenant_id NOT NULL: null rows remain';
  END IF;
END $$;

ALTER TABLE matters ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE cases ALTER COLUMN tenant_id SET NOT NULL;
