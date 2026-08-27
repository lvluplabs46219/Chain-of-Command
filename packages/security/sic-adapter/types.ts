export type AcquitEventKind =
  | 'agent.started'
  | 'agent.tool_call'
  | 'agent.tool_result'
  | 'agent.model_request'
  | 'agent.model_response'
  | 'agent.permission_check'
  | 'agent.permission_denied'
  | 'agent.scope_escalation_attempt'
  | 'agent.external_action_attempted'
  | 'agent.external_action_authorized'
  | 'agent.external_action_blocked'
  | 'document.uploaded'
  | 'document.accessed'
  | 'document.extracted'
  | 'document.injection_detected'
  | 'case.accessed'
  | 'case.modified'
  | 'user.session_started'
  | 'user.session_anomaly'
  | 'rag.retrieval'
  | 'rag.citation_verified'
  | 'rag.citation_unverifiable'
  | 'deadline.calculated'
  | 'court.action_attempted'
  | 'court.action_authorized'
  | 'court.action_blocked';

export interface AcquitAuditEvent {
  id: string;                    // uuid v7
  kind: AcquitEventKind;
  timestamp: string;             // ISO 8601
  sessionId: string;
  userId: string;
  caseId?: string;
  agentId?: string;
  agentRunId?: string;

  payload: Record<string, unknown>;

  // Risk signals
  riskScore?: number;            // 0-100, populated by FrawdBot
  riskFlags?: string[];

  // Compliance
  evidentiary: boolean;          // must be retained for litigation
  immutable: boolean;            // cannot be deleted
  signature?: string;            // HMAC of payload for tamper detection
}

export interface ScopeEscalationEvent {
  agentId: string;
  agentRunId: string;
  userId: string;
  caseId: string;
  declaredPermissions: AgentPermissions;
  attemptedAction: string;
  toolId: string;
  blocked: boolean;
  timestamp: string;
}

// Temporary stub for AgentPermissions until SDK is integrated
export interface AgentPermissions {
  canReadDocuments?: boolean;
  canSearchLegalSources?: boolean;
  canSearchCourtRecords?: boolean;
  canGenerateDocuments?: boolean;
  canModifyCaseData?: boolean;
  canUseExternalTools?: boolean;
  canExecuteExternalActions?: boolean;
}

export interface AnomalyReport {
  agentRunId: string;
  anomalies: Anomaly[];
  riskScore: number;
  recommendation: 'clear' | 'review' | 'escalate' | 'block';
}

export interface Anomaly {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: Record<string, unknown>;
}

export interface CustodyRecord {
  id: string;
  documentId: string;
  action: string;
  timestamp: string;
  hash: string;
  userId: string;
  agentId?: string;
  immutable: true;
}

export interface AuditExport {
  caseId: string;
  generatedAt: string;
  events: unknown[];
  documentUrl: string;
  signature: string;
}

export interface CitationStatus {
  citation: string;
  status: 'verified' | 'unverifiable' | 'fabricated';
  sourceId?: string;
}

export interface CitationChainReport {
  agentRunId: string;
  verified: number;
  unverifiable: number;
  fabricated: number;  // citations that appear in output but not in retrieved sources
  details: CitationStatus[];
}
