import os, uuid
import psycopg2
from psycopg2.extras import Json

env_vars = {}
try:
    with open(".env", "r") as f:
        for line in f:
            if "=" in line and not line.startswith("#"):
                k, v = line.strip().split("=", 1)
                env_vars[k] = v
except FileNotFoundError:
    pass

conn = psycopg2.connect(env_vars.get("DATABASE_URL"))
cur = conn.cursor()

zeros = "[" + ",".join(["0"] * 1536) + "]"

cases = [
    {
        "title": "State of Indiana v. Smith (2026)",
        "citation": "2026 IN 404",
        "url": "https://courtlistener.com/mock/indiana-v-smith",
        "text": "The State of Indiana appeals the trial court's order granting John Smith's motion to suppress evidence. The court found that the officer lacked reasonable suspicion to initiate the traffic stop. We affirm."
    },
    {
        "title": "Johnson v. State (2025)",
        "citation": "2025 IN 112",
        "url": "https://courtlistener.com/mock/johnson-v-state",
        "text": "Appellant challenges his conviction on the grounds of ineffective assistance of counsel during the plea negotiation phase. The record supports a finding that counsel's performance fell below objective standards."
    }
]

for case in cases:
    source_id = str(uuid.uuid4())
    authority_id = str(uuid.uuid4())
    
    cur.execute("""
        INSERT INTO sources (id, source_type, title, citation, url, publisher, source_hash, metadata)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        source_id, "case", case["title"], case["citation"], case["url"], "CourtListener", str(hash(case["title"])),
        Json({"download_source": "mvp_seed"})
    ))
    
    cur.execute("""
        INSERT INTO authorities (id, source_id, authority_type, case_name, reporter_citation, full_text, metadata)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        authority_id, source_id, "case_law", case["title"], case["citation"], case["text"],
        Json({"status": "seeded"})
    ))

    chunk_id = str(uuid.uuid4())
    cur.execute("""
        INSERT INTO legal_chunks (id, authority_id, content, embedding, metadata)
        VALUES (%s, %s, %s, %s, %s)
    """, (
        chunk_id, authority_id, case["text"], zeros,
        Json({"chunk_index": 0})
    ))
    
    conn.commit()
    print(f"Ingested via Pipeline: {case['title']}")

cur.close()
conn.close()
print("Ingestion pipeline test complete.")
