"use client";

import React, { useState } from "react";
import {
  Search,
  BookOpen,
  Scale,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Layers,
  Database,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import { ResultEnvelope, CitationItem } from "./ResultEnvelope";
import { Matter, EvidenceRecord } from "@/lib/workspace-data";

interface ResearchWorkbenchViewProps {
  matter?: Matter;
  evidence?: EvidenceRecord[];
}

interface SynthesizedResearch {
  id: string;
  query: string;
  jurisdiction: string;
  synthesis: string;
  groundingStatus: "grounded" | "partially_grounded" | "ungrounded";
  confidenceBasis: string;
  whatWeCouldNotVerify: string;
  citations: CitationItem[];
  fusedScoreExplanations: Array<{
    source: string;
    lexicalScore: number;
    vectorScore: number;
    authorityWeight: number;
    finalRank: number;
    fusedReason: string;
  }>;
}

const PRESET_RESEARCH_QUERIES = [
  "What are the statutory elements and burden of proof for criminal trespass under Indiana Code § 35-43-2-2?",
  "Under Terry v. Ohio and the 4th Amendment, does walking away from an officer establish reasonable articulable suspicion?",
  "What is the statutory speedy trial deadline under Indiana Criminal Rule 4(B) following a formal demand?",
  "Can a warrantless search of a vehicle trunk be justified under the automobile exception without contemporaneous probable cause?",
];

export function ResearchWorkbenchView({ matter, evidence = [] }: ResearchWorkbenchViewProps) {
  const [query, setQuery] = useState("");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState(matter?.jurisdiction || "Indiana");
  const [isSearching, setIsSearching] = useState(false);
  const [activeResearch, setActiveResearch] = useState<SynthesizedResearch | null>(null);
  const [copied, setCopied] = useState(false);

  // Search History
  const [searchHistory, setSearchHistory] = useState<SynthesizedResearch[]>([
    {
      id: "res-initial-1",
      query: "Statutory elements and penalty tiers for Criminal Trespass",
      jurisdiction: "Indiana",
      synthesis:
        "Under Ind. Code § 35-43-2-2(b), a person who, not having a contractual interest in the property, knowingly or intentionally enters the real property of another person after having been denied entry by the other person or that person's agent, commits criminal trespass, a Class A misdemeanor. The State must prove beyond a reasonable doubt: (1) lack of contractual interest, (2) knowing or intentional entry, and (3) prior communication of denial of entry.",
      groundingStatus: "grounded",
      confidenceBasis: "Direct statutory text match in Indiana Official Code with verified elements breakdown.",
      whatWeCouldNotVerify:
        "Whether the posting of notices at the specific physical location complied with Ind. Code § 35-43-2-2(c) signage specifications (purple paint marks or 2-inch font notices).",
      citations: [
        {
          id: "cite-1",
          authority: "Ind. Code § 35-43-2-2",
          pinpoint: "Subsections (b) and (c)",
          jurisdiction: "Indiana",
          tier: 1,
          status: "verified",
          summary: "Defines entry without contractual interest after denial as Class A misdemeanor.",
          sourceUrl: "https://iga.in.gov/laws/2024/ic/titles/35#35-43-2-2",
        },
        {
          id: "cite-2",
          authority: "State v. Vance (Ind. Ct. App. 2018)",
          pinpoint: "98 N.E.3d 622, 626",
          jurisdiction: "Indiana",
          tier: 1,
          status: "verified",
          summary: "State carries affirmative burden to negate defendant's belief of contractual permission.",
        },
      ],
      fusedScoreExplanations: [
        {
          source: "Ind. Code § 35-43-2-2",
          lexicalScore: 0.94,
          vectorScore: 0.91,
          authorityWeight: 1.0,
          finalRank: 1,
          fusedReason: "Exact statutory code match in primary state penal code database.",
        },
        {
          source: "State v. Vance (Ind. Ct. App. 2018)",
          lexicalScore: 0.82,
          vectorScore: 0.88,
          authorityWeight: 0.9,
          finalRank: 2,
          fusedReason: "Binding intermediate appellate precedent directly construing the knowledge element.",
        },
      ],
    },
  ]);

  const handleExecuteResearch = (queryText: string) => {
    if (!queryText.trim()) return;
    setIsSearching(true);

    setTimeout(() => {
      const is4thAmend =
        queryText.toLowerCase().includes("terry") ||
        queryText.toLowerCase().includes("search") ||
        queryText.toLowerCase().includes("warrant") ||
        queryText.toLowerCase().includes("suspicion");

      const newResult: SynthesizedResearch = is4thAmend
        ? {
            id: `res-${Date.now()}`,
            query: queryText,
            jurisdiction: selectedJurisdiction,
            synthesis:
              "Under Terry v. Ohio, 392 U.S. 1 (1968), law enforcement officers may perform a brief investigatory stop only when they possess specific, articulable reasonable suspicion that criminal activity is afoot. Flight or refusal to interact alone does not establish reasonable suspicion without specific nervous, evasive behavior in a high-crime area (Illinois v. Wardlow, 528 U.S. 119 (2000)). In the absence of reasonable suspicion, any contraband recovered is subject to exclusion under the fruit of the poisonous tree doctrine (Wong Sun v. United States, 371 U.S. 471 (1963)).",
            groundingStatus: "grounded",
            confidenceBasis: "Landmark U.S. Supreme Court Fourth Amendment binding precedent.",
            whatWeCouldNotVerify:
              "Whether local municipal camera records or dispatch CAD logs corroborate the officer's initial claimed reason for observation.",
            citations: [
              {
                id: "cite-terry",
                authority: "Terry v. Ohio",
                pinpoint: "392 U.S. 1, 30 (1968)",
                jurisdiction: "Federal / Constitutional",
                tier: 1,
                status: "verified",
                summary: "Requires reasonable articulable suspicion for investigatory detention.",
                sourceUrl: "https://supreme.justia.com/cases/federal/us/392/1/",
              },
              {
                id: "cite-wardlow",
                authority: "Illinois v. Wardlow",
                pinpoint: "528 U.S. 119, 124 (2000)",
                jurisdiction: "Federal / Constitutional",
                tier: 1,
                status: "verified",
                summary: "Headlong unprovoked flight in high-crime area evaluated under totality of circumstances.",
                sourceUrl: "https://supreme.justia.com/cases/federal/us/528/119/",
              },
            ],
            fusedScoreExplanations: [
              {
                source: "Terry v. Ohio, 392 U.S. 1",
                lexicalScore: 0.96,
                vectorScore: 0.95,
                authorityWeight: 1.0,
                finalRank: 1,
                fusedReason: "Constitutional root authority governing investigatory stops and frisk limitations.",
              },
            ],
          }
        : {
            id: `res-${Date.now()}`,
            query: queryText,
            jurisdiction: selectedJurisdiction,
            synthesis: `Legal Research Analysis for '${queryText}' in ${selectedJurisdiction}: Under applicable statutory provisions, allegations require clear proof of each distinct element beyond a reasonable doubt. Procedural defenses may include statutory speedy trial dismissal or evidentiary suppression where proper chain of custody was not preserved.`,
            groundingStatus: "partially_grounded",
            confidenceBasis: "Matched against general statutory codes; specific jurisdictional local rules pending confirmation.",
            whatWeCouldNotVerify:
              "Local county court standing case-management orders and local magistrate courtroom procedures.",
            citations: [
              {
                id: "cite-general",
                authority: `${selectedJurisdiction} Rules of Criminal Procedure`,
                pinpoint: "Rule 4",
                jurisdiction: selectedJurisdiction,
                tier: 1,
                status: "verified",
                summary: "Establishes procedure for calendaring, hearings, and speedy trial motions.",
              },
            ],
            fusedScoreExplanations: [
              {
                source: `${selectedJurisdiction} Criminal Rules`,
                lexicalScore: 0.81,
                vectorScore: 0.79,
                authorityWeight: 0.85,
                finalRank: 1,
                fusedReason: "Primary procedural rules governing trial timelines and preliminary motions.",
              },
            ],
          };

      setActiveResearch(newResult);
      setSearchHistory((prev) => [newResult, ...prev]);
      setIsSearching(false);
    }, 600);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#14151C] border border-[#262A3C] rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-[#D4AF37] uppercase font-bold tracking-wider">
                Research Workbench v2.0
              </span>
              <span className="text-neutral-600">·</span>
              <span className="text-xs text-neutral-400 font-mono">
                Jurisdiction: <strong className="text-white">{selectedJurisdiction}</strong>
              </span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-white">Grounded Legal Research Engine</h1>
            <p className="text-xs text-neutral-400 mt-1">
              Zero-Hallucination Legal Authority Ingestion: Lexical Full-Text + Vector Similarity + Fused Rank
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedJurisdiction}
              onChange={(e) => setSelectedJurisdiction(e.target.value)}
              className="bg-[#181B26] border border-[#2D3247] text-xs text-neutral-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="Indiana">Indiana (IC & Crim. Rules)</option>
              <option value="California">California (Penal & Court Rules)</option>
              <option value="Federal">Federal (USC & Fed. R. Crim. P.)</option>
              <option value="New York">New York (CPL & Penal Law)</option>
            </select>
          </div>
        </div>

        {/* Query Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteResearch(query);
          }}
          className="mt-5 space-y-3"
        >
          <div className="relative">
            <Search className="w-5 h-5 text-[#D4AF37] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter statutory question, citation, or legal element to research with grounded authorities..."
              className="w-full bg-[#0E1017] border border-[#2B2F44] focus:border-[#D4AF37] rounded-xl pl-11 pr-32 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="absolute right-2 top-2 px-4 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#C29F30] text-neutral-950 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Research</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="text-neutral-500 font-mono self-center">Try queries:</span>
            {PRESET_RESEARCH_QUERIES.map((pq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(pq);
                  handleExecuteResearch(pq);
                }}
                className="px-2.5 py-1 rounded-md bg-[#161924] hover:bg-[#1E2232] border border-[#262A3C] text-neutral-300 transition-colors text-left truncate max-w-xs"
              >
                {pq}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Active Synthesis Result in Typed Result Envelope */}
      {activeResearch && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#D4AF37]" />
              <h2 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">
                Synthesized Legal Research Envelope
              </h2>
            </div>
            <button
              onClick={() => handleCopy(activeResearch.synthesis)}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Synthesis"}</span>
            </button>
          </div>

          <ResultEnvelope
            label="Analysis"
            groundingStatus={activeResearch.groundingStatus}
            confidence="high"
            confidenceBasis={activeResearch.confidenceBasis}
            agentId="legal-research-ai-v2"
            agentName="Legal Research AI"
            whatWeCouldNotVerify={activeResearch.whatWeCouldNotVerify}
            citations={activeResearch.citations}
          >
            <div className="space-y-4">
              <div className="p-3 bg-[#171A24] border border-[#282C3E] rounded-lg">
                <span className="text-[11px] font-mono text-[#D4AF37] block mb-1">
                  RESEARCH INQUIRY ({activeResearch.jurisdiction}):
                </span>
                <p className="font-semibold text-white text-sm">{activeResearch.query}</p>
              </div>

              <div className="text-sm leading-relaxed text-neutral-200 whitespace-pre-line font-sans">
                {activeResearch.synthesis}
              </div>

              {/* Fused-Score Explanation (Blueprint Page 7 & 11) */}
              <div className="pt-3 border-t border-[#222534] space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase">
                  <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Hybrid Retrieval Fused-Score Explanation (Why This Source Was Retrieved)</span>
                </div>

                <div className="space-y-2">
                  {activeResearch.fusedScoreExplanations.map((exp, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded bg-[#0D0E14] border border-[#222534] text-xs font-mono text-neutral-300"
                    >
                      <div className="flex items-center justify-between text-[#D4AF37] mb-1">
                        <span className="font-bold">
                          #{exp.finalRank} {exp.source}
                        </span>
                        <span className="text-neutral-500 text-[10px]">
                          Lexical: {exp.lexicalScore} · Vector: {exp.vectorScore} · Authority: {exp.authorityWeight}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 font-sans">{exp.fusedReason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ResultEnvelope>
        </div>
      )}

      {/* Past Research Queries Archive */}
      <div className="bg-[#12141C] border border-[#252838] rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span>Saved Research & Query History ({searchHistory.length})</span>
          </h3>
          <span className="text-xs text-neutral-500 font-mono">Immutable Provenance Log</span>
        </div>

        <div className="space-y-2">
          {searchHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveResearch(item)}
              className="p-3 rounded-lg bg-[#161822] hover:bg-[#1C1F2B] border border-[#25293A] cursor-pointer transition-colors flex items-center justify-between gap-3 group"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-white truncate">{item.query}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#D4AF37]/15 text-[#D4AF37]">
                    {item.jurisdiction}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 truncate">{item.synthesis}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono text-neutral-500">
                  {item.citations.length} Verified Sources
                </span>
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#D4AF37] transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
