-- Acquit.ai remote-state synchronization
-- Captures the agent runtime tables already applied to Supabase project YOUR_PROJECT_REF.
-- This file is intentionally idempotent so a fresh environment can recreate the runtime schema.

begin;

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  role text not null,
  instructions text not null default '',
  provider_config jsonb not null default '{}'::jsonb,
  allowed_tools jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  matter_id uuid references public.matters(id) on delete set null,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  status text not null default 'queued' check (status in ('queued','running','completed','failed','cancelled')),
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  error jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.tool_executions (
  id uuid primary key default gen_random_uuid(),
  agent_run_id uuid not null references public.agent_runs(id) on delete cascade,
  tool_name text not null,
  status text not null default 'queued' check (status in ('queued','running','completed','failed')),
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  error jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.agents enable row level security;
alter table public.conversations enable row level security;
alter table public.agent_runs enable row level security;
alter table public.tool_executions enable row level security;

create policy agents_owner_all on public.agents for all to authenticated
  using (exists (select 1 from public.users u where u.id = agents.user_id and u.auth_id = (select auth.uid())))
  with check (exists (select 1 from public.users u where u.id = agents.user_id and u.auth_id = (select auth.uid())));

create policy conversations_owner_all on public.conversations for all to authenticated
  using (exists (select 1 from public.users u where u.id = conversations.user_id and u.auth_id = (select auth.uid())))
  with check (exists (select 1 from public.users u where u.id = conversations.user_id and u.auth_id = (select auth.uid())));

create policy agent_runs_owner_select on public.agent_runs for select to authenticated
  using (exists (select 1 from public.agents a join public.users u on u.id = a.user_id where a.id = agent_runs.agent_id and u.auth_id = (select auth.uid())));

create policy tool_executions_owner_select on public.tool_executions for select to authenticated
  using (exists (select 1 from public.agent_runs r join public.agents a on a.id = r.agent_id join public.users u on u.id = a.user_id where r.id = tool_executions.agent_run_id and u.auth_id = (select auth.uid())));

create index if not exists idx_agents_user_id on public.agents(user_id);
create index if not exists idx_conversations_user_id on public.conversations(user_id);
create index if not exists idx_conversations_matter_id on public.conversations(matter_id);
create index if not exists idx_agent_runs_agent_id_created_at on public.agent_runs(agent_id, created_at desc);
create index if not exists idx_tool_executions_run_id on public.tool_executions(agent_run_id);

commit;