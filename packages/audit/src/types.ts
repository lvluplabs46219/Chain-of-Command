/**
 * Append-only, hash-chained audit event (§16 Master Implementation Prompt v2.0)
 */

export type ActorType = 'user' | 'agent' | 'system' | 'connector' | 'service';

export type AuditResult = 'success' | 'failure' | 'denied' | 'approval_required';

export interface AuditEvent {
  id: string;
  at: string;
  tenantId: string;
  caseId?: string;
  actor: { type: ActorType; id: string };
  action: string;
  target?: { type: string; id: string };
  agentId?: string;
  model?: string;
  modelVersion?: string;
  promptId?: string;
  promptVersion?: string;
  runId?: string;
  traceId: string;
  parentAuditId?: string;
  contextManifestRef?: string;
  toolCalls?: Array<{ name: string; status: string; approvalId?: string }>;
  retrievedAuthorityIds?: string[];
  citationsProduced?: string[];
  outputRef?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    costUsd?: number;
    latencyMs?: number;
  };
  approval?: {
    id: string;
    grantedBy: string;
    at: string;
    method: string;
  };
  result: AuditResult;
  errorCode?: string;
  /** Hash of previous event in the tenant chain */
  prevHash: string;
  /** Hash of this event body + prevHash */
  hash: string;
}

export interface HumanApproval {
  id: string;
  action: string;
  scope: 'one_time';
  target: { type: string; ref: string; description: string };
  payloadHash: string;
  approvedBy: string;
  approvedAt: string;
  expiresAt: string;
  method: 'explicit_ui_confirm';
  mfaSatisfied: boolean;
  caseId: string;
}
