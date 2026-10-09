"use client";

import React, { useState } from "react";
import {
  Users,
  Send,
  Sparkles,
  Bot,
  Shield,
  BookOpen,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { AIAgent, AI_TEAM_ROSTER, Matter } from "@/lib/workspace-data";
import { ResultEnvelope } from "./ResultEnvelope";

interface ChambersViewProps {
  matter: Matter;
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

export function ChambersView({ matter }: ChambersViewProps) {
  const [selectedAgent, setSelectedAgent] = useState<AIAgent>(AI_TEAM_ROSTER[0]);
  const [promptInput, setPromptInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "agent",
      agentId: "agent-head",
      agentName: "Head Legal AI",
      timestamp: "10:14 AM",
      text: `Welcome Marcus. I have reviewed the procedural posture of ${matter.caseNumber}. Our current priority is auditing the legality of the initial traffic stop under Terry v. Ohio and preparing the suppression filing before the October 24 deadline. How can our team assist you today?`,
      envelope: {
        type: "Analysis",
        citations: [
          {
            statuteOrRule: "Ind. Code § 35-36-8-1",
            summary: "Statutory omnibus and suppression motion deadline rule in Indiana.",
            confidenceScore: 0.98,
            provenance: "SOURCE_PUBLIC",
          },
        ],
      },
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: promptInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setPromptInput("");

    // Simulate grounded agent response
    setTimeout(() => {
      const agentReply: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: "agent",
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: `Based on verified Indiana precedent and the BWC-04 footage in your evidence locker: Under Spangler v. State, 607 N.E.2d 720 (Ind. 1993), 'forcible resistance' requires active, aggressive physical tension or force directed against an officer. A startled flinch or passive refusal does not satisfy the statutory elements of Ind. Code § 35-44.1-3-1. We have added this authority to your Motion to Suppress outline.`,
        envelope: {
          type: "Analysis",
          citations: [
            {
              statuteOrRule: "Spangler v. State, 607 N.E.2d 720 (Ind. 1993)",
              summary: "Indiana Supreme Court rule on non-forcible passive resistance.",
              confidenceScore: 0.96,
              provenance: "SOURCE_PUBLIC",
            },
            {
              statuteOrRule: "Ind. Code § 35-44.1-3-1",
              summary: "Statutory elements of Resisting Law Enforcement.",
              confidenceScore: 0.98,
              provenance: "SOURCE_PUBLIC",
            },
          ],
        },
      };
      setMessages((prev) => [...prev, agentReply]);
    }, 600);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#272830]">
        <span className="text-xs font-mono uppercase text-[#D4AF37] font-semibold">
          AI Legal Team Chambers
        </span>
        <h1 className="text-2xl font-bold text-white mt-1">Multi-Agent Case Collaboration</h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Specialized agents operating with defined capabilities, groundings, and pro se safety guardrails.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Agent Roster */}
        <div className="space-y-3 lg:col-span-1">
          <h2 className="text-xs font-mono uppercase text-neutral-400 font-bold px-1">
            Agent Roster ({AI_TEAM_ROSTER.length})
          </h2>
          <div className="space-y-2">
            {AI_TEAM_ROSTER.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedAgent.id === agent.id
                    ? "bg-[#1C1E2A] border-[#D4AF37]/50 shadow-md shadow-[#D4AF37]/5"
                    : "bg-[#14151C] border-[#252735] hover:bg-[#181A24]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-xs">{agent.name}</div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                    {agent.model}
                  </span>
                </div>
                <div className="text-[11px] text-[#D4AF37] mt-0.5">{agent.role}</div>
                <p className="text-[10px] text-neutral-400 mt-1 line-clamp-1">{agent.specialty}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right 3 Cols: Active Consultation Space */}
        <div className="lg:col-span-3 flex flex-col h-[700px] bg-[#14151C] border border-[#272938] rounded-2xl overflow-hidden shadow-xl">
          {/* Active Agent Banner */}
          <div className="p-4 bg-[#181923] border-b border-[#252736] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs ${selectedAgent.avatarBg}`}
              >
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">{selectedAgent.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                    Ready
                  </span>
                </div>
                <p className="text-xs text-neutral-400">{selectedAgent.specialty}</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
              <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Grounded Mode: Active</span>
            </div>
          </div>

          {/* Messages Flow */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div className="text-[11px] text-neutral-400 mb-1 px-1">
                  {m.sender === "user" ? "Marcus (You)" : m.agentName} · {m.timestamp}
                </div>
                {m.envelope ? (
                  <div className="max-w-2xl w-full">
                    <ResultEnvelope
                      envelopeType={m.envelope.type}
                      title={`Analysis from ${m.agentName}`}
                      agentName={m.agentName || "AI"}
                      timestamp={m.timestamp}
                      citations={m.envelope.citations}
                    >
                      <p className="text-xs sm:text-sm leading-relaxed">{m.text}</p>
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

          {/* Prompt Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-[#181923] border-t border-[#252736] flex items-center gap-3"
          >
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder={`Ask ${selectedAgent.name} about legal citations, timeline inconsistencies, or hearing prep...`}
              className="flex-1 bg-[#101117] border border-[#2B2E3D] rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]"
            />
            <button
              type="submit"
              disabled={!promptInput.trim()}
              className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#c49f27] disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send Query</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
