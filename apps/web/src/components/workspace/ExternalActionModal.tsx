"use client";

import React, { useState } from "react";
import { ShieldAlert, Lock, CheckCircle2, AlertTriangle, X, FileText, KeyRound } from "lucide-react";

interface ExternalActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionTitle: string;
  targetCourt: string;
  payloadSummary: string;
}

export function ExternalActionModal({
  isOpen,
  onClose,
  actionTitle,
  targetCourt,
  payloadSummary,
}: ExternalActionModalProps) {
  const [authCode, setAuthCode] = useState("");
  const [confirmedRisk, setConfirmedRisk] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  if (!isOpen) return null;

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (authCode.length >= 4 && confirmedRisk) {
      setAuthorized(true);
      setTimeout(() => {
        setAuthorized(false);
        setAuthCode("");
        setConfirmedRisk(false);
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#141519] border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40">
                Cryptographic Action Gateway
              </span>
              <h3 className="text-base font-bold text-white mt-1">Human Authorization Required</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 bg-neutral-900 border border-[#2B2D3A] rounded-xl text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-neutral-400">Requested Action:</span>
            <span className="font-semibold text-white">{actionTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Target Venue:</span>
            <span className="font-semibold text-white">{targetCourt}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Payload SHA-256:</span>
            <span className="font-mono text-[11px] text-[#D4AF37]">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
          </div>
          <div className="pt-2 border-t border-neutral-800 text-neutral-300 text-[11px]">
            {payloadSummary}
          </div>
        </div>

        <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 text-xs text-amber-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            AI cannot autonomously file pleadings or contact judicial entities. Filing creates binding legal record with
            penalties for perjury under trial rules.
          </p>
        </div>

        {authorized ? (
          <div className="p-4 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-center text-xs text-emerald-300 space-y-1">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
            <div className="font-bold text-white text-sm">Action Signed & Authorized</div>
            <p>Verification record logged to immutable audit ledger.</p>
          </div>
        ) : (
          <form onSubmit={handleAuthorize} className="space-y-4">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-300">
              <input
                type="checkbox"
                checked={confirmedRisk}
                onChange={(e) => setConfirmedRisk(e.target.checked)}
                className="mt-0.5 rounded bg-neutral-900 border-neutral-700 text-[#D4AF37] focus:ring-0"
              />
              <span>
                I have independently reviewed the motion draft, verified factual accuracy, and take full legal
                responsibility as a pro se litigant.
              </span>
            </label>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Enter Authorization Security PIN (or type &quot;1234&quot; to sign):
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  className="w-full bg-[#181920] border border-[#2D303D] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!confirmedRisk || authCode.length < 4}
                className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#c49f27] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-neutral-950 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign & Authorize Action</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
