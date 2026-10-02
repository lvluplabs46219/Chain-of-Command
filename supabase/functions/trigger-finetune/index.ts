/**
 * Trigger a fine-tuning job (AutoTrain when available) and record it in
 * fine_tuning_jobs so check-job-status can poll.
 *
 * Body: {
 *   datasetExportId: string (UUID),
 *   baseModel: string,
 *   targetModelRepo: string  // e.g. your-org/llama-legal-finetuned
 * }
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import { isAuthorized, requireEnv, json } from "../_shared/auth.ts";

const AUTOTRAIN_API = "https://api.autotrain.huggingface.co";

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return json({ error: "method not allowed" }, 405);
    }
    if (!isAuthorized(req)) {
      return json({ error: "unauthorized" }, 401);
    }

    const body = await req.json();
    const { datasetExportId, baseModel, targetModelRepo } = body ?? {};

    if (!datasetExportId || !baseModel || !targetModelRepo) {
      return json(
        {
          error:
            "datasetExportId, baseModel, and targetModelRepo are required",
        },
        400,
      );
    }

    const hfToken = requireEnv("HUGGING_FACE_ACCESS_TOKEN");
    const supabase = createClient(
      requireEnv("SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    );

    // 1. Resolve dataset export
    const { data: exportRecord, error: exportErr } = await supabase
      .from("dataset_exports")
      .select("*")
      .eq("id", datasetExportId)
      .single();

    if (exportErr || !exportRecord) {
      return json({ error: "dataset export not found" }, 404);
    }

    // 2. Create AutoTrain project (best-effort; API surface changes)
    let jobId: string | null = null;
    let autotrainError: string | null = null;

    try {
      const autotrainRes = await fetch(`${AUTOTRAIN_API}/projects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_name: targetModelRepo.split("/")[1] ?? targetModelRepo,
          task: "llm:sft",
          base_model: baseModel,
          dataset: exportRecord.hf_dataset_repo,
          hub_model_id: targetModelRepo,
          params: {
            epochs: 3,
            learning_rate: 2e-4,
            batch_size: 4,
            peft: true,
            quantization: "int4",
          },
        }),
      });

      const jobBody = await autotrainRes.json().catch(() => ({}));
      if (!autotrainRes.ok) {
        autotrainError = JSON.stringify(jobBody);
      } else {
        jobId = jobBody.id ?? jobBody.job_id ?? jobBody.project_id ?? null;
      }
    } catch (e) {
      autotrainError = e instanceof Error ? e.message : String(e);
    }

    // 3. Always create a job row so status checker / GPU path can update it
    const { data: jobRow, error: insertErr } = await supabase
      .from("fine_tuning_jobs")
      .insert({
        dataset_id: exportRecord.id,
        base_model: baseModel,
        hf_model_output_repo: targetModelRepo,
        status: jobId ? "queued" : "queued",
        hf_autotrain_job_id: jobId,
        error_message: autotrainError,
      })
      .select()
      .single();

    if (insertErr) throw new Error(insertErr.message);

    return json({
      success: true,
      job: jobRow,
      autotrain: jobId
        ? { id: jobId }
        : {
            note:
              "AutoTrain API did not return a job id. Use train_lora.py on GPU and POST completion to check-job-status / update the row.",
            error: autotrainError,
          },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return json({ error: message }, 500);
  }
});
