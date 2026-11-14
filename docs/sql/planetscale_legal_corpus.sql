-- PlanetScale Postgres: legal_corpus for RAG ingest
-- Apply with: psql "$DATABASE_URL" -f docs/sql/planetscale_legal_corpus.sql
-- Requires pgvector extension where available.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.legal_corpus (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction  text NOT NULL,
  source_type   text NOT NULL CHECK (source_type IN ('statute', 'case_law', 'regulation', 'rule')),
  citation      text NOT NULL,
  title         text NOT NULL,
  content       text NOT NULL,
  embedding     vector(1536),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (jurisdiction, citation)
);

CREATE INDEX IF NOT EXISTS legal_corpus_citation_idx ON public.legal_corpus (citation);
CREATE INDEX IF NOT EXISTS legal_corpus_jurisdiction_idx ON public.legal_corpus (jurisdiction);

CREATE TABLE IF NOT EXISTS public.training_records (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt          text NOT NULL,
  completion      text NOT NULL,
  jurisdiction    text,
  label_quality   text NOT NULL DEFAULT 'draft'
                  CHECK (label_quality IN ('draft', 'reviewed', 'approved', 'rejected')),
  source_refs     jsonb DEFAULT '[]'::jsonb,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS training_records_quality_idx
  ON public.training_records (label_quality);
