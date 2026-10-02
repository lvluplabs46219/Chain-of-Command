/**
 * Export approved training_records → JSONL → Hugging Face Dataset Hub.
 * Uses the correct HF commit API (application/x-ndjson).
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import { isAuthorized, requireEnv, json } from "../_shared/auth.ts";

const HF_API = "https://huggingface.co/api";

async function ensureDatasetRepo(
  repo: string,
  token: string,
  isPrivate = true,
): Promise<void> {
  const [org, name] = repo.split("/");
  const res = await fetch(`${HF_API}/repos/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "dataset",
      name,
      organization: org,
      private: isPrivate,
    }),
  });
  // 409 = already exists — OK
  if (!res.ok && res.status !== 409) {
    throw new Error(`Repo creation failed (${res.status}): ${await res.text()}`);
  }
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return json({ error: "method not allowed" }, 405);
    }
    if (!isAuthorized(req)) {
      return json({ error: "unauthorized" }, 401);
    }

    const hfToken = requireEnv("HUGGING_FACE_ACCESS_TOKEN");
    const org = requireEnv("HF_ORG");
    const supabase = createClient(
      requireEnv("SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    );

    // Optional body: { datasetName?, repoSuffix? }
    let body: { datasetName?: string; repoSuffix?: string } = {};
    try {
      body = await req.json();
    } catch {
      /* empty body is fine */
    }

    const datasetName = body.datasetName ?? "legal_training_v1";
    const repo = `${org}/${body.repoSuffix ?? "dataset-legal-v1"}`;

    // 1. Approved rows only
    const { data: rows, error } = await supabase
      .from("training_records")
      .select("prompt, completion")
      .eq("label_quality", "approved");

    if (error) throw new Error(error.message);
    if (!rows?.length) {
      return json({ error: "no approved training rows" }, 422);
    }

    // 2. JSONL
    const jsonlContent = rows
      .map((r) =>
        JSON.stringify({ instruction: r.prompt, response: r.completion }),
      )
      .join("\n");

    // 3. Ensure repo + commit via Hub NDJSON API
    await ensureDatasetRepo(repo, hfToken);

    // HF commit protocol: sequence of JSON objects (LFS-free text upload)
    const ndjson = [
      JSON.stringify({ key: "header", value: { summary: `Sync from Supabase (${rows.length} rows)`, description: "" } }),
      JSON.stringify({ key: "file", value: { content: jsonlContent, path: "train.jsonl", encoding: "utf-8" } }),
    ].join("\n");

    const commitRes = await fetch(`${HF_API}/datasets/${repo}/commit/main`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/x-ndjson",
      },
      body: ndjson,
    });

    if (!commitRes.ok) {
      const detail = await commitRes.text();
      return json(
        { error: `HF commit failed (${commitRes.status})`, detail },
        502,
      );
    }
    const commit = await commitRes.json();

    // 4. Log export
    const { data: exportRecord, error: insertError } = await supabase
      .from("dataset_exports")
      .insert({
        dataset_name: datasetName,
        hf_dataset_repo: repo,
        hf_commit_sha: commit?.commitOid ?? commit?.oid ?? null,
        row_count: rows.length,
      })
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);

    return json({ success: true, exportRecord });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return json({ error: message }, 500);
  }
});
