import os, psycopg2
with open('.env') as f:
    env = dict(line.strip().split('=',1) for line in f if '=' in line)
conn = psycopg2.connect(env['DATABASE_URL'])
cur = conn.cursor()
cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='legal_chunks';")
print([r[0] for r in cur.fetchall()])
cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='sources';")
print([r[0] for r in cur.fetchall()])
cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='authorities';")
print([r[0] for r in cur.fetchall()])
