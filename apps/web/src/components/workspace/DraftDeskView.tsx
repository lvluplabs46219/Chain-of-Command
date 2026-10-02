"use client";

import React, { useState } from "react";
import { Matter } from "@/lib/workspace-data";
import {
  FileSignature,
  Copy,
  Download,
  Printer,
  Check,
  FileText,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface DraftDeskViewProps {
  matter: Matter;
}

type MotionType =
  | "notice_pro_se"
  | "brady_discovery"
  | "motion_suppress"
  | "bail_reduction"
  | "motion_continuance";

export function DraftDeskView({ matter }: DraftDeskViewProps) {
  const [selectedMotion, setSelectedMotion] = useState<MotionType>("brady_discovery");
  const [copied, setCopied] = useState<boolean>(false);
  const [groundsInput, setGroundsInput] = useState<string>("");

  const getTemplateContent = (type: MotionType, customGrounds?: string): string => {
    const today = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const watermark =
      "[PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE - REQUIRES INDEPENDENT HUMAN REVIEW]\n\n";
    const footer =
      "\n\n================================================================================\nThis document draft is prepared for educational and procedural purposes only and does not\nconstitute legal advice. No attorney-client relationship is formed. All self-represented litigants\nmust independently review and verify all statements prior to physical or electronic court filing.\n================================================================================";

    switch (type) {
      case "notice_pro_se":
        return `${watermark}IN THE ${matter.courtName.toUpperCase()}
COUNTY OF MARION, STATE OF INDIANA

STATE OF INDIANA,               )
       Plaintiff,              )  CASE NO. ${matter.caseNumber}
v.                             )
MARCUS VANCE,                  )
       Defendant.              )

             ENTRY OF APPEARANCE PRO SE (SELF-REPRESENTATION)

TO: THE CLERK OF THE COURT AND THE OFFICE OF THE PROSECUTING ATTORNEY:

COMES NOW the Defendant, Marcus Vance, pro se, and enters this formal appearance
as Defendant in the above-captioned matter pursuant to constitutional and statutory rules
of criminal procedure.

1. Defendant asserts the right of self-representation guaranteed under the Sixth and Fourteenth
   Amendments to the United States Constitution (Faretta v. California, 422 U.S. 806).
2. Defendant requests that all future notices, discovery productions, orders, and filings
   be served upon Defendant directly at the address of record provided below.

Respectfully submitted this ${today}.

_______________________________________
Marcus Vance, Defendant Pro Se
Address: 1420 N. Meridian St, Apt 4B, Indianapolis, IN 46202
Email: defendant.prose.record@example.com${footer}`;

      case "brady_discovery":
        return `${watermark}IN THE ${matter.courtName.toUpperCase()}
COUNTY OF MARION, STATE OF INDIANA

STATE OF INDIANA,               )
       Plaintiff,              )  CASE NO. ${matter.caseNumber}
v.                             )
MARCUS VANCE,                  )
       Defendant.              )

  DEFENDANT'S FIRST FORMAL MOTION FOR PRODUCTION OF EXCULPATORY EVIDENCE
              AND DISCOVERY DISCLOSURES UNDER BRADY V. MARYLAND

COMES NOW the Defendant, Marcus Vance, appearing pro se, and respectfully moves this
Honorable Court for an order directing the Prosecuting Attorney to produce all material
exculpatory evidence pursuant to Brady v. Maryland, 373 U.S. 83 (1963), Giglio v. United States,
405 U.S. 150 (1972), and Criminal Discovery Rules.

1. EXCULPATORY VIDEO & AUDIO RECORDINGS:
   Defendant requests complete, unedited copies of all body-worn camera (BWC) footage from all
   responding officers, together with CAD 911 dispatch audio transmissions relating to Incident #2024-9912.

2. COMMERCIAL ESTABLISHMENT SURVEILLANCE & REGISTER TAPES:
   Defendant requests all retail surveillance recordings and original time-stamped register transaction
   receipts in the State's custody demonstrating Defendant's authorized payment and absence of unlawful intent.

3. WITNESS STATEMENTS & CREDIBILITY DISCLOSURES:
   Defendant requests all written statements, interview notes, and any impeachment or prior misconduct
   findings regarding State witnesses pursuant to Giglio and Rule 16.

${customGrounds ? `ADDITIONAL SPECIFIC REQUESTS:\n${customGrounds}\n\n` : ""}WHEREFORE, Defendant prays that the Court order the State to disclose and produce the requested
items within fourteen (14) days hereof.

Respectfully submitted this ${today}.

_______________________________________
Marcus Vance, Defendant Pro Se
Certificate of Service: A copy served upon the Prosecuting Attorney on ${today}.${footer}`;

      case "motion_suppress":
        return `${watermark}IN THE ${matter.courtName.toUpperCase()}
COUNTY OF MARION, STATE OF INDIANA

STATE OF INDIANA,               )
       Plaintiff,              )  CASE NO. ${matter.caseNumber}
v.                             )
MARCUS VANCE,                  )
       Defendant.              )

             DEFENDANT'S MOTION TO SUPPRESS TANGIBLE EVIDENCE
                UNDER THE FOURTH AND FOURTEENTH AMENDMENTS

COMES NOW Defendant, Marcus Vance, pro se, and moves this Court to suppress from introduction
at trial any and all tangible items seized during the warrantless search of Defendant's vehicle on
August 10, 2026, pursuant to Mapp v. Ohio, 367 U.S. 643 (1961) and Terry v. Ohio, 392 U.S. 1 (1968).

MEMORANDUM OF POINTS AND AUTHORITIES:
1. The Fourth Amendment protects against unreasonable searches and seizures. Warrantless searches
   are per se unreasonable unless subject to a specifically established exception (Katz v. United States).
2. Law enforcement officers conducted a search of Defendant's vehicle trunk without a warrant, without consent,
   and after Defendant had already been detained, violating the automobile exception standards.
${customGrounds ? `3. SPECIFIC CONTESTED FACTS:\n   ${customGrounds}\n` : ""}
WHEREFORE, Defendant respectfully moves that all tangible evidence seized during said warrantless search
be suppressed and excluded from introduction at trial.

Dated: ${today}

_______________________________________
Marcus Vance, Defendant Pro Se${footer}`;

      case "bail_reduction":
        return `${watermark}IN THE ${matter.courtName.toUpperCase()}

STATE OF INDIANA v. MARCUS VANCE | CASE NO. ${matter.caseNumber}

       DEFENDANT'S MOTION FOR REDUCTION OF BAIL / RELEASE ON OWN RECOGNIZANCE

COMES NOW the Defendant, Marcus Vance, pro se, and moves the Court for an order reducing bail
or granting release upon personal recognizance under the Eighth Amendment and statutory bail rules.

FACTORS SUPPORTING MODIFICATION:
1. COMMUNITY TIES: Defendant is a lifelong resident of Marion County with stable employment.
2. APPEARANCE HISTORY: Defendant has zero failures to appear and poses no danger to the community.
3. FINANCIAL MEANS: The current cash bond imposes an insurmountable barrier resulting in pretrial incarceration.

WHEREFORE, Defendant requests a hearing on bond reduction.

Dated: ${today}
_______________________________________
Marcus Vance, Defendant Pro Se${footer}`;

      case "motion_continuance":
        return `${watermark}IN THE ${matter.courtName.toUpperCase()}

STATE OF INDIANA v. MARCUS VANCE | CASE NO. ${matter.caseNumber}

              DEFENDANT'S MOTION FOR CONTINUANCE OF PRE-TRIAL HEARING

COMES NOW the Defendant, Marcus Vance, pro se, and respectfully requests a continuance of the upcoming
hearing scheduled for ${matter.nextCourtDate.split("T")[0]}.

GROUNDS:
1. Defendant recently received supplemental discovery disclosures requiring adequate review.
2. Good cause exists and no prejudice will result to the State of Indiana.

WHEREFORE, Defendant requests a continuance of not less than twenty-one (21) days.

Dated: ${today}
_______________________________________
Marcus Vance, Defendant Pro Se${footer}`;
    }
  };

  const currentDraft = getTemplateContent(selectedMotion, groundsInput);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentDraft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedMotion}_${matter.caseNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`<pre style="font-family: monospace; white-space: pre-wrap; padding: 20px;">${currentDraft}</pre>`);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-[#23242B] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider">Pro Se Legal Drafting Studio</span>
            <span className="text-neutral-500">·</span>
            <span className="text-xs text-neutral-400">Court-Ready Motion Desk</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-tight">Record Room & Draft Desk</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Prepare formal motions, discovery demands, and pro se notices formatted to court standards with mandatory SRL review marks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-2 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Draft"}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-2 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .txt</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-[#D4AF37] hover:bg-[#c49f27] rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Draft</span>
          </button>
        </div>
      </div>

      {/* Motion Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#23242B] pb-3">
        {[
          { id: "brady_discovery", label: "Motion for Brady Discovery" },
          { id: "motion_suppress", label: "Motion to Suppress (4th Amend)" },
          { id: "notice_pro_se", label: "Entry of Appearance Pro Se" },
          { id: "bail_reduction", label: "Motion for Bail Reduction" },
          { id: "motion_continuance", label: "Motion for Continuance" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedMotion(tab.id as MotionType)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              selectedMotion === tab.id
                ? "bg-[#D4AF37] text-neutral-950 font-semibold"
                : "bg-neutral-800/60 text-neutral-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Editor & Custom Grounds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Motion Editor (8 cols) */}
        <div className="lg:col-span-8 bg-[#141519] border border-[#272830] rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mb-3 border-b border-[#23242B] pb-2">
            <span>FORMATTED COURT PLEADING</span>
            <span className="text-[#D4AF37]">Captioned for {matter.courtName}</span>
          </div>

          <textarea
            readOnly
            value={currentDraft}
            rows={24}
            className="w-full bg-[#0E0E10] border border-[#23242B] rounded-lg p-4 font-mono text-xs text-neutral-200 leading-relaxed focus:outline-none resize-none selection:bg-[#D4AF37]/30"
          />
        </div>

        {/* Right: Custom Grounds & Instructions (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#141519] border border-[#272830] rounded-xl p-5">
            <h3 className="font-semibold text-white text-sm mb-1">Tailor Specific Factual Grounds</h3>
            <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
              Inject specific incident facts or witness details into the draft:
            </p>
            <textarea
              rows={4}
              value={groundsInput}
              onChange={(e) => setGroundsInput(e.target.value)}
              placeholder="e.g. Officers opened the trunk without consent while defendant was handcuffed in police vehicle..."
              className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg p-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="bg-[#141519] border border-[#272830] rounded-xl p-5 space-y-3 text-xs text-neutral-300">
            <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-sm">
              <FileSignature className="w-4 h-4" />
              <span>Pro Se Filing Instructions</span>
            </div>
            <ol className="list-decimal pl-4 space-y-1.5 text-neutral-400">
              <li>Print three (3) copies of the completed document.</li>
              <li>Sign the original above your printed name.</li>
              <li>File the original with the Clerk of the Court.</li>
              <li>Deliver one copy to the Prosecuting Attorney.</li>
              <li>Keep one stamped copy in your personal defense binder.</li>
            </ol>
            <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-lg text-[11px] text-amber-200">
              Notice: The AI does not file or submit motions. You remain in complete control of your court submissions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
