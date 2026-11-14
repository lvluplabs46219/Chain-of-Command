/**
 * Lightweight Node test for source-verification contracts.
 * Run: node --import tsx packages/legal-library/src/source-verification.test.ts
 * Or: npx tsx packages/legal-library/src/source-verification.test.ts
 */

import {
  contentHash,
  ingestSource,
  isAllowListedDomain,
  claimsFromCitationStrings,
  claimIsVerifiable,
  normalizeClaimsForDisplay,
} from "./source-verification";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(isAllowListedDomain("https://www.courtlistener.com/opinion/1/"), "courtlistener allow");
assert(isAllowListedDomain("govinfo.gov"), "govinfo allow");
assert(!isAllowListedDomain("https://random-blog.example/post"), "blog deny");

const h1 = contentHash("hello");
const h2 = contentHash("hello");
const h3 = contentHash("hello!");
assert(h1 === h2 && h1 !== h3 && h1.length === 64, "contentHash stable sha256");

const ok = ingestSource({
  sourceUrlOrId: "https://www.justice.gov/opa/pr/example",
  content: "Official release body",
  retrievingAgentOrUser: "test-agent",
  mimeType: "text/plain",
});
assert(ok.status === "accepted" && ok.allowListed && ok.contentHash.length === 64, "ingest accept");

const bad = ingestSource({
  sourceUrlOrId: "https://untrusted.example/doc.pdf",
  content: "spoof",
  retrievingAgentOrUser: "test-agent",
});
assert(bad.status === "quarantined" && !bad.allowListed, "ingest quarantine");

const bundle = claimsFromCitationStrings(
  "The statute imposes liability for false claims.",
  ["31 U.S.C. § 3729(a)(1)(A)"],
  { jurisdiction: "us-federal", generationMethod: "model" }
);
assert(bundle.claims.length === 1, "one claim");
assert(claimIsVerifiable(bundle.claims[0]), "claim verifiable");
assert(bundle.claims[0].confidence !== "unverified", "has confidence");

const empty = normalizeClaimsForDisplay([
  { claim_text: "Unsupported assertion.", sources: [], confidence: "high", gaps_noted: [] },
]);
assert(empty[0].confidence === "unverified", "normalize unverified");
assert(empty[0].gaps_noted.some((g) => g.includes("verifiable")), "gap noted");

console.log("source-verification.test.ts: all assertions passed");
