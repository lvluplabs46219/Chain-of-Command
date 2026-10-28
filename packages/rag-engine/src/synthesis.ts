import type { LegalCorpusHit } from './hybridSearch';

/**
 * Step 4b: citation-constrained synthesis.
 * buildGroundedPrompt() limits the model to retrieved passages;
 * findUnsupportedCitations() flags anything in the answer that was not retrieved.
 * For the full verification layer, pass results into runGroundingGuard()
 * from packages/legal-library.
 */

export function buildGroundedPrompt(question: string, passages: LegalCorpusHit[]) {
  const context = passages
    .map((p, i) => `[${i + 1}] ${p.citation} (${p.jurisdiction}, ${p.source_type})\n${p.title}\n${p.content}`)
    .join('\n\n---\n\n');

  const system = [
    'You are a legal research assistant providing general legal information, not legal advice.',
    'You must only cite statutes, rules, or cases explicitly provided in the context below.',
    'Cite using the bracketed passage number, e.g. [1], and name the citation the first time.',
    'If the context does not answer the question, say so plainly. Do not rely on outside knowledge of the law.',
    'Never invent section numbers, case names, quotations, or holdings.',
  ].join('\n');

  const user = `CONTEXT:\n${context || '(no passages retrieved)'}\n\nQUESTION:\n${question}`;
  return { system, user };
}

const SECTION_CITE = /(?:§§?\s*[\d.\-()a-zA-Z]+)|(?:\b\d+\s+[A-Z][\w.]*\s+\d+\b)/g;

export interface CitationCheck {
  ok: boolean;
  badMarkers: string[]; // [n] markers outside the retrieved range
  unsupported: string[]; // statute/case-style cites not found in the context
}

export function findUnsupportedCitations(answer: string, passages: LegalCorpusHit[]): CitationCheck {
  const haystack = passages.map((p) => `${p.citation} ${p.content}`).join(' ').toLowerCase();

  const badMarkers = [...answer.matchAll(/\[(\d+)\]/g)]
    .map((m) => Number(m[1]))
    .filter((n) => n < 1 || n > passages.length)
    .map((n) => `[${n}]`);

  const unsupported = [...new Set(answer.match(SECTION_CITE) ?? [])]
    .map((c) => c.trim())
    .filter((c) => !haystack.includes(c.toLowerCase()));

  return { ok: badMarkers.length === 0 && unsupported.length === 0, badMarkers, unsupported };
}
