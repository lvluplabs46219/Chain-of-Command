# Law Library — Hybrid Legal Search (Supabase)

**Goal:** Make `/library` a reading-room surface backed by retrieval that approaches LexisNexis-class *search quality* for pro se and internal agents — not a full commercial reporter license.

Educational tool only. Not a substitute for a licensed attorney or licensed commercial databases for court filing authority.

## What already exists

| Layer | Location | Status |
|-------|----------|--------|
| Design doctrine (places + Candy) | `docs/design/DIRECTION.md`, `docs/design/DESIGN.md` | Authoritative |
| Candy tokens | `packages/shared/src/candy-tokens.css` | Single source |
| Corpus table + hybrid RPC | `supabase/migrations/20261028223000_legal_corpus_hybrid_search.sql` | Applied |
| Citation / grounding helpers | `packages/legal-library` | Present |
| Retriever service | `packages/rag-engine/src/retriever.ts` | Needs RPC name alignment |
| Search client | `packages/rag-engine/src/supabaseSearch.ts` | **Uses `hybrid_legal_search` + `lexical_legal_search`** |

### Schema (summary)

- `public.legal_corpus` — jurisdiction, source_type, citation, title, content, `embedding vector(1536)`, generated `fts`
- Indexes: HNSW on embedding, GIN on fts, jurisdiction
- RLS: public **read** for anon/authenticated; no client writes
- RPCs:
  - `hybrid_legal_search(query_text, query_embedding, match_threshold, match_count, filter_jurisdiction)`
  - `lexical_legal_search(query_text, match_count, filter_jurisdiction)` — citation/keyword path without embeddings

## Architecture (Lexis-class pipeline)

```
User query (Law Library UI)
    → embed (text-embedding-3-small, 1536)
    → hybrid_legal_search (0.7 dense + 0.3 FTS)
    → optional rerank (Cohere / cross-encoder)
    → top-k passages into LLM with strict "cite only provided context"
    → packages/legal-library grounding-guard validates citations
```

Lexical path for exact citations (`PC 1538.5`, `Brady v. Maryland`) uses `lexical_legal_search` first or in parallel.

## What still must be built to rival commercial search *in practice*

1. **Corpus ingestion (critical)**  
   Empty table ⇒ empty library. Ingest:
   - CA Penal Code / Evidence Code (official or public-domain consolidations)
   - Federal Rules of Criminal Procedure
   - Selected CourtListener opinions for target jurisdictions  
   Script target: `scripts/ingest_legal_corpus.py` (embed + upsert on `(jurisdiction, citation)`).

2. **Chunking strategy**  
   Prefer section-level statutes and holding-sized opinion chunks (not whole documents). Store parent citation on every row.

3. **Rerank stage**  
   After hybrid top-20, rerank to top-5 before synthesis.

4. **UI place**  
   Route `/library` under Candy tokens: Search the Stacks, Volume cards, Open Volume reader, Research Brief with verified citation chips only.

5. **Agent contract**  
   Every in-app agent answer that cites law must pass `packages/legal-library` grounding; unresolved cites are stripped or flagged.

## Quick test (SQL)

After corpus has rows with embeddings:

```sql
-- Lexical smoke test
select citation, title, fts_rank
from lexical_legal_search('1538.5', 5, 'CA');
```

## Governance

- In-app agents only (apps/api, packages/rag-engine, packages/legal-library).
- Out-of-app DevOps agents in `agent/` must not use production service role against user matters; corpus read is public legal text only.
- Candy theme only — no one-off library color schemes (`docs/design/DIRECTION.md`).
