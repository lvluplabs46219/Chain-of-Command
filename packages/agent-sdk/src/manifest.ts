/**
 * Agent manifest contract (§8.2 Master Implementation Prompt v2.0)
 * An agent is a configured, versioned, permissioned unit — not a persona skin.
 */

/** Minimal JSON Schema object used for structured model outputs. */
export type JSONSchema = Record<string, unknown>;

export type TaskClass =
  | 'reasoning'
  | 'extraction'
  | 'summarization'
  | 'drafting'
  | 'classification'
  | 'embedding'
  | 'cheap_utility';

export type AgentScope = 'system' | 'workspace' | 'case' | 'user';

export type DocumentAccess = 'none' | 'metadata_only' | 'selected' | 'all';

export type OutputKind = 'Information' | 'Analysis' | 'Draft';

export interface AgentManifest {
  id: string;
  key: string;
  name: string;
  version: string;
  purpose: string;
  scope: AgentScope;
  capabilities: string[];
  modelPolicy: {
    preferredTaskClass: TaskClass;
    allowedProviders?: string[];
    maxCostUsdPerRun?: number;
    requireStructured?: boolean;
  };
  contextPolicy: {
    canReadCaseFacts: boolean;
    canReadDocuments: DocumentAccess;
    canReadConversation?: boolean;
    canReadMemory?: boolean;
    canReadExternalSources: boolean;
    documentTagFilter?: string[];
    jurisdictionScope?: 'case' | string[];
  };
  toolPolicy: {
    allowedTools: string[];
    deniedTools?: string[];
    externalActionTools: string[];
  };
  memoryPolicy?: {
    scope: 'turn' | 'case' | 'user';
    writable: boolean;
    maxFacts?: number;
  };
  systemPromptRef: { promptId: string; version: string };
  guardrails: {
    mustCiteLegalClaims: true;
    refuseAdviceFraming: true;
    outputKinds: OutputKind[];
  };
  ui?: {
    icon?: string;
    accentToken?: string;
    shortDescription: string;
  };
}

export interface ManifestValidationError {
  field: string;
  code: string;
  message: string;
}

export function validateAgentManifest(
  manifest: AgentManifest,
  opts: {
    knownTools: Set<string>;
    requesterCanReadDocuments: boolean;
    tenantResidencyProviders?: string[];
  }
): ManifestValidationError[] {
  const errors: ManifestValidationError[] = [];

  if (manifest.guardrails.mustCiteLegalClaims !== true) {
    errors.push({
      field: 'guardrails.mustCiteLegalClaims',
      code: 'GUARDRAIL_IMMUTABLE',
      message: 'Citation requirements cannot be turned off.',
    });
  }
  if (manifest.guardrails.refuseAdviceFraming !== true) {
    errors.push({
      field: 'guardrails.refuseAdviceFraming',
      code: 'GUARDRAIL_IMMUTABLE',
      message: 'Advice-framing refusal cannot be turned off.',
    });
  }

  for (const tool of manifest.toolPolicy.allowedTools) {
    if (!opts.knownTools.has(tool)) {
      errors.push({
        field: 'toolPolicy.allowedTools',
        code: 'UNKNOWN_TOOL',
        message: `Tool "${tool}" is not in the tool registry.`,
      });
    }
  }

  for (const tool of manifest.toolPolicy.externalActionTools) {
    if (!manifest.toolPolicy.allowedTools.includes(tool)) {
      errors.push({
        field: 'toolPolicy.externalActionTools',
        code: 'EXTERNAL_NOT_ALLOWED',
        message: `External-action tool "${tool}" must also be in allowedTools and will always require human approval.`,
      });
    }
  }

  if (
    manifest.contextPolicy.canReadDocuments === 'all' &&
    !opts.requesterCanReadDocuments
  ) {
    errors.push({
      field: 'contextPolicy.canReadDocuments',
      code: 'ESCALATION_DENIED',
      message:
        'This agent cannot be given access to all documents because you do not have that access.',
    });
  }

  if (opts.tenantResidencyProviders && manifest.modelPolicy.allowedProviders) {
    for (const p of manifest.modelPolicy.allowedProviders) {
      if (!opts.tenantResidencyProviders.includes(p)) {
        errors.push({
          field: 'modelPolicy.allowedProviders',
          code: 'RESIDENCY_VIOLATION',
          message: `Provider "${p}" is not permitted under the tenant data-residency policy.`,
        });
      }
    }
  }

  return errors;
}
