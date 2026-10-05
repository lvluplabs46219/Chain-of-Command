-- Prototype seed: State v. Sample (CR2025-012345)
-- Fictional Arizona criminal matter for Acquit.AI / Chain of Command
-- Target: existing public schema on Supabase (matters-centric)
-- Safe to re-run: deletes prior rows with this case_number first

BEGIN;

DELETE FROM charges WHERE matter_id IN (SELECT id FROM matters WHERE case_number = 'CR2025-012345');
DELETE FROM timeline_events WHERE matter_id IN (SELECT id FROM matters WHERE case_number = 'CR2025-012345');
DELETE FROM deadlines WHERE matter_id IN (SELECT id FROM matters WHERE case_number = 'CR2025-012345');
DELETE FROM documents WHERE matter_id IN (SELECT id FROM matters WHERE case_number = 'CR2025-012345');
DELETE FROM parties WHERE matter_id IN (SELECT id FROM matters WHERE case_number = 'CR2025-012345');
DELETE FROM agents WHERE matter_id IN (SELECT id FROM matters WHERE case_number = 'CR2025-012345');
DELETE FROM matters WHERE case_number = 'CR2025-012345';
DELETE FROM cases WHERE case_number = 'CR2025-012345';

INSERT INTO matters (id, user_id, title, jurisdiction, court_name, case_number, status, description)
VALUES (
  'a1000000-0000-4000-8000-000000000001',
  'eca94b54-67d5-4e4b-8ed0-949379bb457b',
  'State v. Sample — Misdemeanor Assault + Aggravated Assault (Wobbler)',
  'US-AZ',
  'Maricopa County Superior Court',
  'CR2025-012345',
  'open',
  'Prototype seed: fictional Arizona criminal matter. Not a real case.'
);

INSERT INTO cases (id, user_id, case_number, jurisdiction_state, county, court_type, title, status, matter_id)
VALUES (
  'a1000000-0000-4000-8000-000000000002',
  'eca94b54-67d5-4e4b-8ed0-949379bb457b',
  'CR2025-012345',
  'AZ',
  'Maricopa',
  'superior',
  'State v. Sample',
  'open',
  'a1000000-0000-4000-8000-000000000001'
) ON CONFLICT (id) DO NOTHING;

-- See ARIZONA_SEED.md for full party/charge/timeline/document/deadline/agent inserts applied live.

COMMIT;
