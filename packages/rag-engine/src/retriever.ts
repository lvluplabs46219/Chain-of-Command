import { z } from 'zod';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
  metadata: z.record(z.unknown()).optional(),
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

  /**
   * Generates dense embedding vector using OpenAI text-embedding-3-small (1536 dims)
   */
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

  /**
   * Performs pgvector cosine distance search across legal authorities and/or private matter documents
   */
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

    // Validate matter-isolation requirements for private searches
    if ((scope === 'MATTER_DOCUMENTS' || scope === 'HYBRID') && (!matterId || !userId)) {
      throw new Error('matterId and userId are strictly required when searching private case documents');
    }

    const queryEmbedding = await this.generateEmbedding(query);
    const citations: LegalCitation[] = [];

    // ----------------------------------------------------
    // Search 1: Public Legal Corpus (Statutes, Rules, Opinions)
    // Cosine similarity formula: 1 - (embedding <=> queryEmbedding)
    // ----------------------------------------------------
    if (scope === 'PUBLIC_LAW' || scope === 'HYBRID') {
      const { data: publicChunks, error: pubError } = await this.supabase.rpc('match_legal_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount,
        filter_jurisdiction: jurisdiction,
      });

      if (pubError) {
        // Direct SQL fallback if RPC function is not yet migrated
        const { data: rawPublic, error: rawPubErr } = await this.supabase
          .from('legal_chunks')
          .select((`
            id,
            chunk_text,
            authority_id,
            1 - (embedding <=> '${JSON.stringify(queryEmbedding)}') as similarity,
            authorities!inner (
              title,
              citation,
              jurisdiction,
              source_url
            )
          ` as any))
          .eq('authorities.jurisdiction', jurisdiction)
          .order('similarity', { ascending: false })
          .limit(matchCount);

        if (rawPubErr) throw rawPubErr;

        if (rawPublic) {
          for (const item of (rawPublic as any[])) {
            const sim = (item as any).similarity;
            if (sim >= matchThreshold) {
              const auth = (item as any).authorities;
              citations.push({
                id: item.id,
                authorityTitle: auth?.title || 'Unknown Authority',
                citation: auth?.citation || 'No Citation',
                jurisdiction: auth?.jurisdiction || jurisdiction,
                sourceUrl: auth?.source_url || null,
                chunkText: item.chunk_text,
                similarityScore: parseFloat(sim.toFixed(4)),
                sourceType: 'SOURCE_PUBLIC',
              });
            }
          }
        }
      } else if (publicChunks) {
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
      }
    }

    // ----------------------------------------------------
    // Search 2: Matter Case Documents (RLS Tenant Isolated)
    // ----------------------------------------------------
    if ((scope === 'MATTER_DOCUMENTS' || scope === 'HYBRID') && matterId && userId) {
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

    // Sort combined citations by similarity descending
    citations.sort((a, b) => b.similarityScore - a.similarityScore);
    const topCitations = citations.slice(0, matchCount);

    // Compute empirical confidence from the highest matching similarity score
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
