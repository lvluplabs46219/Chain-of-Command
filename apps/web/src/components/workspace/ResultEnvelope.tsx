"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  ExternalLink,
  Info,
  CheckCircle2,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface CitationItem {
  statuteOrRule: string;
  sourceUrl?: string;
  summary: string;
  confidenceScore: number;
  provenance: "SOURCE_PUBLIC" | "SOURCE_COURT" | "SOURCE_USER" | "SOURCE_AI";
}

interface ResultEnvelopeProps {
  envelopeType: "Analysis" | "Information" | "Draft" | "Procedural Checklist" | "Synthesis";
  title: string;
  agentName: string;
  timestamp: string;
  citations: CitationItem[];
  requiresHumanReview?: boolean;
  children: React.ReactNode;
}

export function ResultEnvelope({
  envelopeType,
  title,
  agentName,
  timestamp,
  citations,
  requiresHumanReview = true,
  children,
}: ResultEnvelopeProps) {
  const [showSources, setShowSources] = useState(false);

  const typeColorMap = {
    Analysis: "border-sky-500/40 bg-sky-950/20 text-sky-400",
    Information: "border-blue-500/40 bg-blue-950/20 text-blue-400",
    Draft: "border-amber-500/40 bg-amber-950/20 text-amber-400",
    "Procedural Checklist": "border-emerald-500/40 bg-emerald-950/20 text-emerald-400",
    Synthesis: "border-purple-500/40 bg-purple-950/20 text-purple-400",
  };

  return (
    <div className="bg-[#141519] border border-[#272830] rounded-xl overflow-hidden shadow-xl mb-6">
      {/* Universal Mandatory Header Warning */}
      {requiresHumanReview && (
        <div className="bg-amber-950/40 border-b border-amber-800/40 px-4 py-2 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2 font-mono uppercase tracking-wide">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>[PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE - REQUIRES INDEPENDENT HUMAN REVIEW]</span>
          </div>
          <span className="hidden md:inline-block text-[11px] text-amber-400/80">
            No Attorney-Client Privilege
          </span>
        </div>
      )}

      {/* Envelope Meta Header */}
      <div className="p-4 sm:p-5 border-b border-[#23242B] flex flex-wrap items-center justify-between gap-3 bg-[#17181F]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${typeColorMap[envelopeType]}`}
            >
              {envelopeType}
            </span>
            <span className="text-xs text-neutral-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timestamp}
            </span>
            <span className="text-xs text-neutral-400">· via {agentName}</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">{title}</h3>
        </div>

        {/* Citations Count / Toggle */}
        <button
          onClick={() => setShowSources(!showSources)}
          className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#20222B] hover:bg-[#282B37] text-neutral-300 border border-[#2E313D] transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{citations.length} Grounded Sources</span>
          {showSources ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Sources Drawer */}
      {showSources && (
        <div className="bg-[#0E0F13] border-b border-[#23242B] p-4 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
              Authority Provenance & Verification Matrix
            </span>
            <span className="text-[11px] text-neutral-500">
              Threshold confidence: &ge; 0.70 enforced
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {citations.map((c, i) => (
              <div
                key={i}
                className="bg-[#15161C] border border-[#272830] rounded-lg p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-[#D4AF37]">
                    {c.statuteOrRule}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${
                      c.confidenceScore >= 0.9
                        ? "bg-emerald-950/50 text-emerald-400 border border-emerald-800/40"
                        : "bg-amber-950/50 text-amber-400 border border-amber-800/40"
                    }`}
                  >
                    Conf: {(c.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed">{c.summary}</p>
                <div className="flex items-center justify-between pt-1 border-t border-[#1F2027] text-[11px]">
                  <span className="text-neutral-500 font-mono text-[10px]">{c.provenance}</span>
                  {c.sourceUrl && (
                    <a
                      href={c.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#D4AF37] hover:underline flex items-center gap-1"
                    >
                      <span>Public Law</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Envelope Body */}
      <div className="p-4 sm:p-6 text-sm text-neutral-200 leading-relaxed bg-[#141519]">
        {children}
      </div>

      {/* Universal Mandatory Footer Disclaimer */}
      <div className="bg-[#0D0E12] border-t border-[#23242B] p-4 text-xs text-neutral-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[12px]">
          This information is provided for educational and procedural purposes only and does not constitute legal
          advice. No attorney-client relationship is formed. Consult a licensed attorney for case-specific
          representation.
        </p>
      </div>
    </div>
  );
}
