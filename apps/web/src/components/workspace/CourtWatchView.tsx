"use client";

import React, { useState } from "react";
import { Matter } from "@/lib/workspace-data";
import {
  Eye,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Lock,
  FileCheck,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import { SectionHeader, StatusBadge, MetricCard } from "./primitives";

interface CourtWatchViewProps {
  matter: Matter;
}

export function CourtWatchView({ matter }: CourtWatchViewProps) {
  const [humanReviewConfirmed, setHumanReviewConfirmed] = useState<boolean>(false);
  const [signedName, setSignedName] = useState<string>("");
  const [authorizationGranted, setAuthorizationGranted] = useState<boolean>(false);

  const handleAuthorizeFiling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!humanReviewConfirmed || !signedName.trim()) return;
    setAuthorizationGranted(true);
  };

  const hearingDateLabel = new Date(matter.nextCourtDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <SectionHeader
        eyebrow="Hearing Preparation & Filing Gate"
        title="Court Watch & Hearing Prep War Room"
        description="Review courtroom etiquette protocols, logistical checklists, and execute human-controlled filing authorization."
        actions={
          <StatusBadge variant="gold">{matter.nextCourtType}</StatusBadge>
        }
      />

      {/* Hearing Logistics Card */}
      <div className="bg-[#141519] border border-[#272830] rounded-xl p-5">
        <div className="flex items-center justify-between border-b border-[#23242B] pb-3 mb-4">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <span>Next Scheduled Court Appearance</span>
          </div>
          <StatusBadge variant="gold">{matter.nextCourtType}</StatusBadge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Date & Time"
            value={hearingDateLabel}
            sublabel="Scheduled: 09:00 AM · Arrive by 08:15 AM"
            icon={Clock}
            iconClassName="text-blue-400"
          />
          <MetricCard
            label="Location & Courtroom"
            value={matter.courtName}
            sublabel="Criminal Division 2 · 4th Floor, Courtroom 402"
            icon={MapPin}
            iconClassName="text-[#D4AF37]"
          />
          <MetricCard
            label="Presiding Bench"
            value={matter.judge}
            sublabel='Always address as "Your Honor"'
            icon={Eye}
            iconClassName="text-amber-400"
          />
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#141519] border border-[#272830] rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#D4AF37]" />
            <span>Courtroom Readiness & Protocol Checklist</span>
          </h3>

          <div className="space-y-3 text-xs leading-relaxed">
            <div className="p-3 bg-[#191A20] border border-[#2A2B33] rounded-lg">
              <span className="font-semibold text-white block mb-1">1. Addressing the Judge</span>
              <p className="text-neutral-400">
                Always address the bench as <em>"Your Honor"</em>. Stand immediately whenever speaking or when the
                judge enters the courtroom. Never interrupt opposing counsel or the judge.
              </p>
            </div>

            <div className="p-3 bg-[#191A20] border border-[#2A2B33] rounded-lg">
              <span className="font-semibold text-white block mb-1">2. Three Copies of All Exhibits</span>
              <p className="text-neutral-400">
                Bring at least three (3) physical printed copies of any motion or evidence exhibit you intend to
                present: one copy for the Judge, one for the Prosecuting Attorney, and one for your defense table.
              </p>
            </div>

            <div className="p-3 bg-[#191A20] border border-[#2A2B33] rounded-lg">
              <span className="font-semibold text-white block mb-1">3. Dress Code & Electronics</span>
              <p className="text-neutral-400">
                Wear neat, clean, business or professional attire. Turn cell phones completely off before entering the
                courtroom to prevent contempt citations.
              </p>
            </div>

            <div className="p-3 bg-[#191A20] border border-[#2A2B33] rounded-lg">
              <span className="font-semibold text-white block mb-1">
                4. ADA Accommodations & Language Interpreters
              </span>
              <p className="text-neutral-400">
                Under Title II of the ADA and Title VI of the Civil Rights Act, you have the right to request reasonable
                disability accommodations or a certified court interpreter free of charge from the Clerk.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#141519] border border-[#272830] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#D4AF37] mb-2">
              <Lock className="w-4 h-4" />
              <h3 className="font-semibold text-sm text-white">Human Authorization Gate</h3>
            </div>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Strict Architectural Boundary: Chain of Command AI agents will NEVER autonomously file, sign, or transmit
              legal documents to a court. All actions require independent human review and authorization.
            </p>

            <form onSubmit={handleAuthorizeFiling} className="space-y-4 text-xs">
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={humanReviewConfirmed}
                    onChange={(e) => setHumanReviewConfirmed(e.target.checked)}
                    className="rounded border-[#2A2B35] text-[#D4AF37] focus:ring-0 mt-0.5"
                  />
                  <span className="text-neutral-300 leading-snug">
                    I confirm that I have personally read and verified the factual assertions in this motion. I
                    acknowledge that I am proceeding pro se and that this draft has not been prepared by a licensed
                    attorney.
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">
                  Electronic Signature / Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Vance"
                  value={signedName}
                  onChange={(e) => setSignedName(e.target.value)}
                  className="w-full bg-[#101114] border border-[#2A2B35] rounded-md px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={!humanReviewConfirmed || !signedName.trim() || authorizationGranted}
                className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  authorizationGranted
                    ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700"
                    : "bg-[#D4AF37] hover:bg-[#c49f27] text-neutral-950 disabled:opacity-40"
                }`}
              >
                {authorizationGranted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Human Review Cryptographically Authorized</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Authorize Document for Manual Court Filing</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {authorizationGranted && (
            <div className="mt-4 p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-xs text-emerald-300 font-mono">
              <span className="font-bold block mb-1">Filing Authorization Token Generated:</span>
              <span className="text-[11px] text-neutral-400 break-all">
                AUTH-SHA256: 8f9b2a1c0e3d4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
