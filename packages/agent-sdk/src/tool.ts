/**
 * Tool descriptor contract (§9.2 Master Implementation Prompt v2.0)
 */

import type { HumanApproval } from '@chain-of-command/audit';

export type ToolKind = 'read' | 'compute' | 'write' | 'external_action';

export interface ToolContext {
  tenantId: string;
  caseId?: string;
  userId: string;
  agentId: string;
  /** Server-resolved only — never client-supplied */
  authorization: {
    roles: string[];
    permissions: string[];
    caseMembership?: string;
  };
  traceId: string;
  auditId: string;
  approval?: HumanApproval;
}

export interface ToolDescriptor<I = unknown, O = unknown> {
  name: string;
  kind: ToolKind;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  requiredPermissions: string[];
  requiresHumanApproval: boolean;
  idempotent: boolean;
  sideEffects: string[];
  costEstimate?: { usd?: number; ms?: number };
  execute(input: I, ctx: ToolContext): Promise<O>;
  compensate?(output: O, ctx: ToolContext): Promise<void>;
}

/** External-action tools MUST have requiresHumanApproval === true */
export function assertExternalActionContract(
  tool: ToolDescriptor
): void {
  if (tool.kind === 'external_action' && !tool.requiresHumanApproval) {
    throw new Error(
      `Tool "${tool.name}" is external_action but requiresHumanApproval is false — forbidden by invariant I-8.`
    );
  }
}
