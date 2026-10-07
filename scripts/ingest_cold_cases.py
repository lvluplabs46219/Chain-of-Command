import argparse
import datetime
import os
from dotenv import load_dotenv
from datasets import load_dataset
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
DEFAULT_SCHEMA = os.getenv("SUPABASE_SCHEMA", "public")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY/SUPABASE_SERVICE_ROLE_KEY in .env file.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def sanitize_for_json(data):
    """Recursively converts datetime/date objects to ISO strings for JSON serialization."""
    if isinstance(data, (datetime.date, datetime.datetime)):
        return data.isoformat()
    if isinstance(data, dict):
        return {k: sanitize_for_json(v) for k, v in data.items()}
    if isinstance(data, list):
        return [sanitize_for_json(v) for v in data]
    return data


def ingest_cold_cases(dataset_name: str, batch_size: int, schema_name: str):
    dataset = load_dataset(dataset_name, split="train")

    table_ref = (
        supabase.schema(schema_name).table("cold_cases_ingestion")
        if schema_name != "public"
        else supabase.table("cold_cases_ingestion")
    )

    batch = []
    for row in dataset:
        batch.append(dict(row))
        if len(batch) >= batch_size:
            sanitized_batch = sanitize_for_json(batch)
            table_ref.insert(sanitized_batch).execute()
            batch = []

    if batch:
        sanitized_batch = sanitize_for_json(batch)
        table_ref.insert(sanitized_batch).execute()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest cold cases dataset into Supabase.")
    parser.add_argument(
        "--dataset",
        type=str,
        default="harvard-lil/cold-cases",
        help="Hugging Face dataset path (default: harvard-lil/cold-cases)",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=1000,
        help="Batch size for database inserts (default: 1000)",
    )
    parser.add_argument(
        "--schema",
        type=str,
        default=DEFAULT_SCHEMA,
        help="Supabase schema (default: SUPABASE_SCHEMA env var or public)",
    )

    args = parser.parse_args()
    ingest_cold_cases(
        dataset_name=args.dataset,
        batch_size=args.batch_size,
        schema_name=args.schema,
    )
