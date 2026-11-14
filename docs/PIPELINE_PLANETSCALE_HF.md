# Pipeline: PlanetScale Postgres + Hugging Face buckets

Corpus, vectors, and `training_records` live on **PlanetScale Postgres** (`DATABASE_URL`).  
Training artifacts and bulk court files use **Hugging Face S3-compatible buckets** + optional **HF Dataset Hub**.

**Never commit credentials.** Use Infisical / deployment secrets only.

## Environment

```bash
# PlanetScale (primary store)
DATABASE_URL=postgresql://USER:PASS@HOST:5432/postgres?sslmode=verify-full

# Embeddings
OPENAI_API_KEY=...
OPENAI_EMBED_MODEL=text-embedding-3-small

# HF Dataset Hub (LoRA / SFT export)
HF_TOKEN=hf_...
HF_DATASET_REPO=your-org/coc-legal-sft
OUTPUT_REPO=your-org/coc-legal-lora   # train_lora.py push target

# HF S3-compatible buckets (raw files / JSONL mirrors)
HF_S3_ACCESS_KEY=...
HF_S3_SECRET_KEY=...
HF_S3_ENDPOINT=https://s3.hf.co/your-namespace
HF_S3_BUCKET=courtlistner
HF_S3_REGION=us-east-1
```

If a password was ever pasted into chat or a ticket: **rotate it** in PlanetScale before use.

## Schema

```bash
psql "$DATABASE_URL" -f docs/sql/planetscale_legal_corpus.sql
```

## Ingest (parse → embed → PlanetScale)

```bash
export DATABASE_URL=...   # from Infisical
export OPENAI_API_KEY=...
pip install 'psycopg[binary]'
python scripts/ingest_legal_corpus.py --seed
```

Backend log line should read: `ingest backend=planetscale_postgres`.

## RAG search

- Runtime: set `DATABASE_URL` so `packages/db` and `packages/rag-engine/src/postgresSearch.ts` hit PlanetScale.
- Hybrid: embedding `<=>` + `ts_rank` (or `hybrid_legal_search` if you install that function).

## Training export → HF

```bash
# Local seed + optional approved DB rows → JSONL + Hub + bucket
python scripts/export_training_to_hf.py --jsonl data/training/legal_seed.jsonl --push-hub --mirror-bucket
python scripts/export_training_to_hf.py --from-db --push-hub --mirror-bucket

# LoRA on GPU
export DATASET_PATH=outputs/training_exports/legal_training_*.jsonl
export BASE_MODEL=meta-llama/Llama-3.2-3B-Instruct
export OUTPUT_REPO=your-org/coc-legal-lora
python scripts/train_lora.py
```

Only `label_quality = 'approved'` rows are loaded with `--from-db`.

## End-to-end flow

```text
Primary sources
  → ingest_legal_corpus.py (section parse + embed)
  → PlanetScale public.legal_corpus
  → postgresSearch / hybrid retrieve
  → model + ClaimObject grounding

Approved Q/A
  → training_records (PlanetScale) and/or legal_seed.jsonl
  → export_training_to_hf.py
  → HF Dataset Hub + HF S3 bucket mirror
  → train_lora.py → HF model repo (adapter)
```

Supabase remains optional for **Auth / Edge** only; it is not required for corpus or training storage on this path.
