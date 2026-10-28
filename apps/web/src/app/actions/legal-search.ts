"use server";

import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";
import { groundAnswer } from "@chain-of-command/legal-library";

export type LegalHit = {
  id: string;
  jurisdiction: string;
  source_type: string;
  citation: string;
  title: string;
  content: string;
  similarity: number;
  fts_rank: number;
  rerank_score?: number;
};

export type LegalSearchResult = {
  results: LegalHit[];
  mode: "hybrid" | "lexical" | "empty";
  reranked: boolean;
  notice?: string;
};

const EMBED_MODEL = "text-embedding-3-small";
const EMBED_DIM = 1536;
const CANDIDATE_COUNT = 20;
const FINAL_COUNT = 5;

async function embedQuery(text: string): Promise<number[] | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: text, dimensions: EMBED_DIM }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Embedding request failed (${res.status}): ${body.slice(0, 180)}`);
  }

  const json = (await res.json()) as { data?: Array<{ embedding?: number[] }> };
  const vector = json.data?.[0]?.embedding;
  if (!Array.isArray(vector) || vector.length !== EMBED_DIM) {
    throw new Error(`Expected a ${EMBED_DIM}-dimension embedding from ${EMBED_MODEL}.`);
  }
  return vector;
}

async function rerank(query: string, hits: LegalHit[]): Promise<{ hits: LegalHit[]; reranked: boolean }> {
  if (hits.length <= FINAL_COUNT) return { hits, reranked: false };

  const key = process.env.COHERE_API_KEY;
  if (!key || hits.length < 2) {
    // Deterministic fallback: blend dense + fts already ordered by RPC
    return { hits: hits.slice(0, FINAL_COUNT), reranked: false };
  }

  const res = await fetch("https://api.cohere.com/v2/rerank", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.COHERE_RERANK_MODEL || "rerank-v3.5",
      query,
      top_n: FINAL_COUNT,
      documents: hits.map((hit) => `${hit.citation}\n${hit.title}\n${hit.content.slice(0, 4000)}`),
    }),
  });

  if (!res.ok) return { hits: hits.slice(0, FINAL_COUNT), reranked: false };

  const json = (await res.json()) as { results?: Array<{ index: number; relevance_score: number }> };
  const ordered = (json.results || [])
    .filter((row) => hits[row.index])
    .map((row) => ({ ...hits[row.index], rerank_score: row.relevance_score }));

  return {
    hits: ordered.length > 0 ? ordered.slice(0, FINAL_COUNT) : hits.slice(0, FINAL_COUNT),
    reranked: ordered.length > 0,
  };
}

/**
 * Hybrid legal search: retrieve up to 20 candidates, rerank to top 5.
 */
export async function searchLegalCorpus(
  searchQuery: string,
  jurisdiction: string | null = null
): Promise<LegalSearchResult> {
  const query = searchQuery.trim();
  if (!query) return { results: [], mode: "empty", reranked: false };

  const supabase = getSupabaseAdmin();
  const filter = jurisdiction?.trim() ? jurisdiction.trim() : null;
  let mode: "hybrid" | "lexical" = "lexical";
  let notice: string | undefined;
  let rows: LegalHit[] = [];

  let embedding: number[] | null = null;
  try {
    embedding = await embedQuery(query);
  } catch (err) {
    notice = err instanceof Error ? err.message : "Embedding failed. Using keyword search.";
  }

  if (!embedding && !notice && !process.env.OPENAI_API_KEY) {
    notice =
      "OPENAI_API_KEY is not set, so this search is keyword-only. Hybrid ranking needs text-embedding-3-small.";
  }

  if (embedding) {
    mode = "hybrid";
    const { data, error } = await supabase.rpc("hybrid_legal_search", {
      query_text: query,
      query_embedding: embedding,
      match_threshold: 0.45,
      match_count: CANDIDATE_COUNT,
      filter_jurisdiction: filter,
    });
    if (error) throw new Error(error.message);
    rows = (data || []) as LegalHit[];
  } else {
    const { data, error } = await supabase.rpc("lexical_legal_search", {
      query_text: query,
      match_count: CANDIDATE_COUNT,
      filter_jurisdiction: filter,
    });
    if (error) throw new Error(error.message);
    rows = (data || []) as LegalHit[];
  }

  const ranked = await rerank(query, rows);
  return {
    results: ranked.hits,
    mode,
    reranked: ranked.reranked,
    notice,
  };
}

/**
 * Retrieve + ground a free-text AI answer against the legal corpus.
 */
export async function searchAndGroundAnswer(
  searchQuery: string,
  answerText: string,
  jurisdiction: string | null = "CA"
) {
  const search = await searchLegalCorpus(searchQuery, jurisdiction);
  const grounded = groundAnswer(answerText, search.results, jurisdiction || "CA");
  return {
    search,
    grounding: grounded.report,
    verifiedCitations: grounded.verifiedCitations,
  };
}
