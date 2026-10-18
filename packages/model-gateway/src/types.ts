/**
 * Model Gateway Abstraction & Types
 * Implements Chain of Command Master Build Instructions §7.
 */

import type { TaskClass, JSONSchema } from '@chain-of-command/agent-sdk';
import type { CitationObject } from '@chain-of-command/legal-library';

export interface ContentPart {
  type: 'text' | 'image' | 'pdf';
  text?: string;
  data?: string;
  mimeType?: string;
}

export interface ModelPolicy {
  allowedProviders?: string[];
  requireStructured?: boolean;
  maxCostUsd?: number;
  maxLatencyMs?: number;
  dataResidency?: 'us' | 'eu' | string;
  allowExternalGrounding?: boolean;
  redactPii?: boolean;
}

export interface ModelRequest {
  taskClass: TaskClass;
  input: {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | ContentPart[];
  }[];
  outputSchema?: JSONSchema;
  maxOutputTokens?: number;
  temperature?: number;
  policy: ModelPolicy;
  requestContext: {
    tenantId: string;
    caseId?: string;
    userId: string;
    agentId: string;
    taskId: string;
    traceId: string;
  };
  untrustedContentBlockIds?: string[];
}

export interface AttemptRecord {
  provider: string;
  model: string;
  success: boolean;
  error?: string;
  latencyMs: number;
}

export interface ModelResponse {
  text?: string;
  structured?: unknown;
  citations?: CitationObject[];
  usage: {
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
    cached: boolean;
  };
  provider: string;
  model: string;
  modelVersion: string;
  finishReason: 'stop' | 'length' | 'tool' | 'safety' | 'error';
  safety?: { blocked: boolean; categories?: string[] };
  latencyMs: number;
  attempts: AttemptRecord[];
}

export interface ModelAdapter {
  readonly provider: string;
  readonly supports: {
    structured: boolean;
    tools: boolean;
    grounding: boolean;
    vision: boolean;
    embeddings: boolean;
  };
  generate(req: ModelRequest): Promise<ModelResponse>;
}
