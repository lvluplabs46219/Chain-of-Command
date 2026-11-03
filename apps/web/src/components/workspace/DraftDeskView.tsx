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
  Files,
  Settings,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  List,
  Undo2,
  Redo2,
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
    <div className="flex flex-col h-[calc(100vh-7.5rem)] min-h-[640px] max-w-[1600px] mx-auto my-3 mx-3 sm:mx-4 rounded-xl overflow-hidden border border-[#3c3c3c] shadow-2xl bg-[#1e1e1e] text-[#cccccc]">
      {/* VS Code–style menu bar */}
      <div className="h-9 shrink-0 flex items-center justify-between px-3 border-b border-[#2b2b2b] bg-[#323233] text-[11px] select-none">
        <div className="flex items-center gap-3 min-w-0">
          <FileSignature className="w-3.5 h-3.5 text-[#c586c0] shrink-0" />
          <span className="font-semibold text-[#e0e0e0] truncate">Draft Desk</span>
          <span className="text-[#6a6a6a]">—</span>
          <span className="truncate text-[#9cdcfe]">{selectedTemplate.name}.docx</span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-[#a0a0a0]">
          <span className="hover:text-white cursor-default">File</span>
          <span className="hover:text-white cursor-default">Edit</span>
          <span className="hover:text-white cursor-default">View</span>
          <span className="hover:text-white cursor-default">Insert</span>
          <span className="hover:text-white cursor-default">Format</span>
          <span className="hover:text-white cursor-default">Tools</span>
          <span className="hover:text-white cursor-default">Help</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-[#808080]">
          <span>UTF-8</span>
          <span>·</span>
          <span>Pleading</span>
          <span>·</span>
          <span className="text-amber-400/90">NOT LEGAL ADVICE</span>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Activity bar */}
        <div className="w-12 shrink-0 flex flex-col items-center py-2 gap-1 border-r border-[#2b2b2b] bg-[#333333]">
          <div className="p-2 rounded text-white border-l-2 border-[#007acc] bg-white/5" title="Templates">
            <Files className="w-5 h-5" />
          </div>
          <div className="p-2 rounded text-[#858585] hover:text-white" title="Search templates">
            <Search className="w-5 h-5" />
          </div>
          <div className="p-2 rounded text-[#858585] hover:text-white" title="Matter context">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div className="mt-auto p-2 rounded text-[#858585] hover:text-white" title="Settings">
            <Settings className="w-5 h-5" />
          </div>
        </div>

        {/* Explorer: motion templates */}
        <aside className="w-[min(100%,280px)] shrink-0 flex flex-col border-r border-[#2b2b2b] bg-[#252526]">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#bbbbbb] border-b border-[#2b2b2b]">
            Explorer · Motion Templates
          </div>
          <div className="p-2 border-b border-[#2b2b2b]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6a6a6a]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-8 pr-2 py-1.5 rounded bg-[#3c3c3c] border border-[#3c3c3c] focus:border-[#007acc] text-[12px] text-[#cccccc] placeholder:text-[#6a6a6a] outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] px-2 py-0.5 rounded border ${
                    activeCategory === cat
                      ? "bg-[#094771] border-[#007acc] text-white"
                      : "bg-transparent border-[#3c3c3c] text-[#9d9d9d] hover:border-[#6a6a6a]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {filteredTemplates.map((template) => {
              const isSelected = template.id === selectedTemplateId;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => {
                    setSelectedTemplateId(template.id);
                    setCustomDraftText("");
                  }}
                  className={`w-full text-left px-3 py-2 border-l-2 ${
                    isSelected
                      ? "bg-[#2a2d2e] border-[#007acc]"
                      : "border-transparent hover:bg-[#2a2d2e]/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#9cdcfe]" : "text-[#6a6a6a]"}`} />
                    <span className={`text-[12px] truncate ${isSelected ? "text-white font-medium" : "text-[#cccccc]"}`}>
                      {template.name}
                    </span>
                  </div>
                  <div className="pl-5 mt-0.5 text-[10px] text-[#6a6a6a] truncate">{template.badge} · {template.category}</div>
                </button>
              );
            })}
            {filteredTemplates.length === 0 && (
              <p className="px-3 py-6 text-center text-[11px] text-[#6a6a6a]">No templates match.</p>
            )}
          </div>
        </aside>

        {/* Editor column */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
          {/* Tabs */}
          <div className="flex items-center gap-0 border-b border-[#2b2b2b] bg-[#252526] overflow-x-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#1e1e1e] border-r border-[#2b2b2b] text-[12px] text-[#e0e0e0]">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span className="truncate max-w-[220px]">{selectedTemplate.name}.docx</span>
              <span className="text-[#6a6a6a] text-[10px]">●</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5 px-2 py-1">
              <button type="button" onClick={handleCopy} className="px-2 py-1 rounded text-[11px] text-[#cccccc] hover:bg-[#2a2d2e] flex items-center gap-1">
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button type="button" onClick={handleDownload} className="px-2 py-1 rounded text-[11px] text-[#cccccc] hover:bg-[#2a2d2e] flex items-center gap-1">
                <Download className="w-3 h-3" /> Export
              </button>
              <button type="button" onClick={handlePrint} className="px-2 py-1 rounded text-[11px] text-[#cccccc] hover:bg-[#2a2d2e] flex items-center gap-1">
                <Printer className="w-3 h-3" /> Print/PDF
              </button>
              <button
                type="button"
                onClick={() => setShowFilingChecklist(true)}
                className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#0e639c] hover:bg-[#1177bb] text-white flex items-center gap-1"
              >
                <FileCheck className="w-3 h-3" /> Filing Packet
              </button>
            </div>
          </div>

          {/* LibreOffice / Word–style ribbon */}
          <div className="flex flex-wrap items-center gap-1 px-3 py-1.5 border-b border-[#2b2b2b] bg-[#2d2d2d] text-[#c8c8c8]">
            <span className="text-[10px] uppercase tracking-wide text-[#6a6a6a] mr-1">Home</span>
            <button type="button" className="p-1.5 rounded hover:bg-[#3c3c3c]" title="Bold (visual only)"><Bold className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1.5 rounded hover:bg-[#3c3c3c]" title="Italic (visual only)"><Italic className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1.5 rounded hover:bg-[#3c3c3c]" title="Underline (visual only)"><Underline className="w-3.5 h-3.5" /></button>
            <span className="w-px h-4 bg-[#3c3c3c] mx-1" />
            <button type="button" className="p-1.5 rounded hover:bg-[#3c3c3c]" title="Align left"><AlignLeft className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1.5 rounded hover:bg-[#3c3c3c]" title="Center"><AlignCenter className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1.5 rounded hover:bg-[#3c3c3c]" title="List"><List className="w-3.5 h-3.5" /></button>
            <span className="w-px h-4 bg-[#3c3c3c] mx-1" />
            <button type="button" onClick={handleResetToDefault} className="p-1.5 rounded hover:bg-[#3c3c3c] text-[11px] flex items-center gap-1" title="Reset to template">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              type="button"
              onClick={() => setLineNumbersEnabled(!lineNumbersEnabled)}
              className={`ml-auto px-2 py-1 rounded text-[10px] border ${
                lineNumbersEnabled ? "border-[#007acc] text-[#9cdcfe]" : "border-[#3c3c3c] text-[#808080]"
              }`}
            >
              Line nos {lineNumbersEnabled ? "On" : "Off"}
            </button>
          </div>

          {/* Quick insert chips */}
          <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 border-b border-[#2b2b2b] bg-[#252526] text-[11px]">
            <Sparkles className="w-3 h-3 text-[#c586c0]" />
            <span className="text-[#6a6a6a]">Insert:</span>
            {matter.charges.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  handleInsertSnippet(
                    `\n[ADDITIONAL COUNT REF]: Regarding Count 1 (${matter.charges[0].title}), Litigant specifically notes that elements regarding '${matter.charges[0].elements?.[0]?.name || "statutory proof"}' remain unproven.`
                  )
                }
                className="px-2 py-0.5 rounded bg-[#3c3c3c] hover:bg-[#094771] text-[#cccccc]"
              >
                + Count 1
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
                className="px-2 py-0.5 rounded bg-[#3c3c3c] hover:bg-[#094771] text-[#cccccc]"
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
                className="px-2 py-0.5 rounded bg-[#3c3c3c] hover:bg-[#094771] text-[#cccccc]"
              >
                + Hearing Date
              </button>
            )}
            <span className="ml-auto text-[10px] text-[#6a6a6a] truncate max-w-[40%]">{selectedTemplate.governingRule}</span>
          </div>

          {/* Word / LibreOffice page canvas */}
          <div className="flex-1 overflow-auto bg-[#525659] p-4 sm:p-8">
            <div className="mx-auto max-w-[816px] min-h-[1056px] bg-white text-black shadow-[0_8px_40px_rgba(0,0,0,0.45)] rounded-[2px] relative">
              {/* faint margin guides */}
              <div className="pointer-events-none absolute inset-y-0 left-[72px] w-px bg-blue-400/20" />
              <div className="pointer-events-none absolute inset-y-0 right-[72px] w-px bg-blue-400/20" />
              <textarea
                value={activeText}
                onChange={(e) => setCustomDraftText(e.target.value)}
                spellCheck
                className="w-full min-h-[1056px] bg-transparent border-0 resize-none focus:outline-none px-[72px] py-[72px] text-[13px] leading-[1.85] text-[#111] selection:bg-[#cce2ff]"
                style={{
                  fontFamily: '"Times New Roman", Times, "Liberation Serif", serif',
                }}
                aria-label="Pleading document editor"
              />
            </div>
          </div>

          {/* Status bar */}
          <div className="h-6 shrink-0 flex items-center justify-between px-3 border-t border-[#007acc] bg-[#007acc] text-[11px] text-white">
            <div className="flex items-center gap-3">
              <span>Draft Desk</span>
              <span className="opacity-80">{hasMatter ? matter.caseNumber || matter.title || "Matter linked" : "No matter linked"}</span>
            </div>
            <div className="flex items-center gap-3 opacity-90">
              <span>Ln {activeText.split("\n").length}</span>
              <span>Spaces: 2</span>
              <span>100%</span>
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
                className="underline underline-offset-2"
              >
                Filing instructions
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
