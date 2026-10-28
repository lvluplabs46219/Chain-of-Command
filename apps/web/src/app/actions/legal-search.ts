"use server";

import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";

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

async function embedQuery(text: string): Promise<number[] | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: text }),
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
  const key = process.env.COHERE_API_KEY;
  if (!key || hits.length < 2) return { hits, reranked: false };

  const res = await fetch("https://api.cohere.com/v2/rerank", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.COHERE_RERANK_MODEL || "rerank-v3.5",
      query,
      top_n: Math.min(8, hits.length),
      documents: hits.map((hit) => `${hit.citation}\n${hit.title}\n${hit.content.slice(0, 4000)}`),
    }),
  });

  if (!res.ok) return { hits, reranked: false };

  const json = (await res.json()) as { results?: Array<{ index: number; relevance_score: number }> };
  const ordered = (json.results || [])
    .filter((row) => hits[row.index])
    .map((row) => ({ ...hits[row.index], rerank_score: row.relevance_score }));

  return { hits: ordered.length > 0 ? ordered : hits, reranked: ordered.length > 0 };
}

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
    notice = "OPENAI_API_KEY is not set, so this search is keyword-only. Hybrid ranking needs text-embedding-3-small.";
  }

  if (embedding) {
    mode = "hybrid";
    const { data, error } = await supabase.rpc("hybrid_legal_search", {
      query_text: query,
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 20,
      filter_jurisdiction: filter,
    });
    if (error) throw new Error(error.message);
    rows = (data || []) as LegalHit[];
  } else {
    const { data, error } = await supabase.rpc("lexical_legal_search", {
      query_text: query,
      match_count: 20,
      filter_jurisdiction: filter,
    });
    if (error) throw new Error(error.message);
    rows = (data || []) as LegalHit[];
  }

  const ranked = await rerank(query, rows);
  return {
    results: ranked.hits.slice(0, 10),
    mode,
    reranked: ranked.reranked,
    notice,
  };
}
