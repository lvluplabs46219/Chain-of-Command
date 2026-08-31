/**
 * Chain of Command - Supabase Database Schema
 * 
 * This schema defines the database tables for storing the immutable chain of command events.
 * The chain provides cryptographic verification of all actions, ensuring tamper-proof
 * audit trails for evidence, documents, and system actions.
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';

// ============================================================================
// MAIN CHAIN EVENTS TABLE
// ============================================================================

/**
 * Chain of Command Events Table
 * 
 * Stores all chain events with cryptographic hashes and previous-hash linking.
 * Each event is immutable once created (no updates allowed).
 */
export const chainEvents = pgTable('chain_events', {
  // Core identifiers
  id: uuid('id').primaryKey().defaultRandom(),
  chainId: text('chain_id').notNull(),  // Identifies which chain this belongs to
  sequenceNumber: integer('sequence_number').notNull(),  // Monotonically increasing
  
  // Event metadata
  type: text('type').notNull(),  // ChainEventType enum
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  
  // Actor information
  actorType: text('actor_type').notNull(),  // ChainActorType enum
  actorId: text('actor_id').notNull(),
  actorName: text('actor_name'),
  
  // Resource information
  resourceType: text('resource_type').notNull(),  // ChainResourceType enum
  resourceId: text('resource_id').notNull(),
  resourceName: text('resource_name'),
  
  // Chain integrity
  hash: text('hash').notNull(),  // SHA-256 of canonical event representation
  previousHash: text('previous_hash'),  // SHA-256 of previous event (null for genesis)
  
  // Evidence tracking
  evidenceFingerprint: text('evidence_fingerprint'),  // SHA-256 of evidence
  evidenceId: text('evidence_id'),  // Reference to evidence document
  
  // Additional context
  caseId: text('case_id'),
  sessionId: text('session_id'),
  agentRunId: text('agent_run_id'),
  
  // Payload (deterministically serialized)
  payload: jsonb('payload').notNull().default({}),
  
  // Security
  signature: text('signature'),  // HMAC-SHA256 signature for tamper detection
  
  // Metadata
  immutable: boolean('immutable').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Indexes for efficient querying
  chainIdx: index('chain_events_chain_idx').on(table.chainId),
  sequenceIdx: index('chain_events_sequence_idx').on(table.chainId, table.sequenceNumber),
  resourceIdx: index('chain_events_resource_idx').on(table.resourceType, table.resourceId),
  caseIdx: index('chain_events_case_idx').on(table.caseId),
  actorIdx: index('chain_events_actor_idx').on(table.actorType, table.actorId),
  typeIdx: index('chain_events_type_idx').on(table.type),
  timestampIdx: index('chain_events_timestamp_idx').on(table.timestamp),
  hashIdx: index('chain_events_hash_idx').on(table.hash),
  previousHashIdx: index('chain_events_previous_hash_idx').on(table.previousHash),
  
  // Unique constraint: chain + sequence number must be unique
  uniqueChainSequence: index('chain_events_unique_chain_sequence').on(table.chainId, table.sequenceNumber).unique(),
}));

// ============================================================================
// CHAIN METADATA TABLE
// ============================================================================

/**
 * Chain Metadata Table
 * 
 * Stores metadata about each chain (e.g., case chain, resource chain).
 * This allows for efficient lookup of chains without scanning all events.
 */
export const chainMetadata = pgTable('chain_metadata', {
  chainId: text('chain_id').primaryKey(),
  
  // Chain type and context
  chainType: text('chain_type').notNull(),  // 'case', 'resource', 'system', etc.
  name: text('name'),
  description: text('description'),
  
  // Genesis event reference
  genesisEventId: uuid('genesis_event_id'),
  genesisTimestamp: timestamp('genesis_timestamp', { withTimezone: true }),
  genesisHash: text('genesis_hash'),
  
  // Latest event reference
  latestEventId: uuid('latest_event_id'),
  latestTimestamp: timestamp('latest_timestamp', { withTimezone: true }),
  latestHash: text('latest_hash'),
  latestSequenceNumber: integer('latest_sequence_number'),
  
  // Statistics
  totalEvents: integer('total_events').notNull().default(0),
  verifiedEvents: integer('verified_events').notNull().default(0),
  
  // Status
  status: text('status').notNull().default('active'),  // 'active', 'archived', 'corrupted'
  verificationStatus: text('verification_status'),  // 'verified', 'unverified', 'tampered', 'incomplete'
  lastVerificationTimestamp: timestamp('last_verification_timestamp', { withTimezone: true }),
  
  // Security
  signingSecretHash: text('signing_secret_hash'),  // Hash of the signing secret (not the secret itself)
  
  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  chainTypeIdx: index('chain_metadata_type_idx').on(table.chainType),
  statusIdx: index('chain_metadata_status_idx').on(table.status),
  verificationStatusIdx: index('chain_metadata_verification_status_idx').on(table.verificationStatus),
  createdAtIdx: index('chain_metadata_created_at_idx').on(table.createdAt),
}));

// ============================================================================
// CHAIN VERIFICATION LOG TABLE
// ============================================================================

/**
 * Chain Verification Log Table
 * 
 * Stores results of chain verification operations for audit purposes.
 */
export const chainVerificationLog = pgTable('chain_verification_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Verification context
  chainId: text('chain_id').notNull(),
  requestedBy: text('requested_by').notNull(),  // userId or system
  requestedAt: timestamp('requested_at', { withTimezone: true }).notNull().defaultNow(),
  
  // Verification results
  valid: boolean('valid').notNull(),
  totalEvents: integer('total_events').notNull(),
  verifiedEvents: integer('verified_events').notNull(),
  
  // Error counts
  tamperedHashesCount: integer('tampered_hashes_count').notNull().default(0),
  brokenLinksCount: integer('broken_links_count').notNull().default(0),
  sequenceGapsCount: integer('sequence_gaps_count').notNull().default(0),
  invalidSignaturesCount: integer('invalid_signatures_count').notNull().default(0),
  duplicateSequencesCount: integer('duplicate_sequences_count').notNull().default(0),
  
  // Error details (stored as JSON for flexibility)
  errors: jsonb('errors').notNull().default([]),
  
  // Metadata
  durationMs: integer('duration_ms'),  // How long verification took
  notes: text('notes'),
}, (table) => ({
  chainIdx: index('chain_verification_log_chain_idx').on(table.chainId),
  validIdx: index('chain_verification_log_valid_idx').on(table.valid),
  requestedByIdx: index('chain_verification_log_requested_by_idx').on(table.requestedBy),
  requestedAtIdx: index('chain_verification_log_requested_at_idx').on(table.requestedAt),
}));

// ============================================================================
// CHAIN TRACKING VIEW (for FedEx-style UI)
// ============================================================================

/**
 * This would be created as a PostgreSQL view for efficient tracking UI queries.
 * In Drizzle, we define it as a queryable view.
 * 
 * Note: Views are typically created via raw SQL migrations, but we define
 * the structure here for type safety.
 */
export const chainTrackingView = pgTable('chain_tracking_view', {
  chainId: text('chain_id').primaryKey(),
  resourceId: text('resource_id').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceName: text('resource_name'),
  caseId: text('case_id'),
  caseName: text('case_name'),
  
  // Chain statistics
  totalEvents: integer('total_events').notNull(),
  verifiedEvents: integer('verified_events').notNull(),
  
  // Status
  status: text('status').notNull(),
  verificationStatus: text('verification_status').notNull(),
  
  // Timestamps
  genesisTimestamp: timestamp('genesis_timestamp', { withTimezone: true }),
  latestTimestamp: timestamp('latest_timestamp', { withTimezone: true }),
  
  // Latest event info
  latestEventId: uuid('latest_event_id'),
  latestHash: text('latest_hash'),
  latestSequenceNumber: integer('latest_sequence_number'),
}, (table) => ({
  resourceIdx: index('chain_tracking_view_resource_idx').on(table.resourceType, table.resourceId),
  caseIdx: index('chain_tracking_view_case_idx').on(table.caseId),
  statusIdx: index('chain_tracking_view_status_idx').on(table.status),
}));

// ============================================================================
// RELATIONS
// ============================================================================

// Define relations for type-safe queries
import { relations } from 'drizzle-orm';

export const chainEventsRelations = relations(chainEvents, ({ one, many }) => ({
  // Each event belongs to a chain (metadata)
  chain: one(chainMetadata, {
    fields: [chainEvents.chainId],
    references: [chainMetadata.chainId],
  }),
  
  // Events can have verification logs
  verificationLogs: many(chainVerificationLog),
}));

export const chainMetadataRelations = relations(chainMetadata, ({ many }) => ({
  // A chain has many events
  events: many(chainEvents),
  
  // A chain can have many verification logs
  verificationLogs: many(chainVerificationLog),
}));

export const chainVerificationLogRelations = relations(chainVerificationLog, ({ one }) => ({
  // Each verification log belongs to a chain
  chain: one(chainMetadata, {
    fields: [chainVerificationLog.chainId],
    references: [chainMetadata.chainId],
  }),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ChainEvent = typeof chainEvents.$inferSelect;
export type NewChainEvent = typeof chainEvents.$inferInsert;
export type ChainMetadata = typeof chainMetadata.$inferSelect;
export type NewChainMetadata = typeof chainMetadata.$inferInsert;
export type ChainVerificationLog = typeof chainVerificationLog.$inferSelect;
export type NewChainVerificationLog = typeof chainVerificationLog.$inferInsert;
