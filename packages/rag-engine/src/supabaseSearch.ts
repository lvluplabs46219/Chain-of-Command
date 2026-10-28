import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type LegalCorpusHit = {
  id: string;
  jurisdiction: string;
  source_type: string;
  citation: string;
  title: string;
  content: string;
  similarity: number;
  fts_rank: number;
};

function client(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  if (!url || !key) {
    throw new Error(
      'Supabase configuration missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or anon key for read-only).',
    );
  }
  return createClient(url, key);
}

/**
 * Hybrid search: dense (pgvector) + BM25/FTS via hybrid_legal_search RPC.
 * Requires a 1536-dim embedding (e.g. text-embedding-3-small).
 */
export async function hybridLegalSearch(opts: {
  queryText: string;
  queryEmbedding: number[];
  matchThreshold?: number;
  matchCount?: number;
  jurisdiction?: string | null;
}): Promise<LegalCorpusHit[]> {
  const supabase = client();
  const { data, error } = await supabase.rpc('hybrid_legal_search', {
    query_text: opts.queryText,
    query_embedding: opts.queryEmbedding,
    match_threshold: opts.matchThreshold ?? 0.5,
    match_count: opts.matchCount ?? 10,
    filter_jurisdiction: opts.jurisdiction ?? null,
  });

  if (error) {
    console.error('hybrid_legal_search failed:', error);
    throw error;
  }
  return (data ?? []) as LegalCorpusHit[];
}

/**
 * Lexical-only search (citations, keywords) — no embedding required.
 * Useful for "PC 1538.5" style queries and offline/cheap paths.
 */
export async function lexicalLegalSearch(opts: {
  queryText: string;
  matchCount?: number;
  jurisdiction?: string | null;
}): Promise<LegalCorpusHit[]> {
  const supabase = client();
  const { data, error } = await supabase.rpc('lexical_legal_search', {
    query_text: opts.queryText,
    match_count: opts.matchCount ?? 10,
    filter_jurisdiction: opts.jurisdiction ?? null,
  });

  if (error) {
    console.error('lexical_legal_search failed:', error);
    throw error;
  }
  return (data ?? []) as LegalCorpusHit[];
}

/** @deprecated Prefer hybridLegalSearch — kept for older call sites. */
export async function searchLegalCases(queryEmbedding: number[]) {
  const supabase = client();
  const { data, error } = await supabase.rpc('hybrid_legal_search', {
    query_text: '',
    query_embedding: queryEmbedding,
    match_threshold: 0.6,
    match_count: 5,
    filter_jurisdiction: null,
  });
  if (error) {
    // Legacy CourtListener RPC fallback
    const legacy = await supabase.rpc('match_courtlistener', {
      query_embedding: queryEmbedding,
      match_threshold: 0.6,
      match_count: 5,
    });
    if (legacy.error) throw error;
    return legacy.data;
  }
  return data;
}
