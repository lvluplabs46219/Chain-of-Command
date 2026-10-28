import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Hybrid legal retrieval: pgvector + Postgres FTS (hybrid_legal_search RPC),
 * then Cohere rerank, then a citation-constrained prompt for synthesis.
 * Backed by supabase/migrations/20261028223000_legal_corpus_hybrid_search.sql
 */

export interface LegalCorpusHit {
  id: string;
  jurisdiction: string;
  source_type: 'statute' | 'case_law' | 'regulation' | 'rule';
  citation: string;
  title: string;
  content: string;
  similarity: number;
  fts_rank: number;
  rerankScore?: number;
}

export interface HybridSearchConfig {
  supabaseUrl: string;
  supabaseKey: string;
  openAiKey: string;
  cohereKey?: string;
  rerankModel?: string;
}

export interface HybridSearchOptions {
  query: string;
  jurisdiction?: string | null;
  candidateCount?: number; // pulled from Postgres before rerank
  topN?: number; // passed to the LLM
  matchThreshold?: number;
}

export class HybridLegalSearch {
  private supabase: SupabaseClient;

  constructor(private cfg: HybridSearchConfig) {
    this.supabase = createClient(cfg.supabaseUrl, cfg.supabaseKey);
  }

  private async embed(text: string): Promise<number[]> {
    const input = text.replace(/\n/g, ' ').trim();
    if (!input) throw new Error('Cannot embed empty query');
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.cfg.openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'text-embedding-3-small', input }),
    });
    if (!res.ok) throw new Error(`OpenAI embeddings ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const json = (await res.json()) as { data: { embedding: number[] }[] };
    return json.data[0].embedding;
  }

  /** Step 3: dense + lexical candidates from Postgres. */
  async candidates(opts: HybridSearchOptions): Promise<LegalCorpusHit[]> {
    const queryEmbedding = await this.embed(opts.query);
    const { data, error } = await this.supabase.rpc('hybrid_legal_search', {
      query_text: opts.query,
      query_embedding: queryEmbedding,
      match_threshold: opts.matchThreshold ?? 0.5,
      match_count: opts.candidateCount ?? 20,
      filter_jurisdiction: opts.jurisdiction ?? null,
    });
    if (error) throw new Error(`hybrid_legal_search failed: ${error.message}`);
    return (data ?? []) as LegalCorpusHit[];
  }

  /** Step 4a: Cohere rerank. Falls back to the hybrid score order if no key or on failure. */
  async rerank(query: string, hits: LegalCorpusHit[], topN: number): Promise<LegalCorpusHit[]> {
    const fallback = () => hits.slice(0, topN);
    if (!this.cfg.cohereKey || hits.length <= 1) return fallback();
    try {
      const res = await fetch('https://api.cohere.com/v2/rerank', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.cfg.cohereKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.cfg.rerankModel ?? 'rerank-v3.5',
          query,
          top_n: topN,
          documents: hits.map((h) => `${h.citation}\n${h.title}\n${h.content}`.slice(0, 8000)),
        }),
      });
      if (!res.ok) throw new Error(`Cohere ${res.status}`);
      const json = (await res.json()) as { results: { index: number; relevance_score: number }[] };
      return json.results.map((r) => ({ ...hits[r.index], rerankScore: r.relevance_score }));
    } catch (err) {
      console.error('Rerank failed, using hybrid order:', err);
      return fallback();
    }
  }

  /** Steps 3 + 4a combined. */
  async search(opts: HybridSearchOptions): Promise<LegalCorpusHit[]> {
    const hits = await this.candidates(opts);
    return this.rerank(opts.query, hits, opts.topN ?? 3);
  }
}
