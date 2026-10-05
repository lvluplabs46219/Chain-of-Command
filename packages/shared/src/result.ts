/**
 * Structured task result envelope (§24.4 Master Implementation Prompt v2.0)
 * Every structured agent operation returns this shape. Chat merely renders it.
 */

import type { CitationObject } from './citations';

export type OutputLabeling = 'Information' | 'Analysis' | 'Draft';

export type GroundingStatus = 'grounded' | 'partial' | 'ungrounded';

export interface TaskResultProvenance {
  agentId: string;
  agentVersion: string;
  model: string;
  modelVersion: string;
  promptId: string;
  promptVersion: string;
  runId: string;
}

export interface TaskResult<T = unknown> {
  taskType: string;
  payload: T;
  labeling: OutputLabeling;
  citations: CitationObject[];
  grounding: {
    status: GroundingStatus;
    note: string;
  };
  confidence?: {
    level: 'low' | 'medium' | 'high';
    basis: string;
  };
  provenance: TaskResultProvenance;
  /** Tools that would need human approval if the user proceeds */
  approvalsRequired?: string[];
  /** Capabilities the system could not verify (honest "Capability not verified") */
  unverifiedCapabilities?: string[];
  /** Versioned notice refs shown with this result */
  disclosures: string[];
  traceId: string;
}

export function createUngroundedResult<T>(
  opts: {
    taskType: string;
    payload: T;
    labeling: OutputLabeling;
    provenance: TaskResultProvenance;
    traceId: string;
    note?: string;
    disclosures?: string[];
  }
): TaskResult<T> {
  return {
    taskType: opts.taskType,
    payload: opts.payload,
    labeling: opts.labeling,
    citations: [],
    grounding: {
      status: 'ungrounded',
      note:
        opts.note ??
        'I could not find authority for this. Do not rely on it as law.',
    },
    provenance: opts.provenance,
    disclosures: opts.disclosures ?? ['ungrounded-result'],
    traceId: opts.traceId,
  };
}
