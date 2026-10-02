"use client";

import React, { useState } from "react";
import { TimelineRecord } from "@/lib/workspace-data";
import {
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileText,
  BadgeAlert,
} from "lucide-react";

interface TimelineViewProps {
  timeline: TimelineRecord[];
  onSaveTimelineRecord: (rec: TimelineRecord) => void;
  matterId: string;
}

export function TimelineView({ timeline, onSaveTimelineRecord, matterId }: TimelineViewProps) {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [filterContradictionsOnly, setFilterContradictionsOnly] = useState<boolean>(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newCategory, setNewCategory] = useState<TimelineRecord["category"]>("Police Procedures");
  const [newProvenance, setNewProvenance] = useState<TimelineRecord["provenance"]>("SOURCE_POLICE_REPORT");
  const [newSourceDoc, setNewSourceDoc] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isContradiction, setIsContradiction] = useState(false);
  const [contradictionNote, setContradictionNote] = useState("");

  const sortedTimeline = [...timeline].sort(
    (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  );

  const displayedTimeline = filterContradictionsOnly
    ? sortedTimeline.filter((t) => t.isContradiction)
    : sortedTimeline;

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    const fullIso = newTime ? `${newDate}T${newTime}:00` : `${newDate}T12:00:00`;

    const record: TimelineRecord = {
      id: `time-${Date.now()}`,
      matterId,
      dateTime: fullIso,
      title: newTitle.trim(),
      category: newCategory,
      provenance: newProvenance,
      sourceDocument: newSourceDoc.trim() || "Case Document Record",
      description: newDescription.trim() || "Chronological event entry.",
      isContradiction,
      contradictionNote: isContradiction ? contradictionNote.trim() : undefined,
      verified: true,
    };

    onSaveTimelineRecord(record);
    setShowAddModal(false);
    setNewTitle("");
    setNewDate("");
    setNewTime("");
    setNewDescription("");
    setIsContradiction(false);
    setContradictionNote("");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-[#23242B] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider">Chronology Engine</span>
            <span className="text-neutral-500">·</span>
            <span className="text-xs text-neutral-400">Strict Factual Sequence</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-tight">Case Timeline & Contradiction Audit</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Order filings, evidence acquisitions, and dispatch logs chronologically to spotlight factual contradictions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterContradictionsOnly(!filterContradictionsOnly)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors flex items-center gap-1.5 ${
              filterContradictionsOnly
                ? "bg-amber-950/60 text-amber-300 border-amber-700"
                : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{filterContradictionsOnly ? "Showing Discrepancies" : "Filter Discrepancies"}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-[#D4AF37] hover:bg-[#c49f27] rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Timeline Event</span>
          </button>
        </div>
      </div>

      {/* Chronological Vertical Feed */}
      <div className="relative border-l border-[#262730] ml-4 md:ml-8 space-y-6 pl-6 py-2">
        {displayedTimeline.map((item, idx) => {
          const parsed = new Date(item.dateTime);
          const dateStr = parsed.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const timeStr = parsed.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div key={item.id} className="relative group">
              {/* Dot */}
              <div
                className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 ${
                  item.isContradiction
                    ? "bg-amber-500 border-[#141519]"
                    : "bg-[#D4AF37] border-[#141519]"
                }`}
              />

              {/* Event Card */}
              <div
                className={`bg-[#141519] border rounded-xl p-4 transition-all ${
                  item.isContradiction
                    ? "border-amber-900/50 bg-[#171512]"
                    : "border-[#252630] hover:border-neutral-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-white">{dateStr} · {timeStr}</span>
                    <span className="text-neutral-500">·</span>
                    <span className="text-[11px] font-mono text-[#D4AF37]">{item.category}</span>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 self-start sm:self-auto">
                    {item.provenance}
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-white mb-1">{item.title}</h3>
                <p className="text-xs text-neutral-300 leading-relaxed mb-2">{item.description}</p>

                {item.isContradiction && item.contradictionNote && (
                  <div className="mt-3 p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg text-xs text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block mb-0.5">Factual Discrepancy Spotlight:</span>
                      {item.contradictionNote}
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-2.5 border-t border-[#23242B] flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                  <span>Source Document: {item.sourceDocument}</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Record
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Timeline Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141519] border border-[#2A2B35] rounded-xl max-w-md w-full p-6 text-neutral-200 shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-1">Log Chronology Event</h3>
            <p className="text-xs text-neutral-400 mb-4">Record an exact timestamped incident, court event, or police action.</p>

            <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 911 Call Logged or Vehicle Trunk Search Conducted"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#101114] border border-[#2A2B35] rounded-md px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-[#101114] border border-[#2A2B35] rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Time</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-[#101114] border border-[#2A2B35] rounded-md px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-[#101114] border border-[#2A2B35] rounded-md px-2.5 py-2 text-white"
                  >
                    <option value="Police Procedures">Police Procedures</option>
                    <option value="Incident & Arrest">Incident & Arrest</option>
                    <option value="Court Appearance">Court Appearance</option>
                    <option value="Discovery & Evidence">Discovery & Evidence</option>
                    <option value="Filing & Motion">Filing & Motion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Source Provenance</label>
                  <select
                    value={newProvenance}
                    onChange={(e) => setNewProvenance(e.target.value as any)}
                    className="w-full bg-[#101114] border border-[#2A2B35] rounded-md px-2.5 py-2 text-white"
                  >
                    <option value="SOURCE_POLICE_REPORT">Police Incident Report</option>
                    <option value="SOURCE_DISPATCH_CAD">CAD 911 Dispatch</option>
                    <option value="SOURCE_COURT_DOCKET">Official Court Docket</option>
                    <option value="SOURCE_DEFENDANT_RECORD">Defendant Personal Record</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Source Document Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Officer Incident Narrative p. 2, Exhibit A"
                  value={newSourceDoc}
                  onChange={(e) => setNewSourceDoc(e.target.value)}
                  className="w-full bg-[#101114] border border-[#2A2B35] rounded-md px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Factual Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Exact description of what occurred..."
                  className="w-full bg-[#101114] border border-[#2A2B35] rounded-md p-2 text-white"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={isContradiction}
                    onChange={(e) => setIsContradiction(e.target.checked)}
                    className="rounded border-[#2A2B35] text-amber-500 focus:ring-0"
                  />
                  <span className="text-amber-300 font-medium">Flag as Factual Contradiction / Discrepancy</span>
                </label>

                {isContradiction && (
                  <textarea
                    rows={2}
                    value={contradictionNote}
                    onChange={(e) => setContradictionNote(e.target.value)}
                    placeholder="Explain the contradiction with camera footage or dispatch records..."
                    className="w-full bg-[#1A1813] border border-amber-900/50 rounded-md p-2 text-amber-200"
                  />
                )}
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
                  Save to Timeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
