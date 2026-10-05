"use client";

import React, { useState } from "react";
import { Matter } from "@/lib/workspace-data";
import {
  CalendarCheck2,
  Clock,
  Shield,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Hash,
} from "lucide-react";
import { SectionHeader, StatusBadge } from "./primitives";

interface TasksDeadlinesViewProps {
  matter: Matter;
}

interface DeadlineTask {
  id: string;
  title: string;
  ruleCitation: string;
  statutoryDays: number;
  triggerEvent: string;
  calculatedDueDate: string;
  status: "pending" | "in_progress" | "completed" | "urgent";
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  operation: string;
  agentInvoked: string;
  model: string;
  promptHash: string;
  retrievedCitations: string[];
  humanReviewStatus: "Verified" | "Pro Se Draft";
}

export function TasksDeadlinesView({ matter }: TasksDeadlinesViewProps) {
  const [tasks, setTasks] = useState<DeadlineTask[]>([
    {
      id: "task-1",
      title: "Serve Defendant's First Formal Brady Discovery Demand",
      ruleCitation: "Ind. Crim. R. 2.5 & Brady v. Maryland",
      statutoryDays: 14,
      triggerEvent: "Arraignment (Aug 12, 2026)",
      calculatedDueDate: "2026-08-26",
      status: "completed",
    },
    {
      id: "task-2",
      title: "File Formal Pro Se Motion to Suppress Vehicle Evidence",
      ruleCitation: "Ind. Code § 35-36-8-1 (Omnibus Motion Cutoff)",
      statutoryDays: 30,
      triggerEvent: "Prior to Omnibus Hearing",
      calculatedDueDate: "2026-10-10",
      status: "urgent",
    },
    {
      id: "task-3",
      title: "Inspect Merchant Video at Prosecutor's Office",
      ruleCitation: "Local Discovery Order Rule 4",
      statutoryDays: 21,
      triggerEvent: "Following State's Initial Disclosures",
      calculatedDueDate: "2026-10-18",
      status: "in_progress",
    },
    {
      id: "task-4",
      title: "Subpoena Retail Store Shift Manager for Pretrial Deposition",
      ruleCitation: "Ind. Trial Rule 45 Subpoena",
      statutoryDays: 10,
      triggerEvent: "Notice of Witness List",
      calculatedDueDate: "2026-10-20",
      status: "pending",
    },
  ]);

  const [auditLogs] = useState<AuditLogEntry[]>([
    {
      id: "audit-01",
      timestamp: "2026-10-02 04:30:12 UTC",
      operation: "Synthesize Statutory Element Breakdown",
      agentInvoked: "Charge Explainer AI",
      model: "gemini-2.5-flash",
      promptHash: "sha256:d8a2f4e19b0c7a53",
      retrievedCitations: ["Ind. Code § 35-42-2-1", "Ind. Code § 35-41-3-2"],
      humanReviewStatus: "Pro Se Draft",
    },
    {
      id: "audit-02",
      timestamp: "2026-10-02 04:45:00 UTC",
      operation: "Audit 4th Amendment Warrantless Search Grounds",
      agentInvoked: "Rights Checker AI",
      model: "gemini-2.5-flash",
      promptHash: "sha256:1a8b9c4d5e2f3a7c",
      retrievedCitations: ["Terry v. Ohio, 392 U.S. 1", "Mapp v. Ohio, 367 U.S. 643"],
      humanReviewStatus: "Verified",
    },
    {
      id: "audit-03",
      timestamp: "2026-10-02 05:02:18 UTC",
      operation: "Generate Motion to Suppress Draft",
      agentInvoked: "Legal Document Drafting AI",
      model: "gemini-2.5-flash",
      promptHash: "sha256:7f6e5d4c3b2a1f0e",
      retrievedCitations: ["U.S. Const. amend. IV", "Katz v. United States"],
      humanReviewStatus: "Verified",
    },
  ]);

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "completed" ? "in_progress" : "completed" }
          : t
      )
    );
  };

  const statusVariant = (s: DeadlineTask["status"]) =>
    s === "completed" ? "success" : s === "urgent" ? "danger" : s === "in_progress" ? "info" : "neutral";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <SectionHeader
        eyebrow="Deterministic Court Rules Engine"
        title="Tasks, Deadlines & System Audit"
        description="Calculate strict statutory court deadlines and inspect the immutable audit log of all AI operations and sources."
        actions={<StatusBadge variant="gold">Rules Engine: Rule 2.5 / Rule 16</StatusBadge>}
      />

      <div className="bg-[#141519] border border-[#272830] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Court Rule Deadline Schedule</h2>
            <p className="text-xs text-neutral-400">
              Deterministic calculation based on {matter.jurisdiction} criminal trial rules
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTaskStatus(task.id)}
              className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                task.status === "completed"
                  ? "bg-[#101114] border-[#222328] opacity-60"
                  : task.status === "urgent"
                  ? "bg-rose-950/20 border-rose-900/40"
                  : "bg-[#181920] border-[#262732]"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={task.status === "completed"}
                  onChange={() => toggleTaskStatus(task.id)}
                  className="rounded border-[#2A2B35] text-[#D4AF37] focus:ring-0 mt-0.5"
                />
                <div>
                  <div
                    className={`text-xs font-semibold ${
                      task.status === "completed" ? "line-through text-neutral-400" : "text-white"
                    }`}
                  >
                    {task.title}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    Authority: {task.ruleCitation} · Trigger: {task.triggerEvent}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:text-right shrink-0">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Due Date</span>
                  <span
                    className={`text-sm font-bold font-mono ${
                      task.status === "urgent" ? "text-rose-400" : "text-white"
                    }`}
                  >
                    {task.calculatedDueDate}
                  </span>
                </div>
                <StatusBadge variant={statusVariant(task.status)}>{task.status}</StatusBadge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#141519] border border-[#272830] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#D4AF37]" />
            <h2 className="text-sm font-semibold text-white">Immutable AI Operations Audit Trail</h2>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">Traceable Provenance Ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#23242B] text-slate-400 font-medium tracking-wider text-[10px] uppercase">
                <th className="pb-2.5">Timestamp</th>
                <th className="pb-2.5">Operation</th>
                <th className="pb-2.5">Agent</th>
                <th className="pb-2.5">Model</th>
                <th className="pb-2.5">Citations Retrieved</th>
                <th className="pb-2.5">Review Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202128]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#181920] transition-colors">
                  <td className="py-2.5 font-mono text-neutral-400 text-[11px]">{log.timestamp}</td>
                  <td className="py-2.5 text-white font-medium">{log.operation}</td>
                  <td className="py-2.5 text-[#D4AF37]">{log.agentInvoked}</td>
                  <td className="py-2.5 font-mono text-neutral-400 text-[11px]">{log.model}</td>
                  <td className="py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {log.retrievedCitations.map((c, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5">
                    <StatusBadge variant={log.humanReviewStatus === "Verified" ? "success" : "warning"}>
                      {log.humanReviewStatus}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
