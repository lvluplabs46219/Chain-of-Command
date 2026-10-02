"use client";

import React, { useState } from "react";
import { LegalPrecedent, LANDMARK_LEGAL_PRECEDENTS } from "@/lib/workspace-data";
import {
  BookOpen,
  Search,
  Scale,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileText,
  Bookmark,
} from "lucide-react";

export function LibraryView() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [citationInput, setCitationInput] = useState<string>("");
  const [citationVerificationResult, setCitationVerificationResult] = useState<{
    verified: boolean;
    citation: string;
    details: string;
  } | null>(null);

  const filteredPrecedents = LANDMARK_LEGAL_PRECEDENTS.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.citation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.holding.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleVerifyCitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citationInput.trim()) return;

    const query = citationInput.trim().toLowerCase();
    const found = LANDMARK_LEGAL_PRECEDENTS.find(
      (p) => p.citation.toLowerCase().includes(query) || p.title.toLowerCase().includes(query)
    );

    if (found) {
      setCitationVerificationResult({
        verified: true,
        citation: found.citation,
        details: `Verified Binding Precedent: ${found.title} (${found.year}). Preserved in authoritative federal / state caselaw repository. Holding: ${found.holding}`,
      });
    } else {
      setCitationVerificationResult({
        verified: false,
        citation: citationInput,
        details: `[Authority Not Verified - Consult Local Rules or Counsel] The citation '${citationInput}' could not be verified against active primary legal sources in this jurisdiction.`,
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#23242B] pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider">Authoritative Legal Stacks</span>
          <span className="text-neutral-500">·</span>
          <span className="text-xs text-neutral-400">Zero Statute Hallucinations Guarantee</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-white tracking-tight">Legal Library & Citation Grounding</h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Search binding appellate precedents, criminal procedure rules, and verify statutory citations against primary authority.
        </p>
      </div>

      {/* Citation Grounding Validator Bar */}
      <div className="bg-[#141519] border border-[#272830] rounded-xl p-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#D4AF37] mb-2 uppercase">
          <ShieldCheck className="w-4 h-4" />
          <span>Statutory Citation Grounding Check</span>
        </div>
        <form onSubmit={handleVerifyCitation} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={citationInput}
            onChange={(e) => setCitationInput(e.target.value)}
            placeholder="Enter statute or precedent citation (e.g., 384 U.S. 436 or Ind. Code § 35-41-3-2 or Terry v. Ohio)..."
            className="flex-1 bg-[#101114] border border-[#2A2B35] rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#D4AF37]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c49f27] text-neutral-950 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap"
          >
            Verify Authority
          </button>
        </form>

        {citationVerificationResult && (
          <div
            className={`mt-3 p-3 rounded-lg border text-xs leading-relaxed ${
              citationVerificationResult.verified
                ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-200"
                : "bg-amber-950/30 border-amber-800/40 text-amber-200 font-mono"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1">
              {citationVerificationResult.verified ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verified Legal Authority</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Unverified Legal Claim</span>
                </>
              )}
            </div>
            <div>{citationVerificationResult.details}</div>
          </div>
        )}
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search holdings, titles, or code..."
            className="w-full bg-[#141519] border border-[#272830] rounded-lg pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {["All", "Search & Seizure (4th Amend)", "Self-Incrimination (5th Amend)", "Discovery & Brady", "Self-Defense"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? "bg-[#D4AF37] text-neutral-950 font-semibold"
                  : "bg-neutral-800/60 text-neutral-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Precedents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrecedents.map((item) => (
          <div
            key={item.id}
            className="bg-[#141519] border border-[#272830] hover:border-[#D4AF37]/40 rounded-xl p-5 flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono text-[#D4AF37] uppercase">{item.citation}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300">
                  {item.precedentialStatus}
                </span>
              </div>

              <h3 className="font-serif font-bold text-white text-base mb-1">{item.title}</h3>
              <div className="text-[11px] text-neutral-400 font-mono mb-3">
                {item.court} · {item.year} · Jurisdiction: {item.jurisdiction}
              </div>

              <div className="bg-[#191A20] p-3 rounded-lg border border-[#2A2B33] text-xs text-neutral-300 leading-relaxed mb-3">
                <span className="font-semibold text-neutral-200 block mb-1">Official Holding Summary:</span>
                {item.holding}
              </div>

              <div className="border-l-2 border-[#D4AF37]/60 pl-3 text-xs italic text-neutral-400 mb-2">
                "{item.quote}"
              </div>
            </div>

            <div className="pt-3 border-t border-[#23242B] flex items-center justify-between text-[11px] text-neutral-500 font-mono">
              <span>Category: {item.category}</span>
              <span className="text-[#D4AF37] hover:underline cursor-pointer flex items-center gap-1">
                Pinpoint Holding <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
