/**
 * Chain of Command - Core Workspace Data & State Models
 * Authoritative legal entities, statutory definitions, precedent database,
 * and deterministic court deadline calculations.
 */

export interface Matter {
  id: string;
  title: string;
  caseNumber: string;
  courtName: string;
  jurisdiction: string;
  judge: string;
  prosecutor: string;
  defenseStatus: "Self-Represented (Pro Se)" | "Appointed Counsel" | "Retained Counsel";
  charges: Charge[];
  status: "active" | "pending" | "discovery" | "trial_prep" | "closed";
  nextCourtDate: string;
  nextCourtType: string;
  speedyTrialDeadline: string;
  createdAt: string;
  summary: string;
}

export interface Charge {
  id: string;
  statute: string;
  title: string;
  level: "Felony Class A" | "Felony Class B" | "Felony Class C" | "Misdemeanor Class A" | "Misdemeanor Class B" | "Infraction";
  allegedDate: string;
  statutoryMaxPenalty: string;
  statutoryMinPenalty: string;
  elements: {
    name: string;
    description: string;
    stateProofStatus: "Alleged" | "Contested" | "Insufficient Evidence" | "Refuted by Exhibit";
  }[];
}

export interface SpecialistAgent {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarIcon: string;
  active: boolean;
  model: string;
  capabilities: string[];
  systemInstructions: string;
  toolPermissions: {
    readDocuments: boolean;
    accessDockets: boolean;
    searchStatutes: boolean;
    externalResearch: boolean;
  };
}

export interface TimelineRecord {
  id: string;
  matterId: string;
  dateTime: string;
  title: string;
  category: "Incident & Arrest" | "Police Procedures" | "Court Appearance" | "Discovery & Evidence" | "Filing & Motion";
  provenance: "SOURCE_POLICE_REPORT" | "SOURCE_COURT_DOCKET" | "SOURCE_DEFENDANT_RECORD" | "SOURCE_DISPATCH_CAD";
  sourceDocument: string;
  description: string;
  isContradiction: boolean;
  contradictionNote?: string;
  verified: boolean;
}

export interface EvidenceRecord {
  id: string;
  matterId: string;
  exhibitNumber: string;
  title: string;
  type: "Police Report" | "Body-Worn Video" | "Audio Recording" | "Physical Receipt" | "Cellular Tower / CDR" | "Witness Statement";
  dateAcquired: string;
  custodian: string;
  chainOfCustodyStatus: "Verified Intact" | "Missing Gap Noted" | "Pending Subpoena";
  relevantCharge: string;
  summary: string;
  storageHash: string;
}

export interface LegalPrecedent {
  id: string;
  citation: string;
  court: string;
  year: number;
  title: string;
  holding: string;
  quote: string;
  category: "Search & Seizure (4th Amend)" | "Self-Incrimination (5th Amend)" | "Right to Counsel (6th Amend)" | "Discovery & Brady" | "Self-Defense";
  jurisdiction: string;
  precedentialStatus: "Binding Precedent" | "Active Federal Rule" | "Persuasive Precedent";
}

export interface AttorneyListing {
  id: string;
  name: string;
  firm: string;
  city: string;
  state: string;
  barNumber: string;
  status: "Active - Good Standing";
  practiceAreas: string[];
  representationType: "Pro Bono / Legal Aid" | "Sliding Scale" | "Private Retainer";
  phone: string;
  email: string;
  address: string;
  verifiedSource: "State Bar Public Records" | "Legal Aid Society Roster";
}

/** Placeholder when the workspace has no open matter yet */
export const EMPTY_MATTER: Matter = {
  id: "matter-empty",
  title: "No matter open",
  caseNumber: "—",
  courtName: "",
  jurisdiction: "",
  judge: "",
  prosecutor: "",
  defenseStatus: "Self-Represented (Pro Se)",
  status: "pending",
  nextCourtDate: "",
  nextCourtType: "",
  speedyTrialDeadline: "",
  createdAt: "",
  summary: "Open a new legal matter to begin organizing your case.",
  charges: [],
};

/** @deprecated Use SAMPLE_MATTERS for explore mode; default workspace starts empty. */
export const INITIAL_MATTERS: Matter[] = [];

/** Sample matters for explore-mode only (not loaded on first run). */
export const SAMPLE_MATTERS: Matter[] = [
  {
    id: "matter-001",
    title: "State of Indiana v. Marcus Vance",
    caseNumber: "49D02-2408-F3-004419",
    courtName: "Marion County Superior Court, Criminal Division 2",
    jurisdiction: "Indiana",
    judge: "Hon. Patricia Campbell",
    prosecutor: "Office of the Marion County Prosecuting Attorney",
    defenseStatus: "Self-Represented (Pro Se)",
    status: "discovery",
    nextCourtDate: "2026-10-24T09:00:00",
    nextCourtType: "Pretrial Conference & Omnibus Hearing",
    speedyTrialDeadline: "2026-12-15",
    createdAt: "2026-08-12",
    summary: "Prosecution alleging Class B felony theft and battery resulting in moderate bodily injury arising from a contested commercial altercation. Defendant asserts affirmative defense of lawful self-defense under Ind. Code § 35-41-3-2 and challenges warrantless vehicle search without probable cause.",
    charges: [
      {
        id: "ch-01",
        statute: "Ind. Code § 35-42-2-1",
        title: "Battery with Moderate Bodily Injury",
        level: "Felony Class B",
        allegedDate: "2026-08-10",
        statutoryMaxPenalty: "6 years imprisonment; $10,000 fine",
        statutoryMinPenalty: "1 year advisory imprisonment",
        elements: [
          {
            name: "Knowing or Intentional Touching",
            description: "Defendant knowingly or intentionally touched another person in a rude, insolent, or angry manner.",
            stateProofStatus: "Contested"
          },
          {
            name: "Resulting in Moderate Bodily Injury",
            description: "Resulted in substantial physical pain, impairment, or laceration.",
            stateProofStatus: "Insufficient Evidence"
          },
          {
            name: "Absence of Lawful Self-Defense Justification",
            description: "The State carries the burden of disproving beyond a reasonable doubt defendant's justified defensive force under Ind. Code § 35-41-3-2.",
            stateProofStatus: "Refuted by Exhibit"
          }
        ]
      },
      {
        id: "ch-02",
        statute: "Ind. Code § 35-43-4-2",
        title: "Theft of Property Valued Over $750",
        level: "Felony Class C",
        allegedDate: "2026-08-10",
        statutoryMaxPenalty: "2.5 years imprisonment; $10,000 fine",
        statutoryMinPenalty: "0.5 years imprisonment",
        elements: [
          {
            name: "Knowingly or Intentionally Exerted Control",
            description: "Exerted unauthorized control over personal property of another person.",
            stateProofStatus: "Contested"
          },
          {
            name: "Intent to Deprive Owner of Value or Use",
            description: "Requisite Mens Rea to permanently deprive rightful owner.",
            stateProofStatus: "Refuted by Exhibit"
          }
        ]
      }
    ]
  },
  {
    id: "matter-002",
    title: "People of the State of California v. Elena Rostova",
    caseNumber: "24-CR-09812-LA",
    courtName: "Los Angeles County Superior Court, Central Arraignment",
    jurisdiction: "California",
    judge: "Hon. Marcus Thorne",
    prosecutor: "Los Angeles District Attorney Trial Unit",
    defenseStatus: "Self-Represented (Pro Se)",
    status: "active",
    nextCourtDate: "2026-11-04T08:30:00",
    nextCourtType: "Preliminary Hearing & Motion to Suppress",
    speedyTrialDeadline: "2027-01-10",
    createdAt: "2026-09-01",
    summary: "Misdemeanor traffic stop resulting in contested vehicle search. Defense asserting 4th Amendment violation under Terry v. Ohio and California Penal Code § 1538.5 due to prolonged detention past the mission of the stop.",
    charges: [
      {
        id: "ch-03",
        statute: "Cal. Penal Code § 484(a)",
        title: "Petty Theft",
        level: "Misdemeanor Class A",
        allegedDate: "2026-08-28",
        statutoryMaxPenalty: "6 months county jail; $1,000 fine",
        statutoryMinPenalty: "Probation eligible",
        elements: [
          {
            name: "Taking without Consent",
            description: "Stealing, taking, carrying, leading, or driving away personal property of another.",
            stateProofStatus: "Contested"
          },
          {
            name: "Specific Intent to Deprive",
            description: "Intent to permanently deprive the owner of property value.",
            stateProofStatus: "Insufficient Evidence"
          }
        ]
      }
    ]
  }
];

export const SPECIALIST_AGENTS_ROSTER: SpecialistAgent[] = [
  {
    id: "lead-counsel",
    name: "Head Legal AI (Coordinator)",
    role: "Litigation Strategy Architect",
    department: "Executive Chambers",
    avatarIcon: "Scale",
    active: true,
    model: "gemini-2.5-flash",
    capabilities: [
      "Decompose litigation objectives",
      "Coordinate specialist AI roster",
      "Synthesize procedural legal memos",
      "Structure multi-issue pro se defenses"
    ],
    systemInstructions: "You are the Head Legal AI for Chain of Command. Help pro se litigants understand case posture, evaluate procedural steps, and coordinate specialist agent work. Always ground in statutory rules.",
    toolPermissions: {
      readDocuments: true,
      accessDockets: true,
      searchStatutes: true,
      externalResearch: true
    }
  },
  {
    id: "paralegal",
    name: "Paralegal AI",
    role: "Procedural & Deadlines Specialist",
    department: "Rules & Deadlines",
    avatarIcon: "CalendarClock",
    active: true,
    model: "gemini-2.5-flash",
    capabilities: [
      "Calculate deterministic statutory court deadlines",
      "Review local court filing formatting rules",
      "Prepare procedural filing checklists",
      "Track omnibus and discovery cutoffs"
    ],
    systemInstructions: "Calculate exact court rule deadlines under statutory rules of procedure. Ensure all pro se court filings adhere to caption, margins, certificate of service, and formatting requirements.",
    toolPermissions: {
      readDocuments: true,
      accessDockets: true,
      searchStatutes: true,
      externalResearch: false
    }
  },
  {
    id: "legal-research",
    name: "Legal Research AI",
    role: "Statute & Precedent Retriever",
    department: "Law Library",
    avatarIcon: "BookOpenCheck",
    active: true,
    model: "gemini-2.5-flash",
    capabilities: [
      "Search statutory penal and criminal codes",
      "Retrieve binding appellate case precedent",
      "Verify Shepard's and KeyCite precedential status",
      "Ground all legal citations in verified authority"
    ],
    systemInstructions: "Retrieve only verified statutory codes and binding appellate holdings. If a citation cannot be verified, state '[Authority Not Verified - Consult Local Rules or Counsel]'. Never fabricate statute citations.",
    toolPermissions: {
      readDocuments: true,
      accessDockets: false,
      searchStatutes: true,
      externalResearch: true
    }
  },
  {
    id: "rights-checker",
    name: "Rights Checker AI",
    role: "Constitutional Safeguard Auditor",
    department: "Constitutional Protections",
    avatarIcon: "ShieldAlert",
    active: true,
    model: "gemini-2.5-flash",
    capabilities: [
      "Scan for 4th Amendment unlawful search & seizure violations",
      "Audit Miranda rights warning protocols (5th Amendment)",
      "Evaluate right to counsel & speedy trial rights (6th Amendment)",
      "Check for Brady v. Maryland exculpatory evidence disclosures"
    ],
    systemInstructions: "Audit police actions, traffic stops, interrogations, and discovery disclosures for constitutional infractions under Supreme Court precedents including Terry, Miranda, Brady, and Mapp.",
    toolPermissions: {
      readDocuments: true,
      accessDockets: true,
      searchStatutes: true,
      externalResearch: true
    }
  },
  {
    id: "charge-explainer",
    name: "Charge Explainer AI",
    role: "Statutory Element Breakdown",
    department: "Litigant Education",
    avatarIcon: "FileText",
    active: true,
    model: "gemini-2.5-flash",
    capabilities: [
      "Translate complex indictments into 8th-grade plain English",
      "Deconstruct offenses into Actus Reus and Mens Rea elements",
      "Explain statutory mandatory minimums and maximum penalties",
      "Clarify wobbler classification tiers and expungement paths"
    ],
    systemInstructions: "Translate complex charging documents into clear, non-jargon English. Break down statutory elements of crimes, what the state must prove beyond a reasonable doubt, and sentencing exposure.",
    toolPermissions: {
      readDocuments: true,
      accessDockets: false,
      searchStatutes: true,
      externalResearch: false
    }
  },
  {
    id: "case-timeline",
    name: "Arrest & Case Timeline AI",
    role: "Chronology & Contradiction Spotter",
    department: "Factual Investigations",
    avatarIcon: "GitCommitHorizontal",
    active: true,
    model: "gemini-2.5-flash",
    capabilities: [
      "Reconstruct chronological sequences from police logs",
      "Highlight timestamp contradictions between dispatch & arrest",
      "Correlate witness statements with bodycam telemetry",
      "Maintain chronological chain-of-events record"
    ],
    systemInstructions: "Organize factual case events in strict chronological order. Flag any temporal discrepancies between officer narratives, 911 dispatch CAD timestamps, and surveillance video.",
    toolPermissions: {
      readDocuments: true,
      accessDockets: true,
      searchStatutes: false,
      externalResearch: false
    }
  },
  {
    id: "court-prep",
    name: "Court Preparation AI",
    role: "Hearing Readiness & Etiquette",
    department: "Courtroom Readiness",
    avatarIcon: "Sparkles",
    active: true,
    model: "gemini-2.5-flash",
    capabilities: [
      "Generate 1-page hearing preparation checklists",
      "Provide courtroom etiquette and bench addressing guidelines",
      "Outline questions to ask presiding judge or clerk",
      "Draft ADA accommodation and certified interpreter requests"
    ],
    systemInstructions: "Prepare self-represented individuals for appearing before a judge. Explain courtroom decorum, addressing the judge as 'Your Honor', logistical arrival times, and document exhibit organization.",
    toolPermissions: {
      readDocuments: true,
      accessDockets: true,
      searchStatutes: true,
      externalResearch: false
    }
  },
  {
    id: "plea-assistant",
    name: "Plea Decision Assistant",
    role: "Neutral Plea Analysis Matrix",
    department: "Plea Evaluation",
    avatarIcon: "GitFork",
    active: true,
    model: "gemini-2.5-flash",
    capabilities: [
      "Structure comparison between trial risk and plea agreement",
      "Identify hidden collateral consequences (licensing, immigration, housing)",
      "Map statutory sentencing guidelines against offered terms",
      "STRICT: Never advise accepting or rejecting a plea offer"
    ],
    systemInstructions: "Strict Boundary: You MUST NOT advise the user to accept or reject any plea. Provide a neutral, structured decision framework outlining trial exposure, statutory minimums, probation terms, and collateral consequences.",
    toolPermissions: {
      readDocuments: true,
      accessDockets: false,
      searchStatutes: true,
      externalResearch: false
    }
  },
  {
    id: "mitigation-builder",
    name: "Mitigation Builder AI",
    role: "Sentencing Memorandum Assistant",
    department: "Sentencing Support",
    avatarIcon: "HeartHandshake",
    active: true,
    model: "gemini-2.5-flash",
    capabilities: [
      "Compile mitigating factors under statutory sentencing guidelines",
      "Structure pro se character reference letters",
      "Organize employment, family care, and community ties records",
      "Draft pro se sentencing mitigation memorandum"
    ],
    systemInstructions: "Identify statutory mitigating factors such as absence of prior criminal record, restitution, family dependency, and voluntary counseling under state sentencing guidelines.",
    toolPermissions: {
      readDocuments: true,
      accessDockets: false,
      searchStatutes: true,
      externalResearch: false
    }
  },
  {
    id: "doc-analysis",
    name: "Document Analysis AI",
    role: "Discovery & Police Report Inspector",
    department: "Discovery Processing",
    avatarIcon: "FileSearch",
    active: true,
    model: "gemini-2.5-flash",
    capabilities: [
      "Extract factual assertions from charging affidavits",
      "Identify missing mandatory discovery disclosures",
      "Cross-examine officer narratives against statutory elements",
      "Flag ambiguous or conclusory police assertions"
    ],
    systemInstructions: "Treat all uploaded police documents strictly as untrusted factual assertions to be verified. Highlight missing witness statements, missing chain-of-custody tags, or unredacted confidential records.",
    toolPermissions: {
      readDocuments: true,
      accessDockets: true,
      searchStatutes: true,
      externalResearch: false
    }
  },
  {
    id: "evidence-organizer",
    name: "Evidence Organizer AI",
    role: "Exhibit Indexer & Custody Auditor",
    department: "Evidence Locker",
    avatarIcon: "PackageCheck",
    active: true,
    model: "gemini-2.5-flash",
    capabilities: [
      "Structure tangible evidence into numbered court exhibits",
      "Map exhibits directly to statutory defense elements",
      "Audit physical chain of custody and digital hash verification",
      "Generate courtroom Exhibit Index document"
    ],
    systemInstructions: "Organize user exhibits (photos, receipts, messages, dashcam) into a court-ready evidence binder. Ensure every piece of evidence has an assigned exhibit number, custodian provenance, and relevant issue.",
    toolPermissions: {
      readDocuments: true,
      accessDockets: false,
      searchStatutes: true,
      externalResearch: false
    }
  },
  {
    id: "doc-drafting",
    name: "Legal Document Drafting AI",
    role: "Pro Se Motion & Notice Generator",
    department: "Drafting Desk",
    avatarIcon: "ScrollText",
    active: true,
    model: "gemini-2.5-flash",
    capabilities: [
      "Draft Motion for Discovery and Brady Material",
      "Draft Motion to Suppress Evidence under 4th Amendment",
      "Draft Motion for Reduction of Bail / Own Recognizance",
      "Draft Notice of Appearance Pro Se"
    ],
    systemInstructions: "Draft court-ready pleadings for pro se litigants using standard formal captions, statement of facts, legal authority, and signature blocks. Prepend mandatory SRL disclaimer watermark.",
    toolPermissions: {
      readDocuments: true,
      accessDockets: true,
      searchStatutes: true,
      externalResearch: true
    }
  }
];

export const INITIAL_TIMELINE_RECORDS: TimelineRecord[] = [
  {
    id: "time-001",
    matterId: "matter-001",
    dateTime: "2026-08-10T21:45:00",
    title: "Alleged Physical Altercation at Merchant Establishment",
    category: "Incident & Arrest",
    provenance: "SOURCE_POLICE_REPORT",
    sourceDocument: "Officer Initial Incident Narrative, Exhibit A",
    description: "Police report claims defendant engaged in unprovoked physical altercation with store manager regarding disputed purchase return.",
    isContradiction: true,
    contradictionNote: "Security camera footage (Exhibit B, timestamp 21:44:12) shows store manager lunged over counter first; defendant raised hands defensively.",
    verified: true
  },
  {
    id: "time-002",
    matterId: "matter-001",
    dateTime: "2026-08-10T22:15:00",
    title: "911 Dispatch Emergency Call Logged",
    category: "Police Procedures",
    provenance: "SOURCE_DISPATCH_CAD",
    sourceDocument: "Marion County CAD Dispatch Records #99412",
    description: "CAD log shows initial call received from bystander reporting disturbance in progress.",
    isContradiction: false,
    verified: true
  },
  {
    id: "time-003",
    matterId: "matter-001",
    dateTime: "2026-08-10T22:38:00",
    title: "Warrantless Vehicle Search & Detention",
    category: "Police Procedures",
    provenance: "SOURCE_POLICE_REPORT",
    sourceDocument: "Arresting Officer Supplemental Report p. 3",
    description: "Officers conducted search of defendant's vehicle trunk parked across the street, seizing merchant merchandise.",
    isContradiction: true,
    contradictionNote: "No search warrant obtained and no consent given. Motion to Suppress under 4th Amendment applies.",
    verified: true
  },
  {
    id: "time-004",
    matterId: "matter-001",
    dateTime: "2026-08-11T02:10:00",
    title: "County Jail Booking & Fingerprinting",
    category: "Incident & Arrest",
    provenance: "SOURCE_COURT_DOCKET",
    sourceDocument: "Marion County Jail Intake Sheet #2024-8841",
    description: "Defendant processed and booked on preliminary charges of Battery and Theft. Held on $5,000 cash bond.",
    isContradiction: false,
    verified: true
  },
  {
    id: "time-005",
    matterId: "matter-001",
    dateTime: "2026-08-12T13:30:00",
    title: "Initial Appearance & Arraignment",
    category: "Court Appearance",
    provenance: "SOURCE_COURT_DOCKET",
    sourceDocument: "Minutes of the Court, Docket Entry #4",
    description: "Judge Patricia Campbell entered preliminary plea of Not Guilty on defendant's behalf. Defendant elected self-representation (pro se). Cash bond reduced to $1,500 surety.",
    isContradiction: false,
    verified: true
  },
  {
    id: "time-006",
    matterId: "matter-001",
    dateTime: "2026-08-20T10:00:00",
    title: "Pro Se Formal Discovery Demand Served",
    category: "Discovery & Evidence",
    provenance: "SOURCE_DEFENDANT_RECORD",
    sourceDocument: "Defendant's First Motion for Production of Evidence & Brady Disclosure",
    description: "Served formal request upon Prosecuting Attorney demanding complete bodycam video, dispatch recordings, and merchant register tapes.",
    isContradiction: false,
    verified: true
  }
];

export const INITIAL_EVIDENCE_RECORDS: EvidenceRecord[] = [
  {
    id: "ev-001",
    matterId: "matter-001",
    exhibitNumber: "Exhibit A",
    title: "IMPD Incident Narrative & Probable Cause Affidavit",
    type: "Police Report",
    dateAcquired: "2026-08-12",
    custodian: "Marion County Clerk",
    chainOfCustodyStatus: "Verified Intact",
    relevantCharge: "Battery with Moderate Bodily Injury (Ind. Code § 35-42-2-1)",
    summary: "Officer narrative alleging physical fight occurred in store lobby. Omits mention of store manager initiating contact.",
    storageHash: "sha256:4a8b79c3d1e2f4a56b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9"
  },
  {
    id: "ev-002",
    matterId: "matter-001",
    exhibitNumber: "Exhibit B",
    title: "Commercial Establishment CCTV High-Angle Surveillance Video",
    type: "Body-Worn Video",
    dateAcquired: "2026-08-22",
    custodian: "Subpoenaed from Merchant Loss Prevention",
    chainOfCustodyStatus: "Verified Intact",
    relevantCharge: "Self-Defense Justification (Ind. Code § 35-41-3-2)",
    summary: "Video demonstrates store manager aggressively lunged over the register counter, grabbing defendant's shirt collar before defendant used defensive force.",
    storageHash: "sha256:7b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0"
  },
  {
    id: "ev-003",
    matterId: "matter-001",
    exhibitNumber: "Exhibit C",
    title: "Original Electronic Point-of-Sale Register Transaction Receipt",
    type: "Physical Receipt",
    dateAcquired: "2026-08-15",
    custodian: "Defendant Personal Records",
    chainOfCustodyStatus: "Verified Intact",
    relevantCharge: "Theft Charge (Ind. Code § 35-43-4-2)",
    summary: "Time-stamped debit card receipt proving defendant lawfully purchased and paid for the merchandise at 21:32 PM.",
    storageHash: "sha256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2"
  },
  {
    id: "ev-004",
    matterId: "matter-001",
    exhibitNumber: "Exhibit D",
    title: "Officer Bodycam Video Unit #441 (Unedited)",
    type: "Body-Worn Video",
    dateAcquired: "2026-09-02",
    custodian: "State Discovery Production",
    chainOfCustodyStatus: "Missing Gap Noted",
    relevantCharge: "Search & Seizure Suppression",
    summary: "Video captures officers opening car trunk with a slim jim without warrant or consent while defendant was already handcuffed in squad car.",
    storageHash: "sha256:9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8"
  }
];

export const LANDMARK_LEGAL_PRECEDENTS: LegalPrecedent[] = [
  {
    id: "prec-001",
    citation: "384 U.S. 436 (1966)",
    court: "Supreme Court of the United States",
    year: 1966,
    title: "Miranda v. Arizona",
    category: "Self-Incrimination (5th Amend)",
    jurisdiction: "Federal / All States",
    precedentialStatus: "Binding Precedent",
    holding: "The prosecution may not use statements stemming from custodial interrogation of the defendant unless it demonstrates the use of procedural safeguards effective to secure the privilege against self-incrimination.",
    quote: "Prior to any questioning, the person must be warned that he has a right to remain silent, that any statement he does make may be used as evidence against him, and that he has a right to the presence of an attorney."
  },
  {
    id: "prec-002",
    citation: "373 U.S. 83 (1963)",
    court: "Supreme Court of the United States",
    year: 1963,
    title: "Brady v. Maryland",
    category: "Discovery & Brady",
    jurisdiction: "Federal / All States",
    precedentialStatus: "Binding Precedent",
    holding: "Suppression by the prosecution of evidence favorable to an accused upon request violates due process where the evidence is material either to guilt or to punishment, irrespective of the good faith or bad faith of the prosecution.",
    quote: "Society wins not only when the guilty are convicted but when criminal trials are fair; our system of the administration of justice suffers when any accused is treated unfairly."
  },
  {
    id: "prec-003",
    citation: "392 U.S. 1 (1968)",
    court: "Supreme Court of the United States",
    year: 1968,
    title: "Terry v. Ohio",
    category: "Search & Seizure (4th Amend)",
    jurisdiction: "Federal / All States",
    precedentialStatus: "Binding Precedent",
    holding: "Police officers may stop a person without probable cause if they have reasonable articulable suspicion that criminal activity is afoot; a subsequent pat-down search must be strictly limited to discovering weapons.",
    quote: "The officer must be able to point to specific and articulable facts which, taken together with rational inferences from those facts, reasonably warrant that intrusion."
  },
  {
    id: "prec-004",
    citation: "367 U.S. 643 (1961)",
    court: "Supreme Court of the United States",
    year: 1961,
    title: "Mapp v. Ohio",
    category: "Search & Seizure (4th Amend)",
    jurisdiction: "Federal / All States",
    precedentialStatus: "Binding Precedent",
    holding: "All evidence obtained by searches and seizures in violation of the Fourth Amendment of the Federal Constitution is inadmissible in state court criminal prosecutions (the Exclusionary Rule).",
    quote: "We hold that all evidence obtained by searches and seizures in violation of the Constitution is, by that same authority, inadmissible in a state court."
  },
  {
    id: "prec-005",
    citation: "Ind. Code § 35-41-3-2",
    court: "Indiana General Assembly",
    year: 2024,
    title: "Indiana Use of Force in Defense of Person or Property",
    category: "Self-Defense",
    jurisdiction: "Indiana",
    precedentialStatus: "Binding Precedent",
    holding: "A person is justified in using reasonable force against another person to protect the person or a third person from what the person reasonably believes to be the imminent use of unlawful force. No duty to retreat.",
    quote: "A person is justified in using reasonable force... and has no duty to retreat, if the person reasonably believes that that force is necessary to prevent serious bodily injury."
  }
];

export const INDEPENDENT_ATTORNEY_DIRECTORY: AttorneyListing[] = [
  {
    id: "att-001",
    name: "Eleanor Sterling, Esq.",
    firm: "Sterling Legal Defense & Civil Rights Center",
    city: "Indianapolis",
    state: "Indiana",
    barNumber: "IN-Bar #34912-49",
    status: "Active - Good Standing",
    practiceAreas: ["Criminal Defense", "Constitutional Rights", "Appeals"],
    representationType: "Sliding Scale",
    phone: "(317) 555-0142",
    email: "contact@sterlingdefense.law",
    address: "120 E. Market St, Suite 800, Indianapolis, IN 46204",
    verifiedSource: "State Bar Public Records"
  },
  {
    id: "att-002",
    name: "Indiana Legal Services Pro Bono Project",
    firm: "Marion County Legal Aid Association",
    city: "Indianapolis",
    state: "Indiana",
    barNumber: "501(c)(3) Legal Clinic #00812",
    status: "Active - Good Standing",
    practiceAreas: ["Pro Se Litigant Clinic", "Misdemeanor Defense", "Expungement"],
    representationType: "Pro Bono / Legal Aid",
    phone: "(317) 631-9410",
    email: "clinic@indianalegalservices.org",
    address: "151 N. Delaware St, Suite 1800, Indianapolis, IN 46204",
    verifiedSource: "Legal Aid Society Roster"
  },
  {
    id: "att-003",
    name: "Marcus Holloway, Esq.",
    firm: "Holloway Criminal Trial Advocacy",
    city: "Los Angeles",
    state: "California",
    barNumber: "CA-Bar #289412",
    status: "Active - Good Standing",
    practiceAreas: ["Felony Defense", "Search & Seizure Suppression", "Jury Trials"],
    representationType: "Private Retainer",
    phone: "(213) 555-0199",
    email: "mholloway@hollowaytriallaw.com",
    address: "600 Wilshire Blvd, Suite 1200, Los Angeles, CA 90017",
    verifiedSource: "State Bar Public Records"
  },
  {
    id: "att-004",
    name: "Legal Aid Foundation of Los Angeles (LAFLA)",
    firm: "Community Defense Project",
    city: "Los Angeles",
    state: "California",
    barNumber: "CA State Bar Registered Legal Aid #0042",
    status: "Active - Good Standing",
    practiceAreas: ["Pro Se Guidance", "Civil Rights", "Misdemeanor Expungement"],
    representationType: "Pro Bono / Legal Aid",
    phone: "(800) 399-4529",
    email: "help@lafla.org",
    address: "1550 W. 8th St, Los Angeles, CA 90017",
    verifiedSource: "Legal Aid Society Roster"
  }
];
