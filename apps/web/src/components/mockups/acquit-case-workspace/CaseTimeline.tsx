import { useState } from "react";
import { Sparkles, 
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  FileText,
  Filter,
  Gavel,
  Info,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { INITIAL_TIMELINE_EVENTS, type TimelineEvent } from "./legalData";

interface CaseTimelineProps {
  onSelectEventDoc?: (docId: string) => void;
  onOpenFilingCenter?: () => void;
}

export function CaseTimeline({ onSelectEventDoc, onOpenFilingCenter }: CaseTimelineProps) {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(INITIAL_TIMELINE_EVENTS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<"All" | "Completed" | "Upcoming">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const categories = [
    "All",
    "Court Hearing",
    "Filing & Motion",
    "Discovery & Evidence",
    "Arrest & Charge",
  ];

  const filteredEvents = timelineEvents.filter((event) => {
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
    const matchesTime = timeFilter === "All" || event.status === timeFilter;
    const matchesSearch =
      searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.judge && event.judge.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (event.docketNumber && event.docketNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesTime && matchesSearch;
  });

  const completedCount = timelineEvents.filter((e) => e.status === "Completed").length;
  const progressPercent = Math.round((completedCount / timelineEvents.length) * 100);

  const handleSyncCourtDocket = () => {
    setIsSyncing(true);
    setSyncSuccessMsg(null);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccessMsg("Synced 2 new docket entries securely.");
      setTimeout(() => setSyncSuccessMsg(null), 5000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Timeline Progress Meter */}
      <div className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 backdrop-blur-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-white/70">
              <Clock3 size={14} /> Chronological Case Timeline
            </div>
            <h2 className="mt-2 font-serif text-[28px] font-semibold text-white">
              Case Milestones
            </h2>
            <p className="mt-1 text-xs text-white/50 tracking-wide">
              Marion County Superior Court · Criminal Division 4 · Docket IN-MAR-24-0187
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncCourtDocket}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5/5 px-4 py-2 text-[10px] font-bold tracking-widest text-white hover:bg-white/5/10 transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={isSyncing ? "animate-spin text-white/70" : ""} />
              {isSyncing ? "SYNCING..." : "SYNC DOCKET"}
            </button>
          </div>
        </div>

        {syncSuccessMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-[12px] bg-[rgba(255,255,255,0.03)]/10 p-3 text-xs font-bold text-white/70 ring-1 ring-[#D4AF37]/20">
            <Check size={16} /> {syncSuccessMsg}
          </div>
        )}

        <div className="mt-6 flex items-center gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="flex-1 overflow-hidden rounded-full bg-white/5/10 h-2">
              <div
                className="h-full rounded-full bg-[rgba(255,255,255,0.03)] shadow-[0_0_10px_rgba(212,175,55,0.5)] transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] font-bold tracking-widest text-white/70">
              {progressPercent}% PROGRESS
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-[10px] font-bold tracking-widest transition ${
                selectedCategory === cat
                  ? "bg-white/5/10 text-white ring-1 ring-white/20"
                  : "bg-black/40 text-white/50 hover:bg-white/5/5 hover:text-white"
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 border-l border-white/10 pl-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="SEARCH TIMELINE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 rounded-full border border-white/10 bg-black/40 py-2 pl-9 pr-3 text-[10px] font-bold tracking-widest text-white placeholder-white/30 focus:border-white/10 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
            />
          </div>
        </div>
      </div>

      {/* Main Layout: Timeline List & Detail Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="relative space-y-6 lg:col-span-2">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-12 text-center backdrop-blur-xl">
              <CalendarDays size={32} className="mb-4 text-white/20" />
              <p className="text-[14px] font-semibold text-white">No events found.</p>
              <p className="text-xs text-white/50 mt-1">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute bottom-0 left-[27px] top-4 w-px bg-white/5/10" />
              <div className="space-y-6">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="relative flex gap-5">
                    <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[rgba(255,255,255,0.03)] shadow-md">
                      {event.status === "Completed" ? (
                        <CheckCircle2 size={24} className="text-white/70" />
                      ) : (
                        <Clock3 size={24} className="text-white/40" />
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className={`flex-1 overflow-hidden rounded-[18px] border text-left transition ${
                        selectedEvent?.id === event.id
                          ? "border-white/10 bg-white/5/5 ring-1 ring-[#D4AF37]/30"
                          : "border-white/10 bg-[rgba(255,255,255,0.03)] hover:bg-white/5/5"
                      } backdrop-blur-xl`}
                    >
                      <div className="p-5">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-[10px] font-bold tracking-widest text-white/70">
                            {event.date} {event.time && `· ${event.time}`}
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-widest ${
                              event.status === "Completed"
                                ? "bg-[rgba(255,255,255,0.03)]/10 text-white/70 ring-1 ring-[#D4AF37]/20"
                                : "bg-white/5/5 text-white/60 ring-1 ring-white/10"
                            }`}
                          >
                            {event.status.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="font-serif text-[20px] text-white">
                          {event.title}
                        </h3>
                        <p className="mt-2 text-xs leading-[1.6] text-white/60 line-clamp-2">
                          {event.description}
                        </p>
                        {(event.linkedDocs || event.actionRequired) && (
                          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/5 pt-4">
                            {event.linkedDocs && event.linkedDocs.length > 0 && (
                              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-white/40">
                                <FileText size={14} /> {event.linkedDocs.length} DOCS
                              </div>
                            )}
                            {event.actionRequired && (
                              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-white/70">
                                <ShieldAlert size={14} /> REQUIRES ACTION
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Detail Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] backdrop-blur-xl flex flex-col min-h-[400px]">
            {selectedEvent ? (
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <span className="rounded-full bg-[rgba(255,255,255,0.03)]/10 px-2 py-0.5 text-[9px] font-bold tracking-widest text-white/70 ring-1 ring-[#D4AF37]/20">
                    {selectedEvent.category.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-serif text-[24px] leading-tight text-white mb-2">
                  {selectedEvent.title}
                </h3>
                <p className="text-xs text-white/50">
                  {selectedEvent.date} {selectedEvent.time && `at ${selectedEvent.time}`}
                </p>

                <div className="mt-6 flex-1">
                  <p className="text-[13px] leading-[1.6] text-white/80">
                    {selectedEvent.description}
                  </p>

                  <div className="mt-6 space-y-4">
                    {selectedEvent.location && (
                      <div className="flex items-start gap-3">
                        <MapPin size={16} className="mt-0.5 shrink-0 text-white/40" />
                        <div>
                          <p className="text-[11px] font-bold text-white">Location</p>
                          <p className="text-[11px] text-white/60 mt-0.5">{selectedEvent.location}</p>
                        </div>
                      </div>
                    )}
                    {selectedEvent.judge && (
                      <div className="flex items-start gap-3">
                        <Gavel size={16} className="mt-0.5 shrink-0 text-white/40" />
                        <div>
                          <p className="text-[11px] font-bold text-white">Presiding</p>
                          <p className="text-[11px] text-white/60 mt-0.5">Judge {selectedEvent.judge}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedEvent.aiInsight && (
                    <div className="mt-6 rounded-[12px] border border-white/10/30 bg-[rgba(255,255,255,0.03)]/5 p-4">
                      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-widest text-white/70">
                        <Sparkles size={14} /> AI INSIGHT
                      </div>
                      <p className="text-xs leading-[1.6] text-white/70">
                        {selectedEvent.aiInsight}
                      </p>
                    </div>
                  )}

                  {selectedEvent.linkedDocs && selectedEvent.linkedDocs.length > 0 && (
                    <div className="mt-6">
                      <p className="mb-3 text-[10px] font-bold tracking-widest text-white/40">ATTACHED DOCUMENTS</p>
                      <div className="space-y-2">
                        {selectedEvent.linkedDocs.map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => onSelectEventDoc && onSelectEventDoc(doc.id)}
                            className="flex w-full items-center gap-3 rounded-[12px] border border-white/5 bg-black/40 p-3 text-left hover:bg-white/5/5 transition"
                          >
                            <FileCheck2 size={16} className="text-white/70" />
                            <span className="flex-1 truncate text-xs font-medium text-white">{doc.name}</span>
                            <ChevronRight size={14} className="text-white/30" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <Info size={32} className="mb-4 text-white/20" />
                <p className="text-[14px] font-semibold text-white">Select an event</p>
                <p className="mt-2 text-xs text-white/50">
                  Click on any timeline event to view details, insights, and attached documents.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
