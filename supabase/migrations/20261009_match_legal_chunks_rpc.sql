-- RAG: cosine similarity search over legal_chunks
CREATE OR REPLACE FUNCTION public.match_legal_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.65,
  match_count int DEFAULT 5,
  filter_jurisdiction text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  citation text,
  jurisdiction text,
  source_url text,
  content text,
  similarity float
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    lc.id,
    COALESCE(a.case_name, a.reporter_citation, 'Authority') AS title,
    COALESCE(a.reporter_citation, a.docket_number, '') AS citation,
    COALESCE(lc.jurisdiction, filter_jurisdiction, '') AS jurisdiction,
    NULL::text AS source_url,
    lc.content,
    (1 - (lc.embedding <=> query_embedding))::float AS similarity
  FROM public.legal_chunks lc
  LEFT JOIN public.authorities a ON a.id = lc.authority_id
  WHERE lc.embedding IS NOT NULL
    AND (filter_jurisdiction IS NULL OR lc.jurisdiction = filter_jurisdiction OR lc.jurisdiction IS NULL)
    AND (1 - (lc.embedding <=> query_embedding)) >= match_threshold
  ORDER BY lc.embedding <=> query_embedding
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION public.match_legal_chunks(vector, float, int, text) TO anon, authenticated, service_role;
