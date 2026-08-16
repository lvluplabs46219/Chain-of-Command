import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileCode2,
  Info,
  Layers,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { type AiChatMessage, type LegalAuthority, type RagSourceClaim } from "./legalData";

interface RagCitationViewerProps {
  message: AiChatMessage;
  onOpenLawLibrary?: (authority: LegalAuthority) => void;
}

export function RagCitationViewer({ message, onOpenLawLibrary }: RagCitationViewerProps) {
  const [selectedClaim, setSelectedClaim] = useState<RagSourceClaim | null>(null);
  const [showAllSources, setShowAllSources] = useState(false);
  const [activeTab, setActiveTab] = useState<"claims" | "provenance">("claims");

  return (
    <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-5 shadow-[0_10px_30px_rgba(47,78,69,.05)] sm:p-6">
      {/* Header with Agent Info & Grounding Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs ${message.agentColor}`}>
            {message.agentAvatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white/70">{message.agentName}</h3>
              <span className="rounded-full bg-[rgba(255,255,255,0.03)] px-2 py-0.5 text-[10px] font-bold text-white/70">
                {message.agentRole}
              </span>
            </div>
            <p className="text-[11px] text-white/70">{message.timestamp}</p>
          </div>
        </div>

        {/* Grounding Telemetry Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[rgba(255,255,255,0.03)] px-3 py-1.5 text-xs">
          <ShieldCheck size={16} className="text-white/70" />
          <div>
            <span className="font-semibold text-white/70">
              {message.ragMetrics.groundingScorePercent}% RAG Grounded
            </span>
            <span className="hidden text-[11px] text-white/70 sm:inline">
              {" "}· {message.claims.length} Legal Authorities Verified
            </span>
          </div>
        </div>
      </div>

      {/* RAG Claims Visual Indicators Bar */}
      <div className="mt-4 rounded-xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-3">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-white/70">
            <Sparkles size={13} className="text-white/70" />
            Evidence & Citation Retrieval Traces
          </div>
          <button
            onClick={() => setShowAllSources(!showAllSources)}
            className="flex items-center gap-1 font-bold text-white/70 hover:underline"
          >
            {showAllSources ? "Hide Sources" : `Inspect All ${message.claims.length} Sources`}
            {showAllSources ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        {/* Quick-pill Citation Badges */}
        <div className="mt-2.5 flex flex-wrap gap-2">
          {message.claims.map((claim, idx) => (
            <button
              key={claim.id}
              onClick={() => setSelectedClaim(claim)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[rgba(255,255,255,0.03)] px-2.5 py-1 text-xs font-semibold text-white/70 transition hover:border-white/10 hover:bg-[rgba(255,255,255,0.03)] shadow-2xs"
            >
              <Scale size={13} className="text-white/70" />
              <span className="max-w-[210px] truncate">{claim.authority.citation}</span>
              <span className="rounded-full bg-[rgba(255,255,255,0.03)] px-1.5 py-0.2 text-[10px] font-bold text-white/70">
                {claim.confidenceScore}%
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Message Content */}
      <div className="mt-4 text-xs sm:text-sm text-white/70 leading-relaxed whitespace-pre-line font-[#404040]">
        {message.content}
      </div>

      {/* Legal Claims & Grounding Cards List (When Expanded or Always Visible Below) */}
      {showAllSources && (
        <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
              <Layers size={14} /> Verified Grounding Claims ({message.claims.length})
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("claims")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                  activeTab === "claims" ? "bg-[rgba(255,255,255,0.03)] text-white" : "bg-[rgba(255,255,255,0.03)] text-white/70"
                }`}
              >
                Claims & Sources
              </button>
              <button
                onClick={() => setActiveTab("provenance")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                  activeTab === "provenance" ? "bg-[rgba(255,255,255,0.03)] text-white" : "bg-[rgba(255,255,255,0.03)] text-white/70"
                }`}
              >
                Vector Provenance
              </button>
            </div>
          </div>

          {activeTab === "claims" ? (
            <div className="grid gap-3 sm:grid-cols-1">
              {message.claims.map((claim) => (
                <div
                  key={claim.id}
                  className="group rounded-xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 transition hover:border-white/10 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-[rgba(255,255,255,0.03)] px-2 py-0.5 text-[11px] font-bold text-white/70">
                        <CheckCircle2 size={12} className="text-white/70" /> {claim.supportType}
                      </span>
                      <span className="text-[11px] font-semibold text-white/70">
                        Offset: {claim.pageOffset}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-white/70">
                      {claim.confidenceScore}% Support Confidence
                    </div>
                  </div>

                  <p className="mt-2 text-xs font-semibold text-white/70">
                    "{claim.claimText}"
                  </p>

                  <div className="mt-3 rounded-lg border border-white/10 bg-[rgba(255,255,255,0.03)] p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white/70">{claim.authority.title}</span>
                      <span className="text-[11px] font-semibold text-white/70">{claim.authority.citation}</span>
                    </div>
                    <p className="mt-1 text-[11px] italic text-white/70 line-clamp-2">
                      "{claim.authority.verbatimExcerpt}"
                    </p>
                    <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 text-[11px]">
                      <span className="text-white/70">
                        Status: <strong className="text-white/70">{claim.authority.precedentialStatus}</strong>
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedClaim(claim)}
                          className="font-bold text-white/70 hover:underline"
                        >
                          View Full Details
                        </button>
                        {onOpenLawLibrary && (
                          <button
                            onClick={() => onOpenLawLibrary(claim.authority)}
                            className="flex items-center gap-1 font-bold text-white/70 hover:underline"
                          >
                            Open in Library <ExternalLink size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-white/70">
                <FileCode2 size={15} /> RAG Vector Retrieval Audit Log
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-white/70">
                <div>
                  <span className="font-semibold text-white/70">Embedding Model:</span> {message.ragMetrics.embeddingModel}
                </div>
                <div>
                  <span className="font-semibold text-white/70">Vector Similarity Index:</span> HNSW cosine_distance &lt; 0.15
                </div>
                <div>
                  <span className="font-semibold text-white/70">Total Index Corpus:</span> {message.ragMetrics.totalAuthoritiesQueried.toLocaleString()} Authorities
                </div>
                <div>
                  <span className="font-semibold text-white/70">Query Response Latency:</span> {message.ragMetrics.vectorIndexTimeMs} ms
                </div>
              </div>
              <p className="text-[11px] text-white/70 pt-1">
                Every legal authority cited is linked to an immutable IPFS Content Identifier (CID) in the <code className="bg-[rgba(255,255,255,0.03)] px-1 rounded">ipfs.source_pins</code> database table.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Selected Claim Source Inspector Modal / Drawer */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-white/70">
                  <Scale size={14} /> Source Authority & Grounding Inspector
                </div>
                <h3 className="mt-1 font-['Fraunces'] text-xl font-semibold text-white/70">
                  {selectedClaim.authority.title}
                </h3>
                <p className="text-xs text-white/70">{selectedClaim.authority.citation}</p>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="rounded-lg p-1.5 text-white/70 hover:bg-[rgba(255,255,255,0.03)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-4 pr-1">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[rgba(255,255,255,0.03)] p-3 text-xs">
                <div>
                  <span className="text-white/70">Precedential Status: </span>
                  <strong className="text-white/70">{selectedClaim.authority.precedentialStatus}</strong>
                </div>
                <div>
                  <span className="text-white/70">Jurisdiction: </span>
                  <strong className="text-white/70">{selectedClaim.authority.court} ({selectedClaim.authority.year})</strong>
                </div>
                <div className="rounded-md bg-[rgba(255,255,255,0.03)] px-2 py-0.5 font-bold text-white/70">
                  {selectedClaim.confidenceScore}% Grounding Match
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                  Claim Supported in AI Response
                </h4>
                <p className="rounded-lg border border-white/10 bg-[rgba(255,255,255,0.03)] p-3 text-xs text-white/70">
                  "{selectedClaim.claimText}"
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                  Holding & Key Summary
                </h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  {selectedClaim.authority.holdingSummary}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                  Verbatim Court Excerpt ({selectedClaim.pageOffset})
                </h4>
                <blockquote className="rounded-lg border-l-4 border-white/10 bg-[rgba(255,255,255,0.03)]/50 p-3 text-xs italic text-white/70 leading-relaxed">
                  "{selectedClaim.authority.verbatimExcerpt}"
                </blockquote>
              </div>

              <div className="rounded-xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-3.5 text-[11px] space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-white/70">
                  <ShieldCheck size={14} className="text-white/70" /> IPFS Content Addressing & Integrity
                </div>
                <div className="flex items-center justify-between font-mono text-[10px] text-white/70">
                  <span className="truncate">CID: {selectedClaim.authority.ipfsCid}</span>
                  <span className="rounded bg-[rgba(255,255,255,0.03)] px-1.5 py-0.5 text-white/70 font-sans font-bold">
                    Pinned (local + Pinata)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
              <button
                onClick={() => setSelectedClaim(null)}
                className="rounded-xl border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-2 text-xs font-bold text-white/70 hover:bg-[rgba(255,255,255,0.03)]"
              >
                Close
              </button>
              {onOpenLawLibrary && (
                <button
                  onClick={() => {
                    const auth = selectedClaim.authority;
                    setSelectedClaim(null);
                    onOpenLawLibrary(auth);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[rgba(255,255,255,0.03)] px-4 py-2 text-xs font-bold text-white/70 hover:bg-[rgba(255,255,255,0.03)]"
                >
                  Inspect in Law Library <ExternalLink size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
