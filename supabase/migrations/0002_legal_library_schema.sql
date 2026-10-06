-- Migration: 0002_legal_library_schema
-- Description: Define the global legal library (sources, authorities, legal_chunks) and enforce RLS.

-- 1. Create Legal Library Tables
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type TEXT NOT NULL,
    title TEXT NOT NULL,
    citation TEXT,
    url TEXT UNIQUE,
    publisher TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source_hash TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS authorities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
    authority_type TEXT NOT NULL,
    court_name TEXT,
    docket_number TEXT,
    case_name TEXT,
    reporter_citation TEXT,
    holding TEXT,
    full_text TEXT,
    precedential_status TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS legal_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    authority_id UUID REFERENCES authorities(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_legal_chunks_embedding ON legal_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_sources_url ON sources(url);
CREATE INDEX IF NOT EXISTS idx_authorities_source_id ON authorities(source_id);

-- 3. Row Level Security (RLS) for Legal Library
-- The legal library is a global resource. Authenticated users can read.
-- Only service roles can insert/update (which bypasses RLS by default, but we enforce it).

ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_chunks ENABLE ROW LEVEL SECURITY;

-- Read policies for authenticated users
CREATE POLICY "Authenticated users can read sources" 
ON sources FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can read authorities" 
ON authorities FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can read legal_chunks" 
ON legal_chunks FOR SELECT 
TO authenticated 
USING (true);

-- Explicitly deny write access to normal users (enforced by lack of INSERT/UPDATE/DELETE policies)
-- The ingestion scripts use the service_role key or postgres credentials, which bypass RLS.
