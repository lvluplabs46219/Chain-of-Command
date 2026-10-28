"use client";

import React, { useState, useMemo } from "react";
import {
  FileSignature,
  FileText,
  Download,
  Copy,
  Check,
  Printer,
  Search,
  Sparkles,
  Info,
  CheckCircle2,
  Calendar,
  AlertCircle,
  HelpCircle,
  Send,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  Scale,
  X,
  FileCheck,
} from "lucide-react";
import { Matter, isDemoMatter } from "@/lib/workspace-data";

interface DraftDeskViewProps {
  matter: Matter;
  onOpenActionModal?: (title: string, court: string, summary: string) => void;
  onSendToChambers?: (promptText: string) => void;
}

export interface MotionTemplate {
  id: string;
  name: string;
  category: "Pre-Trial" | "Discovery & Evidence" | "Constitutional" | "Family & Paternity" | "Appearance";
  badge: string;
  governingRule: string;
  summary: string;
  whenToFile: string;
  generateText: (matter: Matter, todayStr: string) => string;
}

function cleanStr(val: string | undefined | null, fallback: string): string {
  if (!val || val.trim() === "" || val === "—") return fallback;
  return val.trim();
}

function formatPleadingHeader(matter: Matter, title: string, todayStr: string): string {
  const jurisdiction = cleanStr(matter.jurisdiction, "STATE OF INDIANA");
  const court = cleanStr(matter.court || matter.courtName, "IN THE SHELBY CIRCUIT COURT");
  const caseNo = cleanStr(matter.caseNumber, "CAUSE NO. [ENTER CAUSE NUMBER]");
  const judge = cleanStr(matter.judge, "[PRESIDING JUDGE]");

  const isJP = (matter.caseNumber || "").toUpperCase().includes("-JP-") ||
               (matter.title || "").toLowerCase().includes("paternity");
  const isFamily = isJP || (matter.caseNumber || "").toUpperCase().includes("-DC-") ||
                   (matter.caseNumber || "").toUpperCase().includes("-DN-");

  let caption = "";
  if (isFamily) {
    caption = `IN RE THE PATERNITY / MARRIAGE OF:
${matter.title || "[PETITIONER] v. [RESPONDENT]"}
    Petitioner,
v.                                      ${caseNo}
    Respondent.`;
  } else {
    caption = `STATE OF ${jurisdiction.toUpperCase().replace("STATE OF ", "")},
    Plaintiff / Prosecution,
v.                                      ${caseNo}
${cleanStr(matter.title, "DEFENDANT [NAME]")},
    Defendant (Pro Se).`;
  }

  return `================================================================================
${jurisdiction.toUpperCase()}
${court.toUpperCase()}
PRESIDING: HON. ${judge.toUpperCase()}
================================================================================

${caption}

--------------------------------------------------------------------------------
${title.toUpperCase()}
--------------------------------------------------------------------------------
[PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE - REQUIRES INDEPENDENT HUMAN REVIEW & SIGNATURE PRIOR TO FILING]
`;
}

function formatSignatureBlock(matter: Matter, todayStr: string): string {
  const defendantName = matter.title ? matter.title.replace(/^State\s+v\.?\s+/i, "") : "[YOUR FULL NAME]";
  return `

Respectfully submitted this ${todayStr},

_____________________________________________
${defendantName}, Pro Se Litigant
Address: [YOUR STREET ADDRESS]
City, State, Zip: [CITY, STATE, ZIP]
Telephone: [YOUR PHONE NUMBER]
Email: [YOUR EMAIL ADDRESS]

================================================================================
CERTIFICATE OF SERVICE
================================================================================
I hereby certify that on this ${todayStr}, a true and accurate copy of the foregoing document was served upon the Prosecuting Attorney / Opposing Counsel of record via:
[ ] Indiana E-Filing System (IEFS)
[ ] Certified First Class U.S. Mail, postage prepaid
[ ] Hand Delivery to Office of Opposing Counsel

Service Address:
${cleanStr(matter.prosecutor, "Office of the Prosecuting Attorney / Opposing Counsel")}
[Address of Opposing Counsel]

_____________________________________________
${defendantName}, Pro Se
`;
}

const MOTION_TEMPLATES: MotionTemplate[] = [
  {
    id: "motion-pro-se-appearance",
    name: "Notice of Pro Se Appearance & Demand for Direct Service",
    category: "Appearance",
    badge: "Ind. T.R. 3.1 / Faretta",
    governingRule: "Indiana Trial Rule 3.1 & 6th Amendment",
    summary: "Enters your formal self-represented appearance and commands that all court notices and prosecutor filings be delivered directly to your personal address.",
    whenToFile: "Immediately upon filing of charges, opening of a case, or discharge/withdrawal of prior counsel.",
    generateText: (matter, todayStr) => {
      const header = formatPleadingHeader(matter, "Verified Notice of Pro Se Appearance & Demand for Direct Service", todayStr);
      const defendant = cleanStr(matter.title, "[DEFENDANT / RESPONDENT]");
      const court = cleanStr(matter.court || matter.courtName, "this Court");
      const sig = formatSignatureBlock(matter, todayStr);

      return `${header}
COMES NOW the undersigned litigant, ${defendant}, proceeding pro se (self-represented), pursuant to the Sixth and Fourteenth Amendments to the United States Constitution, Article 1, Section 13 of the Indiana Constitution, and Indiana Trial Rule 3.1, and respectfully notifies this Court and all parties of an appearance in this cause:

1. PRO SE STATUS: Litigant hereby exercises the absolute constitutional right of self-representation as affirmed in Faretta v. California, 422 U.S. 806 (1975). Litigant is representing themselves in the above-captioned matter without retained or appointed counsel.

2. SERVICE ADDRESS & CONTACT: Pursuant to Indiana Trial Rule 3.1(A), all notices, orders, motions, discovery disclosures, hearings, and official communications from the Court and opposing counsel MUST be served directly upon the undersigned at:
   Full Legal Name: ${defendant}
   Mailing Address: [INSERT YOUR CURRENT MAILING ADDRESS]
   Primary Phone:   [INSERT YOUR PHONE NUMBER]
   Email for Notice:[INSERT YOUR EMAIL ADDRESS]

3. DEMAND FOR PROMPT DIRECT SERVICE: Pursuant to Indiana Trial Rule 5, litigant demands that opposing counsel immediately provide copies of any and all pleadings, charging affidavits, arrest reports, discovery disclosures, or hearing notices previously filed in this cause that have not yet been directly received.

4. REQUEST FOR CLERK CONFIRMATION: The Clerk of this Court is respectfully requested to record this Appearance in the Chronological Case Summary (CCS) and ensure the automated notification system directs all future dockets to the address specified above.

${sig}`;
    },
  },
  {
    id: "motion-continuance",
    name: "Motion for Continuance of Hearing / Extension of Time",
    category: "Pre-Trial",
    badge: "Ind. T.R. 53.5",
    governingRule: "Indiana Trial Rule 53.5 / Local Court Rules",
    summary: "Requests a postponement of an upcoming hearing, pretrial conference, or deadline to allow adequate time for preparation and discovery review.",
    whenToFile: "File as soon as good cause arises, ideally at least 10–14 days before the scheduled hearing date.",
    generateText: (matter, todayStr) => {
      const header = formatPleadingHeader(matter, "Motion for Continuance of Scheduled Hearing", todayStr);
      const defendant = cleanStr(matter.title, "[LITIGANT]");
      const court = cleanStr(matter.court || matter.courtName, "this Court");
      const nextDate = cleanStr(matter.nextCourtDate, "[CURRENTLY SCHEDULED HEARING DATE]");
      const sig = formatSignatureBlock(matter, todayStr);

      return `${header}
COMES NOW ${defendant}, proceeding pro se, and respectfully moves this Court pursuant to Indiana Trial Rule 53.5 for a continuance of the hearing currently scheduled in this cause for ${nextDate}, and in support thereof states as follows:

1. CURRENT SETTING: This matter is currently set for a hearing/proceeding on ${nextDate} before the Honorable ${cleanStr(matter.judge, "Judge of this Court")}.

2. GOOD CAUSE FOR CONTINUANCE: The self-represented litigant respectfully requests a reasonable postponement for the following good cause:
   a. Need for Complete Discovery: Critical evidentiary records, reports, and witness statements necessary to prepare an adequate defense have not yet been produced or are currently undergoing review.
   b. Fair Opportunity to Prepare: Pro se litigant requires additional time to consult legal authorities, organize exhibits, and ensure compliance with procedural rules to guarantee due process of law.
   c. [ADDITIONAL GOOD CAUSE: e.g. medical conflict, witness unavailability, or recent receipt of supplemental disclosures].

3. NO UNDUE DELAY OR PREJUDICE: This request is made in good faith and not for purposes of undue delay. Opposing party will suffer no unfair prejudice by the granting of a brief continuance.

4. PROPOSED RESET WINDOW: Litigant respectfully requests that this proceeding be rescheduled to a date thirty (30) to forty-five (45) days subsequent to the current setting, or at the Court's earliest convenience.

WHEREFORE, ${defendant} respectfully requests that this Court grant this Motion for Continuance, vacate the setting on ${nextDate}, reschedule the hearing to a future date, and grant all other just and proper relief.

${sig}`;
    },
  },
  {
    id: "motion-discovery-brady",
    name: "Motion for Discovery & Inspection (Brady / Rule 34 Demand)",
    category: "Discovery & Evidence",
    badge: "Brady / Ind. T.R. 34",
    governingRule: "Brady v. Maryland, Giglio v. U.S., Ind. Trial Rule 34",
    summary: "Commands production of all exculpatory evidence, 911 audio, officer bodycam/dashcam, dispatch logs, CAD notes, and witness statements.",
    whenToFile: "File immediately after initial appearance/arraignment to lock in preservation obligations.",
    generateText: (matter, todayStr) => {
      const header = formatPleadingHeader(matter, "Motion for Discovery, Production of Documents & Exculpatory Evidence", todayStr);
      const defendant = cleanStr(matter.title, "[DEFENDANT]");
      const sig = formatSignatureBlock(matter, todayStr);

      const chargeList = matter.charges.length > 0
        ? matter.charges.map((c) => `   - Count ${c.countNumber}: ${c.title} (${c.statuteCitation || "Ind. Code"})`).join("\n")
        : "   - All charges, counts, and allegations pending under this cause number.";

      return `${header}
COMES NOW ${defendant}, pro se, and respectfully moves this Court for an Order compelling the State of Indiana / Opposing Party to produce and permit inspection and copying of all tangible evidence, documents, electronic recordings, and exculpatory material pursuant to the Fourth, Fifth, Sixth, and Fourteenth Amendments to the U.S. Constitution, Brady v. Maryland, 373 U.S. 83 (1963), Giglio v. United States, 405 U.S. 150 (1972), and Indiana Trial Rules 26 and 34:

1. PENDING CHARGES: This demand applies to all evidence related to the following counts:
${chargeList}

2. SPECIFIC DISCOVERY DEMANDED: Litigant demands production of the following items within thirty (30) days:
   a. Exculpatory & Impeachment Evidence: Any and all evidence tending to negate guilt, reduce potential punishment, or impeach the credibility of any prospective State witness (Brady / Giglio material).
   b. Audio & Video Recordings: Uncut, unedited body-worn camera (BWC) footage, cruiser dashcam recordings, interview room video, and 911 emergency call audio recordings.
   c. Police Dispatch & CAD Records: Complete Computer-Aided Dispatch (CAD) call logs, radio transmission audio, unit callout logs, and shift activity sheets.
   d. Field Notes & Rough Drafts: All handwritten officer notes, preliminary draft narratives, incident reports, and supplemental filings.
   e. Witness Statements & Criminal Histories: Written, recorded, or summarized statements of all persons interviewed, together with certified criminal history records of any civilian witness the State intends to call.
   f. Scientific & Laboratory Testing: All calibration logs, chain of custody documentation, instrument maintenance records, and raw lab data for any forensic or chemical tests.

3. CONTINUING DUTY TO DISCLOSE: Litigant places the State on notice that this request imposes a continuing legal obligation to supplement disclosures promptly upon receiving additional information.

WHEREFORE, ${defendant} respectfully requests that this Court enter an Order directing the State / Opposing Party to produce the requested materials within thirty (30) days of service hereof.

${sig}`;
    },
  },
  {
    id: "motion-suppress-evidence",
    name: "Motion to Suppress Illegally Seized Evidence (4th Amendment)",
    category: "Constitutional",
    badge: "4th Amend. / Mapp",
    governingRule: "U.S. Const. Amend. IV; Ind. Const. Art. 1 § 11; Mapp v. Ohio",
    summary: "Seeks exclusion of physical items, statements, or test results obtained through an unlawful traffic stop, warrantless search, or unconstitutional detention.",
    whenToFile: "File prior to the omnibus date or pretrial evidentiary deadline.",
    generateText: (matter, todayStr) => {
      const header = formatPleadingHeader(matter, "Verified Motion to Suppress Illegally Seized Evidence", todayStr);
      const defendant = cleanStr(matter.title, "[DEFENDANT]");
      const sig = formatSignatureBlock(matter, todayStr);

      const evidenceList = matter.evidence.length > 0
        ? matter.evidence.map((e) => `   - Exhibit [${e.exhibitNumber}]: ${e.title} (${e.type})`).join("\n")
        : "   - All tangible items, physical contraband, biological samples, and verbal statements seized during the encounter.";

      return `${header}
COMES NOW ${defendant}, proceeding pro se, and respectfully moves this Court to suppress all evidence obtained directly or indirectly from the unconstitutional search and seizure conducted by law enforcement officers in this cause, stating in support as follows:

1. CONSTITUTIONAL VIOLATIONS: The detention, search, and seizure executed against the Defendant violated the Fourth and Fourteenth Amendments to the United States Constitution, Article 1, Section 11 of the Indiana Constitution, and controlling precedents including Terry v. Ohio, 392 U.S. 1 (1968) and Mapp v. Ohio, 367 U.S. 643 (1961).

2. EVIDENCE SOUGHT TO BE SUPPRESSED:
${evidenceList}

3. GROUNDS FOR SUPPRESSION:
   a. Lack of Reasonable Suspicion: Law enforcement officers lacked articulable reasonable suspicion of criminal activity at the inception of the stop/encounter.
   b. Unlawful Extension of Detention: Officers impermissibly prolonged the duration of the stop beyond the time required to complete the initial traffic mission, in violation of Rodriguez v. United States, 575 U.S. 348 (2015).
   c. Warrantless Search Without Exception: The search was conducted without a search warrant, without voluntary informed consent, and without any valid recognized exception to the warrant requirement.
   d. Fruit of the Poisonous Tree: All subsequent statements, observations, and physical exhibits constitute derivative evidence ('fruit of the poisonous tree') subject to mandatory exclusion under Wong Sun v. United States, 371 U.S. 471 (1963).

WHEREFORE, ${defendant} respectfully requests that this Court set this Motion for an evidentiary hearing, suppress all evidence seized as a result of the unconstitutional stop and search, and order that such evidence not be admitted or referenced at trial.

${sig}`;
    },
  },
  {
    id: "motion-speedy-trial",
    name: "Demand for Speedy Trial (Ind. Crim. R. 4(B) / 6th Amend.)",
    category: "Constitutional",
    badge: "Crim. R. 4(B)",
    governingRule: "Indiana Criminal Rule 4(B) & Sixth Amendment",
    summary: "Formally invokes your constitutional and statutory right to a speedy trial within seventy (70) calendar days.",
    whenToFile: "File when in custody or ready for immediate trial and wishing to prevent indefinite prosecution delays.",
    generateText: (matter, todayStr) => {
      const header = formatPleadingHeader(matter, "Demand for Speedy Trial Pursuant to Criminal Rule 4(B)", todayStr);
      const defendant = cleanStr(matter.title, "[DEFENDANT]");
      const remainingDays = matter.speedyTrialDaysRemaining || 70;
      const sig = formatSignatureBlock(matter, todayStr);

      return `${header}
COMES NOW the Defendant, ${defendant}, proceeding pro se, and pursuant to Rule 4(B) of the Indiana Rules of Criminal Procedure and the Sixth Amendment to the United States Constitution, hereby formally files this Demand for Speedy Trial:

1. INVOCATION OF STATUTORY RIGHT: Defendant demands a speedy trial and moves this Court to set this cause for trial by jury within seventy (70) calendar days from the date of the filing of this motion, pursuant to Ind. Crim. R. 4(B)(1).

2. READINESS FOR TRIAL: Defendant is ready for trial, has not caused any delay, and does not consent to any continuance or postponement beyond the seventy-day statutory window.

3. STATUTORY TIMELINE:
   - Date of Motion Filing: ${todayStr}
   - Statutory Period: 70 Calendar Days
   - Calculated Deadline: Within ${remainingDays} days of initial calculation.

4. MANDATORY DISMISSAL CLAUSE: Defendant places the Court and the State on notice that if Defendant is not brought to trial within seventy (70) calendar days from the date of this motion, Defendant shall move for immediate discharge and dismissal of all charges with prejudice pursuant to Ind. Crim. R. 4(B).

WHEREFORE, Defendant ${defendant} moves this Court to immediately set a firm jury trial date within the statutory 70-day window prescribed by Indiana Criminal Rule 4(B).

${sig}`;
    },
  },
  {
    id: "motion-dismiss-defective-charging",
    name: "Motion to Dismiss for Defective Information / Failure to State Offense",
    category: "Pre-Trial",
    badge: "I.C. § 35-34-1-4",
    governingRule: "Ind. Code § 35-34-1-4 & Ind. Trial Rule 12(B)(6)",
    summary: "Demands dismissal of charges where the charging affidavit fails to allege essential statutory elements or facts establishing probable cause.",
    whenToFile: "File prior to or at the omnibus hearing.",
    generateText: (matter, todayStr) => {
      const header = formatPleadingHeader(matter, "Motion to Dismiss Charging Information Pursuant to I.C. § 35-34-1-4", todayStr);
      const defendant = cleanStr(matter.title, "[DEFENDANT]");
      const sig = formatSignatureBlock(matter, todayStr);

      const chargeDetails = matter.charges.length > 0
        ? matter.charges.map((c) => `   - Count ${c.countNumber}: ${c.title} (${c.statuteCitation})\n     Statutory Tier: ${c.tier}`).join("\n")
        : "   - All pending counts under Cause No. " + cleanStr(matter.caseNumber, "[ENTER CAUSE NUMBER]");

      return `${header}
COMES NOW ${defendant}, proceeding pro se, and moves this Court pursuant to Indiana Code § 35-34-1-4 and the Due Process Clause of the Fourteenth Amendment to dismiss the charging information filed in this cause, stating in support:

1. DEFICIENT CHARGES:
${chargeDetails}

2. STATUTORY GROUNDS FOR DISMISSAL:
   a. Failure to State an Offense: The Information fails to state an offense as required by Ind. Code § 35-34-1-4(a)(1) because it omits essential statutory elements, including the requisite mens rea (culpable mental state) and specific acts of conduct.
   b. Defective Affidavit of Probable Cause: The probable cause affidavit attached to the information relies upon conclusory assertions without personal knowledge or corroborated facts.
   c. Constitutional Lack of Notice: Under the Sixth Amendment and Indiana Constitution Art. 1 § 13, an accused is entitled to be informed of the specific nature and cause of the accusation with sufficient clarity to prepare a defense. The vague allegations here fail this threshold.

WHEREFORE, ${defendant} respectfully requests that this Court schedule an immediate hearing on this motion, order the charging information dismissed with prejudice, and discharge the Defendant from custody and bond.

${sig}`;
    },
  },
  {
    id: "petition-modification-custody-paternity",
    name: "Verified Petition for Modification of Custody / Parenting Time",
    category: "Family & Paternity",
    badge: "Ind. Code § 31-14 / § 31-17",
    governingRule: "Indiana Code § 31-14-13 / § 31-17-2 & IPTG",
    summary: "Petitions for modification of parenting time, legal custody, or child support based upon a substantial and continuing change in circumstances.",
    whenToFile: "File in Juvenile Paternity (JP) or Domestic Relations (DC/DR/DN) cases when circumstances have changed substantially.",
    generateText: (matter, todayStr) => {
      const header = formatPleadingHeader(matter, "Verified Petition for Modification of Parenting Time & Custody", todayStr);
      const petitioner = cleanStr(matter.title, "Petitioner / Respondent");
      const sig = formatSignatureBlock(matter, todayStr);

      return `${header}
COMES NOW ${petitioner}, pro se, and respectfully petitions this Court for a modification of the current parenting time and custody order pursuant to Indiana Code § 31-14-13-6, Indiana Code § 31-17-4, and the Indiana Parenting Time Guidelines (IPTG), and states in support:

1. EXISTING ORDER: The Court previously entered an order establishing custody and parenting time regarding the minor child(ren) subject to this action.

2. SUBSTANTIAL & CONTINUING CHANGE IN CIRCUMSTANCES: Since the entry of the last order, there has been a substantial and continuing change in circumstances, including but not limited to:
   a. Change in residence, employment stability, or home environment providing an enhanced, safe, and nurturing environment for the child(ren).
   b. Change in the developmental, educational, or medical needs of the child(ren).
   c. Interference with established parenting time or failure to adhere to the Indiana Parenting Time Guidelines (IPTG).
   d. [DETAIL SPECIFIC FACTUAL CHANGES HERE].

3. BEST INTERESTS OF THE CHILD: Modification of parenting time / custody is in the best interests of the minor child(ren) under Indiana Code § 31-17-2-8, promoting regular, continuous, and meaningful contact with both fit parents.

4. MEDIATION / DISPUTE RESOLUTION: Litigant has attempted in good faith to resolve this schedule cooperatively without unnecessary litigation, but judicial resolution is now required.

WHEREFORE, Litigant respectfully requests that this Court set this Petition for a hearing, modify the parenting time order in accordance with the Indiana Parenting Time Guidelines, recalculate child support if applicable, and grant all other equitable relief.

${sig}`;
    },
  },
  {
    id: "motion-rule-to-show-cause-contempt",
    name: "Motion for Rule to Show Cause & Citation for Contempt",
    category: "Family & Paternity",
    badge: "Contempt / Enforcement",
    governingRule: "Indiana Code § 34-47-3 (Indirect Contempt)",
    summary: "Demands that the opposing party appear in court and explain why they should not be held in contempt for willfully violating existing court orders.",
    whenToFile: "File when the opposing party willfully refuses to obey court orders regarding discovery, parenting time, or support.",
    generateText: (matter, todayStr) => {
      const header = formatPleadingHeader(matter, "Verified Motion for Rule to Show Cause (Citation for Indirect Contempt)", todayStr);
      const movant = cleanStr(matter.title, "Litigant");
      const sig = formatSignatureBlock(matter, todayStr);

      return `${header}
COMES NOW ${movant}, pro se, and moves this Court to issue a Rule to Show Cause directed to the Opposing Party, requiring them to appear and show cause why they should not be held in indirect civil contempt of court, stating:

1. EXISTING VALID ORDER: On [DATE OF ORDER], this Court entered an enforceable Order requiring the Opposing Party to [COMPLY WITH DISCOVERY / PERMIT PARENTING TIME / PAY CHILD SUPPORT].

2. WILLFUL NON-COMPLIANCE: The Opposing Party had actual knowledge of said Order, possessed the ability to comply, but willfully and intentionally failed and refused to comply with its terms by:
   a. [DETAIL WILLFUL VIOLATION 1: e.g. Withholding parenting time on specified weekend].
   b. [DETAIL WILLFUL VIOLATION 2: e.g. Refusing to produce mandated discovery records].

3. DAMAGE & PREJUDICE: Movant has suffered substantial harm, interference with parental rights, and procedural prejudice as a direct result of Opposing Party's contemptuous conduct.

WHEREFORE, Movant prays that this Court:
1. Issue a Rule to Show Cause commanding Opposing Party to appear before this Court on a date and time certain;
2. Hold Opposing Party in Indirect Civil Contempt of Court;
3. Order immediate purge conditions to remedy the violation (make-up parenting time, immediate document production, etc.);
4. Award all other relief appropriate to enforce compliance.

${sig}`;
    },
  },
  {
    id: "motion-bill-of-particulars",
    name: "Motion for More Definite Statement / Bill of Particulars",
    category: "Discovery & Evidence",
    badge: "Ind. T.R. 12(E)",
    governingRule: "Indiana Trial Rule 12(E) & 6th Amendment Notice",
    summary: "Requires the opposing party to state specific dates, times, acts, and statutory code definitions when pleadings are vague or ambiguous.",
    whenToFile: "File when allegations are too generic to reasonably prepare an answer or defense.",
    generateText: (matter, todayStr) => {
      const header = formatPleadingHeader(matter, "Motion for More Definite Statement Pursuant to Trial Rule 12(E)", todayStr);
      const defendant = cleanStr(matter.title, "[LITIGANT]");
      const sig = formatSignatureBlock(matter, todayStr);

      return `${header}
COMES NOW ${defendant}, pro se, and respectfully moves this Court pursuant to Indiana Trial Rule 12(E) for an Order directing the Opposing Party to file a More Definite Statement (Bill of Particulars), stating in support:

1. AMBIGUITY OF PLEADING: The charging document or petition filed herein is so vague, ambiguous, and lacking in factual specificity that the self-represented litigant cannot reasonably frame a responsive pleading or prepare an adequate defense.

2. SPECIFIC DEFECTS:
   a. The pleading fails to specify the precise date and time window of the alleged occurrence.
   b. The pleading fails to identify the exact location or venue within the County where the acts supposedly occurred.
   c. The pleading fails to describe the specific physical acts attributed to the litigant, alleging only generic legal conclusions.

3. CONSTITUTIONAL RIGHT TO NOTICE: Under the Sixth Amendment to the United States Constitution and Article 1, Section 13 of the Indiana Constitution, an accused has the fundamental right to demand the nature and cause of the accusation against them.

WHEREFORE, ${defendant} respectfully requests that this Court order the Opposing Party to file a More Definite Statement within twenty (20) days, failing which the vague counts be ordered stricken.

${sig}`;
    },
  },
];

export function DraftDeskView({ matter, onOpenActionModal, onSendToChambers }: DraftDeskViewProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(MOTION_TEMPLATES[0].id);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [customDraftText, setCustomDraftText] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [showFilingChecklist, setShowFilingChecklist] = useState<boolean>(false);
  const [showProposedOrderModal, setShowProposedOrderModal] = useState<boolean>(false);
  const [lineNumbersEnabled, setLineNumbersEnabled] = useState<boolean>(false);

  const hasMatter = matter && matter.id !== "matter-empty";

  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const selectedTemplate = useMemo(() => {
    return MOTION_TEMPLATES.find((t) => t.id === selectedTemplateId) || MOTION_TEMPLATES[0];
  }, [selectedTemplateId]);

  // Generate initial text whenever template or matter changes (unless user explicitly edited)
  const defaultDraftText = useMemo(() => {
    return selectedTemplate.generateText(matter, todayStr);
  }, [selectedTemplate, matter, todayStr]);

  const activeText = customDraftText || defaultDraftText;

  const filteredTemplates = useMemo(() => {
    return MOTION_TEMPLATES.filter((t) => {
      const matchesCategory = activeCategory === "All" || t.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.governingRule.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownload = () => {
    const filename = `${(matter.caseNumber || "ProSe_Pleading").replace(/[^a-zA-Z0-9_-]/g, "_")}_${selectedTemplate.id}.txt`;
    const blob = new Blob([activeText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResetToDefault = () => {
    setCustomDraftText("");
  };

  const handleInsertSnippet = (snippet: string) => {
    setCustomDraftText((prev) => (prev ? prev + "\n" + snippet : defaultDraftText + "\n" + snippet));
  };

  const categories = ["All", "Pre-Trial", "Discovery & Evidence", "Constitutional", "Family & Paternity", "Appearance"];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f0d5e2] shadow-[0_8px_30px_rgba(224,64,160,0.06)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#ffd8e8]/50 via-[#fde7ff]/30 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd8e8] text-[#8a005e] text-xs font-bold font-mono uppercase tracking-wide">
                <FileSignature className="w-3.5 h-3.5 text-[#af0a78]" />
                Draft Desk · Motion Library
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#efdbff] text-[#5b3188] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#7c52aa]" />
                Auto-Filled with Matter Parameters
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#281330] tracking-tight">
              Court Pleading & Motion Builder
            </h1>
            <p className="text-sm text-[#604868] max-w-2xl leading-relaxed">
              Select any court-tested pro se motion below. The system automatically injects your active matter's
              court name, cause number, presiding judge, statutory counts, and evidence.
            </p>
          </div>

          {/* Active Matter Sync Pill */}
          <div className="bg-[#fff7fb] border border-[#f0d5e2] rounded-2xl p-4 shrink-0 max-w-sm">
            <div className="flex items-center justify-between text-xs font-bold text-[#8a005e] uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                Active Matter Attached
              </span>
              <span className="font-mono text-[11px] text-[#7c52aa] bg-white px-2 py-0.5 rounded-full border border-[#f0d5e2]">
                {cleanStr(matter.caseNumber, "No Cause #")}
              </span>
            </div>
            <div className="text-xs text-[#281330] font-semibold truncate">
              {cleanStr(matter.title, "No active matter loaded")}
            </div>
            <div className="text-[11px] text-[#604868] truncate mt-0.5">
              Court: <span className="font-medium text-[#281330]">{cleanStr(matter.court || matter.courtName, "Not set")}</span>
            </div>
            <div className="text-[11px] text-[#604868] truncate mt-0.5">
              Judge: <span className="font-medium text-[#281330]">{cleanStr(matter.judge, "Not set")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-[#e040a0] to-[#af0a78] text-white shadow-[0_4px_16px_rgba(224,64,160,0.25)] scale-[1.02]"
                  : "bg-white text-[#604868] border border-[#f0d5e2] hover:bg-[#fff7fb] hover:text-[#281330]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-[#8a707b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search motion templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-[#ddbfca] text-xs text-[#281330] placeholder:text-[#8a707b] focus:outline-none focus:ring-2 focus:ring-[#e040a0]/30 focus:border-[#af0a78] shadow-sm"
          />
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Template List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase font-mono tracking-wider text-[#604868]">
              Available Templates ({filteredTemplates.length})
            </span>
            <span className="text-[11px] text-[#af0a78] font-medium">Click to Load & Fill</span>
          </div>

          <div className="space-y-2.5 max-h-[820px] overflow-y-auto pr-1">
            {filteredTemplates.map((template) => {
              const isSelected = template.id === selectedTemplateId;
              return (
                <div
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplateId(template.id);
                    setCustomDraftText(""); // Reset custom edits when switching template
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-gradient-to-br from-[#ffffff] to-[#fff7fb] border-[#e040a0] shadow-[0_6px_24px_rgba(224,64,160,0.18)] scale-[1.01]"
                      : "bg-white border-[#f0d5e2] hover:border-[#ddbfca] hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-[#ffd8e8] text-[#8a005e]">
                      {template.badge}
                    </span>
                    <span className="text-[11px] font-semibold text-[#7c52aa]">
                      {template.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs sm:text-sm text-[#281330] mt-2 leading-snug">
                    {template.name}
                  </h3>

                  <p className="text-[11px] text-[#604868] mt-1.5 line-clamp-2 leading-relaxed">
                    {template.summary}
                  </p>

                  <div className="mt-3 pt-2 border-t border-[#f8e6ef] flex items-center justify-between text-[10px] text-[#8a707b]">
                    <span className="truncate max-w-[190px]">{template.governingRule}</span>
                    <span className="flex items-center gap-1 font-bold text-[#af0a78]">
                      View Draft <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredTemplates.length === 0 && (
              <div className="p-8 text-center bg-white border border-[#f0d5e2] rounded-2xl">
                <p className="text-xs text-[#604868]">No templates match your search filter.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pleading Studio Editor & Actions (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Action Ribbon */}
          <div className="bg-white border border-[#f0d5e2] rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-[#281330]">
                  {selectedTemplate.name}
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#efdbff] text-[#5b3188] font-bold">
                  Pro Se Pleading
                </span>
              </div>
              <p className="text-xs text-[#604868]">
                {selectedTemplate.governingRule} · {selectedTemplate.whenToFile}
              </p>
            </div>

            {/* Utility Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-1.5 rounded-full bg-[#fff7fb] hover:bg-[#ffd8e8] text-[#8a005e] border border-[#f0d5e2] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                title="Copy entire pleading to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Text"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="px-3.5 py-1.5 rounded-full bg-[#fff7fb] hover:bg-[#efdbff] text-[#5b3188] border border-[#f0d5e2] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                title="Download formatted document as text file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .TXT</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-full bg-[#fff7fb] hover:bg-[#e0f2fe] text-[#006388] border border-[#f0d5e2] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                title="Print pleading or save to PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFilingChecklist(true)}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#e040a0] to-[#af0a78] text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_4px_16px_rgba(224,64,160,0.25)] hover:scale-[1.02] transition-transform"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Filing Packet Checklist</span>
              </button>
            </div>
          </div>

          {/* Quick Snippet Inserters */}
          <div className="bg-[#fff7fb] border border-[#f0d5e2] rounded-2xl px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-[#8a005e] flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-[#af0a78]" />
              Quick Insert:
            </span>

            {matter.charges.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  handleInsertSnippet(
                    `\n[ADDITIONAL COUNT REF]: Regarding Count 1 (${matter.charges[0].title}), Litigant specifically notes that elements regarding '${matter.charges[0].elements?.[0]?.name || "statutory proof"}' remain unproven.`
                  )
                }
                className="px-2.5 py-1 rounded-full bg-white hover:bg-[#ffd8e8] text-[#8a005e] border border-[#f0d5e2] text-[11px] font-semibold transition-colors"
              >
                + Count 1 ({matter.charges[0].title})
              </button>
            )}

            {matter.evidence.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  handleInsertSnippet(
                    `\n[EXHIBIT EVIDENCE CITED]: Exhibit [${matter.evidence[0].exhibitNumber}] - ${matter.evidence[0].title} (${matter.evidence[0].type}) is incorporated herein by reference as supporting documentation.`
                  )
                }
                className="px-2.5 py-1 rounded-full bg-white hover:bg-[#efdbff] text-[#5b3188] border border-[#f0d5e2] text-[11px] font-semibold transition-colors"
              >
                + Exhibit {matter.evidence[0].exhibitNumber}
              </button>
            )}

            {matter.nextCourtDate && (
              <button
                type="button"
                onClick={() =>
                  handleInsertSnippet(
                    `\n[SCHEDULED HEARING DATE]: Hearing is currently scheduled on the Court calendar for ${matter.nextCourtDate}.`
                  )
                }
                className="px-2.5 py-1 rounded-full bg-white hover:bg-[#e0f2fe] text-[#006388] border border-[#f0d5e2] text-[11px] font-semibold transition-colors"
              >
                + Hearing Date ({matter.nextCourtDate})
              </button>
            )}

            {customDraftText && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="ml-auto px-2.5 py-1 rounded-full bg-white hover:bg-red-50 text-red-600 border border-red-200 text-[11px] font-semibold flex items-center gap-1"
                title="Revert custom edits back to template auto-filled defaults"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Defaults
              </button>
            )}
          </div>

          {/* Legal Document Pleading Container */}
          <div className="bg-white border border-[#f0d5e2] rounded-3xl shadow-[0_8px_30px_rgba(124,82,170,0.06)] overflow-hidden">
            {/* Document Header Bar */}
            <div className="bg-[#fff7fb] border-b border-[#f0d5e2] px-6 py-3 flex items-center justify-between text-xs text-[#604868]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[#af0a78] font-bold uppercase tracking-wider">
                  Pleading Paper Preview (Editable)
                </span>
                <span className="text-[#8a707b]">·</span>
                <span className="text-[11px]">Click anywhere to type or amend your averments</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setLineNumbersEnabled(!lineNumbersEnabled)}
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors ${
                    lineNumbersEnabled
                      ? "bg-[#ffd8e8] text-[#8a005e] border-[#ffafd5]"
                      : "bg-white text-[#604868] border-[#f0d5e2]"
                  }`}
                >
                  {lineNumbersEnabled ? "Line Numbers: On" : "Line Numbers: Off"}
                </button>
              </div>
            </div>

            {/* Editable Legal Pleading Sheet */}
            <div className="p-6 sm:p-10 font-mono text-xs sm:text-[13px] text-[#281330] leading-relaxed bg-white">
              <textarea
                value={activeText}
                onChange={(e) => setCustomDraftText(e.target.value)}
                rows={32}
                className="w-full bg-transparent border-0 focus:outline-none resize-y font-mono text-xs sm:text-[13px] text-[#281330] leading-relaxed selection:bg-[#ffd8e8]"
                spellCheck="false"
              />
            </div>

            {/* Pro Se Mandatory Warning Footer */}
            <div className="bg-[#fff7fb] border-t border-[#f0d5e2] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#604868]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#af0a78] shrink-0" />
                <span className="text-[11px]">
                  <strong>Pro Se Verification:</strong> You must print, review, sign, and date this motion before filing with the Clerk.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onOpenActionModal) {
                    onOpenActionModal(
                      selectedTemplate.name,
                      matter.court || matter.courtName || "Local Court",
                      "Draft requires your signature, verification, and clerk submission."
                    );
                  } else {
                    setShowFilingChecklist(true);
                  }
                }}
                className="px-4 py-1.5 rounded-full bg-[#ffd8e8] text-[#8a005e] hover:bg-[#ffafd5] text-xs font-bold transition-colors shrink-0"
              >
                Filing Instructions & Packet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Se Filing Checklist Modal */}
      {showFilingChecklist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-[#f0d5e2] rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowFilingChecklist(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#fff7fb] hover:bg-[#ffd8e8] text-[#8a005e] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#af0a78]">
                Pro Se Court Protocol
              </span>
              <h3 className="text-xl font-bold text-[#281330]">
                Step-by-Step Filing Checklist
              </h3>
              <p className="text-xs text-[#604868]">
                How to properly file {selectedTemplate.name} with the {cleanStr(matter.court || matter.courtName, "Court Clerk")}.
              </p>
            </div>

            <div className="space-y-3.5 text-xs text-[#281330]">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#fff7fb] border border-[#f0d5e2]">
                <div className="w-6 h-6 rounded-full bg-[#ffd8e8] text-[#8a005e] font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-[#281330]">Sign in Blue or Black Ink</h4>
                  <p className="text-[#604868] mt-0.5 leading-relaxed">
                    Verify all factual statements. Sign the document above the signature line with your full legal name, current telephone, and physical mailing address.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#fff7fb] border border-[#f0d5e2]">
                <div className="w-6 h-6 rounded-full bg-[#ffd8e8] text-[#8a005e] font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-[#281330]">Make Three (3) Physical Copies</h4>
                  <p className="text-[#604868] mt-0.5 leading-relaxed">
                    • <strong>Original:</strong> For the Court Clerk to file in the Chronological Case Summary.<br />
                    • <strong>Copy 1:</strong> Served upon the Prosecuting Attorney / Opposing Counsel.<br />
                    • <strong>Copy 2:</strong> Kept in your personal case binder with the Clerk's stamped time-date stamp.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#fff7fb] border border-[#f0d5e2]">
                <div className="w-6 h-6 rounded-full bg-[#ffd8e8] text-[#8a005e] font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-[#281330]">Accompanying Proposed Order</h4>
                  <p className="text-[#604868] mt-0.5 leading-relaxed">
                    Most Indiana and local rules require motions to include a separate blank <em>Proposed Order Granting Motion</em> for the Judge to sign.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#fff7fb] border border-[#f0d5e2]">
                <div className="w-6 h-6 rounded-full bg-[#ffd8e8] text-[#8a005e] font-bold flex items-center justify-center shrink-0 text-xs">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-[#281330]">Complete Certificate of Service</h4>
                  <p className="text-[#604868] mt-0.5 leading-relaxed">
                    Mail or deliver a copy to opposing counsel on the same date you file with the Court Clerk. Failure to serve opposing counsel violates Trial Rule 5.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowFilingChecklist(false)}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-[#e040a0] to-[#af0a78] text-white text-xs font-bold shadow-[0_4px_16px_rgba(224,64,160,0.25)] hover:scale-[1.02] transition-transform"
              >
                Understood, Close Checklist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
