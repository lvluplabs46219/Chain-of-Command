"use client";

import React, { useState } from "react";
import {
  FileSignature,
  FileText,
  Download,
  Copy,
  Check,
  ShieldAlert,
  Edit3,
  Lock,
  Printer,
  AlertTriangle,
} from "lucide-react";
import { Matter } from "@/lib/workspace-data";
import { ResultEnvelope } from "./ResultEnvelope";

interface DraftDeskViewProps {
  matter: Matter;
  onOpenActionModal: (title: string, court: string, summary: string) => void;
}

export function DraftDeskView({ matter, onOpenActionModal }: DraftDeskViewProps) {
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const hasMatter = matter.id !== "matter-empty";
  // Never seed fictional pleadings for real users. Drafts come from user/AI actions only.
  const DRAFTS: {
    id: string;
    title: string;
    status: string;
    date: string;
    summary: string;
    content: string;
  }[] = [];

  const currentDoc = DRAFTS[selectedDocIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDoc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentDoc) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-[#141519] border border-[#272830] rounded-xl p-8 text-center space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#e040a0]">Draft Desk</p>
          <h1 className="text-xl font-serif font-bold text-white">No drafts yet</h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            {hasMatter
              ? "When you generate or write a motion, it will appear here as a draft for your review. Nothing is filed automatically."
              : "Open a matter first, then create drafts grounded in your real case data."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#272830]">
        <span className="text-xs font-mono uppercase text-[#e040a0] font-semibold">
          Draft Desk & Document Intelligence
        </span>
        <h1 className="text-2xl font-bold text-white mt-1">Court-Ready Pleadings & Motions</h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Drafts are structured for pro se review. No document can be filed autonomously.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Col: Document List */}
        <div className="space-y-3 lg:col-span-1">
          <div className="text-xs font-mono uppercase text-neutral-400 font-bold px-1">
            Prepared Drafts ({DRAFTS.length})
          </div>
          <div className="space-y-2">
            {DRAFTS.map((doc, idx) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDocIndex(idx)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  selectedDocIndex === idx
                    ? "bg-[#1C1E2A] border-[#e040a0]/50 shadow-md shadow-[#e040a0]/5"
                    : "bg-[#14151C] border-[#252735] hover:bg-[#181A24]"
                }`}
              >
                <div className="text-[10px] font-mono uppercase text-amber-400 font-semibold">
                  {doc.status}
                </div>
                <h4 className="text-xs font-bold text-white mt-1 line-clamp-2">{doc.title}</h4>
                <p className="text-[10px] text-neutral-400 mt-1">{doc.date}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right 3 Cols: Document Editor / Preview */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#181923] p-4 rounded-xl border border-[#262836]">
            <div>
              <h3 className="font-bold text-white text-sm">{currentDoc.title}</h3>
              <p className="text-xs text-neutral-400 mt-0.5">{currentDoc.summary}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-[#222430] hover:bg-[#2A2D3C] text-neutral-300 text-xs font-semibold flex items-center gap-1.5 border border-[#313446]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Text"}</span>
              </button>

              <button
                onClick={() =>
                  onOpenActionModal(
                    currentDoc.title,
                    matter.court,
                    "Draft requires signature & clerk submission."
                  )
                }
                className="px-3.5 py-1.5 rounded-lg bg-[#e040a0] hover:bg-[#c49f27] text-neutral-950 text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Prepare Filing Packet</span>
              </button>
            </div>
          </div>

          <div className="bg-[#101117] border border-[#252735] rounded-xl p-5 sm:p-6 font-mono text-xs text-neutral-200 leading-relaxed overflow-x-auto whitespace-pre-wrap select-all shadow-inner">
            {currentDoc.content}
          </div>
        </div>
      </div>
    </div>
  );
}
