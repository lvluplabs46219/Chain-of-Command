import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const sql = `
-- 1. Resolve Linter Warning: Relocate vector extension out of public schema
CREATE SCHEMA IF NOT EXISTS extensions;
-- ALTER EXTENSION vector SET SCHEMA extensions;

-- 2. Resolve Linter Warning: Revoke public execution of security definer function
-- REVOKE EXECUTE ON FUNCTION public.user_owns_matter(uuid) FROM anon, authenticated, public;

-- 3. Resolve Database Audit Gaps: Add missing constraints and performance indexes
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sources_source_hash_unique') THEN
    ALTER TABLE public.sources ADD CONSTRAINT sources_source_hash_unique UNIQUE (source_hash);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_matters_case_number ON public.matters (case_number);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON public.audit_logs (user_id, created_at DESC);

-- 4. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_matters_updated_at') THEN
    CREATE TRIGGER update_matters_updated_at 
      BEFORE UPDATE ON public.matters 
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
  `;

  try {
    await pool.query(sql);
    console.log("Supabase hardening executed successfully.");
  } catch (error) {
    console.error("Error executing hardening script:", error);
  } finally {
    await pool.end();
  }
}

run();
