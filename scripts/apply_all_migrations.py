import os
import glob
import psycopg2

DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL and os.path.exists('.env'):
    with open('.env') as f:
        env = dict(line.strip().split('=', 1) for line in f if '=' in line and not line.startswith('#'))
        DATABASE_URL = env.get('DATABASE_URL')

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

conn = psycopg2.connect(DATABASE_URL)
conn.autocommit = True
cur = conn.cursor()

def apply_sql(file_path):
    print(f"Applying {file_path}...")
    with open(file_path, 'r') as f:
        sql = f.read()
    cur.execute(sql)
    print(f"Successfully applied {file_path}")

migration_files = sorted(glob.glob('supabase/migrations/*.sql'))
for file_path in migration_files:
    apply_sql(file_path)

cur.close()
conn.close()
print("All Supabase migrations applied successfully.")
