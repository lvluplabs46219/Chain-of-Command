# Law Library — Hybrid Legal Search (Supabase)

Educational tool only. Not a substitute for a licensed attorney or commercial databases for court filing authority.

## Pipeline (shipped)

```
Ingest (scripts/ingest_legal_corpus.py --seed)
  → section/holding chunks + text-embedding-3-small (1536)
  → public.legal_corpus

UI /library → searchLegalCorpus(query, jurisdiction)
  → hybrid_legal_search top-20 (or lexical fallback)
  → Cohere rerank → top-5 (optional COHERE_API_KEY)
  → Volume cards + citation chips + Open Volume reader

Agent answers → searchAndGroundAnswer / groundAnswer
  → packages/legal-library grounding guard
```

## Files

| Piece | Path |
|-------|------|
| Migration (hybrid + lexical RPCs) | `supabase/migrations/20261028223000_legal_corpus_hybrid_search.sql` |
| Python ingest + chunking + CourtListener | `scripts/ingest_legal_corpus.py` |
| Node JSONL ingest (legacy) | `scripts/ingest-legal-corpus.mjs` |
| Seed CA PC + FRCP | `data/legal_corpus/seed_ca_pc_frcp.jsonl` |
| Server actions | `apps/web/src/app/actions/legal-search.ts` |
| Library UI | `apps/web/src/app/library/` |
| Grounding | `packages/legal-library/src/ground-answer.ts` |
| Design | `docs/design/DIRECTION.md`, Candy tokens |

## Run ingest locally

```bash
cd ~/Development/Repos/Chain-of-Command
export OPENAI_API_KEY=...
export SUPABASE_URL=...          # or NEXT_PUBLIC_SUPABASE_URL
export SUPABASE_SERVICE_ROLE_KEY=...

python3 scripts/ingest_legal_corpus.py --seed

# Optional opinions
export COURTLISTENER_TOKEN=...
python3 scripts/ingest_legal_corpus.py --courtlistener --query "search and seizure" --pages 2
```

## Search API (server action)

```ts
import { searchLegalCorpus, searchAndGroundAnswer } from '@/app/actions/legal-search'

const hits = await searchLegalCorpus('PC 1538.5', 'CA')
// hits.results length ≤ 5 after rerank

const grounded = await searchAndGroundAnswer(
  'suppression motion',
  'Under Cal. Penal Code § 1538.5 a defendant may move to suppress...',
  'CA',
)
```

## Env

| Variable | Role |
|----------|------|
| `OPENAI_API_KEY` | Embeddings (hybrid mode) |
| `SUPABASE_URL` / service role | Corpus read/write |
| `COHERE_API_KEY` | Optional rerank; without it top-5 from hybrid order |
| `COURTLISTENER_TOKEN` | Optional opinion pull |

## UI

Open **`/library`** after `pnpm dev` in `apps/web`. Candy tokens only — no ad-hoc palette.
