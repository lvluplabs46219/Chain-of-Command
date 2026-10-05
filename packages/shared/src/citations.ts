/**
 * Citation object — the atom of trust (§12.6 Master Implementation Prompt v2.0)
 * Every legal claim must map to a resolvable CitationObject with verification status.
 */

export type SourceType =
  | 'case_law'
  | 'statute'
  | 'regulation'
  | 'rule'
  | 'form'
  | 'opinion'
  | 'motion'
  | 'secondary'
  | 'court_resource';

export type VerificationStatus = 'verified' | 'unverified' | 'superseded' | 'overruled';

export type CredibilityTier = 1 | 2 | 3 | 4;

export interface CitationObject {
  id: string;
  authorityId: string;
  authorityVersionId?: string;
  sourceType: SourceType;
  jurisdictionId: string;
  courtId?: string;
  /** Canonical reporter/statute citation, e.g. "A.R.S. § 13-1203" */
  citation: string;
  title?: string;
  /** Section/paragraph/page preserved from chunk ancestry */
  pinpoint?: string;
  /** Exact text if quoted; must be verbatim from the stored chunk */
  quote?: string;
  officialUrl?: string;
  retrievedAt: string;
  verificationStatus: VerificationStatus;
  credibilityTier: CredibilityTier;
  modelUsedForEmbedding?: string;
  score?: {
    lexical?: number;
    vector?: number;
    rerank?: number;
    fused: number;
  };
}

/** Only Tier 1/2 may ground a legal claim; Tier 2 must be labeled secondary. */
export function mayGroundLegalClaim(tier: CredibilityTier): boolean {
  return tier === 1 || tier === 2;
}

export function isSettledAuthority(status: VerificationStatus): boolean {
  return status === 'verified';
}
