/**
 * Hybrid / lexical legal search against PlanetScale Postgres (DATABASE_URL).
 * Prefer this over Supabase REST when DATABASE_URL is set.
 */
import pg from 'pg';

export type PostgresLegalCorpusHit = {
  id: string;
  jurisdiction: string;
  source_type: string;
  citation: string;
  title: string;
  content: string;
  similarity: number;
  fts_rank: number;
};

function databaseUrl(): string {
  const url =
    process.env.DATABASE_URL?.trim() ||
    process.env.PLANETSCALE_DATABASE_URL?.trim() ||
    '';
  if (!url) {
    throw new Error(
      'DATABASE_URL (PlanetScale Postgres) is required for postgresSearch',
    );
  }
  return url;
}

function pool(): pg.Pool {
  const connectionString = databaseUrl();
  const needsSsl =
    /psdb\.cloud|planetscale|sslmode=require|sslmode=verify/i.test(connectionString) ||
    process.env.NODE_ENV === 'production';
  return new pg.Pool({
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: true } : undefined,
    max: 10,
  });
}

/** Dense + text rank. Requires pgvector and a hybrid_legal_search function, or falls back. */
export async function hybridLegalSearchPostgres(opts: {
  queryText: string;
  queryEmbedding: number[];
  matchThreshold?: number;
  matchCount?: number;
  jurisdiction?: string | null;
}): Promise<PostgresLegalCorpusHit[]> {
  const client = pool();
  try {
    const emb = `[${opts.queryEmbedding.join(',')}]`;
    // Prefer RPC if present
    try {
      const rpc = await client.query(
        `SELECT * FROM hybrid_legal_search($1, $2::vector, $3, $4, $5)`,
        [
          opts.queryText,
          emb,
          opts.matchThreshold ?? 0.5,
          opts.matchCount ?? 10,
          opts.jurisdiction ?? null,
        ],
      );
      return rpc.rows as PostgresLegalCorpusHit[];
    } catch {
      /* fall through to inline SQL */
    }

    const { rows } = await client.query(
      `
      SELECT
        id::text,
        jurisdiction,
        source_type,
        citation,
        title,
        content,
        1 - (embedding <=> $1::vector) AS similarity,
        ts_rank(to_tsvector('english', coalesce(content, '')), plainto_tsquery('english', $2)) AS fts_rank
      FROM public.legal_corpus
      WHERE embedding IS NOT NULL
        AND ($3::text IS NULL OR jurisdiction = $3)
        AND (1 - (embedding <=> $1::vector)) >= $4
      ORDER BY embedding <=> $1::vector
      LIMIT $5
      `,
      [
        emb,
        opts.queryText,
        opts.jurisdiction ?? null,
        opts.matchThreshold ?? 0.5,
        opts.matchCount ?? 10,
      ],
    );
    return rows as PostgresLegalCorpusHit[];
  } finally {
    await client.end();
  }
}

export async function lexicalLegalSearchPostgres(opts: {
  queryText: string;
  matchCount?: number;
  jurisdiction?: string | null;
}): Promise<PostgresLegalCorpusHit[]> {
  const client = pool();
  try {
    const { rows } = await client.query(
      `
      SELECT
        id::text,
        jurisdiction,
        source_type,
        citation,
        title,
        content,
        0::float8 AS similarity,
        ts_rank(to_tsvector('english', coalesce(content,'') || ' ' || coalesce(citation,'')), plainto_tsquery('english', $1)) AS fts_rank
      FROM public.legal_corpus
      WHERE ($2::text IS NULL OR jurisdiction = $2)
        AND (
          to_tsvector('english', coalesce(content,'') || ' ' || coalesce(citation,'')) @@ plainto_tsquery('english', $1)
          OR citation ILIKE '%' || $1 || '%'
        )
      ORDER BY fts_rank DESC NULLS LAST
      LIMIT $3
      `,
      [opts.queryText, opts.jurisdiction ?? null, opts.matchCount ?? 10],
    );
    return rows as PostgresLegalCorpusHit[];
  } finally {
    await client.end();
  }
}
