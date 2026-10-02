"use client";

import React, { useState } from "react";
import { EvidenceRecord } from "@/lib/workspace-data";
import {
  Package,
  Plus,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Video,
  Receipt,
  Radio,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface InvestigationsViewProps {
  evidence: EvidenceRecord[];
  onSaveEvidence: (ev: EvidenceRecord) => void;
  matterId: string;
}

export function InvestigationsView({ evidence, onSaveEvidence, matterId }: InvestigationsViewProps) {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedExhibit, setSelectedExhibit] = useState<EvidenceRecord | null>(evidence[0] || null);

  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<EvidenceRecord["type"]>("Police Report");
  const [newCustodian, setNewCustodian] = useState("");
  const [newRelevantCharge, setNewRelevantCharge] = useState("");
  const [newSummary, setNewSummary] = useState("");

  const handleAddExhibit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const count = evidence.length + 1;
    const letter = String.fromCharCode(64 + count);

    const record: EvidenceRecord = {
      id: `ev-${Date.now()}`,
      matterId,
      exhibitNumber: `Exhibit ${letter}`,
      title: newTitle.trim(),
      type: newType,
      dateAcquired: new Date().toISOString().split("T")[0],
      custodian: newCustodian.trim() || "Defendant Custody",
      chainOfCustodyStatus: "Verified Intact",
      relevantCharge: newRelevantCharge.trim() || "General Evidentiary Defense",
      summary: newSummary.trim() || "Evidence acquired for defense record.",
      storageHash: `sha256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
    };

    onSaveEvidence(record);
    setSelectedExhibit(record);
    setShowAddModal(false);
    setNewTitle("");
    setNewCustodian("");
    setNewRelevantCharge("");
    setNewSummary("");
  };

  const getTypeIcon = (type: EvidenceRecord["type"]) => {
    switch (type) {
      case "Body-Worn Video":
        return Video;
      case "Physical Receipt":
        return Receipt;
      case "Cellular Tower / CDR":
        return Radio;
      default:
        return FileText;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-[#23242B] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider">Evidence & Chain of Custody</span>
            <span className="text-neutral-500">·</span>
            <span className="text-xs text-neutral-400">Cryptographic Integrity</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-tight">Investigations & Evidence Locker</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Index tangible exhibits, audit physical chain of custody, and map evidence to statutory element defenses.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-[#D4AF37] hover:bg-[#c49f27] rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Evidence Exhibit</span>
        </button>
      </div>

      {/* Main Grid: Exhibit List + Detailed View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
            Cataloged Exhibits ({evidence.length})
          </div>

          {evidence.map((ev) => {
            const Icon = getTypeIcon(ev.type);
            const isSelected = selectedExhibit?.id === ev.id;
            return (
              <div
                key={ev.id}
                onClick={() => setSelectedExhibit(ev)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#1E1F26] border-[#D4AF37] shadow-md shadow-[#D4AF37]/5"
                    : "bg-[#141519] border-[#252630] hover:border-neutral-600 hover:bg-[#181920]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#D4AF37]">{ev.exhibitNumber}</span>
                    <span className="text-neutral-500">·</span>
                    <span className="text-[11px] text-neutral-400">{ev.type}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      ev.chainOfCustodyStatus === "Verified Intact"
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40"
                        : "bg-amber-950/40 text-amber-400 border-amber-800/40"
                    }`}
                  >
                    {ev.chainOfCustodyStatus}
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <Icon className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">{ev.title}</h4>
                    <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5">{ev.summary}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Details Panel (7 cols) */}
        <div className="lg:col-span-7 bg-[#141519] border border-[#272830] rounded-xl p-6">
          {selectedExhibit ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#23242B] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-[#D4AF37]">{selectedExhibit.exhibitNumber}</span>
                    <span className="text-neutral-500">·</span>
                    <span className="text-xs text-neutral-400">{selectedExhibit.type}</span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-white">{selectedExhibit.title}</h3>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-emerald-400 text-xs font-mono">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{selectedExhibit.chainOfCustodyStatus}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Exculpatory Factual Summary</h4>
                <div className="bg-[#191A20] p-4 rounded-lg border border-[#2A2B33] text-xs text-neutral-200 leading-relaxed">
                  {selectedExhibit.summary}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-[#191A20] p-3 rounded-lg border border-[#2A2B33]">
                  <span className="text-neutral-500 font-mono text-[10px] uppercase block mb-1">Current Custodian</span>
                  <span className="text-white font-medium">{selectedExhibit.custodian}</span>
                </div>

                <div className="bg-[#191A20] p-3 rounded-lg border border-[#2A2B33]">
                  <span className="text-neutral-500 font-mono text-[10px] uppercase block mb-1">Date Acquired</span>
                  <span className="text-white font-medium font-mono">{selectedExhibit.dateAcquired}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Mapped Legal Element / Defense</h4>
                <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-lg text-xs text-amber-200">
                  {selectedExhibit.relevantCharge}
                </div>
              </div>

              <div className="pt-4 border-t border-[#23242B]">
                <div className="text-[10px] font-mono text-neutral-500 uppercase mb-1">Cryptographic Provenance Hash</div>
                <div className="text-[11px] font-mono text-neutral-400 bg-[#101114] p-2 rounded border border-[#2A2B35] break-all">
                  {selectedExhibit.storageHash}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-neutral-500 text-xs">Select an exhibit to inspect details.</div>
          )}
        </div>
      </div>

      {/* Add Exhibit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141519] border border-[#2A2B35] rounded-xl max-w-md w-full p-6 text-neutral-200 shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-1">Catalog Evidence Exhibit</h3>
            <p className="text-xs text-neutral-400 mb-4">Register new tangible evidence or video file into the case record.</p>

            <form onSubmit={handleAddExhibit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Exhibit Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Officer Bodycam Segment or Store Receipt"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#101114] border border-[#2A2B35] rounded-md px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Evidence Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-[#101114] border border-[#2A2B35] rounded-md px-3 py-2 text-white"
                >
                  <option value="Police Report">Police Incident Report</option>
                  <option value="Body-Worn Video">Body-Worn / Dashcam Video</option>
                  <option value="Physical Receipt">Physical Receipt / Financial Record</option>
                  <option value="Cellular Tower / CDR">Cellular Tower / Geolocation CDR</option>
                  <option value="Witness Statement">Sworn Witness Statement</option>
                  <option value="Audio Recording">911 Audio / Dispatch Recording</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Custodian / Source</label>
                <input
                  type="text"
                  placeholder="e.g. Marion County Prosecutor Discovery Unit"
                  value={newCustodian}
                  onChange={(e) => setNewCustodian(e.target.value)}
                  className="w-full bg-[#101114] border border-[#2A2B35] rounded-md px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Relevant Issue / Defense Element</label>
                <input
                  type="text"
                  placeholder="e.g. Self-Defense Justification (Ind. Code § 35-41-3-2)"
                  value={newRelevantCharge}
                  onChange={(e) => setNewRelevantCharge(e.target.value)}
                  className="w-full bg-[#101114] border border-[#2A2B35] rounded-md px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Evidence Summary</label>
                <textarea
                  rows={2}
                  placeholder="Factual findings or contradiction substantiated by this exhibit..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full bg-[#101114] border border-[#2A2B35] rounded-md p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#23242B] mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c49f27] text-neutral-950 font-semibold rounded-md text-xs"
                >
                  Save to Locker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
