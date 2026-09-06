"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STITCH_MOCKUPS = [
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

function formatName(name: string) {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function StitchMockup({ mockupName }: { mockupName: string }) {
  const router = useRouter();
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHtml() {
      if (!mockupName) {
        setError("No mockup name provided");
        setLoading(false);
        return;
      }

      // Validate mockup name
      if (!STITCH_MOCKUPS.includes(mockupName)) {
        setError(`Mockup '${mockupName}' not found`);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/assets/stitch/${mockupName}/code.html`);
        if (!response.ok) {
          throw new Error(`Failed to load: ${response.status}`);
        }
        const fullHtml = await response.text();
        
        // Extract title from head for the page title
        const titleMatch = fullHtml.match(/<title>([\s\S]*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : formatName(mockupName);
        document.title = `Acquit - ${title}`;
        
        setHtmlContent(fullHtml);
        setLoading(false);
      } catch (err) {
        setError(`Failed to load mockup: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    }

    loadHtml();
  }, [mockupName]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#174E48] border-t-[#D4AF37]" />
          <p className="font-mono text-sm tracking-widest text-[#D4AF37]">LOADING STITCH MOCKUP...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] p-8 text-white">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-xs font-bold tracking-widest text-[#D4AF37] hover:text-white"
        >
          ← BACK
        </button>
        <h1 className="mb-3 text-xl font-semibold text-[#D4AF37]">Mockup Load Error</h1>
        <pre className="max-w-3xl whitespace-pre-wrap rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-red-300">
          {error}
        </pre>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-4 md:p-6">
      <div className="flex items-center gap-4 border-b border-white/10 pb-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-xs font-bold tracking-widest text-[#D4AF37] hover:text-white"
        >
          ← BACK
        </button>
        <span className="text-sm font-semibold text-white/50">{formatName(mockupName || "")}</span>
      </div>
      <div className="flex-1 overflow-auto">
        <iframe
          srcDoc={htmlContent}
          className="w-full h-full min-h-[calc(100vh-200px)] rounded-xl border border-white/10 shadow-2xl"
          title={formatName(mockupName || "")}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </main>
  );
}
