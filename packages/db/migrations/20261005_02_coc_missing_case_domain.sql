-- Case domain: statutes, charge elements, defenses, tasks, deadline_rules, case_members

CREATE TABLE IF NOT EXISTS statutes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id uuid REFERENCES jurisdictions(id) ON DELETE SET NULL,
  cite text NOT NULL UNIQUE,
  title text NOT NULL,
  body text,
  effective_date date,
  repealed_date date,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS charge_elements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  charge_id uuid NOT NULL REFERENCES charges(id) ON DELETE CASCADE,
  statute_id uuid REFERENCES statutes(id) ON DELETE SET NULL,
  element_num int NOT NULL,
  body text NOT NULL,
  burden text DEFAULT 'prosecution',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (charge_id, element_num)
);

CREATE TABLE IF NOT EXISTS defenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL
    CHECK (category IN ('factual','legal','procedural','constitutional','mitigation','affirmative','voluntary_act','other')),
  description text,
  applicable_jurisdictions text[] DEFAULT ARRAY[]::text[],
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS charge_defense_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  charge_id uuid NOT NULL REFERENCES charges(id) ON DELETE CASCADE,
  defense_id uuid NOT NULL REFERENCES defenses(id) ON DELETE CASCADE,
  strength text CHECK (strength IN ('strong','moderate','weak','unknown')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (charge_id, defense_id)
);

CREATE TABLE IF NOT EXISTS charge_dispositions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  charge_id uuid NOT NULL REFERENCES charges(id) ON DELETE CASCADE,
  disposition text NOT NULL,
  disposition_date date,
  source_document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deadline_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id uuid REFERENCES jurisdictions(id) ON DELETE SET NULL,
  court_id uuid REFERENCES courts(id) ON DELETE SET NULL,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  trigger_event text NOT NULL,
  days_offset int NOT NULL,
  business_days_only boolean NOT NULL DEFAULT false,
  authority_cite text,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id uuid NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','in_progress','blocked','done','cancelled')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  due_at timestamptz,
  assignee_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  assignee_agent_id uuid REFERENCES agents(id) ON DELETE SET NULL,
  related_deadline_id uuid REFERENCES deadlines(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS task_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  linked_type text NOT NULL,
  linked_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timeline_event_id uuid NOT NULL REFERENCES timeline_events(id) ON DELETE CASCADE,
  source_kind text NOT NULL CHECK (source_kind IN ('document','citation','user','agent','connector','other')),
  document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  citation_ref text,
  excerpt text,
  confidence numeric(4,3),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS case_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id uuid NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'collaborator'
    CHECK (role IN ('owner','attorney','collaborator','viewer','client')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (matter_id, user_id)
);

CREATE TABLE IF NOT EXISTS case_settings (
  matter_id uuid PRIMARY KEY REFERENCES matters(id) ON DELETE CASCADE,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE statutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE charge_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE defenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE charge_defense_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE charge_dispositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadline_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_settings ENABLE ROW LEVEL SECURITY;
