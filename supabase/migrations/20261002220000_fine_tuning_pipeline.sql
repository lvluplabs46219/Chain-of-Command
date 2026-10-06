-- Fine-tuning pipeline tables (Supabase → Hugging Face)
-- Adds training_records, dataset_exports, fine_tuning_jobs

-- Training data (source of truth for HF dataset sync)
CREATE TABLE IF NOT EXISTS public.training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt TEXT NOT NULL,
  completion TEXT NOT NULL,
  label_quality TEXT NOT NULL DEFAULT 'unreviewed'
    CHECK (label_quality IN ('unreviewed', 'approved', 'rejected')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_records_label_quality
  ON public.training_records (label_quality);

-- Track dataset export versions pushed to Hugging Face
CREATE TABLE IF NOT EXISTS public.dataset_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_name TEXT NOT NULL,
  hf_dataset_repo TEXT NOT NULL,
  hf_commit_sha TEXT,
  row_count INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Track fine-tuning jobs and status
CREATE TABLE IF NOT EXISTS public.fine_tuning_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES public.dataset_exports(id),
  base_model TEXT NOT NULL,
  hf_model_output_repo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'training', 'completed', 'failed')),
  hf_autotrain_job_id TEXT,
  metrics JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fine_tuning_jobs_status
  ON public.fine_tuning_jobs (status);

CREATE INDEX IF NOT EXISTS idx_fine_tuning_jobs_hf_job_id
  ON public.fine_tuning_jobs (hf_autotrain_job_id)
  WHERE hf_autotrain_job_id IS NOT NULL;

-- Auto-maintain updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fine_tuning_jobs_updated_at ON public.fine_tuning_jobs;
CREATE TRIGGER trg_fine_tuning_jobs_updated_at
  BEFORE UPDATE ON public.fine_tuning_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- RLS: service role only for these tables (Edge Functions use service role key)
ALTER TABLE public.training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fine_tuning_jobs ENABLE ROW LEVEL SECURITY;

-- No public policies — only service_role / authenticated admins via Edge Functions
