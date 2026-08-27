import { SICClient } from './client';
import { AgentPermissions, ScopeEscalationEvent, AnomalyReport, Anomaly } from './types';

export class FrawdBotIntegration {
  constructor(private client: SICClient) {}

  /**
   * Called by AgentRuntime BEFORE executing any tool call.
   * If the tool call exceeds agent permissions, block it and report.
   */
  async checkToolCall(opts: {
    agentId: string;
    agentRunId: string;
    userId: string;
    caseId: string;
    toolId: string;
    toolInput: unknown;
    declaredPermissions: AgentPermissions;
  }): Promise<{ allowed: boolean; reason?: string }> {
    const violation = this.detectViolation(
      opts.toolId,
      opts.toolInput,
      opts.declaredPermissions
    );

    if (violation) {
      const escalationEvent: ScopeEscalationEvent = {
        agentId: opts.agentId,
        agentRunId: opts.agentRunId,
        userId: opts.userId,
        caseId: opts.caseId,
        declaredPermissions: opts.declaredPermissions,
        attemptedAction: `tool:${opts.toolId}`,
        toolId: opts.toolId,
        blocked: true,
        timestamp: new Date().toISOString(),
      };

      // Report to FrawdBot immediately
      await this.client.reportScopeEscalation(escalationEvent);

      return {
        allowed: false,
        reason: `Agent "${opts.agentId}" attempted to call tool "${opts.toolId}" without declared permission. Blocked and reported.`,
      };
    }

    return { allowed: true };
  }

  private detectViolation(
    toolId: string,
    _input: unknown,
    permissions: AgentPermissions
  ): boolean {
    const toolPermissionMap: Record<string, keyof AgentPermissions> = {
      document_parser: 'canReadDocuments',
      legal_search: 'canSearchLegalSources',
      court_search: 'canSearchCourtRecords',
      document_generator: 'canGenerateDocuments',
      case_modifier: 'canModifyCaseData',
      external_tool: 'canUseExternalTools',
      court_action: 'canExecuteExternalActions',
    };

    const requiredPerm = toolPermissionMap[toolId];
    if (!requiredPerm) return false; // Unknown tool — handled elsewhere
    return !permissions[requiredPerm];
  }

  /**
   * Anomaly detection: detect unusual patterns across an agent run.
   * e.g. agent reading documents from a case it wasn't assigned to.
   */
  async analyzeRunBehavior(agentRunId: string): Promise<AnomalyReport> {
    return this.client.analyzeAgentRun(agentRunId);
  }
}
