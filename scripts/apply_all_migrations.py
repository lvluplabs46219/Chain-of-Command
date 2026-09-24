#!/usr/bin/env python3
"""
Acquit.ai - Database Migration Engine
Applies all Supabase/PostgreSQL migrations in chronological order.
Tracks applied migrations in public._migrations table to prevent duplicate execution.
Supports both psycopg2 (native python) and node pg fallback if python DB driver is absent.
"""
import os
import sys
import glob
import argparse
import subprocess

MIGRATIONS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "supabase", "migrations"))

def load_env_db_url():
    """Load DATABASE_URL from os.environ or .env file."""
    url = os.environ.get("DATABASE_URL")
    if url:
        return url
    
    root_env = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
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

def get_migration_files():
    """Return sorted list of .sql migration files."""
    if not os.path.isdir(MIGRATIONS_DIR):
        print(f"[-] Migrations directory not found at: {MIGRATIONS_DIR}")
        return []
    files = glob.glob(os.path.join(MIGRATIONS_DIR, "*.sql"))
    files.sort(key=lambda x: os.path.basename(x))
    return files

def run_with_python_psycopg(db_url, files, force=False, dry_run=False):
    """Run migrations using psycopg2 / psycopg."""
    try:
        import psycopg2
    except ImportError:
        try:
            import psycopg as psycopg2
        except ImportError:
            return False

    print("[*] Connecting via Python PostgreSQL driver...")
    conn = psycopg2.connect(db_url)
    conn.autocommit = False
    cur = conn.cursor()

    try:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS public._migrations (
                id SERIAL PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        """)
        conn.commit()

        cur.execute("SELECT name FROM public._migrations;")
        applied = set(row[0] for row in cur.fetchall())

        pending = []
        for f in files:
            name = os.path.basename(f)
            if force or name not in applied:
                pending.append((name, f))

        if not pending:
            print("[+] All migrations are already up to date.")
            return True

        print(f"[*] Found {len(pending)} pending migration(s) to apply:")
        for name, _ in pending:
            print(f"    - {name}")

        if dry_run:
            print("[*] Dry-run complete. No changes applied.")
            return True

        for name, path in pending:
            print(f"[*] Applying {name}...")
            with open(path, "r", encoding="utf-8") as f:
                sql = f.read()

            try:
                cur.execute(sql)
                cur.execute("""
                    INSERT INTO public._migrations (name) VALUES (%s)
                    ON CONFLICT (name) DO UPDATE SET applied_at = NOW();
                """, (name,))
                conn.commit()
                print(f"[+] Successfully applied: {name}")
            except Exception as err:
                conn.rollback()
                print(f"[-] Migration failed on {name}: {err}")
                return False

        print("\n" + "=" * 60)
        print("[+] All migrations successfully applied to database.")
        print("=" * 60)
        return True
    finally:
        cur.close()
        conn.close()

def run_with_node_pg(db_url, files, force=False, dry_run=False):
    """Fallback runner using Node.js and the 'pg' library installed in the workspace."""
    print("[*] Python psycopg2 not detected; delegating to workspace Node.js pg engine...")
    
    file_list_json = str([os.path.basename(f) for f in files]).replace("'", '"')
    file_map_json = str({os.path.basename(f): f for f in files}).replace("'", '"')

    node_script = f"""
const {{ Pool }} = require('pg');
const fs = require('fs');

const pool = new Pool({{
  connectionString: process.env.DATABASE_URL,
  ssl: {{ rejectUnauthorized: false }}
}});

const files = {file_list_json};
const fileMap = {file_map_json};
const force = {'true' if force else 'false'};
const dryRun = {'true' if dry_run else 'false'};

async function run() {{
  const client = await pool.connect();
  try {{
    await client.query(`
      CREATE TABLE IF NOT EXISTS public._migrations (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const res = await client.query("SELECT name FROM public._migrations");
    const applied = new Set(res.rows.map(r => r.name));

    const pending = files.filter(f => force || !applied.has(f));

    if (pending.length === 0) {{
      console.log("[+] All migrations are already up to date.");
      return;
    }}

    console.log(`[*] Found ${{pending.length}} pending migration(s) to apply:`);
    for (const name of pending) {{
      console.log(`    - ${{name}}`);
    }}

    if (dryRun) {{
      console.log("[*] Dry-run complete. No changes applied.");
      return;
    }}

    for (const name of pending) {{
      console.log(`[*] Applying ${{name}}...`);
      const sql = fs.readFileSync(fileMap[name], 'utf8');
      try {{
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          "INSERT INTO public._migrations (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET applied_at = NOW()",
          [name]
        );
        await client.query('COMMIT');
        console.log(`[+] Successfully applied: ${{name}}`);
      }} catch (err) {{
        await client.query('ROLLBACK');
        console.error(`[-] Migration failed on ${{name}}:`, err.message);
        process.exit(1);
      }}
    }}

    console.log("\\n============================================================");
    console.log("[+] All migrations successfully applied to database.");
    console.log("============================================================");
  }} finally {{
    client.release();
    await pool.end();
  }}
}}

run().catch(err => {{
  console.error("[-] Migration execution error:", err.message);
  process.exit(1);
}});
"""
    env = os.environ.copy()
    env["DATABASE_URL"] = db_url
    result = subprocess.run(["node", "-e", node_script], env=env)
    return result.returncode == 0

def main():
    parser = argparse.ArgumentParser(description="Acquit.ai Supabase Migration Runner")
    parser.add_argument("--force", action="store_true", help="Re-apply all migrations even if previously applied")
    parser.add_argument("--dry-run", action="store_true", help="List pending migrations without executing them")
    parser.add_argument("--list", action="store_true", help="List all available migration files")
    args = parser.parse_args()

    files = get_migration_files()
    if args.list:
        print(f"[*] Available migrations in {MIGRATIONS_DIR}:")
        for f in files:
            print(f"    - {os.path.basename(f)}")
        return

    if not files:
        print("[-] No migration files found.")
        sys.exit(1)

    db_url = load_env_db_url()
    if not db_url:
        print("[-] DATABASE_URL is not set in environment or .env file.")
        print("    Example: export DATABASE_URL='postgresql://postgres:password@localhost:5432/acquit'")
        sys.exit(1)

    # 1. Try Python native driver
    success = run_with_python_psycopg(db_url, files, force=args.force, dry_run=args.dry_run)
    if success is False or success is None:
        # 2. Fall back to workspace Node driver
        success = run_with_node_pg(db_url, files, force=args.force, dry_run=args.dry_run)

    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()