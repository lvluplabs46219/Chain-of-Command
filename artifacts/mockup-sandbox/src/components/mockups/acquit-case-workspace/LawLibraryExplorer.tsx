import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Database,
  FileText,
  Filter,
  Gavel,
  Loader2,
  Scale,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { MIGRATED_CASE_LAW_DATABASE, type LegalAuthority } from "./legalData";

interface LawLibraryExplorerProps {
  initialSelectedAuthority?: LegalAuthority | null;
  onCiteAuthority?: (authority: LegalAuthority) => void;
}

export function LawLibraryExplorer({ initialSelectedAuthority, onCiteAuthority }: LawLibraryExplorerProps) {
  const [authorities, setAuthorities] = useState<LegalAuthority[]>(MIGRATED_CASE_LAW_DATABASE);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [selectedAuth, setSelectedAuth] = useState<LegalAuthority | null>(initialSelectedAuthority || null);
  
  // AI Research State
  const [isSearching, setIsSearching] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const filteredAuthorities = authorities.filter((auth) => {
    const matchesQuery =
      auth.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auth.citation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auth.holdingSummary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = typeFilter === "All" || auth.type === typeFilter;
    return matchesQuery && matchesFilter;
  });

  const handleSemanticSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setAiSummary(null);
    
    // Simulate AI semantic search delay
    setTimeout(() => {
      setIsSearching(false);
      setAiSummary(`AI Synthesis for "${searchQuery}": Found multiple relevant precedents. The core legal principle suggests that under Indiana Law, courts closely examine the temporal scope of the warrant. Key cases to review include State v. Jackson and Smith v. Indiana.`);
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col bg-transparent">
      {/* Search Header */}
      <div className="mb-6 rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/20">
            <Sparkles size={14} className="text-[#D4AF37]" />
          </div>
          <h2 className="text-sm font-bold tracking-widest text-white uppercase">AI Legal Research Engine</h2>
        </div>
        
        <p className="text-xs text-white/50 mb-5 leading-relaxed max-w-3xl">
          Search internal case law, statutes, and procedural rules using semantic AI analysis. The engine understands legal concepts, not just keywords.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="e.g. 'Can a defendant challenge a search after being arrested?'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSemanticSearch()}
              className="w-full rounded-full border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-xs font-medium text-white placeholder-white/30 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
            />
          </div>
          <button
            onClick={handleSemanticSearch}
            disabled={isSearching}
            className="w-full sm:w-auto rounded-full bg-white px-6 py-3 text-[10px] font-bold tracking-widest text-black hover:bg-[#EFE6D0] transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {isSearching ? "ANALYZING..." : "SEARCH AI"}
          </button>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {["All", "Case Law", "Statute", "Rule"].map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`rounded-full border px-4 py-1.5 text-[10px] font-bold tracking-widest transition-colors ${
                typeFilter === f
                  ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                  : "border-white/10 bg-black/20 text-white/40 hover:text-white"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* AI Synthesis Result */}
      {aiSummary && (
        <div className="mb-6 rounded-[18px] border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-5 animate-in fade-in zoom-in-95">
          <div className="flex items-start gap-4">
            <div className="mt-1 p-2 rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold tracking-widest text-[#D4AF37] mb-2 uppercase">AI Synthesis</h3>
              <p className="text-sm leading-relaxed text-white/90">{aiSummary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-12">
        {filteredAuthorities.length === 0 && !isSearching ? (
          <div className="py-12 text-center text-xs text-white/40 border border-white/5 rounded-2xl border-dashed">
            No authorities found matching your query.
          </div>
        ) : (
          filteredAuthorities.map((auth) => (
            <div
              key={auth.id}
              className="rounded-2xl border border-white/10 bg-black/40 p-5 transition hover:border-white/20 group cursor-pointer"
              onClick={() => setSelectedAuth(auth)}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-white/40">
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[#D4AF37]">
                      {auth.jurisdiction}
                    </span>
                    <span>{auth.type}</span>
                    {auth.precedentialStatus === "Binding" && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 size={10} /> BINDING
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-base font-serif text-white group-hover:text-[#D4AF37] transition">
                    {auth.title}
                  </h3>
                  <p className="text-xs font-bold text-white/60 mt-1">{auth.citation}</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-white/50 leading-relaxed border-l-2 border-white/10 pl-3">
                {auth.holdingSummary}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Detailed Authority Modal */}
      {selectedAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="rounded-md bg-[#D4AF37]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#D4AF37] tracking-widest uppercase">
                  {selectedAuth.precedentialStatus} · {selectedAuth.jurisdiction}
                </span>
                <h3 className="mt-2 font-serif text-xl text-white">
                  {selectedAuth.title}
                </h3>
                <p className="text-xs font-bold text-white/50 mt-1">{selectedAuth.citation}</p>
              </div>
              <button
                onClick={() => setSelectedAuth(null)}
                className="rounded-full p-2 text-white/40 hover:bg-white/10 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="mt-6 max-h-[60vh] overflow-y-auto space-y-6 pr-2 text-xs text-white/70">
              <div>
                <h4 className="font-bold text-white/40 mb-2 uppercase tracking-widest text-[10px]">
                  Court & Issuing Authority
                </h4>
                <p className="text-white">{selectedAuth.court} — Decided {selectedAuth.year}</p>
              </div>
              
              <div>
                <h4 className="font-bold text-white/40 mb-2 uppercase tracking-widest text-[10px]">
                  Holding & Core Principle
                </h4>
                <p className="leading-relaxed text-white/90 rounded-xl bg-white/5 p-4 border border-white/10">
                  {selectedAuth.holdingSummary}
                </p>
              </div>
              
              <div>
                <h4 className="font-bold text-white/40 mb-2 uppercase tracking-widest text-[10px]">
                  Opinion Excerpt ({selectedAuth.pinpointPage || "Official Text"})
                </h4>
                <blockquote className="rounded-xl border-l-2 border-[#D4AF37] bg-[#D4AF37]/5 p-4 italic text-white/80 leading-relaxed font-serif text-sm">
                  "{selectedAuth.verbatimExcerpt}"
                </blockquote>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-5">
              <button
                onClick={() => setSelectedAuth(null)}
                className="rounded-full border border-white/20 px-5 py-2.5 text-[10px] font-bold tracking-widest text-white hover:bg-white/10 transition"
              >
                CLOSE
              </button>
              {onCiteAuthority && (
                <button
                  onClick={() => {
                    const auth = selectedAuth;
                    setSelectedAuth(null);
                    onCiteAuthority(auth);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-5 py-2.5 text-[10px] font-bold tracking-widest text-black hover:bg-[#F2C94C] transition"
                >
                  <Sparkles size={14} />
                  CITE IN PROMPT
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
