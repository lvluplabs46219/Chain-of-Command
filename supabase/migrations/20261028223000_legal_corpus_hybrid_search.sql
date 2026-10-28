-- Applied live on othxichdhzdxgtatautb.
-- HNSW instead of ivfflat: lists=100 cannot be built on an empty corpus.

create extension if not exists vector;

create table if not exists public.legal_corpus (
    id uuid primary key default gen_random_uuid(),
    jurisdiction text not null,
    source_type text not null,
    citation text not null,
    title text not null,
    content text not null,
    embedding vector(1536),
    fts tsvector generated always as (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
    ) stored,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint legal_corpus_source_type_check check (
        source_type in ('statute', 'case_law', 'regulation', 'rule')
    ),
    constraint legal_corpus_jurisdiction_citation_key unique (jurisdiction, citation)
);

create index if not exists legal_corpus_embedding_idx
    on public.legal_corpus using hnsw (embedding vector_cosine_ops);
create index if not exists legal_corpus_fts_idx
    on public.legal_corpus using gin (fts);
create index if not exists legal_corpus_jurisdiction_idx
    on public.legal_corpus (jurisdiction);

alter table public.legal_corpus enable row level security;

drop policy if exists legal_corpus_public_read on public.legal_corpus;
create policy legal_corpus_public_read
    on public.legal_corpus for select to anon, authenticated using (true);

revoke insert, update, delete on public.legal_corpus from anon, authenticated;

create or replace function public.hybrid_legal_search(
    query_text text,
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    filter_jurisdiction text default null
)
returns table (
    id uuid,
    jurisdiction text,
    source_type text,
    citation text,
    title text,
    content text,
    similarity float,
    fts_rank float
)
language plpgsql
stable
security invoker
set search_path = public
as $fn$
begin
    if match_count is null or match_count < 1 or match_count > 50 then
        match_count := 10;
    end if;
    if match_threshold is null then
        match_threshold := 0.5;
    end if;

    return query
    select
        legal_corpus.id,
        legal_corpus.jurisdiction,
        legal_corpus.source_type,
        legal_corpus.citation,
        legal_corpus.title,
        legal_corpus.content,
        (1 - (legal_corpus.embedding <=> query_embedding))::float as similarity,
        ts_rank(legal_corpus.fts, websearch_to_tsquery('english', query_text))::float as fts_rank
    from public.legal_corpus
    where legal_corpus.embedding is not null
      and (filter_jurisdiction is null or legal_corpus.jurisdiction = filter_jurisdiction)
      and (
            (1 - (legal_corpus.embedding <=> query_embedding)) >= match_threshold
            or legal_corpus.fts @@ websearch_to_tsquery('english', query_text)
          )
    order by
        ((1 - (legal_corpus.embedding <=> query_embedding)) * 0.7)
        + (ts_rank(legal_corpus.fts, websearch_to_tsquery('english', query_text)) * 0.3) desc
    limit match_count;
end;
$fn$;

revoke all on function public.hybrid_legal_search(text, vector, float, int, text) from public;
grant execute on function public.hybrid_legal_search(text, vector, float, int, text) to anon, authenticated, service_role;

create or replace function public.lexical_legal_search(
    query_text text,
    match_count int,
    filter_jurisdiction text default null
)
returns table (
    id uuid,
    jurisdiction text,
    source_type text,
    citation text,
    title text,
    content text,
    similarity float,
    fts_rank float
)
language plpgsql
stable
security invoker
set search_path = public
as $fn$
declare
    tsq tsquery;
    safe_citation text;
begin
    if query_text is null or btrim(query_text) = '' then
        return;
    end if;
    if match_count is null or match_count < 1 or match_count > 50 then
        match_count := 10;
    end if;
    begin
        tsq := websearch_to_tsquery('english', query_text);
    exception when others then
        tsq := plainto_tsquery('english', left(query_text, 200));
    end;
    safe_citation := replace(replace(btrim(query_text), '%', ''), '_', '');
    return query
    select
        legal_corpus.id,
        legal_corpus.jurisdiction,
        legal_corpus.source_type,
        legal_corpus.citation,
        legal_corpus.title,
        legal_corpus.content,
        0::float as similarity,
        ts_rank(legal_corpus.fts, tsq)::float as fts_rank
    from public.legal_corpus
    where (filter_jurisdiction is null or legal_corpus.jurisdiction = filter_jurisdiction)
      and (
            legal_corpus.fts @@ tsq
            or (length(safe_citation) >= 3 and legal_corpus.citation ilike '%' || safe_citation || '%')
          )
    order by ts_rank(legal_corpus.fts, tsq) desc, legal_corpus.citation
    limit match_count;
end;
$fn$;

revoke all on function public.lexical_legal_search(text, int, text) from public;
grant execute on function public.lexical_legal_search(text, int, text) to anon, authenticated, service_role;
