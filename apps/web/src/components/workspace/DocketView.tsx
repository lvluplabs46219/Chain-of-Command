"use client";

import React, { useState } from "react";
import { Matter, Charge } from "@/lib/workspace-data";
import {
  Plus,
  Scale,
  Calendar,
  AlertCircle,
  FileText,
  UserCheck,
  CheckCircle2,
  Clock,
  Shield,
} from "lucide-react";

interface DocketViewProps {
  matters: Matter[];
  activeMatter: Matter;
  onSelectMatter: (matter: Matter) => void;
  onSaveMatter: (matter: Matter) => void;
  onOpenNewMatterModal: () => void;
}

export function DocketView({
  matters,
  activeMatter,
  onSelectMatter,
  onSaveMatter,
  onOpenNewMatterModal,
}: DocketViewProps) {
  const [activeChargeIndex, setActiveChargeIndex] = useState<number>(0);
  const [showAddChargeModal, setShowAddChargeModal] = useState<boolean>(false);
  const [newStatute, setNewStatute] = useState<string>("");
  const [newTitle, setNewTitle] = useState<string>("");
  const [newMaxPenalty, setNewMaxPenalty] = useState<string>("");

  const currentCharge = activeMatter.charges[activeChargeIndex] || activeMatter.charges[0];

  const handleAddCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatute.trim() || !newTitle.trim()) return;

    const newCh: Charge = {
      id: `ch-${Date.now()}`,
      statute: newStatute.trim(),
      title: newTitle.trim(),
      level: "Misdemeanor Class A",
      allegedDate: new Date().toISOString().split("T")[0],
      statutoryMaxPenalty: newMaxPenalty.trim() || "1 year jail; $1,000 fine",
      statutoryMinPenalty: "Probation eligible",
      elements: [
        {
          name: "Prohibited Unlawful Act",
          description: "Committed overt act as alleged in information/indictment.",
          stateProofStatus: "Contested",
        },
        {
          name: "Requisite Criminal Intent",
          description: "Acted with statutory Mens Rea.",
          stateProofStatus: "Insufficient Evidence",
        },
      ],
    };

    const updated = {
      ...activeMatter,
      charges: [...activeMatter.charges, newCh],
    };

    onSaveMatter(updated);
    setNewStatute("");
    setNewTitle("");
    setNewMaxPenalty("");
    setShowAddChargeModal(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-[#23242B] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider">The Docket</span>
            <span className="text-neutral-500">·</span>
            <span className="text-xs text-neutral-400">Case Matter Registry</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-tight">{activeMatter.title}</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            {activeMatter.courtName} · Case Number: <span className="font-mono text-neutral-200">{activeMatter.caseNumber}</span>
          </p>
        </div>

        <button
          onClick={onOpenNewMatterModal}
          className="px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-[#D4AF37] hover:bg-[#c49f27] rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Open New Case Matter</span>
        </button>
      </div>

      {/* Case Details Card */}
      <div className="bg-[#141519] border border-[#272830] rounded-xl p-5">
        <h2 className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-3">Case Facts & Procedural Summary</h2>
        <p className="text-xs text-neutral-300 leading-relaxed bg-[#191A20] p-4 rounded-lg border border-[#2A2B33]">
          {activeMatter.summary}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#23242B] text-xs">
          <div>
            <span className="text-neutral-500 font-mono text-[10px] uppercase block">Presiding Judge</span>
            <span className="text-white font-medium">{activeMatter.judge}</span>
          </div>
          <div>
            <span className="text-neutral-500 font-mono text-[10px] uppercase block">Prosecuting Agency</span>
            <span className="text-white font-medium">{activeMatter.prosecutor}</span>
          </div>
          <div>
            <span className="text-neutral-500 font-mono text-[10px] uppercase block">Representation</span>
            <span className="text-emerald-400 font-medium">{activeMatter.defenseStatus}</span>
          </div>
          <div>
            <span className="text-neutral-500 font-mono text-[10px] uppercase block">Speedy Trial Cutoff</span>
            <span className="text-white font-medium font-mono">{activeMatter.speedyTrialDeadline}</span>
          </div>
        </div>
      </div>

      {/* Charges & Statutory Elements Section */}
      <div className="bg-[#141519] border border-[#272830] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white text-sm">Formal Charges & Statutory Elements</h3>
            <p className="text-xs text-neutral-400">Deconstructed elements the State must prove beyond a reasonable doubt</p>
          </div>
          <button
            onClick={() => setShowAddChargeModal(true)}
            className="px-3 py-1.5 text-xs text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-md flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3 h-3 text-[#D4AF37]" />
            <span>Add Count</span>
          </button>
        </div>

        {/* Charge Selector Tabs */}
        <div className="flex items-center gap-2 border-b border-[#23242B] pb-3 mb-4 overflow-x-auto">
          {activeMatter.charges.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => setActiveChargeIndex(idx)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeChargeIndex === idx
                  ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30"
                  : "bg-neutral-800/60 text-neutral-400 hover:text-white border border-transparent"
              }`}
            >
              <span>Count {idx + 1}: {ch.title}</span>
            </button>
          ))}
        </div>

        {/* Selected Charge Breakdown */}
        {currentCharge && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#191A20] rounded-lg border border-[#2A2B33]">
              <div>
                <span className="text-xs font-mono text-[#D4AF37] uppercase">{currentCharge.statute}</span>
                <h4 className="text-base font-semibold text-white mt-0.5">{currentCharge.title}</h4>
                <div className="text-[11px] text-neutral-400 font-mono mt-0.5">Classification: {currentCharge.level}</div>
              </div>
              <div className="text-right sm:border-l sm:border-[#2D2E37] sm:pl-4">
                <div className="text-[10px] font-mono text-neutral-500 uppercase">Max Statutory Exposure</div>
                <div className="text-xs font-semibold text-rose-300">{currentCharge.statutoryMaxPenalty}</div>
                <div className="text-[11px] text-neutral-400 font-mono">Min: {currentCharge.statutoryMinPenalty}</div>
              </div>
            </div>

            {/* Elements Checklist */}
            <div className="space-y-2.5">
              <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                Statutory Elements to Contest ({currentCharge.elements.length})
              </div>

              {currentCharge.elements.map((elem, i) => (
                <div key={i} className="p-3.5 bg-[#17181D] border border-[#262730] rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white text-xs">{elem.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        elem.stateProofStatus === "Refuted by Exhibit"
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40"
                          : elem.stateProofStatus === "Insufficient Evidence"
                          ? "bg-amber-950/40 text-amber-400 border-amber-800/40"
                          : "bg-blue-950/40 text-blue-400 border-blue-800/40"
                      }`}
                    >
                      {elem.stateProofStatus}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">{elem.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Count Modal */}
      {showAddChargeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141519] border border-[#2B2B35] rounded-xl max-w-md w-full p-6 text-neutral-200 shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-1">Add Formal Charge / Count</h3>
            <p className="text-xs text-neutral-400 mb-4">Enter statutory information from the charging information or indictment.</p>

            <form onSubmit={handleAddCharge} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Statutory Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ind. Code § 35-43-4-2 or Cal. Penal Code § 484"
                  value={newStatute}
                  onChange={(e) => setNewStatute(e.target.value)}
                  className="w-full bg-[#101114] border border-[#2A2B35] rounded-md px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Charge Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grand Theft or Battery Resulting in Injury"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#101114] border border-[#2A2B35] rounded-md px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Maximum Statutory Penalty</label>
                <input
                  type="text"
                  placeholder="e.g. 2.5 years imprisonment; $10,000 fine"
                  value={newMaxPenalty}
                  onChange={(e) => setNewMaxPenalty(e.target.value)}
                  className="w-full bg-[#101114] border border-[#2A2B35] rounded-md px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#23242B] mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddChargeModal(false)}
                  className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c49f27] text-neutral-950 font-semibold rounded-md text-xs"
                >
                  Add Charge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
