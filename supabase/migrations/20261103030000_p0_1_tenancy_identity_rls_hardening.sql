-- Applied to project othxichdhzdxgtatautb via supabase___apply_migration
-- name: p0_1_tenancy_identity_rls_hardening
-- See docs/SECURITY_REVIEW_P0_1.md

-- Role constraints
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'memberships_org_role_check') THEN
    ALTER TABLE public.memberships
      ADD CONSTRAINT memberships_org_role_check
      CHECK (org_role IN ('owner','admin','staff','member','viewer'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'memberships_status_check') THEN
    ALTER TABLE public.memberships
      ADD CONSTRAINT memberships_status_check
      CHECK (status IN ('active','invited','suspended','removed'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'case_members_role_check') THEN
    ALTER TABLE public.case_members
      ADD CONSTRAINT case_members_role_check
      CHECK (role IN ('owner','collaborator','viewer'));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT id FROM public.users WHERE auth_id = (SELECT auth.uid()) LIMIT 1; $$;

CREATE OR REPLACE FUNCTION public.is_tenant_member(p_tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.memberships m
  WHERE m.tenant_id = p_tenant_id AND m.user_id = public.current_app_user_id() AND m.status = 'active'
); $$;

CREATE OR REPLACE FUNCTION public.tenant_role(p_tenant_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT m.org_role FROM public.memberships m
  WHERE m.tenant_id = p_tenant_id AND m.user_id = public.current_app_user_id() AND m.status = 'active' LIMIT 1; $$;

CREATE OR REPLACE FUNCTION public.has_tenant_role(p_tenant_id uuid, p_min_role text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT COALESCE((
    CASE public.tenant_role(p_tenant_id)
      WHEN 'owner' THEN 5 WHEN 'admin' THEN 4 WHEN 'staff' THEN 3 WHEN 'member' THEN 2 WHEN 'viewer' THEN 1 ELSE 0 END
  ) >= (
    CASE p_min_role
      WHEN 'owner' THEN 5 WHEN 'admin' THEN 4 WHEN 'staff' THEN 3 WHEN 'member' THEN 2 WHEN 'viewer' THEN 1 ELSE 99 END
  ), false);
$$;

CREATE OR REPLACE FUNCTION public.case_role(p_matter_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT cm.role FROM public.case_members cm
  WHERE cm.matter_id = p_matter_id AND cm.user_id = public.current_app_user_id() LIMIT 1; $$;

CREATE OR REPLACE FUNCTION public.has_case_role(p_matter_id uuid, p_min_role text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT COALESCE((
    CASE public.case_role(p_matter_id)
      WHEN 'owner' THEN 3 WHEN 'collaborator' THEN 2 WHEN 'viewer' THEN 1 ELSE 0 END
  ) >= (
    CASE p_min_role WHEN 'owner' THEN 3 WHEN 'collaborator' THEN 2 WHEN 'viewer' THEN 1 ELSE 99 END
  ), false)
  OR EXISTS (SELECT 1 FROM public.matters m WHERE m.id = p_matter_id AND m.user_id = public.current_app_user_id());
$$;

CREATE OR REPLACE FUNCTION public.can_access_matter(p_matter_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.matters m WHERE m.id = p_matter_id AND (
      m.user_id = public.current_app_user_id()
      OR EXISTS (SELECT 1 FROM public.case_members cm WHERE cm.matter_id = m.id AND cm.user_id = public.current_app_user_id())
      OR (m.tenant_id IS NOT NULL AND public.is_tenant_member(m.tenant_id))
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.mfa_aal_is_aal2()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public', 'auth'
AS $$ SELECT COALESCE((SELECT auth.jwt() ->> 'aal') = 'aal2', false); $$;

REVOKE ALL ON FUNCTION public.current_app_user_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_tenant_member(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_access_matter(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.user_owns_matter(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.user_owns_matter(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.tenant_role(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_tenant_role(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.case_role(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_case_role(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mfa_aal_is_aal2() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.current_app_user_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_access_matter(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.user_owns_matter(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.user_owns_matter(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.tenant_role(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_tenant_role(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.case_role(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_case_role(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mfa_aal_is_aal2() TO authenticated, service_role;

DROP POLICY IF EXISTS case_members_all ON public.case_members;
CREATE POLICY case_members_select ON public.case_members FOR SELECT TO authenticated
  USING (can_access_matter(matter_id) OR user_id = current_app_user_id());
CREATE POLICY case_members_insert ON public.case_members FOR INSERT TO authenticated
  WITH CHECK (has_case_role(matter_id, 'owner') OR has_tenant_role((SELECT tenant_id FROM public.matters WHERE id = matter_id), 'admin'));
CREATE POLICY case_members_update ON public.case_members FOR UPDATE TO authenticated
  USING (has_case_role(matter_id, 'owner') OR has_tenant_role((SELECT tenant_id FROM public.matters WHERE id = matter_id), 'admin'))
  WITH CHECK (has_case_role(matter_id, 'owner') OR has_tenant_role((SELECT tenant_id FROM public.matters WHERE id = matter_id), 'admin'));
CREATE POLICY case_members_delete ON public.case_members FOR DELETE TO authenticated
  USING (has_case_role(matter_id, 'owner') OR has_tenant_role((SELECT tenant_id FROM public.matters WHERE id = matter_id), 'admin'));

DROP POLICY IF EXISTS tenants_update ON public.tenants;
CREATE POLICY tenants_update ON public.tenants FOR UPDATE TO authenticated
  USING (has_tenant_role(id, 'admin')) WITH CHECK (has_tenant_role(id, 'admin'));

DROP POLICY IF EXISTS memberships_update ON public.memberships;
CREATE POLICY memberships_update ON public.memberships FOR UPDATE TO authenticated
  USING (has_tenant_role(tenant_id, 'admin')) WITH CHECK (has_tenant_role(tenant_id, 'admin'));

DROP POLICY IF EXISTS memberships_insert ON public.memberships;
CREATE POLICY memberships_insert ON public.memberships FOR INSERT TO authenticated
  WITH CHECK (has_tenant_role(tenant_id, 'admin') OR user_id = current_app_user_id());

DROP POLICY IF EXISTS ingestion_watermarks_deny_all ON public.ingestion_watermarks;
CREATE POLICY ingestion_watermarks_deny_all ON public.ingestion_watermarks
  FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS service_accounts_tenant ON public.service_accounts;
CREATE POLICY service_accounts_select ON public.service_accounts FOR SELECT TO authenticated
  USING (has_tenant_role(tenant_id, 'admin'));
CREATE POLICY service_accounts_mutate ON public.service_accounts FOR ALL TO authenticated
  USING (has_tenant_role(tenant_id, 'admin')) WITH CHECK (has_tenant_role(tenant_id, 'admin'));

CREATE UNIQUE INDEX IF NOT EXISTS memberships_tenant_user_uidx ON public.memberships (tenant_id, user_id);
CREATE UNIQUE INDEX IF NOT EXISTS case_members_matter_user_uidx ON public.case_members (matter_id, user_id);
