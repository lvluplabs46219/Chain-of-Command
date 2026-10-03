"use client";

import React, { useState, useRef, useEffect } from "react";
import { EvidenceCarousel } from "./EvidenceCarousel";
import {
  ShieldAlert,
  Search,
  MessageSquare,
  Clock,
  Send,
  Sparkles,
  Bot,
  User,
  RefreshCw,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";

export interface AgentProfile {
  id: string;
  name: string;
  role: string;
  badge: string;
  description: string;
  initials: string;
}

export const LEGAL_AGENTS: AgentProfile[] = [
  {
    id: "lead-counsel",
    name: "Lead Counsel Coordinator",
    role: "Strategy & Issue Synthesis",
    badge: "Coordinator",
    description: "Decomposes complex objectives and synthesizes unified procedural workspaces.",
    initials: "LC",
  },
  {
    id: "paralegal",
    name: "Paralegal AI",
    role: "Deadlines & Procedural Rules",
    badge: "Procedural",
    description: "Calculates statutory court deadlines and compiles court filing checklists.",
    initials: "PL",
  },
  {
    id: "investigator",
    name: "Investigator AI",
    role: "Timeline & Fact Verification",
    badge: "Factual",
    description: "Analyzes chronological records and detects inconsistencies in police narratives.",
    initials: "IN",
  },
  {
    id: "evidence-analyst",
    name: "Evidence Analyst AI",
    role: "Chain of Custody & Hash Checks",
    badge: "Forensics",
    description: "Evaluates dashcam telemetry, bodycam logs, and calibration records.",
    initials: "EA",
  },
  {
    id: "court-prep",
    name: "Court Preparation AI",
    role: "Hearing Q&A & Demeanor",
    badge: "Advocacy",
    description: "Simulates judicial questions and courtroom procedures for pro se litigants.",
    initials: "CP",
  },
  {
    id: "rights-checker",
    name: "Rights Checker AI",
    role: "Constitutional & Miranda Audits",
    badge: "Constitutional",
    description: "Audits 4th/5th Amendment stop legality and detention duration thresholds.",
    initials: "RC",
  },
  {
    id: "charge-explainer",
    name: "Charge Explainer AI",
    role: "Statutory Elements Breakdown",
    badge: "Statutory",
    description: "Translates charging affidavits into plain English elements of proof.",
    initials: "CE",
  },
];

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  agentName?: string;
  text: string;
  timestamp: string;
  citations?: { title: string; cite: string }[];
  isStreaming?: boolean;
  isError?: boolean;
}

interface SimulationResult {
  rawText: string;
  disclaimer?: string;
  modelUsed?: string;
}

export function AILab() {
  const [activeTab, setActiveTab] = useState<"Simulation" | "TeamChat">("Simulation");
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile>(LEGAL_AGENTS[0]);
  const [prompt, setPrompt] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "agent",
      agentName: "Lead Counsel Coordinator",
      text: "Welcome to the Acquit.ai intelligence workspace. I am coordinating your legal team. How would you like to proceed? All outputs are educational legal information and must be reviewed by the self-represented litigant.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      citations: [{ title: "Ind. R. Crim. P. 2.5", cite: "Mandatory Prosecution Discovery" }],
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  /** Real Gemini-backed fact simulation via /ai/lawyer */
  const handleSimulate = async () => {
    if (!prompt.trim() || isSimulating) return;

    setIsSimulating(true);
    setSimulationError(null);
    setSimulationResult(null);

    try {
      const data = await api.ai.askLawyer({
        message: `Issue-to-proof strategy simulation. Structure the response with clear sections for: (1) Established Facts from the user's description, (2) Factual Uncertainties / what is unknown, (3) Procedural next steps the self-represented litigant should consider, and (4) Primary statutory or case authorities. User scenario:\n\n${prompt.trim()}`,
        jurisdiction: "Indiana",
        agentRole: selectedAgent.role,
        context: {
          mode: "fact-simulation",
          agentId: selectedAgent.id,
        },
      });

      setSimulationResult({
        rawText: data.text || "No analysis returned.",
        disclaimer: data.disclaimer,
        modelUsed: (data as any).modelUsed,
      });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "AI simulation failed. Check that the API is running and GEMINI_API_KEY is set.";
      setSimulationError(message);
    } finally {
      setIsSimulating(false);
    }
  };

  /** Real Gemini-backed team chat via /ai/lawyer */
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isStreaming) return;

    const userText = chatInput.trim();
    const newMsgId = `usr-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: newMsgId,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsStreaming(true);
    setChatError(null);

    const agentMsgId = `agent-${Date.now()}`;
    const placeholderMsg: ChatMessage = {
      id: agentMsgId,
      sender: "agent",
      agentName: selectedAgent.name,
      text: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, placeholderMsg]);

    try {
      const data = await api.ai.askLawyer({
        message: userText,
        jurisdiction: "Indiana",
        agentRole: selectedAgent.role,
        context: {
          agentId: selectedAgent.id,
          agentName: selectedAgent.name,
        },
      });

      const responseText = data.text || "Unable to generate a response.";

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === agentMsgId
            ? {
                ...msg,
                text: responseText,
                isStreaming: false,
                citations: data.disclaimer
                  ? [{ title: "Disclaimer", cite: data.disclaimer.slice(0, 80) + "…" }]
                  : undefined,
              }
            : msg
        )
      );
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "AI request failed. Ensure the backend is running and GEMINI_API_KEY is configured.";

      setChatError(message);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === agentMsgId
            ? {
                ...msg,
                text: message,
                isStreaming: false,
                isError: true,
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-5 text-white font-sans overflow-hidden">
      {/* 7 AI Legal Agents Selector Bar */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#D4AF37]" />
            <h2 className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
              Specialized Legal AI Team ({LEGAL_AGENTS.length} Agents)
            </h2>
          </div>
          <span className="text-[10px] text-white/40 font-mono">
            Active: <strong className="text-[#D4AF37]">{selectedAgent.name}</strong>
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {LEGAL_AGENTS.map((agent) => {
            const isSelected = agent.id === selectedAgent.id;
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => setSelectedAgent(agent)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all shrink-0 border cursor-pointer ${
                  isSelected
                    ? "bg-[#174E48] border-[#D4AF37] text-white shadow-[0_0_15px_rgba(212,175,55,0.2)] ring-1 ring-[#D4AF37]/40"
                    : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${
                    isSelected ? "bg-[#D4AF37] text-black" : "bg-white/10 text-white/70"
                  }`}
                >
                  {agent.initials}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-semibold truncate max-w-[130px]">{agent.name}</p>
                  <p className="text-[9px] text-white/40 truncate max-w-[130px]">{agent.badge}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Section: Evidence + Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <EvidenceCarousel />

        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-bold tracking-widest text-white/70 uppercase flex items-center gap-2">
              <Clock size={14} className="text-[#D4AF37]" /> Case Progression Timeline
            </h2>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Live AI Connected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { title: "Arrest & Stop", date: "May 12", status: "Completed" },
              { title: "Initial Hearing", date: "May 20", status: "Completed" },
              { title: "Discovery Cutoff", date: "June 15", status: "Active" },
              { title: "Pre-Trial Omnibus", date: "July 10", status: "Scheduled" },
            ].map((event, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  event.status === "Active"
                    ? "bg-[#174E48]/30 border-[#D4AF37] ring-1 ring-[#D4AF37]/30"
                    : "bg-white/[0.02] border-white/10 hover:border-white/20"
                }`}
              >
                <span className="text-[9px] text-white/40 font-mono block">{event.date}</span>
                <h4 className="text-xs font-semibold text-white mt-0.5 truncate">{event.title}</h4>
                <span
                  className={`text-[9px] font-semibold mt-1 inline-block ${
                    event.status === "Active"
                      ? "text-[#D4AF37]"
                      : event.status === "Completed"
                        ? "text-emerald-400"
                        : "text-white/40"
                  }`}
                >
                  {event.status}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
            <span>Next Action: File Motion for Radar Calibration</span>
            <span className="text-[#D4AF37] font-mono font-semibold">12 Days Remaining</span>
          </div>
        </div>
      </div>

      {/* Tabs: AI Simulation vs Team Chat */}
      <div className="flex-1 flex flex-col bg-[#0A0A0A] border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl min-h-[420px]">
        <div className="flex border-b border-white/10 bg-black/40">
          <button
            type="button"
            onClick={() => setActiveTab("Simulation")}
            className={`px-6 py-3.5 text-xs font-bold tracking-widest transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "Simulation"
                ? "border-[#D4AF37] text-[#D4AF37] bg-white/[0.02]"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            <ShieldAlert size={14} /> AI FACT SIMULATION
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("TeamChat")}
            className={`px-6 py-3.5 text-xs font-bold tracking-widest transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "TeamChat"
                ? "border-[#D4AF37] text-[#D4AF37] bg-white/[0.02]"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            <MessageSquare size={14} /> REAL-TIME AGENT STREAM ({selectedAgent.name})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "Simulation" ? (
            <div className="space-y-5">
              <div className="bg-black/60 border border-white/10 rounded-xl p-5 shadow-xl">
                <h3 className="text-xs font-bold tracking-widest text-white/70 uppercase mb-3 flex items-center gap-2">
                  <Search size={14} className="text-[#D4AF37]" /> Issue-to-Proof Strategy Prompt
                </h3>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the stop circumstances or test legal theories (e.g. 'Can we challenge the single lane deviation charge based on rainy road conditions and radar calibration lapse?')..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition min-h-[90px] placeholder:text-white/30 font-sans"
                  disabled={isSimulating}
                />
                <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] text-white/40 font-mono">
                    Model: <strong className="text-white/70">Gemini (via /ai/lawyer)</strong> · Key from env
                  </span>
                  <button
                    type="button"
                    onClick={handleSimulate}
                    disabled={!prompt.trim() || isSimulating}
                    className="bg-[#174E48] hover:bg-[#1f665e] text-[#D4AF37] disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest transition shadow-lg cursor-pointer flex items-center gap-2"
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> RUNNING SYNTHESIS...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} /> RUN SIMULATION
                      </>
                    )}
                  </button>
                </div>
              </div>

              {simulationError && (
                <div
                  role="alert"
                  className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-4 flex items-start gap-3 text-rose-200"
                >
                  <XCircle size={18} className="shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase text-rose-300 mb-1">Simulation Error</p>
                    <p className="text-sm font-sans">{simulationError}</p>
                    <p className="text-[11px] text-rose-300/70 mt-2 font-mono">
                      Ensure GEMINI_API_KEY is set and the API server is reachable (see .env.example).
                    </p>
                  </div>
                </div>
              )}

              {simulationResult && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="bg-black/40 border border-white/10 rounded-xl p-5 border-l-4 border-l-[#D4AF37]">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[11px] font-bold tracking-widest text-[#D4AF37] uppercase">
                        Grounded Analysis
                      </h4>
                      {simulationResult.modelUsed && (
                        <span className="text-[10px] font-mono text-white/40">
                          model: {simulationResult.modelUsed}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-white/85 font-sans whitespace-pre-wrap leading-relaxed">
                      {simulationResult.rawText}
                    </div>
                    {simulationResult.disclaimer && (
                      <p className="mt-4 pt-3 border-t border-white/10 text-[11px] text-white/50 font-sans">
                        {simulationResult.disclaimer}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Team Chat Interface */
            <div className="flex flex-col h-[380px]">
              {chatError && (
                <div
                  role="alert"
                  className="mb-3 bg-rose-950/30 border border-rose-500/30 rounded-lg px-3 py-2 flex items-center gap-2 text-rose-200 text-xs"
                >
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{chatError}</span>
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender === "agent" && (
                      <div className="h-8 w-8 rounded-xl bg-[#174E48] border border-[#174E48] text-[#D4AF37] flex items-center justify-center font-bold text-xs shrink-0">
                        <Bot size={16} />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed font-sans ${
                        msg.sender === "user"
                          ? "bg-[#174E48] text-white rounded-tr-none shadow-md"
                          : msg.isError
                            ? "bg-rose-950/40 border border-rose-500/30 text-rose-100 rounded-tl-none"
                            : "bg-white/[0.04] border border-white/10 text-white/90 rounded-tl-none"
                      }`}
                    >
                      {msg.sender === "agent" && (
                        <div className="flex items-center justify-between mb-1.5 border-b border-white/10 pb-1">
                          <span className="font-bold text-[#D4AF37] font-mono text-[10px]">
                            {msg.agentName || "Specialist Agent"}
                          </span>
                          <span className="text-[9px] text-white/40 font-mono">{msg.timestamp}</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.text || (msg.isStreaming ? "…" : "")}</p>
                      {msg.isStreaming && (
                        <span className="inline-flex items-center gap-1.5 mt-1 text-[#D4AF37]">
                          <RefreshCw size={12} className="animate-spin" />
                          <span className="text-[10px] font-mono">Synthesizing…</span>
                        </span>
                      )}

                      {msg.citations && msg.citations.length > 0 && !msg.isError && (
                        <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
                          {msg.citations.map((c, i) => (
                            <span
                              key={i}
                              className="text-[9px] font-mono text-[#D4AF37] bg-black/40 px-2 py-0.5 rounded border border-white/10"
                            >
                              § {c.title}: {c.cite}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.sender === "user" && (
                      <div className="h-8 w-8 rounded-xl bg-white/10 text-white flex items-center justify-center text-xs shrink-0">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              <div className="mt-3 pt-3 border-t border-white/10 relative flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                  placeholder={`Ask ${selectedAgent.name}…`}
                  disabled={isStreaming}
                  className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition placeholder:text-white/30 font-sans disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isStreaming}
                  className="h-10 px-4 rounded-xl bg-[#174E48] hover:bg-[#1f665e] text-[#D4AF37] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  {isStreaming ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  {isStreaming ? "…" : "Send"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
