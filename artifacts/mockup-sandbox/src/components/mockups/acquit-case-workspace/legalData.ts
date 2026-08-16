export interface LegalAuthority {
  id: string;
  title: string;
  citation: string;
  type: "case_law" | "statute" | "court_rule" | "constitutional";
  jurisdiction: string;
  court: string;
  year: number;
  precedentialStatus: "Binding Precedent" | "Persuasive Authority" | "Active Statute" | "Procedural Rule";
  holdingSummary: string;
  verbatimExcerpt: string;
  pinpointPage?: string;
  citingCasesCount: number;
  ipfsCid: string;
  vectorSimilarity: number; // 0 to 1
  tags: string[];
}

export interface RagSourceClaim {
  id: string;
  claimText: string;
  confidenceScore: number; // 0 - 100
  supportType: "Direct Holding" | "Statutory Mandate" | "Procedural Rule" | "Persuasive Analogy";
  authority: LegalAuthority;
  pageOffset: string;
  reasoning: string;
}

export interface TimelineEvent {
  id: string;
  date: string; // ISO date string e.g. "2026-05-28"
  displayDate: string; // e.g. "May 28, 2026"
  time?: string;
  title: string;
  category: "Court Hearing" | "Filing & Motion" | "Discovery & Evidence" | "Arrest & Charge" | "Order & Ruling";
  stage: "Arrest" | "Initial Hearing" | "Discovery" | "Pretrial" | "Trial Preparation" | "Post-Trial";
  status: "Completed" | "Upcoming" | "Overdue" | "In Review";
  location?: string;
  judge?: string;
  docketNumber?: string;
  ipfsCid?: string;
  description: string;
  keyTakeaways: string[];
  relatedDocumentIds?: string[];
  actionRequired?: string;
}

export interface AiChatMessage {
  id: string;
  agentName: string;
  agentRole: string;
  agentAvatar: string;
  agentColor: string;
  timestamp: string;
  content: string;
  claims: RagSourceClaim[];
  ragMetrics: {
    totalAuthoritiesQueried: number;
    vectorIndexTimeMs: number;
    groundingScorePercent: number;
    embeddingModel: string;
  };
}

export const MIGRATED_CASE_LAW_DATABASE: LegalAuthority[] = [
  {
    id: "auth-001",
    title: "State of Indiana v. Miranda",
    citation: "182 N.E.3d 890 (Ind. 2021)",
    type: "case_law",
    jurisdiction: "Indiana",
    court: "Indiana Supreme Court",
    year: 2021,
    precedentialStatus: "Binding Precedent",
    holdingSummary: "State must provide complete video footage and unredacted dispatch logs within 30 days of initial discovery request in Class B felony prosecutions; failure to do so without good cause warrants exclusion of state witnesses.",
    verbatimExcerpt: "Mandatory disclosure rules under Ind. Crim. R. 2.5 require production of all body-worn camera recordings prior to the omnibus date. The trial court retains broad discretion to exclude unproduced state evidence.",
    pinpointPage: "p. 894",
    citingCasesCount: 142,
    ipfsCid: "bafybeicg2u7x6z3y4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p",
    vectorSimilarity: 0.968,
    tags: ["Discovery", "Suppression", "Body Cam Evidence", "Class B Felony"],
  },
  {
    id: "auth-002",
    title: "Indiana Code § 35-41-3-2",
    citation: "Ind. Code § 35-41-3-2 (2025)",
    type: "statute",
    jurisdiction: "Indiana",
    court: "Indiana General Assembly",
    year: 2025,
    precedentialStatus: "Active Statute",
    holdingSummary: "Defensive force and justification statute. A person is justified in using reasonable force against any other person to protect the person or a third person from what the person reasonably believes to be the imminent use of unlawful force.",
    verbatimExcerpt: "A person is justified in using reasonable force... No duty to retreat exists prior to exercising lawful defense of home, motor vehicle, or self.",
    pinpointPage: "Subdivision (c)",
    citingCasesCount: 1205,
    ipfsCid: "bafybeih5x4y3z2a1b0c9d8e7f6g5h4i3j2k1l0m9n8o7p6q5r4s3t2u1v",
    vectorSimilarity: 0.945,
    tags: ["Self-Defense", "Affirmative Defense", "Statutory Duty"],
  },
  {
    id: "auth-003",
    title: "Marion County Superior Court Local Rule 4.1",
    citation: "Marion Sup. Ct. LR49-CR00-4.1",
    type: "court_rule",
    jurisdiction: "Marion County, IN",
    court: "Marion County Superior Court",
    year: 2024,
    precedentialStatus: "Procedural Rule",
    holdingSummary: "Pretrial Conference Procedures & Omnibus Filings. All defense motions in limine and suppression motions must be served no later than 14 calendar days prior to scheduled pretrial conference.",
    verbatimExcerpt: "Motions to suppress or exclude physical evidence served fewer than 14 days prior to pretrial conference shall be deemed waived unless good cause for delay is shown by sworn affidavit.",
    pinpointPage: "Section 4.1(B)",
    citingCasesCount: 88,
    ipfsCid: "bafybeif9e8d7c6b5a4z3y2x1w0v9u8t7s6r5q4p3o2n1m0l9k8j7i6h5g",
    vectorSimilarity: 0.921,
    tags: ["Pretrial Motions", "Deadline", "Local Procedure", "Marion County"],
  },
  {
    id: "auth-004",
    title: "Patterson v. State",
    citation: "211 N.E.3d 502 (Ind. Ct. App. 2023)",
    type: "case_law",
    jurisdiction: "Indiana",
    court: "Indiana Court of Appeals",
    year: 2023,
    precedentialStatus: "Binding Precedent",
    holdingSummary: "Constructive possession of contraband requires proof of capability and intent to maintain control. Mere proximity without additional incriminating circumstances is insufficient to sustain conviction.",
    verbatimExcerpt: "When possession of the premises is non-exclusive, the State must demonstrate additional circumstances pointing to defendant's knowledge of the presence of contraband.",
    pinpointPage: "p. 509",
    citingCasesCount: 64,
    ipfsCid: "bafybeia2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z",
    vectorSimilarity: 0.894,
    tags: ["Constructive Possession", "Evidentiary Standard", "Reversal"],
  },
  {
    id: "auth-005",
    title: "Indiana Rules of Criminal Procedure, Rule 2.5",
    citation: "Ind. Crim. R. 2.5",
    type: "court_rule",
    jurisdiction: "Indiana",
    court: "Indiana Supreme Court",
    year: 2025,
    precedentialStatus: "Procedural Rule",
    holdingSummary: "Speedy trial deadlines and 70-day discharge provisions under Criminal Rule 2.5(B). Delay caused by State failure to provide mandatory initial discovery toll time constraints against the State.",
    verbatimExcerpt: "If a defendant held in jail on an indictment or affidavit is not brought to trial within seventy (70) days... he shall be discharged.",
    pinpointPage: "Rule 2.5(B)(1)",
    citingCasesCount: 412,
    ipfsCid: "bafybeid9c8b7a6f5e4d3c2b1a0z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k",
    vectorSimilarity: 0.912,
    tags: ["Speedy Trial", "Constitutional Rights", "Discharge Motion"],
  }
];

export const INITIAL_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "evt-001",
    date: "2026-04-12",
    displayDate: "Apr 12, 2026",
    time: "11:45 PM",
    title: "Traffic Stop & Alleged Incident",
    category: "Arrest & Charge",
    stage: "Arrest",
    status: "Completed",
    location: "Washington St & Meridian St, Indianapolis",
    docketNumber: "N/A - Pre-filing",
    ipfsCid: "bafybeia1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y",
    description: "Initial encounter with IMPD officers during routine traffic stop. Client cited and arrested for alleged Class B felony misdemeanor charges.",
    keyTakeaways: [
      "Officer dashcam and body camera recording active (32 min total)",
      "Client preserved right to remain silent at 11:52 PM",
      "Vehicle searched under non-exclusive possession circumstances"
    ],
    relatedDocumentIds: ["doc-001", "doc-002"]
  },
  {
    id: "evt-002",
    date: "2026-04-15",
    displayDate: "Apr 15, 2026",
    time: "09:00 AM",
    title: "Formal Charges Filed by Marion County Prosecutor",
    category: "Filing & Motion",
    stage: "Arrest",
    status: "Completed",
    location: "Marion County Clerk Office",
    docketNumber: "Docket Entry 01",
    ipfsCid: "bafybeic9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d",
    description: "Information filed alleging two criminal counts: Count 1 (Possession of Handgun without license - Level 6 Felony) & Count 2 (Possession of Marijuana - Class B Misdemeanor).",
    keyTakeaways: [
      "Case assigned to Marion County Superior Court, Criminal Division 4",
      "Honorable Judge Marcus Vance presiding",
      "Bail set at $1,500 surety / $150 cash bond"
    ],
    relatedDocumentIds: ["doc-003"]
  },
  {
    id: "evt-003",
    date: "2026-04-30",
    displayDate: "Apr 30, 2026",
    time: "01:30 PM",
    title: "Initial Hearing & Arraignment",
    category: "Court Hearing",
    stage: "Initial Hearing",
    status: "Completed",
    location: "Marion County Superior Court · Room 4B",
    judge: "Hon. Marcus Vance",
    docketNumber: "Docket Entry 08",
    ipfsCid: "bafybeie8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0z9y8x7w6v5u4t",
    description: "Client pleaded Not Guilty. Court set release conditions, confirmed self-representation status with advisory counsel notice, and scheduled omnibus date.",
    keyTakeaways: [
      "Not Guilty plea formally entered into court docket",
      "Pretrial release conditions maintained on personal recognizance",
      "Omnibus date set for June 22, 2026"
    ]
  },
  {
    id: "evt-004",
    date: "2026-05-14",
    displayDate: "May 14, 2026",
    time: "04:15 PM",
    title: "State’s Initial Discovery Response Received",
    category: "Discovery & Evidence",
    stage: "Discovery",
    status: "Completed",
    docketNumber: "Docket Entry 18",
    ipfsCid: "bafybeig1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f",
    description: "Prosecutor submitted 12-page written discovery response. Disclosed officer witness list and preliminary lab certificates.",
    keyTakeaways: [
      "Missing officer body camera audio track from Officer Miller",
      "State failed to produce CAD dispatch audio logs required under Ind. Crim. R. 2.5",
      "Priya Rao (AI Case Analyst) flagged 3 evidentiary inconsistencies"
    ],
    relatedDocumentIds: ["doc-004"]
  },
  {
    id: "evt-005",
    date: "2026-05-28",
    displayDate: "May 28, 2026",
    time: "10:00 AM",
    title: "Pretrial Conference & Status Hearing",
    category: "Court Hearing",
    stage: "Pretrial",
    status: "Upcoming",
    location: "Marion County Superior Court · Room 4B",
    judge: "Hon. Marcus Vance",
    docketNumber: "Docket Entry 22",
    description: "Critical status hearing to address discovery compliance, pending motion schedule, and omnibus readiness.",
    keyTakeaways: [
      "Review State compliance with missing body camera audio logs",
      "Submit proposed Motion to Compel or Motion in Limine if discovery remains incomplete",
      "Confirm trial date window with Court Coordinator"
    ],
    actionRequired: "Prepare Discovery Deficiencies Memo using AI Legal Team before May 26"
  },
  {
    id: "evt-006",
    date: "2026-06-04",
    displayDate: "Jun 04, 2026",
    time: "05:00 PM",
    title: "Deadline: Supplemental Discovery Request & Motion to Exclude",
    category: "Filing & Motion",
    stage: "Pretrial",
    status: "Upcoming",
    docketNumber: "Filing Deadline",
    description: "Deadline under Marion Sup. Ct. LR49-CR00-4.1 to serve all defense discovery requests and suppression motions 14 days prior to omnibus date.",
    keyTakeaways: [
      "Must file Motion to Exclude Unproduced Video Evidence if State delays",
      "Draft already initiated in Acquit Filing Center (85% complete)"
    ],
    actionRequired: "Review and electronically sign Motion in Filing Center"
  },
  {
    id: "evt-007",
    date: "2026-06-22",
    displayDate: "Jun 22, 2026",
    time: "09:00 AM",
    title: "Omnibus Date & Final Motion Hearing",
    category: "Court Hearing",
    stage: "Pretrial",
    status: "Upcoming",
    location: "Marion County Superior Court · Room 4B",
    judge: "Hon. Marcus Vance",
    description: "Statutory omnibus date under Ind. Code § 35-36-8-1. Final date for amendment of charges or assertion of affirmative defenses.",
    keyTakeaways: [
      "Final cutoff for notice of affirmative defense under Ind. Code § 35-41-3-2",
      "Evidentiary hearing on pending motions to suppress"
    ]
  }
];

export const MOCK_RAG_MESSAGES: AiChatMessage[] = [
  {
    id: "msg-101",
    agentName: "Jordan Lee",
    agentRole: "Strategic Lead Attorney",
    agentAvatar: "JL",
    agentColor: "bg-[#315b57]",
    timestamp: "10:14 AM Today",
    content: `Based on our automated analysis of the Marion County Prosecutor's discovery filing on May 14, 2026, we have identified two critical legal options regarding the missing body camera audio logs:

1. **Discovery Violation Under Indiana Supreme Court Precedent**: Under **State v. Miranda (Ind. 2021)**, the prosecution is strictly obligated to disclose unredacted audio/video footage at least 30 days prior to omnibus. The 12-page discovery response provided on May 14 omits Officer Miller's primary audio stream.

2. **Timely Defense Filings Required**: Per **Marion County Local Rule 4.1**, any motion to suppress or exclude physical/digital evidence must be served at least 14 days prior to your scheduled pretrial conference on May 28, 2026.

3. **Lack of Exclusive Control**: The traffic stop occurred in a vehicle with multiple occupants. Under **Patterson v. State**, mere proximity to non-disclosed items without additional independent evidence of intent does not meet the burden for constructive possession.`,
    claims: [
      {
        id: "claim-1",
        claimText: "Prosecution is obligated to disclose unredacted audio/video footage at least 30 days prior to omnibus under Indiana binding precedent.",
        confidenceScore: 98,
        supportType: "Direct Holding",
        authority: MIGRATED_CASE_LAW_DATABASE[0],
        pageOffset: "Page 894, Para 3",
        reasoning: "State v. Miranda establishes mandatory pre-omnibus video disclosure rules for felony prosecutions in Indiana state courts."
      },
      {
        id: "claim-2",
        claimText: "Marion County Local Rule 4.1 requires motions in limine and evidentiary exclusions to be served 14 days before the pretrial conference.",
        confidenceScore: 95,
        supportType: "Procedural Rule",
        authority: MIGRATED_CASE_LAW_DATABASE[2],
        pageOffset: "Section 4.1(B)",
        reasoning: "Rule LR49-CR00-4.1 sets strict 14-day advance notice for exclusion motions in Criminal Division 4."
      },
      {
        id: "claim-3",
        claimText: "Mere proximity in a multi-occupant vehicle is insufficient to establish constructive possession without independent corroborating evidence.",
        confidenceScore: 92,
        supportType: "Direct Holding",
        authority: MIGRATED_CASE_LAW_DATABASE[3],
        pageOffset: "Page 509, Headnote 4",
        reasoning: "Patterson v. State holds non-exclusive possession requires specific proof of capability and intent."
      }
    ],
    ragMetrics: {
      totalAuthoritiesQueried: 15420,
      vectorIndexTimeMs: 142,
      groundingScorePercent: 96,
      embeddingModel: "pgvector (1536d HNSW) + text-embedding-3-small"
    }
  }
];
