#!/usr/bin/env python3
"""
Ingest statutes/opinions into public.legal_corpus with 1536-d embeddings.

Chunks by section / holding (not whole PDFs).

Usage:
  export SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
  export OPENAI_API_KEY  # required — os.getenv / shell env; never hardcode
  export SUPABASE_SERVICE_ROLE_KEY  # from Infisical / Vercel / secret store — never commit

  # Seed CA PC + FRCP from bundled JSONL
  python scripts/ingest_legal_corpus.py --seed

  # Custom JSONL (one object per line)
  python scripts/ingest_legal_corpus.py data/legal_corpus/seed_ca_pc_frcp.jsonl

  # Optional CourtListener opinions (requires COURTLISTENER_TOKEN)
  python scripts/ingest_legal_corpus.py --courtlistener --query "Fourth Amendment" --pages 2

Env:
  OPENAI_API_KEY, SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY
  COURTLISTENER_TOKEN (optional)
  OPENAI_EMBED_MODEL (default text-embedding-3-small)
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Iterable

ALLOWED = {"statute", "case_law", "regulation", "rule"}
SECTION_SPLIT = re.compile(
    r"(?=(?:^|\n)\s*(?:§\s*[\d.]+[a-z]?|[A-Z][A-Z0-9 .\-]{3,80}\n|\(\w\)\s))",
    re.MULTILINE,
)
ROOT = Path(__file__).resolve().parents[1]
SEED_PATH = ROOT / "data" / "legal_corpus" / "seed_ca_pc_frcp.jsonl"


def env(name: str, *alts: str) -> str:
    for key in (name, *alts):
        val = os.environ.get(key, "").strip()
        if val:
            return val
    return ""


def chunk_text(text: str, max_chars: int = 3500) -> list[str]:
    """Prefer section-sized chunks; fall back to sliding windows."""
    text = (text or "").strip()
    if not text:
        return []
    if len(text) <= max_chars:
        return [text]

    parts = [p.strip() for p in SECTION_SPLIT.split(text) if p and p.strip()]
    if len(parts) <= 1:
        parts = [text]

    chunks: list[str] = []
    buf = ""
    for part in parts:
        if len(part) > max_chars:
            if buf:
                chunks.append(buf.strip())
                buf = ""
            for i in range(0, len(part), max_chars):
                chunks.append(part[i : i + max_chars].strip())
            continue
        if len(buf) + len(part) + 1 <= max_chars:
            buf = f"{buf}\n{part}".strip()
        else:
            if buf:
                chunks.append(buf)
            buf = part
    if buf:
        chunks.append(buf)
    return [c for c in chunks if c]


def embed(text: str, api_key: str, model: str) -> list[float]:
    payload = json.dumps(
        {"model": model, "input": text[:24000], "dimensions": 1536}
    ).encode("utf-8")
    req = urllib.request.Request(
        "https://api.openai.com/v1/embeddings",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    return data["data"][0]["embedding"]


def upsert_row(supabase_url: str, service_key: str, row: dict[str, Any]) -> None:
    url = f"{supabase_url.rstrip('/')}/rest/v1/legal_corpus?on_conflict=jurisdiction,citation"
    body = json.dumps([row]).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        resp.read()


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for i, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        line = line.strip()
        if not line:
            continue
        obj = json.loads(line)
        if obj.get("source_type") not in ALLOWED:
            raise SystemExit(f"Line {i}: invalid source_type")
        for field in ("jurisdiction", "citation", "title", "content"):
            if not isinstance(obj.get(field), str) or not obj[field].strip():
                raise SystemExit(f"Line {i}: missing {field}")
        rows.append(obj)
    return rows


def expand_chunks(rows: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for row in rows:
        pieces = chunk_text(row["content"])
        if len(pieces) <= 1:
            out.append(row)
            continue
        for idx, piece in enumerate(pieces, 1):
            out.append(
                {
                    **row,
                    "citation": f"{row['citation']} [chunk {idx}]",
                    "title": f"{row['title']} (part {idx})",
                    "content": piece,
                }
            )
    return out


def fetch_courtlistener(query: str, pages: int, token: str) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for page in range(1, pages + 1):
        qs = urllib.parse.urlencode(
            {"q": query, "type": "o", "order_by": "score desc", "page": page}
        )
        url = f"https://www.courtlistener.com/api/rest/v4/search/?{qs}"
        req = urllib.request.Request(
            url,
            headers={"Authorization": f"Token {token}", "Accept": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            print(f"CourtListener HTTP {e.code}: {e.read()[:200]!r}", file=sys.stderr)
            break
        for hit in payload.get("results") or []:
            cite = (hit.get("citation") or [None])[0] or hit.get("caseName") or hit.get("id")
            snippet = hit.get("snippet") or hit.get("text") or hit.get("caseName") or ""
            if not snippet:
                continue
            rows.append(
                {
                    "jurisdiction": "FEDERAL",
                    "source_type": "case_law",
                    "citation": str(cite)[:240],
                    "title": str(hit.get("caseName") or cite)[:500],
                    "content": str(snippet)[:12000],
                }
            )
        time.sleep(0.4)
    return rows


def ingest(rows: list[dict[str, Any]]) -> int:
    openai_key = env("OPENAI_API_KEY")
    supabase_url = env("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL")
    service_key = env("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY")
    model = env("OPENAI_EMBED_MODEL") or "text-embedding-3-small"
    if not openai_key or not supabase_url or not service_key:
        raise SystemExit(
            "Need OPENAI_API_KEY, SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY"
        )

    expanded = expand_chunks(rows)
    print(f"rows={len(rows)} chunks={len(expanded)}")
    ok = 0
    for row in expanded:
        emb = embed(f"{row['citation']}\n{row['title']}\n{row['content']}", openai_key, model)
        upsert_row(
            supabase_url,
            service_key,
            {
                "jurisdiction": row["jurisdiction"],
                "source_type": row["source_type"],
                "citation": row["citation"],
                "title": row["title"],
                "content": row["content"],
                "embedding": emb,
            },
        )
        ok += 1
        print("upserted", row["jurisdiction"], row["citation"])
        time.sleep(0.15)
    return ok


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest legal_corpus with embeddings")
    parser.add_argument("jsonl", nargs="?", help="JSONL file to ingest")
    parser.add_argument("--seed", action="store_true", help="Ingest bundled CA PC + FRCP seed")
    parser.add_argument("--courtlistener", action="store_true", help="Pull CourtListener opinions")
    parser.add_argument("--query", default="search and seizure", help="CourtListener query")
    parser.add_argument("--pages", type=int, default=1, help="CourtListener pages")
    args = parser.parse_args()

    rows: list[dict[str, Any]] = []
    if args.seed:
        if not SEED_PATH.exists():
            raise SystemExit(f"Missing seed file: {SEED_PATH}")
        rows.extend(load_jsonl(SEED_PATH))
    if args.jsonl:
        rows.extend(load_jsonl(Path(args.jsonl)))
    if args.courtlistener:
        token = env("COURTLISTENER_TOKEN")
        if not token:
            raise SystemExit("COURTLISTENER_TOKEN required for --courtlistener")
        rows.extend(fetch_courtlistener(args.query, max(1, args.pages), token))

    if not rows:
        parser.print_help()
        raise SystemExit(1)

    n = ingest(rows)
    print(f"done: {n}")


if __name__ == "__main__":
    main()
