"use client";

import React, { useState } from "react";
import { Send, Bot, Shield, Lock, FolderOpen } from "lucide-react";
import { AIAgent, AI_TEAM_ROSTER, Matter, agentModeLabel } from "@/lib/workspace-data";
import { ResultEnvelope } from "./ResultEnvelope";
import Link from "next/link";

interface ChambersViewProps {
  matter: Matter;
  agents?: AIAgent[];
  onUpdateAgent?: (agent: AIAgent) => void;
}

interface Message {
  id: string;
  sender: "user" | "agent";
  agentId?: string;
  agentName?: string;
  text: string;
  timestamp: string;
  envelope?: {
    type: "Analysis" | "Information" | "Draft";
    citations: Array<{
      statuteOrRule: string;
      summary: string;
      confidenceScore: number;
      provenance: "SOURCE_PUBLIC" | "SOURCE_COURT";
    }>;
  };
}

function buildWelcome(matter: Matter): string {
  const hasMatter = matter.id !== "matter-empty";
  const docCount = matter.evidence?.length ?? 0;
  const chargeCount = matter.charges?.length ?? 0;
  if (!hasMatter) {
    return "Welcome. No matter is open yet. Open a case in The Docket so questions can use your workspace filings. Educational information only — not legal advice.";
  }
  return (
    `Working on **${matter.title}**` +
    (matter.caseNumber && matter.caseNumber !== "—" ? ` · ${matter.caseNumber}` : "") +
    `. Workspace index: ${chargeCount} charge(s), ${docCount} evidence item(s). ` +
    "Privacy-isolated mode: analysis uses only what you store here (not a live court feed). " +
    "Paste docket facts or ask a specific educational question."
  );
}

export function ChambersView({ matter }: ChambersViewProps) {
  const [selectedAgent, setSelectedAgent] = useState<AIAgent>(AI_TEAM_ROSTER[0]);
  const [promptInput, setPromptInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "agent",
      agentId: "agent-head",
      agentName: "Head Legal AI",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: buildWelcome(matter),
      envelope: { type: "Information", citations: [] },
    },
  ]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: promptInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPromptInput("");

    const thinkingId = `msg-${Date.now()}-thinking`;
    setMessages((prev) => [
      ...prev,
      {
        id: thinkingId,
        sender: "agent",
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: "Working…",
        envelope: { type: "Information", citations: [] },
      },
    ]);

    try {
      const res = await fetch("/api/ai/lawyer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          jurisdiction: matter.jurisdiction || "Indiana",
          agentRole: selectedAgent.name || selectedAgent.role,
          conversationHistory: messages
            .filter((m) => m.id !== thinkingId)
            .slice(-10)
            .map((m) => ({
              sender: m.sender,
              text: m.text,
            })),
          context: {
            caseTitle: matter.title,
            caseNumber: matter.caseNumber,
            courtName: matter.courtName || matter.court,
            judge: matter.judge,
            prosecutor: matter.prosecutor,
            matterId: matter.id,
            chargeCount: matter.charges?.length ?? 0,
            evidenceCount: matter.evidence?.length ?? 0,
            charges: matter.charges?.map((c) => ({
              count: c.countNumber,
              title: c.title,
              statute: c.statuteCitation,
              tier: c.tier,
              summary: c.plainEnglishSummary,
            })),
            evidence: matter.evidence?.map((e) => ({
              title: e.title,
              type: e.type,
              status: e.status,
            })),
            deadlines: matter.deadlines?.map((d) => ({
              title: d.title,
              dueDate: d.dueDate,
              daysRemaining: d.daysRemaining,
            })),
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      const citations = Array.isArray(data.citations)
        ? data.citations.map((c: string) => ({
            statuteOrRule: c,
            summary: "",
            confidenceScore: data.verified ? 0.7 : 0.3,
            provenance: data.verified ? ("SOURCE_PUBLIC" as const) : ("SOURCE_COURT" as const),
          }))
        : [];
      const agentMsg: Message = {
        id: `msg-${Date.now()}-agent`,
        sender: "agent",
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text:
          data.text ||
          data.error ||
          "No response from the model gateway. Try again in a moment.",
        envelope: {
          type: data.labeling === "Analysis" ? "Analysis" : "Information",
          citations,
        },
      };
      setMessages((prev) => prev.filter((m) => m.id !== thinkingId).concat(agentMsg));
    } catch {
      setMessages((prev) =>
        prev.filter((m) => m.id !== thinkingId).concat({
          id: `msg-${Date.now()}-err`,
          sender: "agent",
          agentId: selectedAgent.id,
          agentName: selectedAgent.name,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          text: "Could not reach the AI gateway. Confirm the app is running and try again.",
          envelope: { type: "Information", citations: [] },
        }),
      );
    }
  };

  const emptyLocker = (matter.evidence?.length ?? 0) === 0 && (matter.charges?.length ?? 0) === 0;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      <div className="pb-3 border-b border-[#272830]">
        <span className="text-xs font-mono uppercase text-[#D4AF37] font-semibold">
          AI Legal Team Chambers
        </span>
        <h1 className="text-2xl font-bold text-white mt-1">Ask your case team</h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Educational answers only. Not a law firm. Not legal advice.
        </p>
      </div>

      {/* Privacy status — deliberate isolation, not a broken connection */}
      <div className="flex flex-wrap items-center gap-2 text-xs rounded-xl border border-sky-500/25 bg-sky-950/20 px-3 py-2 text-sky-100/90">
        <Lock className="w-3.5 h-3.5 text-sky-300 shrink-0" />
        <span>
          <strong className="font-semibold text-sky-200">Privacy-isolated mode.</strong>{" "}
          Analysis uses only workspace uploads and notes — not a live court network feed.
        </span>
      </div>

      {emptyLocker && matter.id !== "matter-empty" && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#2A2B35] bg-[#141519] px-3 py-2.5 text-xs text-neutral-300">
          <span className="flex items-center gap-2">
            <FolderOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
            No charges or evidence indexed yet for this matter.
          </span>
          <Link
            href="/investigations"
            className="px-3 py-1.5 rounded-full bg-[#D4AF37] text-neutral-950 font-semibold hover:bg-[#c49f27]"
          >
            Add evidence
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[640px]">
        {/* Agent roster */}
        <div className="space-y-2 lg:col-span-1">
          <h2 className="text-xs font-mono uppercase text-neutral-400 font-bold px-1">Your team</h2>
          <div className="space-y-1.5">
            {AI_TEAM_ROSTER.map((agent) => {
              const active = selectedAgent.id === agent.id;
              const mode = agentModeLabel(agent);
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setSelectedAgent(agent)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    active
                      ? "bg-[#1C1E2A] border-[#D4AF37]/50 shadow-md shadow-[#D4AF37]/5"
                      : "bg-[#14151C] border-[#252735] hover:bg-[#181A24]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-white text-xs">{agent.name}</div>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
                        mode === "Deep Review"
                          ? "border-violet-500/40 text-violet-200 bg-violet-950/40"
                          : "border-emerald-500/40 text-emerald-200 bg-emerald-950/30"
                      }`}
                    >
                      {mode}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#D4AF37] mt-0.5">{agent.role}</div>
                  <p className="text-[10px] text-neutral-400 mt-1 line-clamp-2">{agent.specialty}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat column: messages + pinned input */}
        <div className="lg:col-span-3 flex flex-col h-[min(70vh,720px)] bg-[#14151C] border border-[#272938] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-3 sm:p-4 bg-[#181923] border-b border-[#252736] flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${selectedAgent.avatarBg}`}
              >
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-white text-sm truncate">{selectedAgent.name}</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                    Ready
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/10 text-neutral-300">
                    {agentModeLabel(selectedAgent)}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 truncate">{selectedAgent.specialty}</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400">
              <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Educational mode</span>
            </div>
          </div>

          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div className="text-[11px] text-neutral-500 mb-1 px-1">
                  {m.sender === "user" ? "You" : m.agentName}
                  {m.timestamp ? ` · ${m.timestamp}` : ""}
                </div>
                {m.envelope && m.sender === "agent" ? (
                  <div className="max-w-2xl w-full">
                    <ResultEnvelope
                      envelopeType={m.envelope.type}
                      title={m.agentName || "AI"}
                      agentName={m.agentName || "AI"}
                      timestamp={m.timestamp}
                      citations={m.envelope.citations}
                      compactDisclaimer
                    >
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    </ResultEnvelope>
                  </div>
                ) : (
                  <div
                    className={`max-w-xl p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      m.sender === "user"
                        ? "bg-[#D4AF37] text-neutral-950 font-medium rounded-tr-none"
                        : "bg-[#1C1E2A] text-neutral-200 border border-[#2B2D3D] rounded-tl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Persistent primary action bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-4 bg-[#12131a] border-t border-[#252736] flex items-stretch gap-2 shrink-0"
          >
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Paste docket facts or ask an educational question…"
              className="flex-1 min-h-[44px] bg-[#0c0d12] border border-[#2B2E3D] rounded-full px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]"
              aria-label="Message to selected agent"
            />
            <button
              type="submit"
              disabled={!promptInput.trim()}
              className="px-5 min-h-[44px] rounded-full bg-[#D4AF37] hover:bg-[#c49f27] disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 font-bold text-sm flex items-center gap-2 transition-colors shadow-[0_4px_16px_rgba(212,175,55,0.2)]"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
