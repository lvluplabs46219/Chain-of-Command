# Chain of Command — Ollama Local + Cloud Training Path

## Reality check

| Path | What it does | Needs GPU? |
|------|----------------|------------|
| **Ollama Modelfile** (`ollama create`) | Bakes system prompt + params onto a base model | No |
| **LoRA / full SFT** (`scripts/train_lora.py`) | Trains weight adapters on chat JSONL | Yes (CUDA) |
| **Ollama cloud models** (`*:cloud`) | Runs hosted models via ollama.com | No (account) |

This machine has **no NVIDIA GPU**, so weight fine-tuning must run on a cloud GPU host. Local customization uses the Modelfile path.

## 1. Local model (done / repeatable)

```bash
./scripts/ollama_create_coc.sh
ollama run chain-of-command "Explain burden of proof in a criminal case."
```

- Modelfile: `modelfiles/chain-of-command/Modelfile`
- System rules: derived from `docs/GEMINI.md`
- Base model: `llama3.2:latest`

Point the API gateway at it:

```bash
export LLM_DEFAULT_PROVIDER=ollama
export OLLAMA_HOST=http://127.0.0.1:11434
# model name used by clients: chain-of-command
```

## 2. Grow the training set

Append chat examples to:

```
data/training/legal_seed.jsonl
```

Each line is JSON:

```json
{"messages":[{"role":"system","content":"..."},{"role":"user","content":"..."},{"role":"assistant","content":"..."}]}
```

Only use **approved** factual completions. Prefer jurisdiction-tagged examples (AZ, CA, federal, etc.).

## 3. Cloud Ollama models already pulled

```text
nemotron-3-nano:30b-cloud
nemotron-3-super:cloud
nemotron-3-ultra:cloud
```

Use for heavy reasoning while the local `chain-of-command` model handles day-to-day workspace traffic.

```bash
ollama run nemotron-3-nano:30b-cloud "Summarize Arizona Rule of Criminal Procedure 16 disclosure duties in plain English."
```

Requires `ollama signin` when the cloud session expires.

## 4. True LoRA fine-tune (GPU host)

On a machine with CUDA:

```bash
pip install -r scripts/requirements-finetune.txt
export DATASET_PATH=data/training/legal_seed.jsonl
export BASE_MODEL=meta-llama/Llama-3.2-3B-Instruct
export OUTPUT_DIR=./outputs/coc-lora
export HUGGING_FACE_ACCESS_TOKEN=hf_xxx   # if gated model or push
python scripts/train_lora.py
```

Then convert/export the adapter to GGUF (or merge) and import with a new Modelfile `FROM` that adapter, or keep serving via transformers and put a proxy in front of the API.

## 5. Supabase → HF pipeline (documented separately)

See `docs/FINE_TUNING_PIPELINE.md` for training_records → dataset export → job status. Edge function code may still need to be restored/deployed if missing from the tree.

## Smoke test

```bash
./scripts/ollama_smoke_test.sh chain-of-command
```

Expect refusal to file motions and plain-language legal information with citations or explicit "not verified" language.
