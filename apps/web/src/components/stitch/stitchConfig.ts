export interface StitchScreen {
  id: string;
  label: string;
  category: string;
  description?: string;
  isPrimary?: boolean;
}

export interface StitchCategory {
  id: string;
  label: string;
  icon: string;
  route: string;
  primaryMockup: string;
  screens: StitchScreen[];
}

export const STITCH_CATEGORIES: StitchCategory[] = [
  {
    id: "command_center",
    label: "Command Center",
    icon: "dashboard",
    route: "/",
    primaryMockup: "command_center_dashboard",
    screens: [
      { id: "command_center_dashboard", label: "Dashboard Overview", category: "command_center", isPrimary: true, description: "Active matter KPIs, urgency alerts, deadlines, and recent case activity." },
    ],
  },
  {
    id: "the_docket",
    label: "The Docket",
    icon: "gavel",
    route: "/docket",
    primaryMockup: "the_docket_cases",
    screens: [
      { id: "the_docket_cases", label: "Active Matters", category: "the_docket", isPrimary: true, description: "List of open case files and ongoing proceedings." },
      { id: "the_docket_open_a_matter", label: "Open New Matter", category: "the_docket", description: "Initialize a self-represented legal case file." },
      { id: "the_docket_retrieve_from_court", label: "Court Retrieval", category: "the_docket", description: "Import and sync docket entries from official court systems." },
      { id: "the_docket_closed_matters", label: "Closed Matters", category: "the_docket", description: "Archived proceedings and completed dispositions." },
    ],
  },
  {
    id: "chambers",
    label: "Chambers",
    icon: "groups",
    route: "/chambers",
    primaryMockup: "chambers_ai_legal_team",
    screens: [
      { id: "chambers_ai_legal_team", label: "AI Legal Team", category: "chambers", isPrimary: true, description: "Multi-agent legal workspace with specialized AI counselors." },
      { id: "chambers_full_bench_view", label: "Full Bench View", category: "chambers", description: "Active bench view of all AI agents and their assigned jurisdictions." },
      { id: "chambers_appoint_counsel", label: "Appoint AI Counsel", category: "chambers", description: "Configure and assign custom defense, procedural, or research agents." },
      { id: "chambers_plea_analysis", label: "Plea Analysis", category: "chambers", description: "Objective, risk-factored breakdown of plea offers vs. trial exposure." },
      { id: "chambers_mitigation_memo", label: "Mitigation Memo", category: "chambers", description: "Draft sentencing mitigation packets and restorative history memos." },
      { id: "chambers_counsel_brief", label: "Counsel Brief", category: "chambers", description: "Pre-hearing strategy briefs structured for pro se litigant delivery." },
      { id: "chambers_session_transcripts", label: "Session Transcripts", category: "chambers", description: "Auditable deliberations, prompts, and analytical records." },
    ],
  },
  {
    id: "timeline",
    label: "Timeline",
    icon: "timeline",
    route: "/timeline",
    primaryMockup: "case_timeline_chronology",
    screens: [
      { id: "case_timeline_chronology", label: "Case Chronology", category: "timeline", isPrimary: true, description: "Master chronological timeline of citations, arrests, motions, and hearings." },
      { id: "case_timeline_event_record", label: "Event Record", category: "timeline", description: "Detailed evidentiary and procedural breakdown of a selected event." },
      { id: "case_timeline_log_event", label: "Log New Event", category: "timeline", description: "Add a factual encounter, filing, or discovery occurrence to the timeline." },
    ],
  },
  {
    id: "investigations",
    label: "Investigations",
    icon: "policy",
    route: "/investigations",
    primaryMockup: "investigations_evidence_locker",
    screens: [
      { id: "investigations_evidence_locker", label: "Evidence Locker", category: "investigations", isPrimary: true, description: "Chain-of-custody evidence repository and physical exhibit index." },
      { id: "investigations_exhibit_analysis", label: "Exhibit Analysis", category: "investigations", description: "AI-assisted evidentiary relevance, foundation, and hearsay analysis." },
      { id: "investigations_issue_spotter", label: "Issue Spotter", category: "investigations", description: "Algorithmic identification of constitutional violations and defense defenses." },
      { id: "investigations_research_memo", label: "Research Memo", category: "investigations", description: "Grounded factual and investigative defense memos." },
    ],
  },
  {
    id: "record_room",
    label: "Record Room",
    icon: "folder_shared",
    route: "/record-room",
    primaryMockup: "record_room_documents",
    screens: [
      { id: "record_room_documents", label: "Documents", category: "record_room", isPrimary: true, description: "Vault of court orders, charging instruments, and discovery records." },
      { id: "record_room_draft_desk", label: "Draft Desk", category: "record_room", description: "Structured drafting workstation for motions, affidavits, and pleadings." },
      { id: "record_room_exhibit_gallery", label: "Exhibit Gallery", category: "record_room", description: "Bates-stamped exhibit organizer for courtroom presentation." },
      { id: "record_room_file_a_record", label: "File a Record", category: "record_room", description: "Securely catalog, OCR, and extract text from incoming court records." },
      { id: "record_room_record_preview", label: "Record Preview", category: "record_room", description: "High-resolution document inspection and citation verification view." },
    ],
  },
  {
    id: "law_library",
    label: "Law Library",
    icon: "menu_book",
    route: "/law-library",
    primaryMockup: "law_library_research",
    screens: [
      { id: "law_library_research", label: "Legal Research", category: "law_library", isPrimary: true, description: "Search primary statutory codes, appellate precedents, and procedural rules." },
      { id: "law_library_case_folders", label: "Case Folders", category: "law_library", description: "Organized authority binders categorized by defense issue." },
      { id: "law_library_citation_web", label: "Citation Web", category: "law_library", description: "Interactive graph visualizer mapping shepherdized case relationships." },
      { id: "law_library_prior_research", label: "Prior Research", category: "law_library", description: "Archived statutory queries and synthesized legal authorities." },
    ],
  },
  {
    id: "motions_tasks",
    label: "Motions & Tasks",
    icon: "task_alt",
    route: "/motions",
    primaryMockup: "motions_tasks_court_calendar",
    screens: [
      { id: "motions_tasks_court_calendar", label: "Court Calendar", category: "motions_tasks", isPrimary: true, description: "Deterministic court appearance and filing deadline tracking." },
      { id: "motions_tasks_motion_board", label: "Motion Board", category: "motions_tasks", description: "Kanban board tracking draft, review, served, and filed motion states." },
    ],
  },
  {
    id: "court_watch",
    label: "Court Watch",
    icon: "visibility",
    route: "/court-watch",
    primaryMockup: "court_watch_docket_activity",
    screens: [
      { id: "court_watch_docket_activity", label: "Docket Activity", category: "court_watch", isPrimary: true, description: "Automated docket scrapers alerting on minute entries and judge orders." },
      { id: "hearing_prep_war_room", label: "Hearing War Room", category: "court_watch", description: "Trial strategy, objection checklists, and courtroom argument planner." },
      { id: "court_watch_hearing_prep_kit", label: "Hearing Prep Kit", category: "court_watch", description: "Procedural etiquette, judge dossier, and pro se appearance packets." },
    ],
  },
  {
    id: "counsel_directory",
    label: "Counsel Directory",
    icon: "contact_page",
    route: "/counsel",
    primaryMockup: "counsel_directory_counsel_listings",
    screens: [
      { id: "counsel_directory_counsel_listings", label: "Counsel Listings", category: "counsel_directory", isPrimary: true, description: "Neutral directory of licensed attorneys, bar memberships, and focus areas." },
      { id: "counsel_directory_search", label: "Directory Search", category: "counsel_directory", description: "Filter counsel by county, rate tier, language, and subject-matter practice." },
      { id: "counsel_directory_attorney_profile", label: "Attorney Profile", category: "counsel_directory", description: "Verified attorney profile, public discipline check, and contact channels." },
      { id: "counsel_directory_pro_bono_legal_aid", label: "Pro Bono & Legal Aid", category: "counsel_directory", description: "Public defender offices, legal aid societies, and pro bono clinics." },
    ],
  },
  {
    id: "filing_center",
    label: "Filing Center",
    icon: "send",
    route: "/filing",
    primaryMockup: "filing_center_court_submission",
    screens: [
      { id: "filing_center_court_submission", label: "Court Submission", category: "filing_center", isPrimary: true, description: "Human-gated filing packaging, certificate of service, and submission prep." },
    ],
  },
  {
    id: "security_settings",
    label: "Security & Settings",
    icon: "shield",
    route: "/security",
    primaryMockup: "workspace_security",
    screens: [
      { id: "workspace_security", label: "Workspace Security", category: "security_settings", isPrimary: true, description: "Client-side encryption keys, session audit, and access controls." },
      { id: "system_audit", label: "System Audit Trail", category: "security_settings", description: "Immutable cryptographic logs of all AI suggestions and user decisions." },
      { id: "ai_engine_settings", label: "AI Engine Settings", category: "security_settings", description: "Model temperature, reasoning depth, and LLM gateway routing." },
      { id: "integrations_settings", label: "Integrations & APIs", category: "security_settings", description: "CourtListener, PACER, Google Drive, and Cloud storage connections." },
      { id: "the_clerk_notification_settings", label: "Clerk Notifications", category: "security_settings", description: "SMS, email, and push deadline alerts for docket entries." },
      { id: "accessibility_settings", label: "Accessibility Settings", category: "security_settings", description: "Adjustable font scale, contrast modes, and screen reader tuning." },
      { id: "user_profile", label: "User Profile", category: "security_settings", description: "Litigant demographic, pro se declaration, and verified identity." },
      { id: "help_onboarding", label: "Onboarding & Help", category: "security_settings", description: "Comprehensive user manual and constitutional self-defense tutorials." },
    ],
  },
];

export const ALL_STITCH_MOCKUPS: string[] = [
  "accessibility_settings", "ai_engine_settings", "case_timeline_chronology",
  "case_timeline_event_record", "case_timeline_log_event", "chambers_ai_legal_team",
  "chambers_appoint_counsel", "chambers_counsel_brief", "chambers_full_bench_view",
  "chambers_mitigation_memo", "chambers_plea_analysis", "chambers_session_transcripts",
  "command_center_dashboard", "counsel_directory_attorney_profile",
  "counsel_directory_counsel_listings", "counsel_directory_pro_bono_legal_aid",
  "counsel_directory_search", "court_watch_docket_activity", "court_watch_hearing_prep_kit",
  "filing_center_court_submission", "hearing_prep_war_room", "help_onboarding",
  "integrations_settings", "investigations_evidence_locker", "investigations_exhibit_analysis",
  "investigations_issue_spotter", "investigations_research_memo", "law_library_case_folders",
  "law_library_citation_web", "law_library_prior_research", "law_library_research",
  "motions_tasks_court_calendar", "motions_tasks_motion_board",
  "record_room_documents", "record_room_draft_desk", "record_room_exhibit_gallery",
  "record_room_file_a_record", "record_room_record_preview", "system_audit",
  "the_clerk_notification_settings", "the_docket_cases", "the_docket_closed_matters",
  "the_docket_open_a_matter", "the_docket_retrieve_from_court", "user_profile",
  "workspace_security"
];

export function formatMockupName(name: string): string {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function findCategoryForMockup(mockupId: string): StitchCategory | undefined {
  return STITCH_CATEGORIES.find((cat) =>
    cat.screens.some((screen) => screen.id === mockupId)
  );
}
