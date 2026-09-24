"""
Harvard Library Innovation Lab (LIL) Caselaw Access Project ("Cold Cases") Loader & Ingestion Tool
Dataset: harvard-lil/cold-cases (Hugging Face Datasets)
"""

import os
import sys
import json
import argparse
from datetime import datetime

try:
    from datasets import load_dataset
except ImportError:
    load_dataset = None

try:
    import psycopg2
    from psycopg2.extras import Json
except ImportError:
    psycopg2 = None

def get_database_url():
    url = os.environ.get("DATABASE_URL")
    if url:
        return url
    root_env = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
    if os.path.exists(root_env):
        with open(root_env, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("DATABASE_URL="):
                    val = line.split("=", 1)[1].strip()
                    if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                        val = val[1:-1]
                    return val
    return None

DATABASE_URL = get_database_url()

def check_dependencies(needs_db=False):
    missing = []
    if load_dataset is None:
        missing.append("datasets")
    if needs_db and psycopg2 is None:
        missing.append("psycopg2-binary")
    
    if missing:
        print("[-] Required Python package(s) missing:")
        for pkg in missing:
            print(f"    - {pkg}")
        print(f"\n[!] Please install them using pip:\n    pip install {' '.join(missing)}\n")
        sys.exit(1)

def preview_dataset(limit=5, jurisdiction=None, court=None):
    """
    Stream and preview records from harvard-lil/cold-cases without downloading the entire multi-gigabyte dataset.
    """
    check_dependencies(needs_db=False)

    print("=" * 70)
    print("  HARVARD LIL 'COLD CASES' DATASET EXPLORER")
    print("=" * 70)
    print(f"[*] Connecting to Hugging Face dataset: harvard-lil/cold-cases (streaming=True)")
    if jurisdiction:
        print(f"[*] Filtering by jurisdiction: {jurisdiction}")
    if court:
        print(f"[*] Filtering by court: {court}")
    print("-" * 70)

    ds = load_dataset("harvard-lil/cold-cases", split="train", streaming=True)
    
    count = 0
    for record in ds:
        rec_jurisdiction = record.get("court_jurisdiction") or ""
        rec_court = record.get("court_short_name") or record.get("court_full_name") or ""
        
        if jurisdiction and jurisdiction.lower() not in rec_jurisdiction.lower():
            continue
        if court and court.lower() not in rec_court.lower():
            continue

        count += 1
        case_name = record.get("case_name") or record.get("case_name_short") or "Untitled Case"
        date_filed = record.get("date_filed") or "Unknown"
        citations = record.get("citations") or []
        opinions = record.get("opinions") or []
        court_full = record.get("court_full_name") or record.get("court_short_name") or "Unknown Court"
        
        print(f"\n[Case #{count}] ID: {record.get('id')}")
        print(f"  Title:        {case_name}")
        print(f"  Court:        {court_full} ({rec_jurisdiction})")
        print(f"  Date Filed:   {date_filed}")
        print(f"  Citations:    {', '.join(citations) if citations else 'N/A'}")
        print(f"  Judges:       {record.get('judges') or 'N/A'}")
        print(f"  Opinions:     {len(opinions)} opinion(s) attached")
        
        if opinions:
            op = opinions[0]
            op_author = op.get("author") or "Court"
            op_type = op.get("type") or "majority"
            op_text = op.get("text") or ""
            snippet = op_text[:200].replace("\n", " ").strip()
            print(f"  Lead Opinion: [{op_type.upper()}] by {op_author}")
            print(f"  Excerpt:      \"{snippet}...\"")
            
        if count >= limit:
            break

    print("\n" + "=" * 70)
    print(f"[+] Preview complete ({count} cases inspected).")
    print("=" * 70)


def ingest_to_postgres(limit=10, jurisdiction=None):
    """
    Ingest streaming records from harvard-lil/cold-cases into Supabase PostgreSQL.
    """
    check_dependencies(needs_db=True)
    
    if not DATABASE_URL:
        print("[-]SUPABASE_URL
is not set. Please set it in your environment or .env file.")
        sys.exit(1)

    print("=" * 70)
    print("  HARVARD LIL 'COLD CASES' -> POSTGRESQL INGESTION")
    print("=" * 70)
    
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    ds = load_dataset("harvard-lil/cold-cases", split="train", streaming=True)
    count = 0
    
    for record in ds:
        rec_jurisdiction = record.get("court_jurisdiction") or ""
        if jurisdiction and jurisdiction.lower() not in rec_jurisdiction.lower():
            continue

        case_id = str(record.get("id") or count + 1)
        case_name = record.get("case_name") or record.get("case_name_short") or f"Case #{case_id}"
        court = record.get("court_full_name") or record.get("court_short_name") or "Unknown Court"
        date_filed = record.get("date_filed")
        citations = record.get("citations") or []
        citation_str = citations[0] if citations else "Unreported"
        opinions = record.get("opinions") or []
        
        opinion_text = ""
        if opinions:
            opinion_text = opinions[0].get("text") or ""
        elif record.get("summary"):
            opinion_text = record.get("summary")
        else:
            opinion_text = f"Case record for {case_name} in {court}."

        try:
            # Insert into sources table
            cursor.execute("""
                INSERT INTO public.sources (name, type, details)
                VALUES (%s, %s, %s)
                ON CONFLICT (name) DO UPDATE SET details = EXCLUDED.details
                RETURNING id;
            """, (
                f"Harvard CAP: {citation_str} - {case_name[:80]}",
                "caselaw_archive",
                Json({
                    "dataset": "harvard-lil/cold-cases",
                    "case_id": case_id,
                    "court": court,
                    "jurisdiction": rec_jurisdiction,
                    "date_filed": date_filed,
                    "citations": citations
                })
            ))
            source_id = cursor.fetchone()[0]

            # Insert into authorities table
            cursor.execute("""
                INSERT INTO public.authorities (
                    citation, title, court, decision_date, url, source_id
                ) VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (citation) DO UPDATE SET
                    title = EXCLUDED.title,
                    court = EXCLUDED.court,
                    decision_date = EXCLUDED.decision_date;
            """, (
                f"CAP-{case_id}: {citation_str}",
                case_name,
                court,
                date_filed if date_filed else None,
                f"https://cite.case.law/",
                source_id
            ))
            
            conn.commit()
            count += 1
            print(f"  [+] Ingested #{count}: [{citation_str}] {case_name[:50]}")

        except Exception as e:
            conn.rollback()
            print(f"  [-] Error inserting record {case_id}: {e}")

        if count >= limit:
            break

    cursor.close()
    conn.close()
    print("\n" + "=" * 70)
    print(f"[+] Successfully ingested {count} cases from Harvard LIL dataset into database.")
    print("=" * 70)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Harvard LIL Cold Cases Dataset Utility")
    parser.add_argument("--action", choices=["preview", "ingest"], default="preview", help="Action to execute")
    parser.add_argument("--limit", type=int, default=5, help="Number of records to process")
    parser.add_argument("--jurisdiction", type=str, default=None, help="Filter by jurisdiction (e.g. 'Federal', 'Oklahoma', 'California')")
    parser.add_argument("--court", type=str, default=None, help="Filter by court name")
    
    args = parser.parse_args()
    
    if args.action == "preview":
        preview_dataset(limit=args.limit, jurisdiction=args.jurisdiction, court=args.court)
    elif args.action == "ingest":
        ingest_to_postgres(limit=args.limit, jurisdiction=args.jurisdiction)
