/**
 * Structured Task Result Envelope
 * Implements Chain of Command Master Build Instructions §24.4.
 */

import type { CitationObject } from '@chain-of-command/legal-library';

export interface TaskResult<T> {
  taskType: string;
  payload: T;
  labeling: 'Information' | 'Analysis' | 'Draft';
  citations: CitationObject[];
  grounding: {
    status: 'grounded' | 'partial' | 'ungrounded';
    note: string;
  };
  confidence?: {
    level: 'low' | 'medium' | 'high';
    basis: string;
  };
  provenance: {
    agentId: string;
    agentVersion: string;
    model: string;
    modelVersion: string;
    promptId: string;
    promptVersion: string;
    runId: string;
  };
  approvalsRequired?: string[];      // tools that would need human approval
  unverifiedCapabilities?: string[]; // capabilities the system could not verify
  disclosures: string[];             // versioned notice refs shown with this result
  traceId: string;
}

export function createTaskEnvelope<T>(params: TaskResult<T>): TaskResult<T> {
  return {
    ...params,
    disclosures: [
      "PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE - REQUIRES INDEPENDENT HUMAN REVIEW",
      "This information is provided for educational and procedural purposes only and does not constitute legal advice. No attorney-client relationship is formed. Consult a licensed attorney for case-specific representation.",
      ...(params.disclosures || []),
    ],
  };
}
