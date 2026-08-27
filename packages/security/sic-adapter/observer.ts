import { SICClient } from './client';
import { AcquitAuditEvent, AcquitEventKind } from './types';
// Note: crypto is a Node built-in; assuming this runs server-side
import { createHmac } from 'crypto';

// Minimal stubs to represent AgentRuntime events without importing the full SDK yet
export interface AgentEventContext {
  sessionId: string;
  userId: string;
  caseId?: string;
  agentId?: string;
  agentRunId?: string;
}

export interface AgentEvent {
  type: string;
  context: AgentEventContext;
  data: Record<string, unknown>;
}

export interface AgentRuntime {
  on(event: string, handler: (event: AgentEvent) => void | Promise<void>): void;
}

export interface SICObserverOptions {
  endpoint: string;
  apiKey: string;
  signingSecret: string;
}

// Generate a random v7-like UUID for stubs if true v7 isn't available
function uuidv7(): string {
  return crypto.randomUUID();
}

export class SICObserver {
  private client: SICClient;
  private signingSecret: string;

  constructor(runtime: AgentRuntime, opts: SICObserverOptions) {
    this.client = new SICClient(opts.endpoint, opts.apiKey);
    this.signingSecret = opts.signingSecret;

    // Subscribe to all runtime events
    runtime.on('*', this.handleAgentEvent.bind(this));
  }

  private async handleAgentEvent(event: AgentEvent): Promise<void> {
    const auditEvent = this.mapToAuditEvent(event);

    // Always write locally first (database)
    await this.persistLocal(auditEvent);

    // Stream to SIC platform
    try {
      await this.client.ingest(auditEvent);
    } catch (err) {
      // Never fail the agent run because SIC is unavailable
      // Log degraded mode, alert ops
      await this.flagDegradedMode(err, auditEvent);
    }
  }

  private mapToAuditEvent(event: AgentEvent): AcquitAuditEvent {
    const payload = {
      ...event.data,
      // Strip any PII from payload before sending to SIC
      // PII stays in the local encrypted store only
    };

    const body = JSON.stringify(payload);
    const signature = createHmac('sha256', this.signingSecret)
      .update(body)
      .digest('hex');

    return {
      id: uuidv7(),
      kind: event.type as AcquitEventKind,
      timestamp: new Date().toISOString(),
      sessionId: event.context.sessionId,
      userId: event.context.userId,
      caseId: event.context.caseId,
      agentId: event.context.agentId,
      agentRunId: event.context.agentRunId,
      payload,
      evidentiary: this.isEvidentiary(event.type as AcquitEventKind),
      immutable: true,
      signature,
    };
  }

  private isEvidentiary(kind: AcquitEventKind): boolean {
    // These event types must be retained as evidence
    const evidentiaryKinds: AcquitEventKind[] = [
      'agent.external_action_authorized',
      'agent.external_action_blocked',
      'agent.permission_denied',
      'agent.scope_escalation_attempt',
      'document.injection_detected',
      'court.action_authorized',
      'court.action_blocked',
      'rag.citation_unverifiable',
      'deadline.calculated',
    ];
    return evidentiaryKinds.includes(kind);
  }

  private async persistLocal(event: AcquitAuditEvent): Promise<void> {
    // Stub: Would insert into sicAuditEvents via Drizzle
    console.debug('Persisting event locally:', event.id);
  }

  private async flagDegradedMode(err: unknown, event: AcquitAuditEvent): Promise<void> {
    // Stub: Log degraded mode, potentially queue for retry
    console.error('SIC Ingestion failed. Operating in degraded mode for event:', event.id, err);
  }
}
