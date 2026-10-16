"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scale,
  ArrowRight,
  ArrowLeft,
  MapPin,
  FolderPlus,
  Sparkles,
  Shield,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { bootstrapWorkspaceSession } from "@/app/actions/bootstrap-session";
import type { Matter } from "@/lib/workspace-data";

const JURISDICTIONS = [
  "Indiana",
  "Arizona",
  "California",
  "Texas",
  "New York",
  "Florida",
  "Illinois",
  "Federal",
  "Other / Multi-state",
];

export type OnboardingResult = {
  name: string;
  email: string;
  jurisdiction: string;
  matter: Matter | null;
};

interface FirstRunWizardProps {
  onComplete: (result: OnboardingResult) => void;
}

function buildEmptyMatter(title: string, caseNumber: string, court: string, jurisdiction: string): Matter {
  return {
    id: `matter-${Date.now()}`,
    title: title.trim() || "My first matter",
    caseNumber: caseNumber.trim() || "TBD",
    court: court.trim() || "Court TBD",
    jurisdiction,
    judge: "",
    prosecutor: "",
    filingDate: new Date().toISOString().slice(0, 10),
    status: "Active",
    speedyTrialDaysRemaining: 0,
    speedyTrialLimit: 70,
    readingLevel: "Plain English",
    charges: [],
    timeline: [],
    authorities: [],
    evidence: [],
    deadlines: [],
  };
}

export function FirstRunWizard({ onComplete }: FirstRunWizardProps) {
  const { loginAsLitigant, loginWithToken } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [jurisdiction, setJurisdiction] = useState("Indiana");
  const [matterTitle, setMatterTitle] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [courtName, setCourtName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [acknowledgedBoundaries, setAcknowledgedBoundaries] = useState(false);


  const finish = async (opts: { withMatter: boolean }) => {
    setError(null);
    if (name.trim().length < 2) {
      setError("Enter your name (at least 2 characters).");
      setStep(1);
      return;
    }
    const safeEmail =
      email.trim() ||
      `${name.trim().toLowerCase().replace(/\s+/g, ".")}@local.chainofcommand`;
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email or leave it blank for now.");
      setStep(1);
      return;
    }

    setBusy(true);
    const complete = async (token: string, userId?: string) => {
      await loginWithToken(token, {
        id: userId || `usr_${Date.now()}`,
        name: name.trim(),
        email: safeEmail,
        jurisdiction,
      });
      const matter = opts.withMatter
        ? buildEmptyMatter(matterTitle, caseNumber, courtName, jurisdiction)
        : null;
      onComplete({
        name: name.trim(),
        email: safeEmail,
        jurisdiction,
        matter,
      });
    };

    try {
      const result = await bootstrapWorkspaceSession({
        displayName: name.trim(),
      });

      if (result?.ok === true) {
        await complete(result.accessToken, result.userId);
        return;
      }

      // Cloud bootstrap failed (Anonymous disabled, etc.) — still enter local workspace
      console.warn(
        "[FirstRunWizard] bootstrap:",
        result && "error" in result ? result.error : result
      );
      const localToken =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? `local-session-${crypto.randomUUID()}`
          : `local-session-${Date.now()}`;
      await complete(localToken);
    } catch (err) {
      console.warn("[FirstRunWizard] session error:", err);
      try {
        const localToken =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? `local-session-${crypto.randomUUID()}`
            : `local-session-${Date.now()}`;
        await complete(localToken);
      } catch {
        setError(
          err instanceof Error
            ? err.message
            : "Could not start your session. Please try again."
        );
      }
    } finally {
      setBusy(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#0C0D10] text-[#E1E2E5] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-xl text-white tracking-wide">CHAIN OF COMMAND</h1>
            <p className="text-[11px] text-neutral-500 font-mono uppercase tracking-wider">
              Pro Se Legal OS · First setup
            </p>
          </div>
        </div>

        <div className="flex gap-1.5 mb-4" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-[#D4AF37]" : "bg-[#2A2B35]"
              }`}
            />
          ))}
        </div>

        <div className="bg-[#141519] border border-[#2A2B35] rounded-2xl p-6 sm:p-8 shadow-2xl">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] mb-2">Welcome</p>
                <h2 className="text-2xl font-serif font-semibold text-white leading-snug">
                  Your legal workspace starts empty — and stays yours.
                </h2>
                <p className="text-sm text-neutral-400 mt-3 leading-relaxed">
                  Chain of Command helps self-represented people organize matters, evidence, deadlines,
                  and educational AI research. This is not a law firm and does not create an
                  attorney-client relationship.
                </p>
              </div>

              <ul className="space-y-3 text-sm text-neutral-300">
                <li className="flex gap-3 items-start">
                  <Shield className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Sessions stay on this device until you connect cloud auth.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <Sparkles className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                  <span>AI runs locally via Ollama when available — educational information only.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <BookOpen className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                  <span>Next you will open your first matter and create your first matter.</span>
                </li>
              </ul>

              <label className="flex items-start gap-3 text-sm text-neutral-300 cursor-pointer rounded-lg border border-[#2A2B35] p-3 hover:border-[#D4AF37]/30">
                <input
                  type="checkbox"
                  checked={acknowledgedBoundaries}
                  onChange={(e) => setAcknowledgedBoundaries(e.target.checked)}
                  className="mt-1 rounded border-[#2A2B35]"
                />
                <span>
                  I understand this is <strong className="text-white">not a law firm</strong>, does not create an
                  attorney-client relationship, and will not file anything with a court without my explicit action.
                  If I am in crisis I can call or text <strong className="text-white">988</strong>.
                </span>
              </label>

              <button
                type="button"
                disabled={!acknowledgedBoundaries}
                onClick={() => setStep(1)}
                className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#c49f27] text-neutral-950 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Get started
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-xs text-neutral-500 pt-1">
                Returning user?{" "}
                <Link href="/login" className="text-[#D4AF37] hover:underline font-medium">
                  Sign in instead
                </Link>
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] mb-2">About you</p>
                <h2 className="text-xl font-serif font-semibold text-white">Set up your profile</h2>
                <p className="text-xs text-neutral-400 mt-1">Used only in this workspace. Nothing is filed with a court.</p>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                  Your name *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  placeholder="Full name"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="jurisdiction-select" className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> Primary jurisdiction
                </label>
                <select
                  id="jurisdiction-select"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  aria-label="Primary jurisdiction"
                >
                  {JURISDICTIONS.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <p role="alert" className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="px-4 py-2.5 rounded-xl border border-[#2A2B35] text-neutral-300 text-sm flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (name.trim().length < 2) {
                      setError("Enter your name (at least 2 characters).");
                      return;
                    }
                    setError(null);
                    setStep(2);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c49f27] text-neutral-950 font-semibold text-sm flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] mb-2">Your matter</p>
                <h2 className="text-xl font-serif font-semibold text-white">Open a case file</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Create your real matter. The workspace starts empty — no demo case data.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    Matter title
                  </label>
                  <input
                    value={matterTitle}
                    onChange={(e) => setMatterTitle(e.target.value)}
                    className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                    placeholder="e.g. State v. [Your name] or Family matter"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                      Case number
                    </label>
                    <input
                      value={caseNumber}
                      onChange={(e) => setCaseNumber(e.target.value)}
                      className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                      Court
                    </label>
                    <input
                      value={courtName}
                      onChange={(e) => setCourtName(e.target.value)}
                      className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p role="alert" className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => finish({ withMatter: true })}
                  className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#c49f27] text-neutral-950 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FolderPlus className="w-4 h-4" />
                  Open my matter & enter workspace
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => finish({ withMatter: false })}
                  className="w-full py-2 text-xs text-neutral-500 hover:text-neutral-300 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Skip for now — empty workspace
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-neutral-500 hover:text-neutral-300 flex items-center justify-center gap-1 pt-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-[10px] text-neutral-600 font-mono leading-relaxed">
          NOT LEGAL ADVICE · NO ATTORNEY-CLIENT RELATIONSHIP · EDUCATIONAL USE ONLY
        </p>
      </div>
    </div>
  );
}
