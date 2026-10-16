/**
 * TaskResult envelope (§24.2 / §5.1).
 * Every structured AI / domain operation returns this shape.
 */

export type OutputLabel =
  | 'Information'
  | 'Analysis'
  | 'Draft'
  | 'User-edited'
  | 'Final';

export type GroundingStatus =
  | 'grounded'
  | 'partially_grounded'
  | 'ungrounded';

export interface CitationRef {
  authorityId: string;
  pinpoint?: string;
  verificationStatus: 'verified' | 'unverified' | 'overruled' | 'context_only';
  quote?: string;
  jurisdictionId?: string;
}

export interface TaskResult<T = unknown> {
  payload: T;
  labeling: OutputLabel;
  citations: CitationRef[];
  grounding: GroundingStatus;
  confidence?: {
    score?: number;
    disclosure: string;
  };
  provenance?: {
    agentId?: string;
    agentRunId?: string;
    modelId?: string;
    modelVersion?: string;
    promptVersion?: string;
  };
  approvalsRequired: string[];
  unverifiedCapabilities: string[];
  disclosures: string[];
  traceId: string;
}

export function emptyResult<T>(
  payload: T,
  labeling: OutputLabel = 'Information',
  traceId = crypto.randomUUID()
): TaskResult<T> {
  return {
    payload,
    labeling,
    citations: [],
    grounding: 'ungrounded',
    approvalsRequired: [],
    unverifiedCapabilities: [],
    disclosures: [],
    traceId,
  };
}
