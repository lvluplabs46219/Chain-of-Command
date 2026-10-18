/**
 * Grounding Guard & Anti-Hallucination Verification Layer
 * Implements Chain of Command Master Build Instructions §13.
 * Code path enforcing zero statutory fabrication and preserving source provenance.
 */

import { CitationObject } from './citations';

export interface GroundingCheckRequest {
  text: string;
  proposedCitations: CitationObject[];
  targetJurisdiction: string;
  verifiedCorpus: CitationObject[];
}

export interface GroundingCheckReport {
  grounded: boolean;
  status: 'grounded' | 'partial' | 'ungrounded';
  matchedCitations: CitationObject[];
  unverifiedClaims: string[];
  disclosures: string[];
  mandatoryLabeling: 'Information' | 'Analysis' | 'Draft';
  noticeText: string;
}

/**
 * Evaluates model output for legal citation grounding.
 * Fails safely if unverified or hallucinated claims are detected (§13.2).
 */
export function runGroundingGuard(req: GroundingCheckRequest): GroundingCheckReport {
  const matchedCitations: CitationObject[] = [];
  const unverifiedClaims: string[] = [];
  const disclosures: string[] = [];

  // 1. Resolve citations against verified corpus
  for (const proposed of req.proposedCitations) {
    const verifiedMatch = req.verifiedCorpus.find(
      (c) => c.citation.toLowerCase().trim() === proposed.citation.toLowerCase().trim()
    );

    if (verifiedMatch) {
      if (verifiedMatch.verificationStatus === 'verified') {
        // Check jurisdiction alignment
        if (
          verifiedMatch.jurisdictionId !== 'us-federal' &&
          verifiedMatch.jurisdictionId !== req.targetJurisdiction
        ) {
          disclosures.push(
            `Jurisdiction Distinction: ${verifiedMatch.citation} is from ${verifiedMatch.jurisdictionId}, but your case is in ${req.targetJurisdiction}. Compare principles cautiously.`
          );
        }
        matchedCitations.push(verifiedMatch);
      } else {
        unverifiedClaims.push(
          `Citation ${proposed.citation} is flagged as ${verifiedMatch.verificationStatus}. Cannot be relied on as settled law.`
        );
      }
    } else {
      unverifiedClaims.push(
        `[Authority Not Verified - Consult Local Rules or Counsel]: ${proposed.citation} could not be resolved in the primary legal corpus.`
      );
    }
  }

  // 2. Determine grounding status
  let status: 'grounded' | 'partial' | 'ungrounded' = 'ungrounded';
  if (matchedCitations.length > 0 && unverifiedClaims.length === 0) {
    status = 'grounded';
  } else if (matchedCitations.length > 0 && unverifiedClaims.length > 0) {
    status = 'partial';
  }

  // 3. Set mandatory labeling
  let noticeText = '';
  if (status === 'grounded') {
    noticeText = 'Grounded against verified primary legal authorities. Sources linked below.';
  } else if (status === 'partial') {
    noticeText = 'Partially grounded. Some assertions could not be independently verified against primary authorities.';
  } else {
    noticeText = 'Ungrounded — no primary statutory authority confirmed. Provided for educational understanding only.';
  }

  return {
    grounded: status === 'grounded',
    status,
    matchedCitations,
    unverifiedClaims,
    disclosures,
    mandatoryLabeling: 'Analysis',
    noticeText,
  };
}
