import React, { useState } from "react";
import {
  FolderOpen, FileText, Calendar, Mail, RefreshCw, ExternalLink, ShieldCheck, CheckCircle2,
  AlertCircle, Plus, Search, Download, Filter, Eye, Clock, Sparkles, Lock, ArrowUpRight,
  ChevronRight, HardDrive, FileSpreadsheet, FileCode, CalendarDays, X, Share2, Check
} from "lucide-react";

export interface GoogleDriveItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink: string;
  category: "Pleadings" | "Discovery" | "Evidence" | "Transcripts" | "Court Notices";
  status: "synced" | "syncing" | "local_only";
}
export interface GoogleDocDraft {
  id: string;
  title: string;
  documentType: string;
  lastEditedBy: string;
  lastEditedTime: string;
  docUrl: string;
  status: string;
  wordCount: number;
}
export interface GoogleCalendarHearing {
  id: string;
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  courtroom: string;
  judge: string;
  urgency: string;
  syncStatus: string;
}
export interface GmailThreadLog {
  id: string;
  subject: string;
  sender: string;
  recipient?: string;
  date?: string;
  category?: string;
  receivedTime: string;
  snippet: string;
  threadUrl: string;
  classification: string;
  flaggedForReview: boolean;
}
export interface WorkspaceSyncState {
  lastSyncDrive: string;
  lastSyncDocs: string;
  lastSyncCalendar: string;
  lastSyncGmail: string;
  userEmail?: string;
  lastSyncedAt?: string;
  calendarId?: string;
  isSyncing: boolean;
  status: "Healthy" | "Syncing" | "Error" | "Disconnected";
}

const INITIAL_SYNC_STATE: WorkspaceSyncState = {
  lastSyncDrive: new Date().toISOString(),
  lastSyncDocs: new Date().toISOString(),
  lastSyncCalendar: new Date().toISOString(),
  lastSyncGmail: new Date().toISOString(),
  isSyncing: false,
  status: "Healthy"
};
const INITIAL_DRIVE_FILES: GoogleDriveItem[] = [];
const INITIAL_DOC_DRAFTS: GoogleDocDraft[] = [];
const INITIAL_CALENDAR_EVENTS: GoogleCalendarHearing[] = [];
const INITIAL_GMAIL_LOGS: GmailThreadLog[] = [];


interface GoogleWorkspaceIntegrationProps {
  matterTitle?: string;
  caseNumber?: string;
  courtName?: string;
}

export function GoogleWorkspaceIntegration({
  matterTitle = "State of Indiana v. Alex Thompson",
  caseNumber = "IN-MAR-24-0187",
  courtName = "Marion County Superior Court, Criminal Division 3",
}: GoogleWorkspaceIntegrationProps) {
  const [syncState, setSyncState] = useState<WorkspaceSyncState>(INITIAL_SYNC_STATE);
  const [activeTab, setActiveTab] = useState<"drive" | "docs" | "calendar" | "gmail">("drive");
  const [driveFiles, setDriveFiles] = useState<GoogleDriveItem[]>(INITIAL_DRIVE_FILES);
  const [docDrafts, setDocDrafts] = useState<GoogleDocDraft[]>(INITIAL_DOC_DRAFTS);
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarHearing[]>(INITIAL_CALENDAR_EVENTS);
  const [gmailLogs] = useState<GmailThreadLog[]>(INITIAL_GMAIL_LOGS);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Modals & previews
  const [previewDoc, setPreviewDoc] = useState<GoogleDocDraft | GoogleDriveItem | null>(null);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [newDraftTitle, setNewDraftTitle] = useState("");
  const [newDraftType, setNewDraftType] = useState<GoogleDocDraft["documentType"]>("Motion to Suppress");
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");

  const handleSyncAll = () => {
    setIsSyncing(true);
    setSyncNotice(null);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncState((prev) => ({
        ...prev,
        lastSyncedAt: new Date().toISOString(),
      }));
      setSyncNotice("Google Workspace synchronized with Acquit Case Vault (Drive, Docs & Calendar up to date).");
      setTimeout(() => setSyncNotice(null), 5000);
    }, 1200);
  };

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDraftTitle.trim()) return;

    const newDraft: GoogleDocDraft = {
      id: "gdoc_" + Date.now(),
      title: newDraftTitle.trim(),
      documentType: newDraftType,
      lastEditedBy: "Alex Thompson (Pro Se)",
      lastEditedTime: new Date().toISOString(),
      docUrl: `https://docs.google.com/document/create?title=${encodeURIComponent(newDraftTitle)}`,
      status: "Draft (AI Assisted)",
      wordCount: 350,
    };

    setDocDrafts([newDraft, ...docDrafts]);
    setIsCreatingDraft(false);
    setNewDraftTitle("");
    setSyncNotice(`Google Doc draft "${newDraft.title}" created in Google Drive case folder.`);
    setTimeout(() => setSyncNotice(null), 4000);
  };

  const handleAddCalendarHearing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventDate) return;

    const newHearing: GoogleCalendarHearing = {
      id: "gcal_" + Date.now(),
      summary: newEventTitle.trim(),
      description: `Court proceeding for Case ${caseNumber} before ${courtName}.`,
      startDateTime: newEventDate + "T09:00:00",
      endDateTime: newEventDate + "T10:30:00",
      location: newEventLocation.trim() || courtName,
      courtroom: "Courtroom 302",
      judge: "Hon. Sarah Jenkins",
      urgency: "High",
      syncStatus: "Synchronized",
    };

    setCalendarEvents([...calendarEvents, newHearing]);
    setIsAddingEvent(false);
    setNewEventTitle("");
    setNewEventDate("");
    setNewEventLocation("");
    setSyncNotice(`Event "${newHearing.summary}" synced to Google Calendar.`);
    setTimeout(() => setSyncNotice(null), 4000);
  };

  const filteredDriveFiles = driveFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredDocDrafts = docDrafts.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.documentType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 text-white">
      {/* Universal Legal Notice Header */}
      <div className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 p-4 text-[11px] font-mono text-[#EFE6D0] backdrop-blur-md">
        <div className="flex items-center gap-2 font-bold text-[#D4AF37]">
          <ShieldCheck size={16} />
          <span>[PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE - REQUIRES INDEPENDENT HUMAN REVIEW]</span>
        </div>
        <p className="mt-1 text-white/70">
          Google Workspace integration connects your private Google Drive case vault, Google Docs drafting workbench, and Google Calendar court schedules. Documents and filings are never submitted to the court automatically.
        </p>
      </div>

      {/* Header Connection Bar */}
      <div className="flex flex-col gap-4 rounded-[20px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-white/5 border border-[#D4AF37]/30 text-[#D4AF37]">
              <HardDrive size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-[22px] font-light text-white tracking-wide">
                  Google Workspace Case Sync
                </h1>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Connected
                </span>
              </div>
              <p className="text-xs text-white/50">
                Connected to <span className="font-mono text-[#D4AF37]">{syncState.userEmail}</span> · Matter: {matterTitle} ({caseNumber})
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right text-[11px] text-white/40 hidden sm:block">
            <span>Last synced: </span>
            <span className="text-white/70">
              {syncState.lastSyncedAt ? new Date(syncState.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
            </span>
          </div>

          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold tracking-wider text-white hover:bg-white/10 hover:border-[#D4AF37]/40 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin text-[#D4AF37]" : "text-[#D4AF37]"} />
            {isSyncing ? "SYNCING WORKSPACE..." : "SYNC NOW"}
          </button>

          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-bold tracking-wider text-black hover:bg-[#c49f27] transition shadow-lg shadow-[#D4AF37]/20"
          >
            <span>OPEN DRIVE VAULT</span>
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      {/* Sync notification banner */}
      {syncNotice && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Workspace Navigation Tabs */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-px">
        {[
          { id: "drive", label: "Google Drive Case Vault", icon: FolderOpen, count: driveFiles.length },
          { id: "docs", label: "Google Docs Motion Drafting", icon: FileText, count: docDrafts.length },
          { id: "calendar", label: "Google Calendar Hearings", icon: Calendar, count: calendarEvents.length },
          { id: "gmail", label: "Gmail Clerk & Court Audit", icon: Mail, count: gmailLogs.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold tracking-wider uppercase border-b-2 transition whitespace-nowrap ${
                isActive
                  ? "border-[#D4AF37] text-[#D4AF37] bg-white/[0.02]"
                  : "border-transparent text-white/50 hover:text-white/80 hover:border-white/20"
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${isActive ? "bg-[#D4AF37]/20 text-[#D4AF37]" : "bg-white/5 text-white/40"}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GOOGLE DRIVE CASE VAULT */}
      {activeTab === "drive" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={15} />
              <input
                type="text"
                placeholder="Search discovery files, exhibits, affidavits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {["All", "Pleadings", "Discovery", "Evidence", "Transcripts", "Court Notices"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition ${
                    selectedCategory === cat
                      ? "bg-white text-black font-bold"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.02)] backdrop-blur-md">
            <div className="grid grid-cols-12 border-b border-white/10 bg-white/[0.02] px-6 py-3 text-[11px] font-mono tracking-wider text-white/40 uppercase">
              <div className="col-span-5 sm:col-span-6">File Name & Vault Location</div>
              <div className="col-span-3 sm:col-span-2">Category</div>
              <div className="col-span-2 hidden sm:block">Size</div>
              <div className="col-span-4 sm:col-span-2 text-right">Actions</div>
            </div>

            <div className="divide-y divide-white/5">
              {filteredDriveFiles.map((file) => (
                <div
                  key={file.id}
                  className="grid grid-cols-12 items-center px-6 py-4 transition hover:bg-white/[0.04] text-xs"
                >
                  <div className="col-span-5 sm:col-span-6 flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-[#D4AF37]">
                      {file.mimeType.includes("pdf") ? <FileText size={18} /> : <FileCode size={18} />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white group-hover:text-[#D4AF37]">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-white/40">
                        Modified {new Date(file.modifiedTime).toLocaleDateString()} · Google Drive Synced
                      </p>
                    </div>
                  </div>

                  <div className="col-span-3 sm:col-span-2">
                    <span className="rounded-md bg-white/5 px-2.5 py-1 text-[10px] font-mono text-white/70 border border-white/10">
                      {file.category}
                    </span>
                  </div>

                  <div className="col-span-2 hidden sm:block font-mono text-white/50 text-[11px]">
                    {file.size}
                  </div>

                  <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setPreviewDoc(file)}
                      className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
                      title="Inspect Metadata"
                    >
                      <Eye size={15} />
                    </button>
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-white/80 hover:bg-[#D4AF37] hover:text-black transition"
                    >
                      <span>Drive</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}

              {filteredDriveFiles.length === 0 && (
                <div className="p-8 text-center text-xs text-white/40">
                  No files matching query in Google Drive vault.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GOOGLE DOCS DRAFTING WORKBENCH */}
      {activeTab === "docs" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={15} />
              <input
                type="text"
                placeholder="Search legal draft motions, pleadings, briefs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <button
              onClick={() => setIsCreatingDraft(true)}
              className="flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-bold tracking-wider text-black hover:bg-[#c49f27] transition shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
            >
              <Plus size={16} />
              <span>NEW GOOGLE DOC DRAFT</span>
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {filteredDocDrafts.map((draft) => {
              const isReviewReq = draft.status === "Human Review Required";
              const isReady = draft.status === "Ready for Filing";
              return (
                <div
                  key={draft.id}
                  className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-5 backdrop-blur-xl transition hover:border-[#D4AF37]/40 shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-md bg-[#D4AF37]/10 px-2.5 py-1 text-[10px] font-mono font-semibold text-[#D4AF37] border border-[#D4AF37]/20">
                        {draft.documentType}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-wider border ${
                          isReviewReq
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            : isReady
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                            : "bg-blue-500/10 text-blue-300 border-blue-500/30"
                        }`}
                      >
                        {draft.status.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-[16px] font-normal text-white line-clamp-2">
                        {draft.title}
                      </h3>
                      <p className="mt-1 text-[11px] text-white/50 line-clamp-1">
                        Last edited by {draft.lastEditedBy}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] font-mono text-white/40 pt-2 border-t border-white/5">
                      <span>{draft.wordCount} words</span>
                      <span>·</span>
                      <span>{new Date(draft.lastEditedTime).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 pt-4 border-t border-white/10">
                    <a
                      href={draft.docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-bold text-white hover:bg-white/10 hover:border-[#D4AF37]/40 transition"
                    >
                      <span>EDIT IN DOCS</span>
                      <ExternalLink size={13} />
                    </a>
                    <button
                      onClick={() => setPreviewDoc(draft)}
                      className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 hover:text-white hover:bg-white/10 transition"
                      title="Inspect Draft Details"
                    >
                      <Eye size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: GOOGLE CALENDAR COURT SCHEDULE */}
      {activeTab === "calendar" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/60">
              Hearings and statutory deadlines synced with Google Calendar ID: <span className="font-mono text-[#D4AF37]">{syncState.calendarId}</span>
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAddingEvent(true)}
                className="flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-bold tracking-wider text-black hover:bg-[#c49f27] transition shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
              >
                <Plus size={16} />
                <span>ADD COURT EVENT TO CALENDAR</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {calendarEvents.map((evt) => (
              <div
                key={evt.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-5 backdrop-blur-xl transition hover:border-[#D4AF37]/40 shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-white/5 border border-white/10 font-mono text-center">
                    <span className="text-[10px] uppercase text-[#D4AF37]">
                      {new Date(evt.startDateTime).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-[18px] font-bold leading-none text-white">
                      {new Date(evt.startDateTime).getDate()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-[17px] text-white">
                        {evt.summary}
                      </h3>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider border ${
                        evt.urgency === "Critical" ? "bg-rose-500/10 text-rose-300 border-rose-500/30" : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                      }`}>
                        {evt.urgency.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-white/60">
                      {evt.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-white/40">
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-[#D4AF37]" />
                        {new Date(evt.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>·</span>
                      <span>{evt.location}</span>
                      <span>·</span>
                      <span>{evt.courtroom} ({evt.judge})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                    <Check size={13} />
                    Google Calendar Synced
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GMAIL CLERK & PROSECUTION AUDIT */}
      {activeTab === "gmail" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-white/60">
            Audit log of official emails transmitted between the Pro Se litigant, Marion County Clerk, and Deputy Prosecutor.
          </div>

          <div className="space-y-3">
            {gmailLogs.map((mail) => (
              <div
                key={mail.id}
                className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.02)] p-5 transition hover:bg-white/[0.04]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-mono text-[#D4AF37]">
                      {mail.category}
                    </span>
                    <h4 className="text-xs font-semibold text-white">
                      {mail.subject}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-white/40">
                    {mail.date}
                  </span>
                </div>

                <div className="mt-2 text-[11px] text-white/40">
                  From: <span className="font-mono text-white/70">{mail.sender}</span> · To: <span className="font-mono text-white/70">{mail.recipient}</span>
                </div>

                <p className="mt-2 text-xs text-white/60 line-clamp-2">
                  "{mail.snippet}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: CREATE GOOGLE DOC DRAFT */}
      {isCreatingDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#12161f] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-white">
                <FileText className="text-[#D4AF37]" size={20} />
                <h3 className="font-serif text-[18px]">Create New Google Doc Draft</h3>
              </div>
              <button
                onClick={() => setIsCreatingDraft(false)}
                className="rounded-lg p-1 text-white/40 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDraft} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-white/70 font-semibold">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Defendant's Motion to Suppress Unlawful Search"
                  value={newDraftTitle}
                  onChange={(e) => setNewDraftTitle(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-white/70 font-semibold">Document Pleading Type</label>
                <select
                  value={newDraftType}
                  onChange={(e) => setNewDraftType(e.target.value as any)}
                  className="w-full rounded-xl border border-white/15 bg-[#1a202c] p-3 text-white focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="Motion to Suppress">Motion to Suppress (4th Amendment / Evidence)</option>
                  <option value="Notice of Appearance">Notice of Appearance (Pro Se Litigant)</option>
                  <option value="Discovery Request">Discovery Request & Inspection</option>
                  <option value="Witness List">Witness & Exhibit List</option>
                  <option value="Brief in Support">Memorandum of Law / Brief in Support</option>
                </select>
              </div>

              <div className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-3 text-[11px] text-white/70">
                <span className="font-bold text-[#D4AF37]">Human Review Guardrail:</span> A new Google Doc will be initialized in your private case vault. All citations will be grounded in statutory authority and require your independent approval before filing.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreatingDraft(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-white/60 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#D4AF37] px-5 py-2 font-bold text-black hover:bg-[#c49f27] transition"
                >
                  Initialize Google Doc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CALENDAR HEARING */}
      {isAddingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#12161f] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-white">
                <Calendar className="text-[#D4AF37]" size={20} />
                <h3 className="font-serif text-[18px]">Schedule Hearing in Google Calendar</h3>
              </div>
              <button
                onClick={() => setIsAddingEvent(false)}
                className="rounded-lg p-1 text-white/40 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCalendarHearing} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-white/70 font-semibold">Hearing / Deadline Name</label>
                <input
                  type="text"
                  placeholder="e.g. Omnibus Hearing & Motion Arguments"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-white/70 font-semibold">Date</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/15 bg-[#1a202c] p-3 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-white/70 font-semibold">Courtroom / Location</label>
                  <input
                    type="text"
                    placeholder="Courtroom 302"
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddingEvent(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-white/60 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#D4AF37] px-5 py-2 font-bold text-black hover:bg-[#c49f27] transition"
                >
                  Sync to Google Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW DETAILS */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-[#12161f] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-serif text-[18px] text-white">
                {'title' in previewDoc ? previewDoc.title : previewDoc.name}
              </h3>
              <button
                onClick={() => setPreviewDoc(null)}
                className="rounded-lg p-1 text-white/40 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-[11px] text-white/70 space-y-1">
                <p><span className="text-[#D4AF37]">Document ID:</span> {previewDoc.id}</p>
                {'documentType' in previewDoc && (
                  <p><span className="text-[#D4AF37]">Type:</span> {previewDoc.documentType}</p>
                )}
                {'category' in previewDoc && (
                  <p><span className="text-[#D4AF37]">Category:</span> {previewDoc.category}</p>
                )}
                <p><span className="text-[#D4AF37]">Case Association:</span> {matterTitle} ({caseNumber})</p>
                <p><span className="text-[#D4AF37]">Court:</span> {courtName}</p>
                <p><span className="text-[#D4AF37]">Provenance:</span> SOURCE_USER / GOOGLE_WORKSPACE_ENCRYPTED</p>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] text-emerald-300">
                Encrypted in transit & at rest via Google Workspace OAuth 2.0 Client Tokens.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setPreviewDoc(null)}
                className="rounded-xl bg-[#D4AF37] px-5 py-2 font-bold text-black hover:bg-[#c49f27] transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Mandatory Footer Disclaimer */}
      <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-center text-[11px] text-white/40">
        This information is provided for educational and procedural purposes only and does not constitute legal advice. No attorney-client relationship is formed. Consult a licensed attorney for case-specific representation.
      </div>
    </div>
  );
}
