/**
 * Audit event types for Chain of Command.
 * Append-only, hash-chained, tenant-scoped.
 */

export type AuditActorType = 'user' | 'agent' | 'system' | 'service';

export type AuditAction =
  | 'auth.login'
  | 'auth.logout'
  | 'auth.mfa'
  | 'auth.session_revoke'
  | 'case.create'
  | 'case.update'
  | 'case.read'
  | 'document.upload'
  | 'document.read'
  | 'document.analyze'
  | 'agent.run'
  | 'agent.config'
  | 'tool.invoke'
  | 'external_action.request'
  | 'external_action.approve'
  | 'external_action.deny'
  | 'approval.grant'
  | 'approval.revoke'
  | 'admin.config'
  | 'data.export'
  | 'data.delete'
  | 'security.denied'
  | 'security.injection_flagged'
  // Source verification protocol (docs/SOURCE_VERIFICATION_PROTOCOL.md)
  | 'verification.ingest_accepted'
  | 'verification.ingest_quarantined'
  | 'verification.source_checked'
  | 'verification.approved'
  | 'verification.rejected'
  | 'verification.claim_unverified'
  | 'verification.challenge';

export interface AuditEvent {
  id: string;
  tenantId: string;
  at: string; // ISO timestamptz
  actorType: AuditActorType;
  actorId: string;
  action: AuditAction | string;
  targetType?: string;
  targetId?: string;
  caseId?: string;
  // AI-specific
  agentId?: string;
  agentRunId?: string;
  modelId?: string;
  modelVersion?: string;
  promptVersion?: string;
  // Tracing
  traceId?: string;
  // Result
  result: 'success' | 'failure' | 'denied' | 'partial';
  errorCode?: string;
  // Integrity
  prevHash: string;
  hash: string;
  // Optional payload refs (never full case content)
  metadata?: Record<string, unknown>;
}

export interface AuditWriteInput {
  tenantId: string;
  actorType: AuditActorType;
  actorId: string;
  action: AuditAction | string;
  targetType?: string;
  targetId?: string;
  caseId?: string;
  agentId?: string;
  agentRunId?: string;
  modelId?: string;
  modelVersion?: string;
  promptVersion?: string;
  traceId?: string;
  result: AuditEvent['result'];
  errorCode?: string;
  metadata?: Record<string, unknown>;
}


/** Explicit human approval bound to a concrete external action + payload. */
export interface HumanApproval {
  id: string;
  approvedBy: string;
  approvedAt: string; // ISO timestamptz
  actionName: string;
  payloadHash: string;
  expiresAt?: string;
  note?: string;
}
