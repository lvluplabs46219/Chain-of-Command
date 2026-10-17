"use client";

import React, { useState } from "react";
import {
  Shield,
  Key,
  BookOpen,
  Download,
  Trash2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Smartphone,
  Eye,
  RefreshCw,
} from "lucide-react";
import { agentModeLabel } from "@/lib/workspace-data";

interface SettingsViewProps {
  readingLevel: "Plain English" | "Standard Legal" | "Detailed Statutory";
  onSetReadingLevel: (level: "Plain English" | "Standard Legal" | "Detailed Statutory") => void;
}

export function SettingsView({ readingLevel, onSetReadingLevel }: SettingsViewProps) {
  const [mfaEnabled, setMfaEnabled] = useState(true);

  const AUDIT_LOGS = [
    {
      id: "log-1",
      timestamp: "Today, 10:14:22 EST",
      agent: "Head Legal AI",
      action: "Issue Spotting & Suppression Identification",
      model: "gemini-2.5-pro",
      provenanceHash: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      sourcesCount: 3,
      humanApproved: true,
    },
    {
      id: "log-2",
      timestamp: "Today, 09:48:10 EST",
      agent: "Charge Explainer AI",
      action: "Deconstructed Ind. Code § 35-44.1-3-1 into Actus Reus / Mens Rea",
      model: "gemini-2.5-flash",
      provenanceHash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      sourcesCount: 2,
      humanApproved: true,
    },
    {
      id: "log-3",
      timestamp: "Yesterday, 16:30:05 EST",
      agent: "Legal Research AI",
      action: "Retrieved Spangler v. State landmark on passive resistance",
      model: "gemini-2.5-flash",
      provenanceHash: "sha256:a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
      sourcesCount: 1,
      humanApproved: true,
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#272830]">
        <span className="text-xs font-mono uppercase text-[#D4AF37] font-semibold">
          System Configuration & Privacy
        </span>
        <h1 className="text-2xl font-bold text-white mt-1">Security, Accessibility & Audit Ledger</h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Cryptographic signing gates, cognitive complexity adjustments, and immutable AI traceability.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Preferences & Security */}
        <div className="space-y-4">
          <div className="bg-[#14151C] border border-[#262835] rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#D4AF37]" />
              <span>Cognitive Reading Complexity</span>
            </h3>

            <div className="space-y-2">
              {(["Plain English", "Standard Legal", "Detailed Statutory"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onSetReadingLevel(lvl)}
                  className={`w-full text-left p-3 rounded-lg border text-xs font-medium transition-colors flex items-center justify-between ${
                    readingLevel === lvl
                      ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#E6C65A] font-bold"
                      : "bg-[#181923] border-[#292B3A] text-neutral-300 hover:bg-[#1E202B]"
                  }`}
                >
                  <span>{lvl}</span>
                  {readingLevel === lvl && <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#14151C] border border-[#262835] rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#D4AF37]" />
              <span>External Action Cryptographic Gate</span>
            </h3>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Enforce two-factor PIN challenge before any motion drafting packet or external communication can be exported.
            </p>

            <div className="flex items-center justify-between p-3 bg-[#181923] rounded-lg border border-[#292B3A]">
              <span className="text-xs text-neutral-200">Require PIN for External Actions</span>
              <button
                onClick={() => setMfaEnabled(!mfaEnabled)}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-colors ${
                  mfaEnabled
                    ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/50"
                    : "bg-neutral-800 text-neutral-400"
                }`}
              >
                {mfaEnabled ? "ENFORCED" : "OFF"}
              </button>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Immutable Traceability Audit Ledger */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#D4AF37]" />
              <span>Traceable AI Operations Ledger (RULE 29 Auditability)</span>
            </h3>
            <span className="text-[11px] font-mono text-neutral-400">
              Zero Unaudited Syntheses
            </span>
          </div>

          <div className="space-y-3">
            {AUDIT_LOGS.map((log) => (
              <div
                key={log.id}
                className="bg-[#14151C] border border-[#262835] rounded-xl p-4 space-y-2 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{log.agent}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                      {agentModeLabel({ model: log.model, name: log.agent || "" })}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400">{log.timestamp}</span>
                </div>

                <p className="text-neutral-300">{log.action}</p>

                <div className="pt-2 border-t border-[#1F202B] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="font-mono text-neutral-500 truncate max-w-xs">
                    {log.provenanceHash}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#D4AF37]">{log.sourcesCount} Grounded Citations</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Human Reviewed</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
