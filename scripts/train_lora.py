#!/usr/bin/env python3
"""LoRA SFT on a JSONL chat dataset, then optional push to HF.

Requires a CUDA GPU. For CPU-only machines use Ollama Modelfile create instead:
  ./scripts/ollama_create_coc.sh

Env:
  DATASET_PATH   path to JSONL (default data/training/legal_seed.jsonl)
  BASE_MODEL     HF model id (default meta-llama/Llama-3.2-3B-Instruct)
  OUTPUT_DIR     local adapter dir (default ./outputs/coc-lora)
  OUTPUT_REPO    optional HF repo to push adapter
  HUGGING_FACE_ACCESS_TOKEN  required only if pushing or gated base model
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

def main() -> int:
    try:
        import torch
    except ImportError:
        print("torch not installed. pip install -r scripts/requirements-finetune.txt", file=sys.stderr)
        return 1

    if not torch.cuda.is_available():
        print(
            "No CUDA GPU detected. Use Ollama Modelfile path instead:\n"
            "  ./scripts/ollama_create_coc.sh\n"
            "Or run this script on a GPU host / cloud instance.",
            file=sys.stderr,
        )
        return 2

    from datasets import load_dataset
    from peft import LoraConfig
    from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
    from trl import SFTTrainer, SFTConfig

    dataset_path = os.environ.get("DATASET_PATH", "data/training/legal_seed.jsonl")
    base_model = os.environ.get("BASE_MODEL", "meta-llama/Llama-3.2-3B-Instruct")
    output_dir = os.environ.get("OUTPUT_DIR", "./outputs/coc-lora")
    output_repo = os.environ.get("OUTPUT_REPO")
    token = os.environ.get("HUGGING_FACE_ACCESS_TOKEN") or os.environ.get("HF_TOKEN")

    path = Path(dataset_path)
    if not path.exists():
        print(f"Dataset not found: {path}", file=sys.stderr)
        return 1

    def to_text(example):
        msgs = example.get("messages") or []
        lines = []
        for m in msgs:
            role = m.get("role", "user")
            content = m.get("content", "")
            lines.append(f"<|{role}|>\n{content}")
        return {"text": "\n".join(lines)}

    ds = load_dataset("json", data_files=str(path), split="train")
    ds = ds.map(to_text)

    bnb = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16,
    )
    model = AutoModelForCausalLM.from_pretrained(
        base_model,
        quantization_config=bnb,
        device_map="auto",
        token=token,
    )
    tokenizer = AutoTokenizer.from_pretrained(base_model, token=token)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    peft_config = LoraConfig(
        r=16,
        lora_alpha=32,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    )

    args = SFTConfig(
        output_dir=output_dir,
        num_train_epochs=1,
        per_device_train_batch_size=1,
        gradient_accumulation_steps=8,
        learning_rate=2e-4,
        logging_steps=5,
        save_strategy="epoch",
        bf16=True,
        dataset_text_field="text",
        max_seq_length=2048,
        report_to=[],
    )

    trainer = SFTTrainer(
        model=model,
        args=args,
        train_dataset=ds,
        peft_config=peft_config,
        processing_class=tokenizer,
    )
    trainer.train()
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)
    print(f"Saved adapter to {output_dir}")

    if output_repo and token:
        from huggingface_hub import HfApi
        api = HfApi(token=token)
        api.create_repo(output_repo, exist_ok=True, private=True)
        api.upload_folder(folder_path=output_dir, repo_id=output_repo)
        print(f"Pushed to {output_repo}")

    return 0

if __name__ == "__main__":
    raise SystemExit(main())
