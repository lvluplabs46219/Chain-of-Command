-- Migration: 0001_rls_policies
-- Description: Implement Row Level Security (RLS) on all user-owned tables to enforce tenant isolation.

-- 1. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Policies for Users
-- Users can only read and update their own user record
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
USING (auth_id = auth.uid());

CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
USING (auth_id = auth.uid());

-- 3. Policies for Matters
-- Matters are restricted to the user they belong to
CREATE POLICY "Users can view own matters" 
ON matters FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = matters.user_id 
    AND users.auth_id = auth.uid()
));

CREATE POLICY "Users can insert own matters" 
ON matters FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = matters.user_id 
    AND users.auth_id = auth.uid()
));

CREATE POLICY "Users can update own matters" 
ON matters FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = matters.user_id 
    AND users.auth_id = auth.uid()
));

CREATE POLICY "Users can delete own matters" 
ON matters FOR DELETE 
USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = matters.user_id 
    AND users.auth_id = auth.uid()
));

-- 4. Policies for Parties, Documents, Evidence, Timeline, Deadlines
-- Since these all link back to 'matters', we check the matter's ownership
-- Helper function to simplify policies
CREATE OR REPLACE FUNCTION user_owns_matter(check_matter_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
      SELECT 1 FROM matters
      JOIN users ON users.id = matters.user_id
      WHERE matters.id = check_matter_id
      AND users.auth_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Parties
CREATE POLICY "Users can access own parties" ON parties FOR ALL
USING (user_owns_matter(matter_id))
WITH CHECK (user_owns_matter(matter_id));

-- Documents
CREATE POLICY "Users can access own documents" ON documents FOR ALL
USING (user_owns_matter(matter_id))
WITH CHECK (user_owns_matter(matter_id));

-- Evidence Items
CREATE POLICY "Users can access own evidence" ON evidence_items FOR ALL
USING (user_owns_matter(matter_id))
WITH CHECK (user_owns_matter(matter_id));

-- Timeline Events
CREATE POLICY "Users can access own timeline events" ON timeline_events FOR ALL
USING (user_owns_matter(matter_id))
WITH CHECK (user_owns_matter(matter_id));

-- Deadlines
CREATE POLICY "Users can access own deadlines" ON deadlines FOR ALL
USING (user_owns_matter(matter_id))
WITH CHECK (user_owns_matter(matter_id));

-- 5. Policies for Audit Logs
-- Audit logs should be read-only for users
CREATE POLICY "Users can view own audit logs" 
ON audit_logs FOR SELECT 
USING (
    (user_id IS NOT NULL AND EXISTS (SELECT 1 FROM users WHERE users.id = audit_logs.user_id AND users.auth_id = auth.uid()))
    OR 
    (matter_id IS NOT NULL AND user_owns_matter(matter_id))
);

-- Service Role policies (Bypasses RLS by default, but explicit for clarity)
-- Supabase handles service_role bypassing RLS automatically.
