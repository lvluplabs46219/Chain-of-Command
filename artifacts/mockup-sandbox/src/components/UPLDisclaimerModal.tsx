'use client';

import React, { useState } from 'react';

export interface UPLDisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export default function UPLDisclaimerModal({ isOpen, onAccept }: UPLDisclaimerModalProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl text-neutral-200">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-amber-500 animate-pulse" />
          <h2 className="text-lg font-bold uppercase tracking-wider text-white">
            Legal Information, Not Legal Advice
          </h2>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-neutral-400">
          This platform is a self-help document preparation and procedural navigation tool.
          We are <strong>not a law firm</strong>, do not provide legal representation or strategic advice,
          and no attorney-client relationship is formed.
        </p>

        <p className="mt-2 text-sm leading-relaxed text-neutral-400">
          You are representing yourself (<em>pro se</em>) and remain solely responsible for reviewing
          all factual statements, verifying court deadlines, and approving any court submissions.
        </p>

        <label className="mt-5 flex items-start gap-3 rounded-lg border border-neutral-800 bg-neutral-950/60 p-3.5 cursor-pointer hover:border-neutral-700 transition">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-blue-600 focus:ring-0"
          />
          <span className="text-xs leading-normal text-neutral-300">
            I acknowledge that I am a self-represented litigant, that this software does not provide legal advice, and that I must independently review all generated materials before filing.
          </span>
        </label>

        <div className="mt-6 flex items-center justify-between border-t border-neutral-800 pt-4">
          <span className="text-xs text-neutral-500">
            Compliance Ref: State Bar UPL Rule 5.5 / Safe-Harbor
          </span>
          <button
            type="button"
            disabled={!acknowledged}
            onClick={onAccept}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue to Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
