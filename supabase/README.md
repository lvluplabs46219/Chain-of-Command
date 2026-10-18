# Supabase schema workflow

This repository tracks Acquit.ai database changes in `supabase/migrations/`.

The Supabase project previously received direct remote changes. The migration files in this directory are the Git source of truth going forward.

Recommended recovery and verification workflow:

```bash
supabase link --project-ref othxichdhzdxgtatautb
supabase migration list
supabase db pull
```

Review the generated remote baseline before committing it. If the remote migration history and local timestamps diverge, use `supabase migration repair` only to correct migration tracking; it does not execute SQL.

For normal development:

```bash
supabase migration new descriptive_name
supabase db reset
supabase db push
```

Do not make untracked schema changes in the Dashboard or SQL editor once this workflow is established.
