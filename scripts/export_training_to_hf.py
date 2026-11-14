#!/usr/bin/env python3
"""
Export approved training JSONL to Hugging Face Dataset Hub and/or HF S3 bucket.

Reads:
  - local JSONL (default data/training/legal_seed.jsonl), and/or
  - PlanetScale training_records WHERE label_quality = 'approved' (DATABASE_URL)

Writes:
  - HF Dataset repo via huggingface_hub (HF_TOKEN + HF_DATASET_REPO)
  - optional mirror object to HF S3 bucket (HF_S3_* env)

Never commit tokens. Load from Infisical / shell env only.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path


def env(name: str, *alts: str) -> str:
    for key in (name, *alts):
        val = os.environ.get(key, "").strip()
        if val:
            return val
    return ""


def load_jsonl(path: Path) -> list[dict]:
    rows: list[dict] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        rows.append(json.loads(line))
    return rows


def load_approved_from_postgres(database_url: str) -> list[dict]:
    try:
        import psycopg
    except ImportError as e:
        raise SystemExit("pip install 'psycopg[binary]'") from e

    sql = """
    SELECT prompt, completion, COALESCE(jurisdiction, '') AS jurisdiction
    FROM public.training_records
    WHERE label_quality = 'approved'
    ORDER BY created_at NULLS LAST, id
    """
    rows: list[dict] = []
    with psycopg.connect(database_url) as conn:
        with conn.cursor() as cur:
            try:
                cur.execute(sql)
            except Exception as e:
                raise SystemExit(
                    f"training_records query failed (migrate table first): {e}"
                ) from e
            for prompt, completion, jurisdiction in cur.fetchall():
                system = (
                    "You are a careful U.S. legal research assistant. "
                    "You provide accurate, source-grounded information. "
                    "You never claim to be an attorney, never draft filings that could be submitted, "
                    "and always note when information is not verified or is jurisdiction-specific."
                )
                if jurisdiction:
                    system += f" Jurisdiction context: {jurisdiction}."
                rows.append(
                    {
                        "messages": [
                            {"role": "system", "content": system},
                            {"role": "user", "content": prompt},
                            {"role": "assistant", "content": completion},
                        ]
                    }
                )
    return rows


def push_dataset(rows: list[dict], repo_id: str, token: str) -> str:
    from datasets import Dataset
    from huggingface_hub import login

    login(token=token)
    ds = Dataset.from_list(rows)
    ds.push_to_hub(repo_id, token=token)
    return repo_id


def mirror_to_hf_s3(local_path: Path, key: str) -> None:
    """Optional: boto3 put to HF S3-compatible endpoint."""
    access = env("HF_S3_ACCESS_KEY")
    secret = env("HF_S3_SECRET_KEY")
    if not access or not secret:
        print("HF_S3_* not set — skip bucket mirror")
        return
    try:
        import boto3
    except ImportError as e:
        raise SystemExit("pip install boto3 for HF S3 mirror") from e

    endpoint = env("HF_S3_ENDPOINT") or "https://s3.hf.co"
    bucket = env("HF_S3_BUCKET") or "courtlistner"
    region = env("HF_S3_REGION") or "us-east-1"
    client = boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access,
        aws_secret_access_key=secret,
        region_name=region,
    )
    client.upload_file(str(local_path), bucket, key)
    print(f"mirrored s3://{bucket}/{key}")


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--jsonl",
        type=Path,
        default=root / "data" / "training" / "legal_seed.jsonl",
    )
    parser.add_argument(
        "--from-db",
        action="store_true",
        help="Load approved rows from DATABASE_URL training_records",
    )
    parser.add_argument(
        "--push-hub",
        action="store_true",
        help="Push to HF Dataset repo (HF_TOKEN + HF_DATASET_REPO)",
    )
    parser.add_argument(
        "--mirror-bucket",
        action="store_true",
        help="Also upload JSONL to HF S3 bucket",
    )
    args = parser.parse_args()

    rows: list[dict] = []
    if args.from_db:
        db_url = env("DATABASE_URL", "PLANETSCALE_DATABASE_URL")
        if not db_url:
            raise SystemExit("DATABASE_URL required for --from-db")
        rows.extend(load_approved_from_postgres(db_url))
        print(f"from_db approved={len(rows)}")
    if args.jsonl.exists():
        local = load_jsonl(args.jsonl)
        rows.extend(local)
        print(f"from_jsonl={len(local)} path={args.jsonl}")
    if not rows:
        raise SystemExit("No training rows to export")

    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out_dir = root / "outputs" / "training_exports"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"legal_training_{stamp}.jsonl"
    with out_path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")
    print(f"wrote {out_path} lines={len(rows)}")

    if args.push_hub:
        token = env("HF_TOKEN", "HUGGING_FACE_ACCESS_TOKEN")
        repo = env("HF_DATASET_REPO")
        if not token or not repo:
            raise SystemExit("HF_TOKEN and HF_DATASET_REPO required for --push-hub")
        pushed = push_dataset(rows, repo, token)
        print(f"pushed dataset {pushed}")

    if args.mirror_bucket:
        key = env("HF_TRAINING_PREFIX") or f"training/{out_path.name}"
        mirror_to_hf_s3(out_path, key)


if __name__ == "__main__":
    main()
