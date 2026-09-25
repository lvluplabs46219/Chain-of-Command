/**
 * Canonical route resolution for the Acquit.ai Stitch application pages.
 * Every Stitch design IS an actual app page; routes are derived deterministically.
 */

/** All 85 Stitch design folders under components/mockups/acquit-case-workspace/NEWSTITCH/. */
export const STITCH_FOLDERS: readonly string[] = [
  "accessibility_settings",
  "acquit.ai_genteam_ai_workspace_lemonade_server",
  "acquit.ai_genteam_multi_agent_autonomous_workspace_telegram_lemonade",
  "acquit.ai_telegram_genteam_ai_workspace_lemonade_server",
  "ai_engine_models_agent_personas_playground_studio",
  "ai_engine_settings",
  "alexandria",
  "case_timeline_chronology_1",
  "case_timeline_chronology_2",
  "case_timeline_event_record",
  "case_timeline_log_event",
  "chambers_ai_legal_team_1",
  "chambers_ai_legal_team_2",
  "chambers_appoint_counsel",
  "chambers_conference_room_1",
  "chambers_conference_room_2",
  "chambers_counsel_brief",
  "chambers_full_bench_view",
  "chambers_mitigation_memo",
  "chambers_plea_analysis",
  "chambers_rights_audit",
  "chambers_session_transcripts",
  "command_center_dashboard_1",
  "command_center_dashboard_2",
  "command_center_full_navigational_hub",
  "command_center_genteam_workspace_1",
  "command_center_genteam_workspace_2",
  "command_center_home",
  "command_center_interactive_navigational_hub",
  "command_center_navigational_hub",
  "command_center_refined_social_hub_1",
  "command_center_refined_social_hub_2",
  "command_center_social_legal_hub",
  "command_center_social_news_hub",
  "command_center_telegram_legal_hub",
  "counsel_directory_attorney_profile",
  "counsel_directory_counsel_listings",
  "counsel_directory_pro_bono_legal_aid",
  "counsel_directory_search",
  "counsel_directory_search_portal_1",
  "counsel_directory_search_portal_2",
  "court_watch_docket_activity",
  "court_watch_hearing_prep_kit",
  "filing_center_court_submission",
  "genteam_autonomous_sparring_debate_marcus_sterling_vs_ausa_vance",
  "hearing_prep_war_room",
  "help_onboarding",
  "integrations_settings",
  "investigations_active_research_1",
  "investigations_active_research_2",
  "investigations_evidence_analysis_1",
  "investigations_evidence_analysis_2",
  "investigations_evidence_locker_1",
  "investigations_evidence_locker_2",
  "investigations_exhibit_analysis",
  "investigations_issue_spotter",
  "investigations_research_memo",
  "law_library_case_folders",
  "law_library_citation_web",
  "law_library_prior_research",
  "law_library_research_1",
  "law_library_research_2",
  "law_library_search_the_stacks_1",
  "law_library_search_the_stacks_2",
  "legal_os_prototype",
  "lex_operating_system",
  "motions_tasks_court_calendar",
  "motions_tasks_motion_board",
  "record_room_documents_1",
  "record_room_documents_2",
  "record_room_draft_desk",
  "record_room_exhibit_gallery",
  "record_room_file_a_record",
  "record_room_record_preview",
  "system_audit",
  "the_clerk_notification_settings",
  "the_docket_cases_1",
  "the_docket_cases_2",
  "the_docket_closed_matters",
  "the_docket_open_a_matter",
  "the_docket_retrieve_from_court",
  "three.js_1",
  "three.js_2",
  "user_profile",
  "workspace_security",
];

/** kebabCase("acquit.ai_genteam_...") -> "acquit-ai-genteam-..." */
function kebab(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const slugToFolder: Record<string, string> = {};
for (const folder of STITCH_FOLDERS) {
  slugToFolder[kebab(folder)] = folder;
}

/**
 * Semantic primary routes. Sidebar link text in every design maps here,
 * so the whole application navigates between real pages.
 */
export const ROUTE_ALIASES: Record<string, string> = {
  "": "command_center_home",
  docket: "the_docket_cases_1",
  chambers: "chambers_ai_legal_team_1",
  "law-library": "law_library_research_1",
  "record-room": "record_room_documents_1",
  "court-watch": "court_watch_docket_activity",
  timeline: "case_timeline_chronology_1",
  investigations: "investigations_active_research_1",
  counsel: "counsel_directory_search",
  filing: "filing_center_court_submission",
  motions: "motions_tasks_motion_board",
  calendar: "motions_tasks_court_calendar",
  security: "workspace_security",
  audit: "system_audit",
};

/**
 * Resolve a URL slug path to a Stitch design folder.
 * Alias routes win; otherwise the slug is the kebab-cased folder name.
 */
export function resolveStitchFolder(slug: string[]): string | null {
  const joined = slug.join("/");
  if (joined in ROUTE_ALIASES) return ROUTE_ALIASES[joined];
  const kebabSlug = slug
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slugToFolder[kebabSlug] ?? null;
}
