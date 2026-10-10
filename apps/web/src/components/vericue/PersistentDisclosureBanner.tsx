"use client";

import React, { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp, ShieldAlert, FileText } from "lucide-react";
import { MANDATORY_DISCLOSURE_BANNER } from "@/lib/sanitizer";

interface PersistentDisclosureBannerProps {
  compact?: boolean;
}

export function PersistentDisclosureBanner({ compact = false }: PersistentDisclosureBannerProps) {
  const [expanded, setExpanded] = useState(!compact);

  return (
    <aside
      aria-label="Compliance and Limitations Notice"
      className="bg-[#151722] border-b border-amber-500/25 px-4 py-2.5 text-xs text-neutral-300 relative z-30 transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-wider uppercase text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                Mandatory Regulatory Disclosure (§9)
              </span>
              <span className="text-[11px] text-neutral-400 font-medium">
                Probabilistic Signal Triage — Not Definitive Truth or Guilt
              </span>
            </div>
            {expanded && (
              <p className="text-[11px] text-neutral-300/90 leading-relaxed font-sans max-w-5xl">
                {MANDATORY_DISCLOSURE_BANNER}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] text-neutral-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{expanded ? "Collapse" : "Read Full Policy"}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
