# Supabase → Hugging Face Fine-Tuning Pipeline

Corrected, deployable implementation of the training data → HF Dataset → LoRA/AutoTrain → status callback flow.

## Architecture

```
Supabase (training_records)
    ↓ Edge Function: export-and-sync-hf
Hugging Face Dataset Hub
    ↓ Edge Function: trigger-finetune  OR  scripts/train_lora.py (GPU)
Hugging Face Model Hub (LoRA adapter)
    ↓ Edge Function: check-job-status (poll / callback)
Supabase (fine_tuning_jobs.status + metrics)
```

## Files

| Path | Purpose |
|------|--------|
| `supabase/migrations/20261002220000_fine_tuning_pipeline.sql` | Tables + RLS + updated_at trigger |
| `supabase/functions/_shared/auth.ts` | Auth guard + env helper |
| `supabase/functions/export-and-sync-hf/` | Export approved rows → HF dataset |
| `supabase/functions/trigger-finetune/` | Start job + insert `fine_tuning_jobs` row |
| `supabase/functions/check-job-status/` | Poll AutoTrain or accept GPU callbacks |
| `scripts/train_lora.py` | Local/cloud GPU LoRA training |
| `scripts/requirements-finetune.txt` | Python deps for GPU path |

## Deploy

### 1. Migration

```bash
supabase db push
# or: supabase migration up
```

### 2. Secrets

```bash
supabase secrets set \
  HUGGING_FACE_ACCESS_TOKEN=hf_xxx \
  HF_ORG=your-org \
  EDGE_FUNCTION_SHARED_SECRET=$(openssl rand -hex 32)
```

Use a **fine-grained** HF token with write access only to your org's dataset + model repos.

### 3. Edge Functions

```bash
supabase functions deploy export-and-sync-hf
supabase functions deploy trigger-finetune
supabase functions deploy check-job-status
```

### 4. Schedule status polling (optional)

In Supabase Dashboard → Edge Functions → Schedules, or via cron hitting:

```bash
curl -X POST "$SUPABASE_URL/functions/v1/check-job-status" \
  -H "Authorization: Bearer $EDGE_FUNCTION_SHARED_SECRET"
```

Every 5 minutes is reasonable.

## Usage

### Seed some training data

```sql
INSERT INTO public.training_records (prompt, completion, label_quality) VALUES
  ('What is a motion to dismiss?', 'A motion to dismiss asks the court to throw out a claim...', 'approved'),
  ('Explain burden of proof.', 'The burden of proof is the obligation to prove allegations...', 'approved');
```

### Export → HF Dataset

```bash
curl -X POST "$SUPABASE_URL/functions/v1/export-and-sync-hf" \
  -H "Authorization: Bearer $EDGE_FUNCTION_SHARED_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Response includes `exportRecord.id`.

### Trigger fine-tune (AutoTrain attempt)

```bash
curl -X POST "$SUPABASE_URL/functions/v1/trigger-finetune" \
  -H "Authorization: Bearer $EDGE_FUNCTION_SHARED_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "datasetExportId": "<export-uuid>",
    "baseModel": "meta-llama/Llama-3.2-3B-Instruct",
    "targetModelRepo": "your-org/llama-legal-finetuned"
  }'
```

### GPU path (recommended for production control)

```bash
pip install -r scripts/requirements-finetune.txt

export HUGGING_FACE_ACCESS_TOKEN=hf_xxx
export DATASET_REPO=your-org/dataset-legal-v1
export BASE_MODEL=meta-llama/Llama-3.2-3B-Instruct
export OUTPUT_REPO=your-org/llama-legal-finetuned
export SUPABASE_URL=https://xxxx.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJ...
export FINE_TUNING_JOB_ID=<uuid from trigger-finetune response>

python scripts/train_lora.py
```

On completion the script POSTs status to `check-job-status`.

## Corrections vs original design

1. **HF upload API** — uses `/api/datasets/{repo}/commit/{revision}` NDJSON, not a non-existent `/upload/main/{file}`.
2. **`training_records` table** — added (was missing).
3. **SFT formatting** — maps instruction+response into a single `text` field so the model sees completions.
4. **No HF webhooks** — status via polling Edge Function + optional GPU callback.
5. **Auth on all Edge Functions** — shared secret or service role bearer required.
6. **Job row always created** on trigger so status updates have a target.
7. **Modern 4-bit load** — `BitsAndBytesConfig` instead of deprecated `load_in_4bit=True`.

## Security notes

- Tables have RLS enabled with **no public policies** (service role only).
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to browsers.
- Prefer `EDGE_FUNCTION_SHARED_SECRET` for machine-to-machine calls.
