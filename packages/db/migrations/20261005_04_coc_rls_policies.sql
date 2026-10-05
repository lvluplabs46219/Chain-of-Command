-- RLS policies for Chain of Command (authenticated role).
-- service_role bypasses RLS in Supabase by default.
-- Full policy set applied live; this file is the GitHub mirror of the core + matter-scoped rules.

-- Helpers must exist: current_app_user_id(), is_tenant_member(uuid), can_access_matter(uuid)

-- Tenants
DROP POLICY IF EXISTS tenants_select ON tenants;
CREATE POLICY tenants_select ON tenants FOR SELECT TO authenticated
  USING (public.is_tenant_member(id));
DROP POLICY IF EXISTS tenants_insert ON tenants;
CREATE POLICY tenants_insert ON tenants FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS tenants_update ON tenants;
CREATE POLICY tenants_update ON tenants FOR UPDATE TO authenticated
  USING (public.is_tenant_member(id)) WITH CHECK (public.is_tenant_member(id));

-- Memberships
DROP POLICY IF EXISTS memberships_select ON memberships;
CREATE POLICY memberships_select ON memberships FOR SELECT TO authenticated
  USING (user_id = public.current_app_user_id() OR public.is_tenant_member(tenant_id));

-- Users (self)
DROP POLICY IF EXISTS users_select_self ON users;
CREATE POLICY users_select_self ON users FOR SELECT TO authenticated
  USING (auth_id = auth.uid() OR id = public.current_app_user_id());
DROP POLICY IF EXISTS users_update_self ON users;
CREATE POLICY users_update_self ON users FOR UPDATE TO authenticated
  USING (auth_id = auth.uid()) WITH CHECK (auth_id = auth.uid());

-- Matters
DROP POLICY IF EXISTS matters_select ON matters;
CREATE POLICY matters_select ON matters FOR SELECT TO authenticated
  USING (
    user_id = public.current_app_user_id()
    OR public.can_access_matter(id)
    OR (tenant_id IS NOT NULL AND public.is_tenant_member(tenant_id))
  );
DROP POLICY IF EXISTS matters_insert ON matters;
CREATE POLICY matters_insert ON matters FOR INSERT TO authenticated
  WITH CHECK (user_id = public.current_app_user_id());
DROP POLICY IF EXISTS matters_update ON matters;
CREATE POLICY matters_update ON matters FOR UPDATE TO authenticated
  USING (user_id = public.current_app_user_id() OR public.can_access_matter(id))
  WITH CHECK (user_id = public.current_app_user_id() OR public.can_access_matter(id));
DROP POLICY IF EXISTS matters_delete ON matters;
CREATE POLICY matters_delete ON matters FOR DELETE TO authenticated
  USING (user_id = public.current_app_user_id());

-- Matter-scoped children (pattern)
DROP POLICY IF EXISTS parties_all ON parties;
CREATE POLICY parties_all ON parties FOR ALL TO authenticated
  USING (public.can_access_matter(matter_id)) WITH CHECK (public.can_access_matter(matter_id));

DROP POLICY IF EXISTS charges_all ON charges;
CREATE POLICY charges_all ON charges FOR ALL TO authenticated
  USING (public.can_access_matter(matter_id)) WITH CHECK (public.can_access_matter(matter_id));

DROP POLICY IF EXISTS timeline_events_all ON timeline_events;
CREATE POLICY timeline_events_all ON timeline_events FOR ALL TO authenticated
  USING (public.can_access_matter(matter_id)) WITH CHECK (public.can_access_matter(matter_id));

DROP POLICY IF EXISTS deadlines_all ON deadlines;
CREATE POLICY deadlines_all ON deadlines FOR ALL TO authenticated
  USING (public.can_access_matter(matter_id)) WITH CHECK (public.can_access_matter(matter_id));

DROP POLICY IF EXISTS documents_all ON documents;
CREATE POLICY documents_all ON documents FOR ALL TO authenticated
  USING (public.can_access_matter(matter_id)) WITH CHECK (public.can_access_matter(matter_id));

DROP POLICY IF EXISTS agents_all ON agents;
CREATE POLICY agents_all ON agents FOR ALL TO authenticated
  USING (
    user_id = public.current_app_user_id()
    OR (matter_id IS NOT NULL AND public.can_access_matter(matter_id))
    OR is_system_agent = true
  )
  WITH CHECK (
    user_id = public.current_app_user_id()
    OR (matter_id IS NOT NULL AND public.can_access_matter(matter_id))
  );

-- Shared lookups: read-only for authenticated
DROP POLICY IF EXISTS jurisdictions_select ON jurisdictions;
CREATE POLICY jurisdictions_select ON jurisdictions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS courts_select ON courts;
CREATE POLICY courts_select ON courts FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS statutes_select ON statutes;
CREATE POLICY statutes_select ON statutes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS defenses_select ON defenses;
CREATE POLICY defenses_select ON defenses FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS source_registry_select ON source_registry;
CREATE POLICY source_registry_select ON source_registry FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS model_registry_select ON model_registry;
CREATE POLICY model_registry_select ON model_registry FOR SELECT TO authenticated USING (true);

-- External actions: human-gated, matter-scoped
DROP POLICY IF EXISTS external_action_requests_all ON external_action_requests;
CREATE POLICY external_action_requests_all ON external_action_requests FOR ALL TO authenticated
  USING (public.can_access_matter(matter_id)) WITH CHECK (public.can_access_matter(matter_id));

-- Audit: select by tenant/case; no update/delete for authenticated (append-only intent)
DROP POLICY IF EXISTS audit_events_select ON audit_events;
CREATE POLICY audit_events_select ON audit_events FOR SELECT TO authenticated
  USING (
    (tenant_id IS NOT NULL AND public.is_tenant_member(tenant_id))
    OR (case_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM cases c WHERE c.id = audit_events.case_id
        AND (c.user_id = public.current_app_user_id()
             OR (c.matter_id IS NOT NULL AND public.can_access_matter(c.matter_id)))
    ))
  );

-- See Supabase dashboard / remaining migration names:
-- coc_rls_policies_agents_docs_legal, coc_rls_policies_lookups_legal_ops
-- for the full 190-policy surface.
