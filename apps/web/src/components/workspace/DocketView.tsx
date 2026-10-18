"use client";

import React, { useState } from "react";
import { Gavel, ShieldCheck, AlertCircle, Scale, FileText, CheckCircle2, Info } from "lucide-react";
import { Matter, Charge } from "@/lib/workspace-data";
import { ResultEnvelope } from "./ResultEnvelope";

interface DocketViewProps {
  matter: Matter;
}

export function DocketView({ matter }: DocketViewProps) {
  const [selectedChargeId, setSelectedChargeId] = useState<string>(
    matter.charges[0]?.id || ""
  );

  const selectedCharge =
    matter.charges.find((c) => c.id === selectedChargeId) || matter.charges[0];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#272830]">
        <div>
          <span className="text-xs font-mono uppercase text-[#e040a0] font-semibold">
            Docket & Charging Document Analysis
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">
            Charges, Statutory Elements & Sentencing Ranges
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Matter: {matter.caseNumber} · Reading Level: {matter.readingLevel}
          </p>
        </div>
      </div>

      {/* Charge Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {matter.charges.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedChargeId(c.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCharge?.id === c.id
                ? "bg-[#e040a0] text-neutral-950 border-[#e040a0] shadow-lg shadow-[#e040a0]/10"
                : "bg-[#161720] border-[#2A2C38] text-neutral-300 hover:bg-[#1E202B]"
            }`}
          >
            Count {c.countNumber}: {c.title} ({c.tier})
          </button>
        ))}
      </div>

      {selectedCharge ? (
        <div className="space-y-6">
          <ResultEnvelope
            envelopeType="Analysis"
            title={`Deconstruction of Count ${selectedCharge.countNumber}: ${selectedCharge.title}`}
            agentName="Charge Explainer AI"
            timestamp="Grounding Verified"
            citations={[
              {
                statuteOrRule: selectedCharge.statuteCitation,
                summary: `Controlling Indiana Criminal Code defining ${selectedCharge.title}`,
                confidenceScore: 0.98,
                provenance: "SOURCE_PUBLIC",
                sourceUrl: "https://iga.in.gov",
              },
            ]}
          >
            <div className="space-y-5">
              {/* Charge Summary Box */}
              <div className="bg-[#181A24] border border-[#2B2E3D] rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#e040a0]/20 text-[#E6C65A]">
                      {selectedCharge.statuteCitation}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                      Tier: {selectedCharge.tier}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400">
                    Jurisdiction: <span className="text-white font-medium">{selectedCharge.jurisdiction}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                  {selectedCharge.plainEnglishSummary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#262836] text-xs">
                  <div>
                    <span className="text-neutral-400">Statutory Penalty Limits:</span>
                    <div className="font-bold text-white mt-0.5">{selectedCharge.statutoryRange}</div>
                  </div>
                  <div>
                    <span className="text-neutral-400">Advisory Sentencing Benchmark:</span>
                    <div className="font-bold text-amber-400 mt-0.5">{selectedCharge.advisorySentence}</div>
                  </div>
                </div>
              </div>

              {/* Statutory Elements Breakdown */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#e040a0]" />
                  <span>Individual Statutory Elements (State Must Prove Every Element Beyond Reasonable Doubt)</span>
                </h3>

                <div className="space-y-4">
                  {selectedCharge.elements.map((el, i) => (
                    <div
                      key={el.id}
                      className="bg-[#15161E] border border-[#282A37] rounded-xl p-4 sm:p-5 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#e040a0]/20 text-[#e040a0] font-bold text-xs flex items-center justify-center font-mono">
                            {i + 1}
                          </span>
                          <h4 className="font-bold text-white text-sm">{el.name}</h4>
                        </div>
                        <span
                          className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                            el.type === "Actus Reus"
                              ? "bg-rose-950/40 text-rose-300 border border-rose-800/40"
                              : el.type === "Mens Rea"
                              ? "bg-purple-950/40 text-purple-300 border border-purple-800/40"
                              : "bg-blue-950/40 text-blue-300 border border-blue-800/40"
                          }`}
                        >
                          {el.type}
                        </span>
                      </div>

                      <div className="bg-[#0F1015] rounded-lg p-3 font-mono text-[11px] text-amber-200/90 border border-[#1E202A]">
                        &quot;{el.statutoryLanguage}&quot;
                      </div>

                      <div className="text-xs text-neutral-300 leading-relaxed">
                        <strong className="text-white">Plain English Explanation: </strong>
                        {el.plainEnglishExplanation}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#20222F] text-xs">
                        <div className="p-3 bg-[#181A22] rounded-lg border border-[#262836]">
                          <span className="text-neutral-400 font-semibold block mb-1">Prosecution Burden:</span>
                          <p className="text-neutral-300">{el.prosecutionBurden}</p>
                        </div>
                        <div className="p-3 bg-emerald-950/20 rounded-lg border border-emerald-800/30">
                          <span className="text-emerald-400 font-semibold block mb-1">Defense Scrutiny & Precedent:</span>
                          <p className="text-emerald-200/90">{el.defenseAngle}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ResultEnvelope>
        </div>
      ) : (
        <div className="p-8 text-center text-neutral-400 bg-[#14151C] border border-[#242633] rounded-xl">
          No criminal charges entered for this civil matter.
        </div>
      )}
    </div>
  );
}
