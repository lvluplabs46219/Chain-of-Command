import duckdb

con = duckdb.connect()

# Query all columns
df = con.execute("""
    SELECT citation, section_title, text 
    FROM read_parquet('/home/andrew/.cargo/bin/local/us_ak_statutes.parquet')
    LIMIT 5
""").df()

print(df)
