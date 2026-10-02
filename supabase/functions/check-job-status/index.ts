/**
 * Poll AutoTrain (or accept GPU completion callbacks) and update fine_tuning_jobs.
 *
 * Modes:
 * 1) GET / POST with no body → poll all non-terminal jobs that have hf_autotrain_job_id
 * 2) POST { jobId, status, metrics?, error? } → manual/GPU callback update by row id
 * 3) POST { hfAutotrainJobId, status, metrics?, error? } → update by HF job id
 *
 * Schedule this function (e.g. every 5 min) via Supabase cron / external scheduler.
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import { isAuthorized, requireEnv, json } from "../_shared/auth.ts";

const AUTOTRAIN_API = "https://api.autotrain.huggingface.co";

Deno.serve(async (req) => {
  try {
    if (!isAuthorized(req)) {
      return json({ error: "unauthorized" }, 401);
    }

    const hfToken = requireEnv("HUGGING_FACE_ACCESS_TOKEN");
    const supabase = createClient(
      requireEnv("SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    );

    // Optional callback body
    let body: {
      jobId?: string;
      hfAutotrainJobId?: string;
      status?: string;
      metrics?: Record<string, unknown>;
      error?: string;
    } = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch {
        /* empty */
      }
    }

    // --- Manual / GPU callback path ---
    if (body.jobId || body.hfAutotrainJobId) {
      const status = body.status;
      if (!status || !["queued", "training", "completed", "failed"].includes(status)) {
        return json({ error: "valid status required" }, 400);
      }

      let q = supabase.from("fine_tuning_jobs").update({
        status,
        metrics: body.metrics ?? null,
        error_message: body.error ?? null,
      });

      if (body.jobId) q = q.eq("id", body.jobId);
      else q = q.eq("hf_autotrain_job_id", body.hfAutotrainJobId!);

      const { data, error } = await q.select().maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return json({ error: "job not found" }, 404);
      return json({ success: true, job: data });
    }

    // --- Poll path ---
    const { data: jobs, error: listErr } = await supabase
      .from("fine_tuning_jobs")
      .select("*")
      .in("status", ["queued", "training"])
      .not("hf_autotrain_job_id", "is", null);

    if (listErr) throw new Error(listErr.message);

    const results: Array<{ id: string; previous: string; next: string }> = [];

    for (const job of jobs ?? []) {
      const jobId = job.hf_autotrain_job_id as string;
      try {
        const res = await fetch(`${AUTOTRAIN_API}/projects/${jobId}`, {
          headers: { Authorization: `Bearer ${hfToken}` },
        });
        if (!res.ok) continue;

        const remote = await res.json();
        const remoteStatus = String(
          remote.status ?? remote.state ?? "",
        ).toLowerCase();

        let nextStatus = job.status as string;
        if (["running", "training", "in_progress"].includes(remoteStatus)) {
          nextStatus = "training";
        } else if (
          ["completed", "success", "succeeded", "done"].includes(remoteStatus)
        ) {
          nextStatus = "completed";
        } else if (
          ["failed", "error", "cancelled", "canceled"].includes(remoteStatus)
        ) {
          nextStatus = "failed";
        }

        if (nextStatus !== job.status) {
          const { error: updErr } = await supabase
            .from("fine_tuning_jobs")
            .update({
              status: nextStatus,
              metrics: remote.metrics ?? remote.result ?? null,
              error_message: remote.error ?? remote.message ?? null,
            })
            .eq("id", job.id);

          if (!updErr) {
            results.push({
              id: job.id,
              previous: job.status,
              next: nextStatus,
            });
          }
        }
      } catch {
        // Skip individual poll failures
      }
    }

    return json({
      success: true,
      polled: (jobs ?? []).length,
      updated: results,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return json({ error: message }, 500);
  }
});
