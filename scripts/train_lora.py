#!/usr/bin/env python3
"""
LoRA / QLoRA fine-tune from a Hugging Face dataset (synced from Supabase).
Pushes the adapter to HF Hub and optionally callbacks Supabase on completion.

Usage:
  export HUGGING_FACE_ACCESS_TOKEN=hf_...
  export DATASET_REPO=your-org/dataset-legal-v1
  export BASE_MODEL=meta-llama/Llama-3.2-3B-Instruct
  export OUTPUT_REPO=your-org/llama-legal-finetuned
  # optional callback:
  export SUPABASE_URL=https://xxx.supabase.co
  export SUPABASE_SERVICE_ROLE_KEY=eyJ...
  export FINE_TUNING_JOB_ID=<uuid from fine_tuning_jobs>

  python scripts/train_lora.py
"""

from __future__ import annotations

import os
import sys
from typing import Any

import requests
from datasets import load_dataset
from peft import LoraConfig
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
)
from trl import SFTTrainer


def env(name: str, default: str | None = None) -> str:
    v = os.getenv(name, default)
    if not v:
        print(f"Missing required env: {name}", file=sys.stderr)
        sys.exit(1)
    return v


def format_row(row: dict[str, Any]) -> dict[str, str]:
    instruction = row.get("instruction") or row.get("prompt") or ""
    response = row.get("response") or row.get("completion") or ""
    text = (
        f"### Instruction:\n{instruction}\n\n"
        f"### Response:\n{response}"
    )
    return {"text": text}


def callback_supabase(
    status: str,
    metrics: dict | None = None,
    error: str | None = None,
) -> None:
    job_id = os.getenv("FINE_TUNING_JOB_ID")
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not (job_id and url and key):
        return

    # Prefer the Edge Function if deployed; fall back to direct table update via REST
    fn_url = f"{url.rstrip('/')}/functions/v1/check-job-status"
    try:
        requests.post(
            fn_url,
            headers={
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
            },
            json={
                "jobId": job_id,
                "status": status,
                "metrics": metrics,
                "error": error,
            },
            timeout=30,
        )
    except Exception as e:
        print(f"[warn] status callback failed: {e}", file=sys.stderr)


def main() -> None:
    dataset_repo = env("DATASET_REPO")
    base_model = env("BASE_MODEL", "meta-llama/Llama-3.2-3B-Instruct")
    output_repo = env("OUTPUT_REPO")
    hf_token = env("HUGGING_FACE_ACCESS_TOKEN")

    print(f"Loading dataset {dataset_repo} ...")
    dataset = load_dataset(dataset_repo, split="train")
    dataset = dataset.map(format_row)

    quant = BitsAndBytesConfig(load_in_4bit=True)
    model = AutoModelForCausalLM.from_pretrained(
        base_model,
        quantization_config=quant,
        device_map="auto",
        token=hf_token,
    )
    tokenizer = AutoTokenizer.from_pretrained(base_model, token=hf_token)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    lora_config = LoraConfig(
        r=16,
        lora_alpha=32,
        target_modules=["q_proj", "v_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
    )

    args = TrainingArguments(
        output_dir="./results",
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,
        learning_rate=2e-4,
        num_train_epochs=3,
        logging_steps=10,
        save_strategy="epoch",
        push_to_hub=True,
        hub_model_id=output_repo,
        hub_token=hf_token,
        report_to="none",
    )

    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        peft_config=lora_config,
        args=args,
        processing_class=tokenizer,
        # Formatted text field
        # (trl versions differ: dataset_text_field vs formatting_func)
    )

    # Compatibility: set text field when supported
    if hasattr(trainer, "dataset_text_field"):
        trainer.dataset_text_field = "text"

    callback_supabase("training")
    try:
        train_result = trainer.train()
        trainer.push_to_hub()
        metrics = {
            "train_loss": getattr(train_result, "training_loss", None),
            "metrics": getattr(train_result, "metrics", {}),
        }
        callback_supabase("completed", metrics=metrics)
        print(f"Done. Model pushed to {output_repo}")
    except Exception as e:
        callback_supabase("failed", error=str(e))
        raise


if __name__ == "__main__":
    main()
