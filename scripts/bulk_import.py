import os
import sys
import json
import tarfile
import urllib.request
import time
import uuid
import psycopg2
from psycopg2.extras import Json

# Hardened bulk ingestion script with retries, batching, and idempotency

env_vars = {}
try:
    with open(".env", "r") as f:
        for line in f:
            if "=" in line and not line.startswith("#"):
                k, v = line.strip().split("=", 1)
                env_vars[k] = v
except FileNotFoundError:
    pass

DATABASE_URL = env_vars.get("DATABASE_URL") or os.environ.get("DATABASE_URL")
S3_BULK_URL = "https://com-courtlistener-storage.s3.amazonaws.com/bulk-data/opinions-in.tar.gz"

def execute_with_retry(cur, query, vars=None, max_retries=3):
    for attempt in range(max_retries):
        try:
            cur.execute(query, vars)
            return
        except psycopg2.OperationalError as e:
            print(f"Database operational error: {e}. Retrying {attempt+1}/{max_retries}...")
            time.sleep(2 ** attempt)
        except Exception as e:
            raise e
    raise Exception("Max retries exceeded for database query.")

def run_bulk_import():
    if not DATABASE_URL:
        print("Error: DATABASE_URL is missing.")
        sys.exit(1)

    print("Connecting to PostgreSQL...")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    print(f"Streaming from {S3_BULK_URL}...")
    req = urllib.request.Request(S3_BULK_URL, headers={"User-Agent": "Acquit.ai Ingestion Bot/1.0"})
    
    try:
        response = urllib.request.urlopen(req, timeout=30)
    except Exception as e:
        print(f"Failed to fetch bulk data: {e}")
        sys.exit(1)

    processed_count = 0
    zeros = "[" + ",".join(["0"] * 1536) + "]"

    with tarfile.open(fileobj=response, mode="r|gz") as tar:
        for member in tar:
            if processed_count >= 50:
                print("Stopping early for MVP demonstration (processed 50).")
                break

            if not member.isfile() or not member.name.endswith(".json"):
                continue

            f = tar.extractfile(member)
            if not f:
                continue

            try:
                data = json.loads(f.read().decode('utf-8'))
            except Exception:
                continue

            cl_id = str(data.get("id", ""))
            if not cl_id:
                continue

            html_text = data.get("html_with_citations") or data.get("plain_text") or ""
            if not html_text:
                continue

            title = data.get("case_name", f"Opinion {cl_id}")
            url = data.get("absolute_url", "")
            if url: url = f"https://www.courtlistener.com{url}"

            try:
                # 1. Idempotency Check
                cur.execute("SELECT id FROM sources WHERE url = %s", (url,))
                existing = cur.fetchone()
                if existing:
                    # Skip already ingested records to avoid duplication
                    continue
                
                source_id = str(uuid.uuid4())
                authority_id = str(uuid.uuid4())
                
                # 2. Parameterized Insertion for Source
                execute_with_retry(cur, """
                    INSERT INTO sources (id, source_type, title, citation, url, publisher, source_hash, metadata)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    source_id, "case", title, "", url, "CourtListener", cl_id,
                    Json({"courtlistener_id": cl_id, "download_source": "bulk_s3"})
                ))
                
                # 3. Parameterized Insertion for Authority
                execute_with_retry(cur, """
                    INSERT INTO authorities (id, source_id, authority_type, case_name, reporter_citation, full_text, metadata)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    authority_id, source_id, "case_law", title, "", html_text[:20000], 
                    Json({"status": "bulk_ingest"})
                ))

                # 4. Chunk Insertion (Mocking embeddings for now)
                chunk_id = str(uuid.uuid4())
                execute_with_retry(cur, """
                    INSERT INTO legal_chunks (id, authority_id, content, embedding, metadata)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    chunk_id, authority_id, html_text[:5000], zeros,
                    Json({"chunk_index": 0, "courtlistener_id": cl_id})
                ))
                
                conn.commit()
                processed_count += 1
                if processed_count % 10 == 0:
                    print(f"[{processed_count}] Successfully batched and committed.")
            except psycopg2.IntegrityError as e:
                conn.rollback() # Safely rollback on conflicts
            except Exception as e:
                print(f"Ingest Error for ID {cl_id}: {e}")
                conn.rollback()

    cur.close()
    conn.close()
    print(f"Bulk import hardened run complete! Total cases processed: {processed_count}")

if __name__ == "__main__":
    run_bulk_import()
