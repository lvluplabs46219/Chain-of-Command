-- Onboarding progress (per-user, RLS-safe)
-- Reset for a user: DELETE FROM public.onboarding_progress WHERE user_id = '<auth-uid>';

create table if not exists public.onboarding_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  completed_steps text[] not null default '{}',
  completed_at timestamptz,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.onboarding_progress enable row level security;

drop policy if exists "own row select" on public.onboarding_progress;
create policy "own row select" on public.onboarding_progress
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "own row insert" on public.onboarding_progress;
create policy "own row insert" on public.onboarding_progress
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "own row update" on public.onboarding_progress;
create policy "own row update" on public.onboarding_progress
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own row delete" on public.onboarding_progress;
create policy "own row delete" on public.onboarding_progress
  for delete to authenticated using (user_id = auth.uid());
