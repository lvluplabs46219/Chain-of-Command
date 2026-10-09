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

  const DRAFTS = [
    {
      id: "doc-1",
      title: "Motion to Suppress Evidence Flowing from Warrantless Automotive Stop",
      status: "Draft (Requires Human Review)",
      date: "October 07, 2024",
      summary: "Challenges initial traffic stop pursuant to Terry v. Ohio and Indiana Const. Art. 1 § 11 based on contradicting BWC running-light evidence.",
      content: `STATE OF INDIANA                    IN THE MARION SUPERIOR COURT
COUNTY OF MARION                    CRIMINAL DIVISION 1

STATE OF INDIANA,
      Plaintiff,
v.                                  CAUSE NO. CR-49G01-2403-F5-001289
MARCUS VANCE,
      Defendant.

[PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE - REQUIRES INDEPENDENT HUMAN REVIEW]

MOTION TO SUPPRESS EVIDENCE RESULTING FROM UNLAWFUL DETENTION

COMES NOW the Defendant, Marcus Vance, appearing pro se (self-represented), and respectfully moves this Court to suppress all evidence, statements, and observations obtained as a fruit of the warrantless stop initiated on March 11, 2024. In support thereof, Defendant states as follows:

1. On March 11, 2024, at approximately 22:14 EST, Officer K. Miller (#7712) initiated an investigatory stop of Defendant's vehicle near Meridian and 38th Streets.
2. In the State's Probable Cause Affidavit, the sole justification proffered for the stop was an alleged total inoperability of rear taillights.
3. Controlling precedent under Terry v. Ohio, 392 U.S. 1 (1968) and State v. Keck, 4 N.E.3d 1180 (Ind. 2014) requires that an officer possess specific, articulable reasonable suspicion that criminal activity or an infraction has occurred.
4. Body-Worn Camera footage (BWC-04, timestamp 22:15:02) unambiguously depicts the vehicle's taillights illuminated and functioning properly upon initial approach.
5. Passive non-compliance without active aggressive exertion cannot form the basis of a lawful charge under Ind. Code § 35-44.1-3-1 (Spangler v. State, 607 N.E.2d 720).
6. Consequently, the initial seizure was constitutionally defective under the Fourth Amendment and Article 1, Section 11 of the Indiana Constitution. All subsequent physical evidence, observations, and statements are fruits of the poisonous tree.

WHEREFORE, Defendant Marcus Vance respectfully requests that this Court schedule an evidentiary suppression hearing and enter an order suppressing all fruits of the unlawful stop.

Respectfully submitted,

/s/ Marcus Vance (Pro Se)
Marcus Vance, Self-Represented Defendant`,
    },
    {
      id: "doc-2",
      title: "Formal Motion to Compel Outstanding Discovery (Dashcam & CAD Audio)",
      status: "Draft (Requires Human Review)",
      date: "October 07, 2024",
      summary: "Requests production of secondary cruiser dashcam footage and unedited CAD dispatch radio logs pursuant to Ind. R. Crim. P. 2.5.",
      content: `STATE OF INDIANA                    IN THE MARION SUPERIOR COURT
COUNTY OF MARION                    CRIMINAL DIVISION 1

STATE OF INDIANA,
      Plaintiff,
v.                                  CAUSE NO. CR-49G01-2403-F5-001289
MARCUS VANCE,
      Defendant.

[PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE - REQUIRES INDEPENDENT HUMAN REVIEW]

DEFENDANT'S MOTION TO COMPEL PRODUCTION OF EXCULPATORY DISCOVERY

COMES NOW Defendant, Marcus Vance, pro se, and moves this Court to compel the State of Indiana to produce outstanding materials required under Brady v. Maryland and Indiana Criminal Rule 2.5:

1. Unredacted CAD Radio Dispatch Audio (CAD-901) from March 11, 2024 between 22:00 and 22:30.
2. Dashcam footage from Secondary Officer Vehicle #4412 on scene.
3. Maintenance and calibration inspection records for Officer Miller's vehicle radar and recording equipment.

WHEREFORE, Defendant requests an expedited order compelling production within 14 days.

/s/ Marcus Vance (Pro Se)`,
    },
  ];

  const currentDoc = DRAFTS[selectedDocIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDoc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#272830]">
        <span className="text-xs font-mono uppercase text-[#D4AF37] font-semibold">
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
                    ? "bg-[#1C1E2A] border-[#D4AF37]/50 shadow-md shadow-[#D4AF37]/5"
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
                className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#c49f27] text-neutral-950 text-xs font-bold flex items-center gap-1.5 shadow-md"
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
