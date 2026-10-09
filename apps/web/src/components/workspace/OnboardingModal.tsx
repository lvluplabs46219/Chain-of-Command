"use client";

import React, { useState } from "react";
import { Scale, ShieldAlert, CheckCircle2, BookOpen, AlertCircle, FileText } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onAcknowledge: (readingLevel: "Plain English" | "Standard Legal" | "Detailed Statutory") => void;
}

export function OnboardingModal({ isOpen, onAcknowledge }: OnboardingModalProps) {
  const [agreedNotAttorney, setAgreedNotAttorney] = useState(false);
  const [agreedHumanControl, setAgreedHumanControl] = useState(false);
  const [agreedNoGuarantee, setAgreedNoGuarantee] = useState(false);
  const [selectedReadingLevel, setSelectedReadingLevel] = useState<
    "Plain English" | "Standard Legal" | "Detailed Statutory"
  >("Plain English");

  if (!isOpen) return null;

  const canProceed = agreedNotAttorney && agreedHumanControl && agreedNoGuarantee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-[#141519] border border-[#2F3140] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-[#D4AF37] font-semibold">
              Pro Se Operating Agreement
            </span>
            <h2 className="text-xl font-bold text-white">Welcome to Chain of Command</h2>
            <p className="text-xs text-neutral-400">
              AI-Powered Legal Self-Representation Operating System
            </p>
          </div>
        </div>

        <div className="bg-[#181A22] border border-[#272935] rounded-xl p-4 text-xs text-neutral-300 space-y-3 leading-relaxed">
          <p>
            Chain of Command is engineered to assist self-represented litigants in understanding charges, organizing
            evidence, auditing timelines, calculating deterministic court deadlines, and researching grounded statutory
            authorities.
          </p>
          <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg text-amber-300 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Mandatory Operating Boundary:</span>
            </div>
            <p className="text-[11px] text-amber-200/90">
              Chain of Command is an artificial intelligence system, not a licensed attorney, law firm, or legal aid
              service. Using this system does not create an attorney-client relationship.
            </p>
          </div>
        </div>

        {/* Checkbox Acknowledgment Contract */}
        <div className="space-y-3 text-xs text-neutral-300">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedNotAttorney}
              onChange={(e) => setAgreedNotAttorney(e.target.checked)}
              className="mt-0.5 rounded bg-neutral-900 border-neutral-700 text-[#D4AF37] focus:ring-0"
            />
            <span>
              I understand that Chain of Command does not provide legal advice, and its outputs are informational drafts
              requiring independent human review.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedHumanControl}
              onChange={(e) => setAgreedHumanControl(e.target.checked)}
              className="mt-0.5 rounded bg-neutral-900 border-neutral-700 text-[#D4AF37] focus:ring-0"
            />
            <span>
              I understand that the AI will NEVER autonomously file motions or communicate with courts, and that I
              remain strictly in control of all filings.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedNoGuarantee}
              onChange={(e) => setAgreedNoGuarantee(e.target.checked)}
              className="mt-0.5 rounded bg-neutral-900 border-neutral-700 text-[#D4AF37] focus:ring-0"
            />
            <span>
              I understand that no legal outcome is guaranteed, and that I have the right to seek independent legal
              counsel at any time.
            </span>
          </label>
        </div>

        {/* Initial Reading Level Preference */}
        <div className="space-y-2 pt-2 border-t border-[#23242B]">
          <label className="block text-xs font-semibold text-neutral-300">
            Select Your Preferred Reading Complexity:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["Plain English", "Standard Legal", "Detailed Statutory"] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setSelectedReadingLevel(level)}
                className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                  selectedReadingLevel === level
                    ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#E6C65A] font-bold"
                    : "bg-[#16171E] border-[#2B2D3A] text-neutral-400 hover:text-white"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => onAcknowledge(selectedReadingLevel)}
            disabled={!canProceed}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#D4AF37] hover:bg-[#c49f27] disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 font-bold text-xs rounded-xl transition-colors shadow-lg"
          >
            Acknowledge & Enter Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
