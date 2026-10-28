"use client";

import React, { useState } from "react";
import { Scale, Search } from "lucide-react";
import { searchLegalCorpus, type LegalHit } from "@/app/actions/legal-search";

export function LegalCorpusSearch({ jurisdiction }: { jurisdiction?: string }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(jurisdiction || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<string | null>(null);
  const [results, setResults] = useState<LegalHit[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const data = await searchLegalCorpus(query, filter.trim() || null);
      setResults(data.results);
      setMode(data.reranked ? `${data.mode} + rerank` : data.mode);
      setNotice(data.notice || null);
      setOpenId(data.results[0]?.id || null);
    } catch (err) {
      setResults([]);
      setError(err instanceof Error ? err.message : "Legal corpus search failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-[#141519] border border-[#272830] rounded-xl p-6">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37]">Supabase hybrid retrieval</p>
        <h2 className="text-lg font-serif font-semibold text-white mt-1">Search the legal corpus</h2>
        <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
          Keyword match and semantic match run in Postgres. Results are only passages stored in the corpus. Nothing here is legal advice.
        </p>
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Citation or question, e.g. 1538.5 or warrantless search"
            className="flex-1 rounded-lg border border-[#2A2B35] bg-[#101114] px-3 py-2 text-sm text-white placeholder:text-neutral-500"
          />
          <input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Jurisdiction"
            className="w-full rounded-lg border border-[#2A2B35] bg-[#101114] px-3 py-2 text-sm text-white sm:w-36"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 py-2 text-xs font-bold text-neutral-950 disabled:opacity-60"
          >
            <Search className="h-3.5 w-3.5" />
            {loading ? "Searching" : "Search"}
          </button>
        </form>
        {mode && <p className="mt-2 text-[11px] font-mono text-neutral-500">Mode: {mode}</p>}
        {notice && <p className="mt-2 text-xs text-amber-300">{notice}</p>}
        {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
      </div>

      {results.length === 0 && mode && !error && (
        <p className="text-sm text-neutral-400">No corpus passages matched. The table is empty until documents are ingested.</p>
      )}

      <div className="space-y-3">
        {results.map((hit) => {
          const open = openId === hit.id;
          return (
            <article key={hit.id} className="rounded-xl border border-[#272830] bg-[#141519] p-4">
              <button type="button" onClick={() => setOpenId(open ? null : hit.id)} className="w-full text-left">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-[#D4AF37]">
                      <Scale className="h-3.5 w-3.5" />
                      <span>{hit.jurisdiction}</span>
                      <span className="text-neutral-600">·</span>
                      <span>{hit.source_type}</span>
                    </div>
                    <h3 className="mt-1 text-sm font-semibold text-white">{hit.citation}</h3>
                    <p className="text-xs text-neutral-400">{hit.title}</p>
                  </div>
                  <div className="text-right text-[10px] font-mono text-neutral-500">
                    {typeof hit.rerank_score === "number" && <div>rerank {hit.rerank_score.toFixed(3)}</div>}
                    <div>sim {Number(hit.similarity || 0).toFixed(3)}</div>
                    <div>fts {Number(hit.fts_rank || 0).toFixed(3)}</div>
                  </div>
                </div>
              </button>
              {open && (
                <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-[#2A2B33] bg-[#101114] p-3 text-xs leading-relaxed text-neutral-200">
                  {hit.content}
                </pre>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
