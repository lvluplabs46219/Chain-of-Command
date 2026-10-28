-- Phase 0 security hardening: close SECURITY DEFINER execute grants for anon/PUBLIC
-- Applied to production 2026-10-28 as migration version 20261028203705
-- Functions remain SECURITY DEFINER for correct RLS helper behavior; only grants change.

-- 1. RLS helper functions: revoke from PUBLIC + anon; keep authenticated + service_role
REVOKE EXECUTE ON FUNCTION public.can_access_matter(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_matter(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.current_app_user_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_app_user_id() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_tenant_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.user_owns_matter(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_owns_matter(text) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.user_owns_matter(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_owns_matter(uuid) TO authenticated, service_role;

-- 2. Trigger functions: should never be callable via RPC
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

REVOKE EXECUTE ON FUNCTION public.create_default_agent_permissions() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_default_agent_permissions() TO service_role;
