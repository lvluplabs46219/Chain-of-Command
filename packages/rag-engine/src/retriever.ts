import { z } from 'zod';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { hybridLegalSearch, lexicalLegalSearch } from './supabaseSearch.js';

// ==========================================
// 1. Types & Zod Validation Schemas
// ==========================================
export const RetrievalScopeSchema = z.enum(['PUBLIC_LAW', 'MATTER_DOCUMENTS', 'HYBRID']);
export type RetrievalScope = z.infer<typeof RetrievalScopeSchema>;

export const LegalCitationSchema = z.object({
  id: z.string().uuid(),
  authorityTitle: z.string(),
  citation: z.string(),
  jurisdiction: z.string(),
  sourceUrl: z.string().url().nullable(),
  chunkText: z.string(),
  similarityScore: z.number().min(0).max(1),
  sourceType: z.enum(['SOURCE_PUBLIC', 'SOURCE_USER', 'SOURCE_COURT']),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type LegalCitation = z.infer<typeof LegalCitationSchema>;

export const RetrievalResponseSchema = z.object({
  query: z.string(),
  jurisdiction: z.string(),
  citations: z.array(LegalCitationSchema),
  confidenceScore: z.number().min(0).max(1),
  disclaimer: z.string(),
});
export type RetrievalResponse = z.infer<typeof RetrievalResponseSchema>;

export interface SearchOptions {
  query: string;
  jurisdiction: string;
  scope?: RetrievalScope;
  matterId?: string;
  userId?: string;
  matchThreshold?: number;
  matchCount?: number;
}

// ==========================================
// 2. Active pgvector Legal Retriever Service
// ==========================================
export class LegalRetrieverService {
  private supabase: SupabaseClient;
  private openAiKey: string;
  private readonly UPL_DISCLAIMER =
    'This retrieved legal information is for educational and procedural reference only and does not constitute legal advice. No attorney-client relationship is formed. Verify citations with primary sources or consult a licensed attorney.';

  constructor(config: { supabaseUrl: string; supabaseServiceKey: string; openAiKey: string }) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
    this.openAiKey = config.openAiKey;
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    const cleanText = text.replace(/\n/g, ' ').trim();
    if (!cleanText) throw new Error('Cannot embed empty text');

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: cleanText,
        dimensions: 1536,
      }),
    });

    if (!response.ok) {
      const errPayload = await response.text();
      throw new Error(`OpenAI Embedding API error (${response.status}): ${errPayload}`);
    }

    const payload = (await response.json()) as { data: [{ embedding: number[] }] };
    return payload.data[0].embedding;
  }

  public async retrieve(options: SearchOptions): Promise<RetrievalResponse> {
    const {
      query,
      jurisdiction,
      scope = 'PUBLIC_LAW',
      matterId,
      userId,
      matchThreshold = 0.65,
      matchCount = 5,
    } = options;

    if ((scope === 'MATTER_DOCUMENTS' || scope === 'HYBRID') && (!matterId || !userId)) {
      throw new Error('matterId and userId are strictly required when searching private case documents');
    }

    const citations: LegalCitation[] = [];

    // ----------------------------------------------------
    // Public law: hybrid_legal_search (dense + FTS) with lexical fallback
    // ----------------------------------------------------
    if (scope === 'PUBLIC_LAW' || scope === 'HYBRID') {
      try {
        const queryEmbedding = await this.generateEmbedding(query);
        const hits = await hybridLegalSearch({
          queryText: query,
          queryEmbedding,
          matchThreshold,
          matchCount,
          jurisdiction,
        });
        for (const item of hits) {
          citations.push({
            id: item.id,
            authorityTitle: item.title,
            citation: item.citation,
            jurisdiction: item.jurisdiction,
            sourceUrl: null,
            chunkText: item.content,
            similarityScore: parseFloat(Number(item.similarity).toFixed(4)),
            sourceType: 'SOURCE_PUBLIC',
            metadata: { sourceType: item.source_type, ftsRank: item.fts_rank },
          });
        }
      } catch (hybridErr) {
        console.warn('hybrid_legal_search unavailable, trying lexical:', hybridErr);
        try {
          const lex = await lexicalLegalSearch({
            queryText: query,
            matchCount,
            jurisdiction,
          });
          for (const item of lex) {
            citations.push({
              id: item.id,
              authorityTitle: item.title,
              citation: item.citation,
              jurisdiction: item.jurisdiction,
              sourceUrl: null,
              chunkText: item.content,
              similarityScore: parseFloat(Number(item.fts_rank || 0).toFixed(4)),
              sourceType: 'SOURCE_PUBLIC',
              metadata: { sourceType: item.source_type, mode: 'lexical' },
            });
          }
        } catch (lexErr) {
          // Legacy RPC fallback
          const queryEmbedding = await this.generateEmbedding(query);
          const { data: publicChunks, error: pubError } = await this.supabase.rpc('match_legal_chunks', {
            query_embedding: queryEmbedding,
            match_threshold: matchThreshold,
            match_count: matchCount,
            filter_jurisdiction: jurisdiction,
          });
          if (!pubError && publicChunks) {
            for (const item of publicChunks) {
              citations.push({
                id: item.id,
                authorityTitle: item.title,
                citation: item.citation,
                jurisdiction: item.jurisdiction,
                sourceUrl: item.source_url,
                chunkText: item.content,
                similarityScore: parseFloat(item.similarity.toFixed(4)),
                sourceType: 'SOURCE_PUBLIC',
              });
            }
          } else {
            throw lexErr;
          }
        }
      }
    }

    // ----------------------------------------------------
    // Matter case documents (RLS tenant isolated)
    // ----------------------------------------------------
    if ((scope === 'MATTER_DOCUMENTS' || scope === 'HYBRID') && matterId && userId) {
      const queryEmbedding = await this.generateEmbedding(query);
      const { data: privateChunks, error: privError } = await this.supabase.rpc('match_matter_documents', {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount,
        filter_matter_id: matterId,
        filter_user_id: userId,
      });

      if (!privError && privateChunks) {
        for (const item of privateChunks) {
          citations.push({
            id: item.id,
            authorityTitle: item.document_title || 'User Exhibit/Document',
            citation: `Matter File: Page ${item.page_number || 1}`,
            jurisdiction,
            sourceUrl: null,
            chunkText: item.content,
            similarityScore: parseFloat(item.similarity.toFixed(4)),
            sourceType: 'SOURCE_USER',
            metadata: { matterId, documentId: item.document_id },
          });
        }
      }
    }

    citations.sort((a, b) => b.similarityScore - a.similarityScore);
    const topCitations = citations.slice(0, matchCount);
    const topScore = topCitations.length > 0 ? topCitations[0].similarityScore : 0;
    const confidenceScore = parseFloat(Math.min(1, Math.max(0, topScore)).toFixed(4));

    return {
      query,
      jurisdiction,
      citations: topCitations,
      confidenceScore,
      disclaimer: this.UPL_DISCLAIMER,
    };
  }
}
