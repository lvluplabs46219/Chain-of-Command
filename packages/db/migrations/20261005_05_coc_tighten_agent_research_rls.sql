-- Tighten agent_runs / research_queries and related tables
-- Removes permissive USING (true) policies; scopes by owner + can_access_matter()

DROP POLICY IF EXISTS agent_runs_all ON agent_runs;
DROP POLICY IF EXISTS "Users can access their own agent runs" ON agent_runs;
DROP POLICY IF EXISTS agent_runs_owner_all ON agent_runs;
DROP POLICY IF EXISTS agent_runs_owner_insert ON agent_runs;
DROP POLICY IF EXISTS agent_runs_owner_update ON agent_runs;

CREATE POLICY agent_runs_select ON agent_runs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agents a
      WHERE a.id = agent_runs.agent_id
        AND (
          a.user_id = public.current_app_user_id()
          OR (a.matter_id IS NOT NULL AND public.can_access_matter(a.matter_id))
        )
    )
    OR EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = agent_runs.conversation_id
        AND (
          c.user_id = public.current_app_user_id()
          OR (c.matter_id IS NOT NULL AND public.can_access_matter(c.matter_id))
        )
    )
  );

CREATE POLICY agent_runs_insert ON agent_runs FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents a
      WHERE a.id = agent_runs.agent_id
        AND (
          a.user_id = public.current_app_user_id()
          OR (a.matter_id IS NOT NULL AND public.can_access_matter(a.matter_id))
        )
    )
  );

CREATE POLICY agent_runs_update ON agent_runs FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agents a
      WHERE a.id = agent_runs.agent_id
        AND (
          a.user_id = public.current_app_user_id()
          OR (a.matter_id IS NOT NULL AND public.can_access_matter(a.matter_id))
        )
    )
  );

DROP POLICY IF EXISTS research_queries_all ON research_queries;
DROP POLICY IF EXISTS research_queries_select_own ON research_queries;
DROP POLICY IF EXISTS research_queries_insert_own ON research_queries;
DROP POLICY IF EXISTS research_queries_update_own ON research_queries;

CREATE POLICY research_queries_select ON research_queries FOR SELECT TO authenticated
  USING (
    user_id = public.current_app_user_id()
    OR (matter_id IS NOT NULL AND public.can_access_matter(matter_id))
  );
CREATE POLICY research_queries_insert ON research_queries FOR INSERT TO authenticated
  WITH CHECK (
    user_id = public.current_app_user_id()
    AND (matter_id IS NULL OR public.can_access_matter(matter_id))
  );
CREATE POLICY research_queries_update ON research_queries FOR UPDATE TO authenticated
  USING (
    user_id = public.current_app_user_id()
    OR (matter_id IS NOT NULL AND public.can_access_matter(matter_id))
  );
CREATE POLICY research_queries_delete ON research_queries FOR DELETE TO authenticated
  USING (user_id = public.current_app_user_id());

-- Also tightened (same migration on Supabase): agent_run_steps, tool_executions,
-- agent_sessions, agent_task_runs, agent_permissions, research_results,
-- research_syntheses, retrieval_logs, conversations, messages.
