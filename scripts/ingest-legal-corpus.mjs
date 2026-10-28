#!/usr/bin/env node
/**
 * Upsert a JSONL legal corpus into Supabase and embed with text-embedding-3-small.
 *
 * Each line:
 * {"jurisdiction":"CA","source_type":"statute","citation":"Cal. Penal Code § 1538.5","title":"...","content":"..."}
 *
 * Usage:
 *   OPENAI_API_KEY=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/ingest-legal-corpus.mjs path/to/corpus.jsonl
 */
import { readFile } from "node:fs/promises";

const file = process.argv[2];
const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!file || !url || !key || !openaiKey) {
  console.error("Usage: node scripts/ingest-legal-corpus.mjs <file.jsonl>");
  console.error("Requires SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY.");
  process.exit(1);
}

const allowed = new Set(["statute", "case_law", "regulation", "rule"]);
const raw = await readFile(file, "utf8");
const rows = raw
  .split(/\n+/)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line, index) => {
    const row = JSON.parse(line);
    if (!allowed.has(row.source_type)) {
      throw new Error(`Line ${index + 1}: source_type must be statute, case_law, regulation, or rule`);
    }
    for (const field of ["jurisdiction", "citation", "title", "content"]) {
      if (!row[field] || typeof row[field] !== "string") {
        throw new Error(`Line ${index + 1}: missing ${field}`);
      }
    }
    return row;
  });

async function embed(text) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "text-embedding-3-small", input: text.slice(0, 24000) }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  return json.data[0].embedding;
}

for (const row of rows) {
  const embedding = await embed(`${row.citation}\n${row.title}\n${row.content}`);
  const res = await fetch(`${url}/rest/v1/legal_corpus?on_conflict=jurisdiction,citation`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify([{
      jurisdiction: row.jurisdiction,
      source_type: row.source_type,
      citation: row.citation,
      title: row.title,
      content: row.content,
      embedding,
    }]),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status} for ${row.citation}: ${(await res.text()).slice(0, 300)}`);
  console.log("upserted", row.jurisdiction, row.citation);
}

console.log(`done: ${rows.length}`);
