import {
  pgTable, uuid, text, timestamp, boolean,
  integer, jsonb, index
} from 'drizzle-orm/pg-core';

export const sicAuditEvents = pgTable('sic_audit_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  kind: text('kind').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  sessionId: uuid('session_id').notNull(),
  userId: uuid('user_id').notNull(),
  caseId: uuid('case_id'),
  agentId: uuid('agent_id'),
  agentRunId: uuid('agent_run_id'),

  payload: jsonb('payload').notNull(),
  riskScore: integer('risk_score'),
  riskFlags: text('risk_flags').array(),

  evidentiary: boolean('evidentiary').notNull().default(false),
  immutable: boolean('immutable').notNull().default(true),
  signature: text('signature'),

  // SIC platform sync status
  sicIngested: boolean('sic_ingested').notNull().default(false),
  sicIngestedAt: timestamp('sic_ingested_at', { withTimezone: true }),
  sicEventId: text('sic_event_id'),
}, (t) => ({
  kindIdx: index('sic_audit_kind_idx').on(t.kind),
  userIdx: index('sic_audit_user_idx').on(t.userId),
  caseIdx: index('sic_audit_case_idx').on(t.caseId),
  agentRunIdx: index('sic_audit_agent_run_idx').on(t.agentRunId),
  evidentiaryIdx: index('sic_audit_evidentiary_idx').on(t.evidentiary),
}));

export const documentCustodyChain = pgTable('document_custody_chain', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').notNull(),
  caseId: uuid('case_id').notNull(),
  userId: uuid('user_id').notNull(),
  agentId: uuid('agent_id'),

  action: text('action').notNull(),  // uploaded | accessed | extracted | analyzed | exported
  documentHash: text('document_hash').notNull(),  // SHA-256
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  notes: text('notes'),

  // Immutable — no update or delete RLS policy
  immutable: boolean('immutable').notNull().default(true),
  signature: text('signature'),
}, (t) => ({
  documentIdx: index('custody_document_idx').on(t.documentId),
  caseIdx: index('custody_case_idx').on(t.caseId),
}));
