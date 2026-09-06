"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

const mockups = [
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

export function StitchGallery() {
  const router = useRouter();
  const [selectedMockup, setSelectedMockup] = useState<string | null>(null);

  if (selectedMockup) {
    return (
      <div className="flex h-full flex-col bg-[#0A0A0A]">
        <div className="flex items-center gap-4 border-b border-white/10 p-4">
          <button 
            onClick={() => setSelectedMockup(null)}
            className="text-xs font-bold tracking-widest text-[#D4AF37] hover:text-white"
          >
            ← BACK TO GALLERY
          </button>
          <span className="text-sm font-semibold text-white/50">{formatName(selectedMockup)}</span>
        </div>
        <div className="flex-1 overflow-auto p-4 flex justify-center">
          <img 
            src={`/assets/stitch/${selectedMockup}/screen.png`} 
            alt={formatName(selectedMockup)}
            className="max-w-full h-auto rounded-xl border border-white/10 shadow-2xl"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-serif text-white">Stitch OS Design Gallery</h2>
        <p className="mt-2 text-sm text-white/50">
          Viewing {mockups.length} uploaded UI/UX mockups for the Acquit Legal Operating System.
          <span className="text-[#D4AF37] text-xs ml-2">Click any mockup to view it live</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {mockups.map((m) => (
          <div 
            key={m}
            onClick={() => router.push(`/stitch/${m}`)}
            className="group cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-black/40 transition hover:border-[#D4AF37]/50 hover:bg-white/5"
          >
            <div className="aspect-video w-full bg-white/5 p-2">
              <img 
                src={`/assets/stitch/${m}/screen.png`} 
                alt={formatName(m)}
                className="h-full w-full object-cover rounded opacity-80 transition group-hover:opacity-100"
                loading="lazy"
              />
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-white/70 group-hover:text-[#D4AF37]">
                {formatName(m)}
              </span>
              <ChevronRight size={14} className="text-white/30 group-hover:text-[#D4AF37]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
