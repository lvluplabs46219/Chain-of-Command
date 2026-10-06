-- Chain of Command Schema Migration
-- This migration creates the tables for the immutable chain-of-custody tracking system

-- Enable necessary extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CHAIN EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS chain_events (
  -- Core identifiers
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  chain_id TEXT NOT NULL,
  sequence_number INTEGER NOT NULL,
  
  -- Event metadata
  type TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Actor information
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_name TEXT,
  
  -- Resource information
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  resource_name TEXT,
  
  -- Chain integrity
  hash TEXT NOT NULL,  -- SHA-256 of canonical event representation
  previous_hash TEXT,  -- SHA-256 of previous event (null for genesis)
  
  -- Evidence tracking
  evidence_fingerprint TEXT,  -- SHA-256 of evidence
  evidence_id TEXT,  -- Reference to evidence document
  
  -- Additional context
  case_id TEXT,
  session_id TEXT,
  agent_run_id TEXT,
  
  -- Payload (deterministically serialized)
  payload JSONB NOT NULL DEFAULT '{}',
  
  -- Security
  signature TEXT,  -- HMAC-SHA256 signature for tamper detection
  
  -- Metadata
  immutable BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for chain_events
CREATE INDEX IF NOT EXISTS chain_events_chain_idx ON chain_events(chain_id);
CREATE INDEX IF NOT EXISTS chain_events_sequence_idx ON chain_events(chain_id, sequence_number);
CREATE INDEX IF NOT EXISTS chain_events_resource_idx ON chain_events(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS chain_events_case_idx ON chain_events(case_id);
CREATE INDEX IF NOT EXISTS chain_events_actor_idx ON chain_events(actor_type, actor_id);
CREATE INDEX IF NOT EXISTS chain_events_type_idx ON chain_events(type);
CREATE INDEX IF NOT EXISTS chain_events_timestamp_idx ON chain_events(timestamp);
CREATE INDEX IF NOT EXISTS chain_events_hash_idx ON chain_events(hash);
CREATE INDEX IF NOT EXISTS chain_events_previous_hash_idx ON chain_events(previous_hash);

-- Unique constraint: chain + sequence number must be unique
CREATE UNIQUE INDEX IF NOT EXISTS chain_events_unique_chain_sequence 
  ON chain_events(chain_id, sequence_number);

-- ============================================================================
-- CHAIN METADATA TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS chain_metadata (
  chain_id TEXT PRIMARY KEY,
  
  -- Chain type and context
  chain_type TEXT NOT NULL,  -- 'case', 'resource', 'system', etc.
  name TEXT,
  description TEXT,
  
  -- Genesis event reference
  genesis_event_id UUID,
  genesis_timestamp TIMESTAMPTZ,
  genesis_hash TEXT,
  
  -- Latest event reference
  latest_event_id UUID,
  latest_timestamp TIMESTAMPTZ,
  latest_hash TEXT,
  latest_sequence_number INTEGER,
  
  -- Statistics
  total_events INTEGER NOT NULL DEFAULT 0,
  verified_events INTEGER NOT NULL DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active',  -- 'active', 'archived', 'corrupted'
  verification_status TEXT,  -- 'verified', 'unverified', 'tampered', 'incomplete'
  last_verification_timestamp TIMESTAMPTZ,
  
  -- Security
  signing_secret_hash TEXT,  -- Hash of the signing secret (not the secret itself)
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for chain_metadata
CREATE INDEX IF NOT EXISTS chain_metadata_type_idx ON chain_metadata(chain_type);
CREATE INDEX IF NOT EXISTS chain_metadata_status_idx ON chain_metadata(status);
CREATE INDEX IF NOT EXISTS chain_metadata_verification_status_idx ON chain_metadata(verification_status);
CREATE INDEX IF NOT EXISTS chain_metadata_created_at_idx ON chain_metadata(created_at);

-- ============================================================================
-- CHAIN VERIFICATION LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS chain_verification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  
  -- Verification context
  chain_id TEXT NOT NULL,
  requested_by TEXT NOT NULL,  -- userId or system
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Verification results
  valid BOOLEAN NOT NULL,
  total_events INTEGER NOT NULL,
  verified_events INTEGER NOT NULL,
  
  -- Error counts
  tampered_hashes_count INTEGER NOT NULL DEFAULT 0,
  broken_links_count INTEGER NOT NULL DEFAULT 0,
  sequence_gaps_count INTEGER NOT NULL DEFAULT 0,
  invalid_signatures_count INTEGER NOT NULL DEFAULT 0,
  duplicate_sequences_count INTEGER NOT NULL DEFAULT 0,
  
  -- Error details (stored as JSON for flexibility)
  errors JSONB NOT NULL DEFAULT '[]',
  
  -- Metadata
  duration_ms INTEGER,  -- How long verification took
  notes TEXT
);

-- Indexes for chain_verification_log
CREATE INDEX IF NOT EXISTS chain_verification_log_chain_idx ON chain_verification_log(chain_id);
CREATE INDEX IF NOT EXISTS chain_verification_log_valid_idx ON chain_verification_log(valid);
CREATE INDEX IF NOT EXISTS chain_verification_log_requested_by_idx ON chain_verification_log(requested_by);
CREATE INDEX IF NOT EXISTS chain_verification_log_requested_at_idx ON chain_verification_log(requested_at);

-- ============================================================================
-- CHAIN TRACKING VIEW (for FedEx-style UI)
-- ============================================================================

CREATE OR REPLACE VIEW chain_tracking_view AS
SELECT 
  cm.chain_id,
  ce.resource_id,
  ce.resource_type,
  ce.resource_name,
  ce.case_id,
  -- Case name would come from cases table, but we don't have that here
  '' as case_name,
  
  -- Chain statistics
  cm.total_events,
  cm.verified_events,
  
  -- Status
  cm.status,
  cm.verification_status,
  
  -- Timestamps
  cm.genesis_timestamp,
  cm.latest_timestamp,
  
  -- Latest event info
  cm.latest_event_id,
  cm.latest_hash,
  cm.latest_sequence_number
FROM chain_metadata cm
JOIN chain_events ce ON cm.chain_id = ce.chain_id
WHERE ce.sequence_number = 1  -- Genesis event
GROUP BY 
  cm.chain_id, ce.resource_id, ce.resource_type, ce.resource_name, 
  ce.case_id, cm.total_events, cm.verified_events, cm.status, 
  cm.verification_status, cm.genesis_timestamp, cm.latest_timestamp,
  cm.latest_event_id, cm.latest_hash, cm.latest_sequence_number;

-- Index for the view
CREATE INDEX IF NOT EXISTS chain_tracking_view_resource_idx ON chain_tracking_view(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS chain_tracking_view_case_idx ON chain_tracking_view(case_id);
CREATE INDEX IF NOT EXISTS chain_tracking_view_status_idx ON chain_tracking_view(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE chain_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chain_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE chain_verification_log ENABLE ROW LEVEL SECURITY;

-- Chain Events RLS Policies
-- Allow read access to all authenticated users (for audit transparency)
CREATE POLICY "Allow read access to chain events for authenticated users"
  ON chain_events
  FOR SELECT
  USING (true);

-- Allow insert for authenticated users (but only through server-side API)
CREATE POLICY "Allow insert on chain events for authenticated users"
  ON chain_events
  FOR INSERT
  WITH CHECK (true);

-- Deny all updates (events are immutable)
CREATE POLICY "Deny updates on chain events"
  ON chain_events
  FOR UPDATE
  USING (false);

-- Deny all deletes (events are immutable)
CREATE POLICY "Deny deletes on chain events"
  ON chain_events
  FOR DELETE
  USING (false);

-- Chain Metadata RLS Policies
CREATE POLICY "Allow read access to chain metadata for authenticated users"
  ON chain_metadata
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert on chain metadata for authenticated users"
  ON chain_metadata
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update on chain metadata for authenticated users"
  ON chain_metadata
  FOR UPDATE
  USING (true);

CREATE POLICY "Deny deletes on chain metadata"
  ON chain_metadata
  FOR DELETE
  USING (false);

-- Chain Verification Log RLS Policies
CREATE POLICY "Allow read access to chain verification log for authenticated users"
  ON chain_verification_log
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert on chain verification log for authenticated users"
  ON chain_verification_log
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Deny updates on chain verification log"
  ON chain_verification_log
  FOR UPDATE
  USING (false);

CREATE POLICY "Deny deletes on chain verification log"
  ON chain_verification_log
  FOR DELETE
  USING (false);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update the updated_at timestamp on chain_metadata
CREATE OR REPLACE FUNCTION update_chain_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chain_metadata_updated_at_trigger
  BEFORE UPDATE ON chain_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_chain_metadata_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE chain_events IS 'Stores all chain of command events with cryptographic hashes and previous-hash linking for immutable audit trails';
COMMENT ON TABLE chain_metadata IS 'Stores metadata about each chain (case chain, resource chain, etc.)';
COMMENT ON TABLE chain_verification_log IS 'Stores results of chain verification operations for audit purposes';
COMMENT ON VIEW chain_tracking_view IS 'View for efficient tracking UI queries (FedEx-style)';

COMMENT ON COLUMN chain_events.hash IS 'SHA-256 hash of the canonical event representation';
COMMENT ON COLUMN chain_events.previous_hash IS 'SHA-256 hash of the previous event (null for genesis event)';
COMMENT ON COLUMN chain_events.signature IS 'HMAC-SHA256 signature for tamper detection';
COMMENT ON COLUMN chain_events.immutable IS 'Flag indicating the event cannot be modified (always true)';
