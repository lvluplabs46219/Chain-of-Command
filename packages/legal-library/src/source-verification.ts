/**
 * Source Verification Protocol — shared contracts & helpers
 * See docs/SOURCE_VERIFICATION_PROTOCOL.md and ADR-002.
 *
 * Continuous invariant from ingestion → RAG → generation → news → training data.
 */

import { createHash } from "node:crypto";
import {
  SOURCE_REGISTRY,
  type CredibilityTier,
  type SourceDefinition,
} from "./citations";

// ---------------------------------------------------------------------------
// Status machine
// ---------------------------------------------------------------------------

/** Review workflow for high-impact outputs (news, training candidates, case research). */
export type VerificationWorkflowStatus =
  | "draft"
  | "source_checked"
  | "approved"
  | "rejected"
  | "quarantined";

export type ClaimConfidence = "high" | "medium" | "low" | "unverified";

export type PrimarySourceType =
  | "statute"
  | "opinion"
  | "regulation"
  | "rule"
  | "agency_release"
  | "government_record"
  | "docket"
  | "secondary"
  | "other";

// ---------------------------------------------------------------------------
// Claim-level grounding schema
// ---------------------------------------------------------------------------

export interface SourcePointer {
  type: PrimarySourceType;
  /** Human-readable cite, e.g. "31 U.S.C. § 3729(a)(1)(A)" */
  cite: string;
  /** Page, section, paragraph, or byte offset when known */
  locator?: string;
  /** Content hash of the retrieved source span or document */
  hash?: string;
  /** ISO timestamp of retrieval */
  retrieved?: string;
  /** Canonical URL or document ID */
  urlOrId?: string;
  /** Domain key matching SOURCE_REGISTRY when applicable */
  domain?: string;
}

export interface ClaimObject {
  claim_text: string;
  sources: SourcePointer[];
  confidence: ClaimConfidence;
  gaps_noted: string[];
  /** Optional span mapping for extractive preference */
  source_spans?: Array<{ sourceIndex: number; excerpt?: string }>;
}

export interface ClaimBundle {
  claims: ClaimObject[];
  verificationStatus: VerificationWorkflowStatus;
  lastVerifiedAt?: string;
  generationMethod?: "extractive" | "constrained_abstractive" | "template" | "model";
  reviewActorId?: string;
}

// ---------------------------------------------------------------------------
// Ingestion gate
// ---------------------------------------------------------------------------

export interface IngestionRecord {
  sourceUrlOrId: string;
  retrievedAt: string;
  retrievingAgentOrUser: string;
  contentHash: string;
  mimeType?: string;
  byteLength?: number;
  pageCount?: number;
  domain?: string;
  allowListed: boolean;
  status: "accepted" | "quarantined" | "rejected";
  rejectionReason?: string;
}

/** Official / high-trust domains for legal claims (v1 allow-list). */
export const PRIMARY_SOURCE_ALLOWLIST: readonly string[] = [
  "supremecourt.gov",
  "uscourts.gov",
  "govinfo.gov",
  "justice.gov",
  "congress.gov",
  "house.gov",
  "senate.gov",
  "gpo.gov",
  "federalregister.gov",
  "courtlistener.com",
  "recap.courtlistener.com",
  "law.cornell.edu",
  "azleg.gov",
  "legis.ga.gov",
  "leginfo.legislature.ca.gov",
  "ilga.gov",
  "nycourts.gov",
  "texaslegislature.gov",
  "in.gov",
  "americanbar.org",
] as const;

export function extractHostname(urlOrDomain: string): string {
  try {
    if (urlOrDomain.includes("://")) {
      return new URL(urlOrDomain).hostname.replace(/^www\./, "").toLowerCase();
    }
  } catch {
    /* fall through */
  }
  return urlOrDomain.replace(/^www\./, "").toLowerCase();
}

/** Match hostname against allow-list (exact or subdomain of listed domain). */
export function isAllowListedDomain(urlOrDomain: string): boolean {
  const host = extractHostname(urlOrDomain);
  return PRIMARY_SOURCE_ALLOWLIST.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`)
  );
}

export function lookupSourceDefinition(urlOrDomain: string): SourceDefinition | undefined {
  const host = extractHostname(urlOrDomain);
  const direct = SOURCE_REGISTRY[host];
  if (direct) return direct;
  for (const [key, def] of Object.entries(SOURCE_REGISTRY)) {
    if (host === key || host.endsWith(`.${key}`)) return def;
  }
  return undefined;
}

/** SHA-256 hex digest of UTF-8 content (idempotent integrity check). */
export function contentHash(content: string | Buffer): string {
  return createHash("sha256").update(content).digest("hex");
}

export interface IngestSourceInput {
  sourceUrlOrId: string;
  content: string | Buffer;
  retrievingAgentOrUser: string;
  mimeType?: string;
  pageCount?: number;
  retrievedAt?: string;
}

/**
 * Ingestion gate: accept only allow-listed domains (or explicit document IDs
 * that already carry registry metadata). Non-allow-listed → quarantined.
 */
export function ingestSource(input: IngestSourceInput): IngestionRecord {
  const retrievedAt = input.retrievedAt ?? new Date().toISOString();
  const hash = contentHash(input.content);
  const byteLength =
    typeof input.content === "string"
      ? Buffer.byteLength(input.content, "utf8")
      : input.content.byteLength;

  const looksLikeUrl =
    input.sourceUrlOrId.includes("://") || input.sourceUrlOrId.includes(".");
  const domain = looksLikeUrl ? extractHostname(input.sourceUrlOrId) : undefined;
  const allowListed = domain ? isAllowListedDomain(domain) : false;

  if (looksLikeUrl && !allowListed) {
    return {
      sourceUrlOrId: input.sourceUrlOrId,
      retrievedAt,
      retrievingAgentOrUser: input.retrievingAgentOrUser,
      contentHash: hash,
      mimeType: input.mimeType,
      byteLength,
      pageCount: input.pageCount,
      domain,
      allowListed: false,
      status: "quarantined",
      rejectionReason: `Domain not on PRIMARY_SOURCE_ALLOWLIST: ${domain ?? "unknown"}`,
    };
  }

  return {
    sourceUrlOrId: input.sourceUrlOrId,
    retrievedAt,
    retrievingAgentOrUser: input.retrievingAgentOrUser,
    contentHash: hash,
    mimeType: input.mimeType,
    byteLength,
    pageCount: input.pageCount,
    domain,
    allowListed: !looksLikeUrl || allowListed,
    status: "accepted",
  };
}

// ---------------------------------------------------------------------------
// Claim helpers for generation / rendering
// ---------------------------------------------------------------------------

/** True when a claim has at least one verifiable source pointer. */
export function claimIsVerifiable(claim: ClaimObject): boolean {
  return claim.sources.some(
    (s) => Boolean(s.cite?.trim()) || Boolean(s.urlOrId?.trim()) || Boolean(s.hash)
  );
}

/** Label claims lacking sources as unverified (renderer contract). */
export function normalizeClaimsForDisplay(claims: ClaimObject[]): ClaimObject[] {
  return claims.map((c) => {
    if (claimIsVerifiable(c)) return c;
    return {
      ...c,
      confidence: "unverified",
      gaps_noted: [
        ...c.gaps_noted,
        "No verifiable source pointer attached — treat as unverified.",
      ],
    };
  });
}

/** Build a single claim from model text + citation strings (lawyer route helper). */
export function claimsFromCitationStrings(
  claimText: string,
  citations: string[],
  opts?: { jurisdiction?: string; generationMethod?: ClaimBundle["generationMethod"] }
): ClaimBundle {
  const sources: SourcePointer[] = citations
    .filter((c) => c.trim().length > 0)
    .map((cite) => ({
      type: inferSourceType(cite),
      cite: cite.trim(),
      retrieved: new Date().toISOString(),
    }));

  const hasSources = sources.length > 0;
  const claim: ClaimObject = {
    claim_text: claimText,
    sources,
    confidence: hasSources ? "medium" : "unverified",
    gaps_noted: hasSources
      ? [
          "Citations extracted from model output — not yet re-fetched against primary corpus.",
          ...(opts?.jurisdiction
            ? [`Target jurisdiction context: ${opts.jurisdiction}`]
            : []),
        ]
      : ["No primary source pointer available for this response."],
  };

  return {
    claims: normalizeClaimsForDisplay([claim]),
    verificationStatus: hasSources ? "draft" : "draft",
    lastVerifiedAt: undefined,
    generationMethod: opts?.generationMethod ?? "model",
  };
}

function inferSourceType(cite: string): PrimarySourceType {
  const c = cite.toLowerCase();
  if (c.includes("u.s.c") || c.includes("code §") || c.includes("code §") || /§/.test(cite))
    return "statute";
  if (/\bv\.\s/.test(cite) || c.includes("u.s.") || c.includes("f.3d") || c.includes("f.2d"))
    return "opinion";
  if (c.includes("c.f.r") || c.includes("federal register")) return "regulation";
  if (c.includes("rule") || c.includes("crim. r") || c.includes("t.r.")) return "rule";
  return "other";
}

export function tierAllowsLegalClaims(domain: string): boolean {
  const def = lookupSourceDefinition(domain);
  if (def) return def.allowedForLegalClaims;
  return isAllowListedDomain(domain);
}

export type { CredibilityTier };
