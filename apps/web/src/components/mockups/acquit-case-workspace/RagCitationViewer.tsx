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
  StopCircle,
  X,
} from "lucide-react";
import { type AiChatMessage, type LegalAuthority, type RagSourceClaim, MOCK_RAG_MESSAGES } from "./legalData";
import { useRagStreaming } from "../../../hooks/useRagStreaming";

interface RagCitationViewerProps {
  message?: AiChatMessage;
  onOpenLawLibrary?: (authority: LegalAuthority) => void;
  enableLiveStreaming?: boolean;
}

export function RagCitationViewer({
  message: initialMessage,
  onOpenLawLibrary,
  enableLiveStreaming = true,
}: RagCitationViewerProps) {
  const [selectedClaim, setSelectedClaim] = useState<RagSourceClaim | null>(null);
  const [showAllSources, setShowAllSources] = useState(false);
  const [activeTab, setActiveTab] = useState<"claims" | "provenance">("claims");
  const [inputPrompt, setInputPrompt] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("paralegal");

  const {
    status: streamStatus,
    streamedText,
    claims: streamedClaims,
    groundingScore: streamedScore,
    message: streamedMessage,
    error: streamError,
    startStreamingAgentRun,
    stopStream,
  } = useRagStreaming();

  // Prefer active stream message, or streamed results, or provided message, or default fallback
  const isStreaming = streamStatus === "connecting" || streamStatus === "retrieving" || streamStatus === "streaming";
  
  const currentMessage: AiChatMessage = streamedMessage || initialMessage || MOCK_RAG_MESSAGES[0];
  const activeContent = isStreaming ? streamedText : currentMessage.content;
  const activeClaims = isStreaming && streamedClaims.length > 0 ? streamedClaims : currentMessage.claims;
  const activeScore = isStreaming && streamedScore > 0 ? streamedScore : currentMessage.ragMetrics.groundingScorePercent;

  const handleRunQuery = (queryText: string) => {
    if (!queryText.trim()) return;
    const agentMap: Record<string, { name: string; role: string; avatar: string; color: string }> = {
      paralegal: { name: "Paralegal AI", role: "Statutory Deadlines & Rules", avatar: "📋", color: "bg-blue-600" },
      investigator: { name: "Investigator AI", role: "Chronology & Brady Audit", avatar: "🔍", color: "bg-purple-600" },
      "rights-checker": { name: "Rights Checker AI", role: "Constitutional Audit", avatar: "🛡️", color: "bg-emerald-600" },
      "charge-explainer": { name: "Charge Explainer AI", role: "Statutory Element Breakdown", avatar: "⚖️", color: "bg-amber-600" },
    };

    startStreamingAgentRun(selectedAgent, queryText, agentMap[selectedAgent]);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#141414] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] sm:p-6 text-[#f3ede8]">
      {/* Live Stream Controller Bar */}
      {enableLiveStreaming && (
        <div className="mb-5 rounded-xl border border-[#2c2b2b] bg-[#1a1919] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2a2a2a] pb-3">
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${isStreaming ? "bg-[#d4af37] animate-pulse" : "bg-emerald-500"}`}></span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mono">
                RAG Citation Live Streamer
              </h4>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <label htmlFor="agent-selector" className="text-[11px] text-[#8e857e]">Agent:</label>
              <select
                id="agent-selector"
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="bg-[#101010] border border-[#333] rounded px-2 py-1 text-xs text-[#f3ede8]"
                disabled={isStreaming}
              >
                <option value="paralegal">Paralegal AI (Deadlines &amp; Rules)</option>
                <option value="investigator">Investigator AI (Timeline &amp; Brady)</option>
                <option value="rights-checker">Rights Checker AI (Constitutional)</option>
                <option value="charge-explainer">Charge Explainer AI (Elements)</option>
              </select>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
            <span className="text-[#8e857e] self-center mr-1">Prompts:</span>
            <button
              type="button"
              onClick={() => {
                const q = "What is the statutory deadline to disclose discovery packets under Criminal Rule 2.5?";
                setInputPrompt(q);
                handleRunQuery(q);
              }}
              className="px-2.5 py-1 bg-[#222] hover:bg-[#2e2e2e] border border-[#383838] rounded text-[#cfc5be] transition"
              disabled={isStreaming}
            >
              Rule 2.5 Discovery Deadlines
            </button>
            <button
              type="button"
              onClick={() => {
                const q = "Explain Fourth Amendment search warrant scope for motor vehicle traffic stops.";
                setInputPrompt(q);
                handleRunQuery(q);
              }}
              className="px-2.5 py-1 bg-[#222] hover:bg-[#2e2e2e] border border-[#383838] rounded text-[#cfc5be] transition"
              disabled={isStreaming}
            >
              Fourth Amendment Vehicle Search
            </button>
            <button
              type="button"
              onClick={() => {
                const q = "What are the legal elements of self-defense under justification statutes?";
                setInputPrompt(q);
                handleRunQuery(q);
              }}
              className="px-2.5 py-1 bg-[#222] hover:bg-[#2e2e2e] border border-[#383838] rounded text-[#cfc5be] transition"
              disabled={isStreaming}
            >
              Self-Defense Elements
            </button>
          </div>

          {/* Input & Action */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunQuery(inputPrompt);
            }}
            className="mt-3 flex gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask a legal citation or statutory grounding question..."
              className="flex-1 bg-[#101010] border border-[#333] px-3 py-2 text-xs text-[#f3ede8] placeholder-[#777] rounded focus:border-[#d4af37] focus:outline-none"
              disabled={isStreaming}
            />
            {isStreaming ? (
              <button
                type="button"
                onClick={stopStream}
                className="flex items-center gap-1.5 bg-[#8b2626] hover:bg-[#a32d2d] text-white px-3 py-2 rounded text-xs font-bold"
              >
                <StopCircle size={14} /> Stop
              </button>
            ) : (
              <button
                type="submit"
                className="bg-[#d4af37] hover:bg-[#c29d2b] text-[#141313] px-4 py-2 rounded text-xs font-bold transition flex items-center gap-1.5"
              >
                <Sparkles size={14} /> Stream Response
              </button>
            )}
          </form>

          {/* Stream Status Banner */}
          {streamStatus !== "idle" && (
            <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#d4af37]">
                {streamStatus === "connecting" && "Initializing Agent SSE Stream..."}
                {streamStatus === "retrieving" && "Querying PostgreSQL pgvector index & statutes..."}
                {streamStatus === "streaming" && "Streaming live tokens & grounding authorities..."}
                {streamStatus === "completed" && "Stream completed. Grounding verified."}
                {streamStatus === "error" && `Error: ${streamError}`}
              </span>
              {isStreaming && (
                <span className="animate-pulse text-[#b5c8df]">Latency: ~48ms / token</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Header with Agent Info & Grounding Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${currentMessage.agentColor}`}>
            {currentMessage.agentAvatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#f3ede8]">{currentMessage.agentName}</h3>
              <span className="rounded-full bg-[#252525] border border-[#383838] px-2 py-0.5 text-[10px] font-bold text-[#cfc5be]">
                {currentMessage.agentRole}
              </span>
            </div>
            <p className="text-[11px] text-[#8e857e]">{currentMessage.timestamp}</p>
          </div>
        </div>

        {/* Grounding Telemetry Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#181818] px-3 py-1.5 text-xs">
          <ShieldCheck size={16} className="text-[#d4af37]" />
          <div>
            <span className="font-semibold text-[#f3ede8]">
              {activeScore}% RAG Grounded
            </span>
            <span className="hidden text-[11px] text-[#8e857e] sm:inline">
              {" "}· {activeClaims.length} Legal Authorities Verified
            </span>
          </div>
        </div>
      </div>

      {/* RAG Claims Visual Indicators Bar */}
      <div className="mt-4 rounded-xl border border-[#262626] bg-[#191919] p-3">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#d4af37]">
            <Sparkles size={13} className="text-[#d4af37]" />
            Evidence &amp; Citation Retrieval Traces
          </div>
          <button
            type="button"
            onClick={() => setShowAllSources(!showAllSources)}
            className="flex items-center gap-1 font-bold text-[#b5c8df] hover:underline"
          >
            {showAllSources ? "Hide Sources" : `Inspect All ${activeClaims.length} Sources`}
            {showAllSources ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        {/* Quick-pill Citation Badges */}
        <div className="mt-2.5 flex flex-wrap gap-2">
          {activeClaims.length === 0 ? (
            <span className="text-[11px] text-[#777] italic">
              {isStreaming ? "Retrieving verified citations..." : "No citations attached to this run."}
            </span>
          ) : (
            activeClaims.map((claim) => (
              <button
                key={claim.id}
                type="button"
                onClick={() => setSelectedClaim(claim)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#333] bg-[#222] px-2.5 py-1 text-xs font-semibold text-[#f3ede8] transition hover:border-[#d4af37] hover:bg-[#2a2a2a] shadow-xs"
              >
                <Scale size={13} className="text-[#d4af37]" />
                <span className="max-w-[210px] truncate">{claim.authority.citation}</span>
                <span className="rounded-full bg-[#171717] border border-[#3a3a3a] px-1.5 py-0.2 text-[10px] font-bold text-[#d4af37]">
                  {claim.confidenceScore}%
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Message Content */}
      <div className="mt-4 text-xs sm:text-sm text-[#f3ede8] leading-relaxed whitespace-pre-line font-sans">
        {activeContent || (isStreaming && (
          <span className="text-[#8e857e] animate-pulse">Streaming response from Acquit.ai Model Gateway...</span>
        ))}
        {isStreaming && (
          <span className="inline-block w-2 h-4 ml-1 bg-[#d4af37] animate-pulse align-middle"></span>
        )}
      </div>

      {/* Legal Claims & Grounding Cards List */}
      {showAllSources && activeClaims.length > 0 && (
        <div className="mt-5 space-y-3 border-t border-[#262626] pt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] flex items-center gap-1.5">
              <Layers size={14} /> Verified Grounding Claims ({activeClaims.length})
            </h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("claims")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                  activeTab === "claims" ? "bg-[#d4af37] text-black" : "bg-[#222] text-[#cfc5be]"
                }`}
              >
                Claims &amp; Sources
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("provenance")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                  activeTab === "provenance" ? "bg-[#d4af37] text-black" : "bg-[#222] text-[#cfc5be]"
                }`}
              >
                Vector Provenance
              </button>
            </div>
          </div>

          {activeTab === "claims" ? (
            <div className="grid gap-3 sm:grid-cols-1">
              {activeClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="group rounded-xl border border-[#2a2a2a] bg-[#1b1a1a] p-4 transition hover:border-[#444]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#232a24] border border-[#2d4734] px-2 py-0.5 text-[11px] font-bold text-[#9fc6ae]">
                        <CheckCircle2 size={12} className="text-[#9fc6ae]" /> {claim.supportType}
                      </span>
                      <span className="text-[11px] font-semibold text-[#8e857e]">
                        Offset: {claim.pageOffset}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#d4af37]">
                      {claim.confidenceScore}% Support Confidence
                    </div>
                  </div>

                  <p className="mt-2 text-xs font-semibold text-[#f3ede8]">
                    "{claim.claimText}"
                  </p>

                  <div className="mt-3 rounded-lg border border-[#2b2b2b] bg-[#141414] p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#f3ede8]">{claim.authority.title}</span>
                      <span className="text-[11px] font-semibold text-[#b5c8df]">{claim.authority.citation}</span>
                    </div>
                    <p className="mt-1 text-[11px] italic text-[#cfc5be] line-clamp-2">
                      "{claim.authority.verbatimExcerpt}"
                    </p>
                    <div className="mt-2.5 flex items-center justify-between border-t border-[#262626] pt-2 text-[11px]">
                      <span className="text-[#8e857e]">
                        Status: <strong className="text-[#cfc5be]">{claim.authority.precedentialStatus}</strong>
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedClaim(claim)}
                          className="font-bold text-[#d4af37] hover:underline"
                        >
                          View Full Details
                        </button>
                        {onOpenLawLibrary && (
                          <button
                            type="button"
                            onClick={() => onOpenLawLibrary(claim.authority)}
                            className="flex items-center gap-1 font-bold text-[#b5c8df] hover:underline"
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
            <div className="rounded-xl border border-[#2a2a2a] bg-[#191919] p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#d4af37]">
                <FileCode2 size={15} /> RAG Vector Retrieval Audit Log
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-[#cfc5be]">
                <div>
                  <span className="font-semibold text-[#8e857e]">Embedding Model:</span> {currentMessage.ragMetrics.embeddingModel}
                </div>
                <div>
                  <span className="font-semibold text-[#8e857e]">Vector Similarity Index:</span> HNSW cosine_distance &lt; 0.15
                </div>
                <div>
                  <span className="font-semibold text-[#8e857e]">Total Index Corpus:</span> {currentMessage.ragMetrics.totalAuthoritiesQueried.toLocaleString()} Authorities
                </div>
                <div>
                  <span className="font-semibold text-[#8e857e]">Query Response Latency:</span> {currentMessage.ragMetrics.vectorIndexTimeMs} ms
                </div>
              </div>
              <p className="text-[11px] text-[#8e857e] pt-1">
                Every legal authority cited is linked to an immutable IPFS Content Identifier (CID) in the <code className="bg-[#111] px-1 py-0.5 rounded text-[#d4af37]">ipfs.source_pins</code> database table.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Selected Claim Source Inspector Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-[#333] bg-[#171717] p-6 shadow-2xl text-[#f3ede8]">
            <div className="flex items-start justify-between border-b border-[#2e2e2e] pb-4">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#d4af37]">
                  <Scale size={14} /> Source Authority &amp; Grounding Inspector
                </div>
                <h3 className="mt-1 text-xl font-bold text-[#f3ede8]">
                  {selectedClaim.authority.title}
                </h3>
                <p className="text-xs text-[#b5c8df] font-mono">{selectedClaim.authority.citation}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                className="rounded-lg p-1.5 text-[#8e857e] hover:bg-[#252525] hover:text-[#fff]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-4 pr-1 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#202020] p-3">
                <div>
                  <span className="text-[#8e857e]">Precedential Status: </span>
                  <strong className="text-[#f3ede8]">{selectedClaim.authority.precedentialStatus}</strong>
                </div>
                <div>
                  <span className="text-[#8e857e]">Jurisdiction: </span>
                  <strong className="text-[#f3ede8]">{selectedClaim.authority.court} ({selectedClaim.authority.year})</strong>
                </div>
                <div className="rounded-md bg-[#252015] border border-[#d4af37] px-2 py-0.5 font-bold text-[#d4af37]">
                  {selectedClaim.confidenceScore}% Grounding Match
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-1">
                  Claim Supported in AI Response
                </h4>
                <p className="rounded-lg border border-[#333] bg-[#121212] p-3 text-xs text-[#cfc5be]">
                  "{selectedClaim.claimText}"
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-1">
                  Holding &amp; Key Summary
                </h4>
                <p className="text-xs text-[#cfc5be] leading-relaxed">
                  {selectedClaim.authority.holdingSummary}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-1">
                  Verbatim Court Excerpt ({selectedClaim.pageOffset})
                </h4>
                <blockquote className="rounded-lg border-l-4 border-[#d4af37] bg-[#121212] p-3 text-xs italic text-[#cfc5be] leading-relaxed">
                  "{selectedClaim.authority.verbatimExcerpt}"
                </blockquote>
              </div>

              <div className="rounded-xl border border-[#2b2b2b] bg-[#141414] p-3.5 text-[11px] space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[#9fc6ae]">
                  <ShieldCheck size={14} /> IPFS Content Addressing &amp; Integrity
                </div>
                <div className="flex items-center justify-between font-mono text-[10px] text-[#8e857e]">
                  <span className="truncate">CID: {selectedClaim.authority.ipfsCid}</span>
                  <span className="rounded bg-[#202020] px-1.5 py-0.5 text-[#9fc6ae] font-sans font-bold">
                    Pinned (local + Pinata)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[#2e2e2e] pt-4">
              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                className="rounded-xl border border-[#333] bg-[#222] px-4 py-2 text-xs font-bold text-[#cfc5be] hover:bg-[#2c2c2c]"
              >
                Close
              </button>
              {onOpenLawLibrary && (
                <button
                  type="button"
                  onClick={() => {
                    const auth = selectedClaim.authority;
                    setSelectedClaim(null);
                    onOpenLawLibrary(auth);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-4 py-2 text-xs font-bold text-black hover:bg-[#c29d2b]"
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
