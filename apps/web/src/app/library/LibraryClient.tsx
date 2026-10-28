"use client";

import { useMemo, useState, useTransition } from "react";
import {
  searchLegalCorpus,
  type LegalHit,
  type LegalSearchResult,
} from "@/app/actions/legal-search";

const JURISDICTIONS = [
  { id: "", label: "All jurisdictions" },
  { id: "CA", label: "California" },
  { id: "FEDERAL", label: "Federal" },
] as const;

function scoreLabel(hit: LegalHit): string {
  if (typeof hit.rerank_score === "number") return `rerank ${hit.rerank_score.toFixed(2)}`;
  if (hit.similarity > 0) return `sim ${hit.similarity.toFixed(2)}`;
  if (hit.fts_rank > 0) return `fts ${hit.fts_rank.toFixed(2)}`;
  return "match";
}

export function LibraryClient() {
  const [query, setQuery] = useState("motion to suppress evidence");
  const [jurisdiction, setJurisdiction] = useState("CA");
  const [result, setResult] = useState<LegalSearchResult | null>(null);
  const [selected, setSelected] = useState<LegalHit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const chips = useMemo(() => result?.results ?? [], [result]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const data = await searchLegalCorpus(query, jurisdiction || null);
        setResult(data);
        setSelected(data.results[0] ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--candy-background,#fff7fb)] text-[var(--candy-on-surface,#281330)]">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-6">
        <header className="space-y-2 border-b border-[var(--candy-card-border,#f8d8ff)] pb-6">
          <p className="text-xs font-mono uppercase tracking-wider text-[var(--candy-secondary,#744aa2)]">
            The Law Library
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Reading Room & Stacks</h1>
          <p className="text-sm text-[var(--candy-on-surface-variant,#57414a)] max-w-2xl">
            Hybrid search over the legal corpus (dense + keyword), reranked to the top five volumes.
            Educational reference only — not a substitute for a licensed attorney or commercial reporter.
          </p>
        </header>

        <form
          onSubmit={onSearch}
          className="rounded-2xl border border-[var(--candy-card-border,#f8d8ff)] bg-[var(--candy-card-bg,#fff)] p-4 shadow-[var(--candy-shadow-card)] space-y-3"
        >
          <label className="block text-xs font-mono uppercase tracking-wide text-[var(--candy-secondary,#744aa2)]">
            Search the stacks
          </label>
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. PC 1538.5, Brady material, Fed. R. Crim. P. 12"
              className="flex-1 rounded-xl border border-[var(--candy-outline-variant,#ddbfca)] bg-[var(--candy-surface,#fff7fb)] px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--candy-primary,#af0a78)]"
              required
            />
            <select
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="rounded-xl border border-[var(--candy-outline-variant,#ddbfca)] bg-[var(--candy-surface,#fff7fb)] px-3 py-3 text-sm"
            >
              {JURISDICTIONS.map((j) => (
                <option key={j.id || "all"} value={j.id}>
                  {j.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-[var(--candy-primary,#af0a78)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--candy-shadow-primary)] transition hover:scale-[1.03] disabled:opacity-60"
            >
              {pending ? "Searching…" : "Search"}
            </button>
          </div>
          {result && (
            <p className="text-xs font-mono text-[var(--candy-secondary,#744aa2)]">
              mode={result.mode} · reranked={String(result.reranked)} · hits={result.results.length}
              {result.notice ? ` · ${result.notice}` : ""}
            </p>
          )}
          {error && (
            <p className="text-sm text-[var(--candy-error,#ba1a1a)]" role="alert">
              {error}
            </p>
          )}
        </form>

        {/* Citation chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {chips.map((hit) => (
              <button
                key={hit.id}
                type="button"
                onClick={() => setSelected(hit)}
                className={`rounded-full border px-3 py-1.5 text-xs font-mono transition ${
                  selected?.id === hit.id
                    ? "border-[var(--candy-primary,#af0a78)] bg-[var(--candy-surface-container,#fde7ff)] text-[var(--candy-primary,#af0a78)]"
                    : "border-[var(--candy-card-border,#f8d8ff)] bg-[var(--candy-card-bg,#fff)] hover:border-[var(--candy-secondary,#744aa2)]"
                }`}
              >
                {hit.citation.replace(/\s*\[chunk\s+\d+\]\s*$/i, "")}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Volume cards */}
          <section className="lg:col-span-2 space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--candy-secondary,#744aa2)]">
              Volume cards
            </h2>
            {!result && (
              <p className="text-sm text-[var(--candy-on-surface-variant,#57414a)]">
                Run a search to pull volumes from the corpus. Ingest seed data with{" "}
                <code className="font-mono text-xs">python scripts/ingest_legal_corpus.py --seed</code>.
              </p>
            )}
            {result?.results.length === 0 && (
              <p className="text-sm text-[var(--candy-on-surface-variant,#57414a)]">
                No matches. Corpus may be empty — run the seed ingest.
              </p>
            )}
            <ul className="space-y-3">
              {(result?.results ?? []).map((hit) => (
                <li key={hit.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(hit)}
                    className={`w-full rounded-2xl border p-4 text-left transition shadow-sm ${
                      selected?.id === hit.id
                        ? "border-[var(--candy-primary,#af0a78)] bg-[var(--candy-surface-container,#fde7ff)]"
                        : "border-[var(--candy-card-border,#f8d8ff)] bg-[var(--candy-card-bg,#fff)] hover:shadow-[var(--candy-shadow-hover)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase text-[var(--candy-tertiary,#006388)]">
                        {hit.jurisdiction} · {hit.source_type}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--candy-secondary,#744aa2)]">
                        {scoreLabel(hit)}
                      </span>
                    </div>
                    <h3 className="mt-1 font-semibold text-sm">{hit.title}</h3>
                    <p className="mt-1 font-mono text-xs text-[var(--candy-primary,#af0a78)]">
                      {hit.citation}
                    </p>
                    <p className="mt-2 line-clamp-3 text-xs text-[var(--candy-on-surface-variant,#57414a)]">
                      {hit.content}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Open volume reader */}
          <section className="lg:col-span-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--candy-secondary,#744aa2)] mb-3">
              Open volume
            </h2>
            <div className="min-h-[420px] rounded-2xl border border-[var(--candy-card-border,#f8d8ff)] bg-[var(--candy-card-bg,#fff)] p-6 shadow-[var(--candy-shadow-card)]">
              {!selected ? (
                <p className="text-sm text-[var(--candy-on-surface-variant,#57414a)]">
                  Select a volume card or citation chip to read the full retrieved passage.
                </p>
              ) : (
                <article className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[var(--candy-surface-container,#fde7ff)] px-3 py-1 text-xs font-mono text-[var(--candy-primary,#af0a78)]">
                      {selected.citation}
                    </span>
                    <span className="text-xs font-mono text-[var(--candy-secondary,#744aa2)]">
                      {selected.jurisdiction} · {selected.source_type}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">{selected.title}</h3>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap font-mono text-sm leading-relaxed text-[var(--candy-on-surface,#281330)]">
                    {selected.content}
                  </div>
                </article>
              )}
            </div>
          </section>
        </div>

        <footer className="pt-4 text-center text-xs text-[var(--candy-on-surface-variant,#57414a)]">
          Chain of Command Law Library — educational tool for organization and research, not legal advice.
        </footer>
      </div>
    </div>
  );
}
