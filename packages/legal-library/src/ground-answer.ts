/**
 * Map retrieval hits into CitationObject[] and run the grounding guard
 * against free-text model output.
 */
import { CitationObject } from './citations';
import { runGroundingGuard, GroundingCheckReport } from './grounding-guard';

export type CorpusHitLike = {
  id: string;
  jurisdiction: string;
  source_type: string;
  citation: string;
  title: string;
  content: string;
  similarity?: number;
  fts_rank?: number;
  rerank_score?: number;
};

const CITE_RE =
  /(?:Cal\.\s*Penal\s*Code\s*§\s*[\d.]+[a-z]?|Fed\.\s*R\.\s*Crim\.\s*P\.\s*[\d.]+(?:\([a-z0-9]+\))?|\d+\s+U\.S\.C\.\s*§\s*[\d.]+[a-z]?|\d+\s+U\.S\.\s+\d+\s*\(\d{4}\)|Brady\s+v\.\s+Maryland|Miranda\s+v\.\s+Arizona)/gi;

function mapSourceType(
  t: string,
): CitationObject['sourceType'] {
  if (t === 'statute' || t === 'case_law' || t === 'regulation' || t === 'rule') return t;
  return 'secondary';
}

export function hitsToCitations(hits: CorpusHitLike[]): CitationObject[] {
  const now = new Date().toISOString();
  return hits.map((h, i) => {
    const fused =
      typeof h.rerank_score === 'number'
        ? h.rerank_score
        : typeof h.similarity === 'number'
          ? h.similarity
          : typeof h.fts_rank === 'number'
            ? Math.min(1, h.fts_rank)
            : 0.5;
    return {
      id: h.id || `hit-${i}`,
      authorityId: h.id || `auth-${i}`,
      authorityVersionId: 'corpus',
      sourceType: mapSourceType(h.source_type),
      jurisdictionId: h.jurisdiction === 'FEDERAL' ? 'us-federal' : h.jurisdiction.toLowerCase(),
      citation: h.citation.replace(/\s*\[chunk\s+\d+\]\s*$/i, '').trim(),
      title: h.title,
      quote: h.content.slice(0, 500),
      retrievedAt: now,
      verificationStatus: 'verified' as const,
      credibilityTier: 1 as const,
      score: {
        vector: h.similarity,
        lexical: h.fts_rank,
        rerank: h.rerank_score,
        fused,
      },
    };
  });
}

export function extractProposedCitations(text: string, corpus: CitationObject[]): CitationObject[] {
  const found = new Map<string, CitationObject>();
  const matches = text.match(CITE_RE) || [];
  for (const raw of matches) {
    const key = raw.toLowerCase().replace(/\s+/g, ' ').trim();
    const hit = corpus.find((c) => c.citation.toLowerCase().includes(key) || key.includes(c.citation.toLowerCase().slice(0, 24)));
    if (hit) {
      found.set(hit.citation, hit);
    } else {
      found.set(raw, {
        id: `proposed-${found.size}`,
        authorityId: 'unknown',
        authorityVersionId: 'unknown',
        sourceType: 'secondary',
        jurisdictionId: 'unknown',
        citation: raw,
        title: raw,
        retrievedAt: new Date().toISOString(),
        verificationStatus: 'unverified',
        credibilityTier: 4,
        score: { fused: 0 },
      });
    }
  }
  return [...found.values()];
}

export type GroundedAnswer = {
  report: GroundingCheckReport;
  verifiedCitations: CitationObject[];
  strippedText: string;
};

/**
 * Ground free-text AI output against retrieved corpus hits.
 * Unverified citation strings are listed in the report; caller should prefer verified only.
 */
export function groundAnswer(
  text: string,
  hits: CorpusHitLike[],
  targetJurisdiction = 'CA',
): GroundedAnswer {
  const verifiedCorpus = hitsToCitations(hits);
  const proposed = extractProposedCitations(text, verifiedCorpus);
  // If model cited nothing, still attach top hits as available authorities
  const proposedOrTop = proposed.length > 0 ? proposed : verifiedCorpus.slice(0, 3);
  const report = runGroundingGuard({
    text,
    proposedCitations: proposedOrTop,
    targetJurisdiction: targetJurisdiction === 'FEDERAL' ? 'us-federal' : targetJurisdiction.toLowerCase(),
    verifiedCorpus,
  });
  return {
    report,
    verifiedCitations: report.matchedCitations,
    strippedText: text,
  };
}
