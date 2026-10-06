-- Migration: sic_audit_events and document_custody_chain

CREATE TABLE sic_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kind TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    session_id UUID NOT NULL,
    user_id UUID NOT NULL,
    case_id UUID,
    agent_id UUID,
    agent_run_id UUID,
    payload JSONB NOT NULL,
    risk_score INTEGER,
    risk_flags TEXT[],
    evidentiary BOOLEAN NOT NULL DEFAULT false,
    immutable BOOLEAN NOT NULL DEFAULT true,
    signature TEXT,
    sic_ingested BOOLEAN NOT NULL DEFAULT false,
    sic_ingested_at TIMESTAMPTZ,
    sic_event_id TEXT
);

CREATE INDEX sic_audit_kind_idx ON sic_audit_events(kind);
CREATE INDEX sic_audit_user_idx ON sic_audit_events(user_id);
CREATE INDEX sic_audit_case_idx ON sic_audit_events(case_id);
CREATE INDEX sic_audit_agent_run_idx ON sic_audit_events(agent_run_id);
CREATE INDEX sic_audit_evidentiary_idx ON sic_audit_events(evidentiary);

ALTER TABLE sic_audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Audit events are append-only" ON sic_audit_events FOR DELETE USING (false);
CREATE POLICY "Users read own case audit events" ON sic_audit_events FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE document_custody_chain (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    case_id UUID NOT NULL,
    user_id UUID NOT NULL,
    agent_id UUID,
    action TEXT NOT NULL,
    document_hash TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    immutable BOOLEAN NOT NULL DEFAULT true,
    signature TEXT
);

CREATE INDEX custody_document_idx ON document_custody_chain(document_id);
CREATE INDEX custody_case_idx ON document_custody_chain(case_id);

ALTER TABLE document_custody_chain ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Custody chain is append-only" ON document_custody_chain FOR DELETE USING (false);
