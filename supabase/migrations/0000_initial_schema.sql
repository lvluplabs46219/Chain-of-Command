-- Acquit.ai Phase 0 & Phase 1 Initial Schema
-- This schema establishes the foundational entities for the Legal OS.

-- Enable pgvector for document embeddings (Phase 3+ prep)
CREATE EXTENSION IF NOT EXISTS vector;

-- Enums
CREATE TYPE matter_status AS ENUM ('open', 'closed', 'on_hold', 'archived');
CREATE TYPE party_role AS ENUM ('defendant', 'plaintiff', 'prosecutor', 'defense_attorney', 'judge', 'witness');
CREATE TYPE document_type AS ENUM ('filing', 'evidence', 'order', 'correspondence', 'transcript');
CREATE TYPE event_type AS ENUM ('hearing', 'filing_deadline', 'discovery_deadline', 'arrest', 'general');

-- 1. Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE NOT NULL, -- Links to Supabase Auth
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Matters (Cases)
CREATE TABLE matters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    jurisdiction TEXT,
    court_name TEXT,
    case_number TEXT,
    status matter_status DEFAULT 'open',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Parties
CREATE TABLE parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role party_role NOT NULL,
    contact_info JSONB, -- Flexible for address/email/phone
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Documents (Workspace)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type document_type NOT NULL,
    file_path TEXT NOT NULL, -- S3/Supabase Storage Path
    ipfs_cid TEXT, -- Sovereign IPFS reference (optional)
    status TEXT DEFAULT 'uploaded', -- uploaded, parsed, summarized
    extracted_text TEXT,
    ai_summary TEXT,
    metadata JSONB, -- For OCR/Unstructured.io outputs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Evidence (Manager)
CREATE TABLE evidence_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    date_acquired TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    relevance_score FLOAT, -- Computed by Evidence Analyst AI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Timeline Events
CREATE TABLE timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type event_type NOT NULL,
    description TEXT,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL, -- Linked filing or evidence
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Deadlines (can overlap with timeline, but specific for actionable items)
CREATE TABLE deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, completed, overdue
    related_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Audit Logs (Security/Audit Layer)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- e.g., 'document_uploaded', 'agent_prompted', 'filing_authorized'
    agent_id TEXT, -- If an AI agent performed this action
    details JSONB NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_matters_user_id ON matters(user_id);
CREATE INDEX idx_documents_matter_id ON documents(matter_id);
CREATE INDEX idx_timeline_events_matter_id ON timeline_events(matter_id);
CREATE INDEX idx_audit_logs_matter_id ON audit_logs(matter_id);
