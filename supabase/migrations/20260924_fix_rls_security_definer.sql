-- Migration: 20260924_fix_rls_security_definer
-- Description: Fix SECURITY DEFINER function to pin search_path and grant execute
-- Priority: P0 - Security fix for RLS policy function

-- Drop the existing function
DROP FUNCTION IF EXISTS user_owns_matter(UUID);

-- Recreate with pinned search_path to prevent hijacking
CREATE OR REPLACE FUNCTION user_owns_matter(check_matter_id UUID)
RETURNS BOOLEAN
SET search_path = pg_catalog, public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM matters
    JOIN users ON users.id = matters.user_id
    WHERE matters.id = check_matter_id
    AND users.auth_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated role only
REVOKE ALL ON FUNCTION user_owns_matter(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION user_owns_matter(UUID) TO authenticated;

-- Comment on the fix
COMMENT ON FUNCTION user_owns_matter(UUID) IS 'Pinned search_path prevents function hijacking. Only authenticated users can execute.';
