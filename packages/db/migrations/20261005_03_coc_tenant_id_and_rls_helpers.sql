-- Wire tenant_id + RLS helper functions

ALTER TABLE matters
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS matters_tenant_idx ON matters(tenant_id);
CREATE INDEX IF NOT EXISTS cases_tenant_idx ON cases(tenant_id);
CREATE INDEX IF NOT EXISTS matters_user_idx ON matters(user_id);

UPDATE matters m
SET tenant_id = mem.tenant_id
FROM memberships mem
WHERE mem.user_id = m.user_id
  AND mem.status = 'active'
  AND m.tenant_id IS NULL;

UPDATE cases c
SET tenant_id = m.tenant_id
FROM matters m
WHERE c.matter_id = m.id
  AND c.tenant_id IS NULL;

UPDATE cases c
SET tenant_id = mem.tenant_id
FROM memberships mem
WHERE mem.user_id = c.user_id
  AND mem.status = 'active'
  AND c.tenant_id IS NULL;

CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_member(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.tenant_id = p_tenant_id
      AND m.user_id = public.current_app_user_id()
      AND m.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_matter(p_matter_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.matters m
    WHERE m.id = p_matter_id
      AND (
        m.user_id = public.current_app_user_id()
        OR EXISTS (
          SELECT 1 FROM public.case_members cm
          WHERE cm.matter_id = m.id AND cm.user_id = public.current_app_user_id()
        )
        OR (m.tenant_id IS NOT NULL AND public.is_tenant_member(m.tenant_id))
      )
  );
$$;

GRANT EXECUTE ON FUNCTION public.current_app_user_id() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.can_access_matter(uuid) TO authenticated, anon, service_role;
