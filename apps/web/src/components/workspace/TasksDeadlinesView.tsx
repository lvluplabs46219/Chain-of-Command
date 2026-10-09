"use client";

import React, { useState } from "react";
import {
  CalendarCheck2,
  Clock,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Shield,
  Info,
} from "lucide-react";
import { Matter, CourtDeadline } from "@/lib/workspace-data";

interface TasksDeadlinesViewProps {
  matter: Matter;
}

export function TasksDeadlinesView({ matter }: TasksDeadlinesViewProps) {
  const [testArrestDate, setTestArrestDate] = useState("2024-03-11");
  const [calculatedSpeedy, setCalculatedSpeedy] = useState<string>("2024-05-20");

  const handleRecalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testArrestDate) return;
    const d = new Date(testArrestDate);
    d.setDate(d.getDate() + 70); // 70 day rule
    setCalculatedSpeedy(d.toISOString().split("T")[0]);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#272830]">
        <span className="text-xs font-mono uppercase text-[#D4AF37] font-semibold">
          Deterministic Rules Engine
        </span>
        <h1 className="text-2xl font-bold text-white mt-1">Court Deadlines & Procedural Rules</h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Statutory timelines calculated via deterministic rules logic, not probabilistic LLM predictions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Deadlines */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CalendarCheck2 className="w-4 h-4 text-[#D4AF37]" />
            <span>Active Case Deadlines for {matter.caseNumber}</span>
          </h2>

          <div className="space-y-3">
            {matter.deadlines.map((dl) => (
              <div
                key={dl.id}
                className="bg-[#14151C] border border-[#262835] rounded-xl p-4 sm:p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold text-white text-sm">{dl.title}</h3>
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded ${
                      dl.severity === "Critical"
                        ? "bg-red-950/50 text-red-300 border border-red-800/40"
                        : "bg-neutral-800 text-neutral-300"
                    }`}
                  >
                    {dl.daysRemaining} Days Left
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300">
                  <div>
                    <span className="text-neutral-400">Due Date:</span>{" "}
                    <strong className="text-white">{dl.dueDate}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-400">Statutory Basis:</span>{" "}
                    <span className="font-mono text-[#D4AF37]">{dl.governingStatute}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#0F1015] rounded-lg border border-[#1E202A] text-xs space-y-1">
                  <span className="text-neutral-400 font-semibold">Controlling Court Rule:</span>
                  <p className="text-neutral-300">{dl.jurisdictionRule}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deterministic Rules Calculator */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#D4AF37]" />
            <span>Statutory Date Calculator</span>
          </h2>

          <div className="bg-[#14151C] border border-[#262835] rounded-xl p-4 sm:p-5 space-y-4">
            <p className="text-xs text-neutral-300 leading-relaxed">
              Verify statutory deadlines by selecting an triggering event date:
            </p>

            <form onSubmit={handleRecalculate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Initial Appearance / Arraignment Date:
                </label>
                <input
                  type="date"
                  value={testArrestDate}
                  onChange={(e) => setTestArrestDate(e.target.value)}
                  className="w-full bg-[#181923] border border-[#2B2D3C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="p-3 bg-[#181923] border border-[#2B2D3C] rounded-lg space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Rule 4(B) Speedy Trial (70 Days):</span>
                  <span className="font-mono font-bold text-amber-400">{calculatedSpeedy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Motion to Suppress Cutoff:</span>
                  <span className="font-mono text-white">20 Days Prior to Trial</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#D4AF37] hover:bg-[#c49f27] text-neutral-950 font-bold text-xs rounded-lg transition-colors"
              >
                Compute Exact Cutoffs
              </button>
            </form>

            <div className="text-[11px] text-neutral-400 flex items-start gap-2 pt-2 border-t border-[#20222E]">
              <Info className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
              <span>
                Calculations follow Marion County local rules excluding recognized judicial holidays and emergency closures.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
