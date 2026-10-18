/**
 * Legal Citations, Credibility Tiers & Provenance
 * Implements Chain of Command Master Build Instructions §12.2, §12.6.
 */

export type CredibilityTier = 1 | 2 | 3 | 4;

export interface SourceDefinition {
  domain: string;
  name: string;
  tier: CredibilityTier;
  allowedForLegalClaims: boolean;
  notes: string;
}

export const SOURCE_REGISTRY: Record<string, SourceDefinition> = {
  'supremecourt.gov': {
    domain: 'supremecourt.gov',
    name: 'Supreme Court of the United States',
    tier: 1,
    allowedForLegalClaims: true,
    notes: 'Official primary federal precedent',
  },
  'uscourts.gov': {
    domain: 'uscourts.gov',
    name: 'United States Courts',
    tier: 1,
    allowedForLegalClaims: true,
    notes: 'Federal rules and court records',
  },
  'law.cornell.edu': {
    domain: 'law.cornell.edu',
    name: 'Legal Information Institute (LII)',
    tier: 2,
    allowedForLegalClaims: true,
    notes: 'Authoritative secondary / codified statutory mirror',
  },
  'azleg.gov': {
    domain: 'azleg.gov',
    name: 'Arizona State Legislature',
    tier: 1,
    allowedForLegalClaims: true,
    notes: 'Primary Arizona Revised Statutes',
  },
  'americanbar.org': {
    domain: 'americanbar.org',
    name: 'American Bar Association',
    tier: 2,
    allowedForLegalClaims: true,
    notes: 'Model rules & professional standards',
  },
  'general-web': {
    domain: 'general-web',
    name: 'General Web & News Sources',
    tier: 3,
    allowedForLegalClaims: false,
    notes: 'Context only; never grounds a legal holding',
  },
};

export interface CitationObject {
  id: string;
  authorityId: string;
  authorityVersionId: string;
  sourceType:
    | 'case_law'
    | 'statute'
    | 'regulation'
    | 'rule'
    | 'form'
    | 'opinion'
    | 'secondary'
    | 'court_resource';
  jurisdictionId: string;
  courtId?: string;
  citation: string;            // e.g. "18 U.S.C. § 3161" or "Ind. Code § 35-36-8-1"
  title: string;
  pinpoint?: string;           // section/paragraph/page
  quote?: string;              // exact text, must be verbatim
  officialUrl?: string;
  retrievedAt: string;
  verificationStatus: 'verified' | 'unverified' | 'superseded' | 'overruled';
  credibilityTier: CredibilityTier;
  modelUsedForEmbedding?: string;
  score?: {
    lexical?: number;
    vector?: number;
    rerank?: number;
    fused: number;
  };
}

export const SEED_AUTHORITIES: CitationObject[] = [
  {
    id: "cite-miranda-v-arizona",
    authorityId: "auth-miranda-384-us-436",
    authorityVersionId: "v1-1966",
    sourceType: "case_law",
    jurisdictionId: "us-federal",
    courtId: "scotus",
    citation: "384 U.S. 436 (1966)",
    title: "Miranda v. Arizona",
    pinpoint: "at 444",
    quote: "Prior to any questioning, the person must be warned that he has a right to remain silent, that any statement he does make may be used as evidence against him, and that he has a right to the presence of an attorney, either retained or appointed.",
    officialUrl: "https://supreme.justia.com/cases/federal/us/384/436/",
    retrievedAt: "2026-01-01T00:00:00Z",
    verificationStatus: "verified",
    credibilityTier: 1,
    score: { fused: 0.98 },
  },
  {
    id: "cite-brady-v-maryland",
    authorityId: "auth-brady-373-us-83",
    authorityVersionId: "v1-1963",
    sourceType: "case_law",
    jurisdictionId: "us-federal",
    courtId: "scotus",
    citation: "373 U.S. 83 (1963)",
    title: "Brady v. Maryland",
    pinpoint: "at 87",
    quote: "The suppression by the prosecution of evidence favorable to an accused upon request violates due process where the evidence is material either to guilt or to punishment.",
    officialUrl: "https://supreme.justia.com/cases/federal/us/373/83/",
    retrievedAt: "2026-01-01T00:00:00Z",
    verificationStatus: "verified",
    credibilityTier: 1,
    score: { fused: 0.95 },
  },
  {
    id: "cite-18-usc-3161",
    authorityId: "auth-18-usc-3161",
    authorityVersionId: "v2024",
    sourceType: "statute",
    jurisdictionId: "us-federal",
    citation: "18 U.S.C. § 3161(b)",
    title: "Speedy Trial Act - Time limits and exclusions",
    pinpoint: "subsection (b)",
    quote: "Any information or indictment charging an individual with the commission of an offense shall be filed within thirty days from the date on which such individual was arrested or served with a summons in connection with such charges.",
    officialUrl: "https://www.law.cornell.edu/uscode/text/18/3161",
    retrievedAt: "2026-01-01T00:00:00Z",
    verificationStatus: "verified",
    credibilityTier: 1,
    score: { fused: 0.96 },
  },
  {
    id: "cite-fed-r-crim-p-12",
    authorityId: "auth-fed-crim-rule-12",
    authorityVersionId: "v2024",
    sourceType: "rule",
    jurisdictionId: "us-federal",
    courtId: "us-district",
    citation: "Fed. R. Crim. P. 12(b)(3)",
    title: "Federal Rules of Criminal Procedure - Pretrial Motions",
    pinpoint: "Rule 12(b)(3)",
    quote: "The following defenses, objections, and requests must be raised by pretrial motion if the basis for the motion is then reasonably available and the motion can be determined without a trial on the merits: defect in instituting the prosecution; defect in the indictment; suppression of evidence.",
    officialUrl: "https://www.uscourts.gov/rules-policies/current-rules-practice-procedure",
    retrievedAt: "2026-01-01T00:00:00Z",
    verificationStatus: "verified",
    credibilityTier: 1,
    score: { fused: 0.94 },
  },
];
