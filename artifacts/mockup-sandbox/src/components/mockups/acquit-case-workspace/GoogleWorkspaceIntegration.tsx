import { useState, useEffect } from "react";
import {
  FileText,
  FolderOpen,
  Upload,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Search,
  LogOut,
  Sparkles,
  Lock,
  Table,
  CheckSquare,
  Mail,
  Send,
  Plus,
  Eye,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  Clock,
  Shield,
  Filter,
} from "lucide-react";
import {
  initGoogleAuth,
  googleSignIn,
  googleLogout,
  listDriveFiles,
  createGoogleDocLegalPleading,
  createCaseTimelineSheet,
  createWitnessMatrixSheet,
  createWitnessQuestionnaireForm,
  fetchFormResponses,
  listLegalEmails,
  createGmailDraft,
  type GoogleDriveFile,
  type LegalSpreadsheet,
  type LegalGoogleForm,
  type FormResponseItem,
  type GmailMessageItem,
  type User,
} from "../../../lib/googleWorkspace";

export function GoogleWorkspaceIntegration({
  matterTitle = "State of Indiana v. Alex Thompson",
  caseNumber = "IN-MAR-24-0187",
  courtName = "Marion County Superior Court, Criminal Division 3",
}: {
  matterTitle?: string;
  caseNumber?: string;
  courtName?: string;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"sheets" | "forms" | "gmail" | "drive">("sheets");

  // Notifications
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);

  // Sheets State
  const [isExportingSheet, setIsExportingSheet] = useState(false);
  const [exportedSheets, setExportedSheets] = useState<LegalSpreadsheet[]>([]);

  // Forms State
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [activeForm, setActiveForm] = useState<LegalGoogleForm | null>(null);
  const [formResponses, setFormResponses] = useState<FormResponseItem[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);

  // Gmail State
  const [legalEmails, setLegalEmails] = useState<GmailMessageItem[]>([]);
  const [isFetchingEmails, setIsFetchingEmails] = useState(false);
  const [emailSearchQuery, setEmailSearchQuery] = useState("");
  const [isDraftingEmail, setIsDraftingEmail] = useState(false);
  const [draftRecipient, setDraftRecipient] = useState("j.miller@marioncounty.in.gov");
  const [draftSubject, setDraftSubject] = useState(`Discovery Clarification Request - ${caseNumber}`);
  const [draftBody, setDraftBody] = useState(
    `Dear Prosecutor Miller,\n\nI am writing regarding State v. Thompson (${caseNumber}) to respectfully request confirmation on the estimated delivery date for the BWC digital evidence upload from IMPD Incident #24-99182.\n\nThank you,\nAlex Thompson\nDefendant Pro Se`
  );
  const [createdDraft, setCreatedDraft] = useState<{ draftId: string } | null>(null);
  const [showSendConfirmation, setShowSendConfirmation] = useState(false);

  // Drive & Docs State
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [driveSearchQuery, setDriveSearchQuery] = useState("");
  const [isFetchingFiles, setIsFetchingFiles] = useState(false);
  const [isExportingDoc, setIsExportingDoc] = useState(false);
  const [exportedDoc, setExportedDoc] = useState<{ docUrl: string; title: string } | null>(null);

  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        void loadAllWorkspaceData(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setDriveFiles([]);
        setLegalEmails([]);
        setExportedSheets([]);
        setActiveForm(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const showNotification = (text: string, type: "success" | "info" = "success") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4500);
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        await loadAllWorkspaceData(res.accessToken);
        showNotification("Connected to Google Workspace (Sheets, Forms, Gmail, Drive).");
      }
    } catch (err: any) {
      console.error("Google Auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await googleLogout();
    setUser(null);
    setToken(null);
    setDriveFiles([]);
    setLegalEmails([]);
    setExportedSheets([]);
    setActiveForm(null);
    setExportedDoc(null);
  };

  const loadAllWorkspaceData = async (accessToken: string) => {
    void loadDriveFiles(accessToken);
    void loadEmails(accessToken);
  };

  // 1. Google Sheets Operations
  const handleExportChronologySheet = async () => {
    if (!token) return;
    setIsExportingSheet(true);
    try {
      const chronologyEvents = [
        { date: "2026-08-10", time: "18:24 EST", event: "Traffic Stop Initiated by Unit 412", source: "Patrol Log p. 1", significance: "Stop justification disputed" },
        { date: "2026-08-10", time: "18:28 EST", event: "Officer Requests Backup / K-9 Unit", source: "CAD Dispatch Audio", significance: "Extension of stop duration" },
        { date: "2026-08-10", time: "18:41 EST", event: "Defendant Detained and Searched", source: "BWC Footage #10", significance: "Exceeds Rodriguez standard (unreasonably prolonged)" },
        { date: "2026-08-11", time: "09:00 EST", event: "Booking & Property Inventory Form", source: "Marion County Jail Receipt", significance: "Zero contraband in pockets verified" },
      ];
      const sheet = await createCaseTimelineSheet(token, caseNumber, chronologyEvents);
      setExportedSheets((prev) => [sheet, ...prev]);
      showNotification(`Created Google Sheet: "${sheet.title}"`);
    } catch (err) {
      console.error("Sheets creation error:", err);
    } finally {
      setIsExportingSheet(false);
    }
  };

  const handleExportWitnessMatrixSheet = async () => {
    if (!token) return;
    setIsExportingSheet(true);
    try {
      const witnesses = [
        { name: "Officer D. Miller (#412)", role: "Arresting Officer", contact: "IMPD Dispatch", testimony: "Claims observed erratic lane change", credibilityNotes: "Dashcam does not show lane change; contradicts CAD" },
        { name: "Marcus Daniels", role: "Eyewitness (Pedestrian)", contact: "m.daniels@gmail.com", testimony: "Observed stop from crosswalk", credibilityNotes: "Unbiased third-party observer; confirms empty hands" },
        { name: "Store Clerk (450 N. Meridian)", role: "Surveillance Custodian", contact: "In person", testimony: "Maintains exterior CCTV", credibilityNotes: "Footage requested via preservation letter" },
      ];
      const sheet = await createWitnessMatrixSheet(token, caseNumber, witnesses);
      setExportedSheets((prev) => [sheet, ...prev]);
      showNotification(`Created Google Sheet: "${sheet.title}"`);
    } catch (err) {
      console.error("Witness matrix sheet creation error:", err);
    } finally {
      setIsExportingSheet(false);
    }
  };

  // 2. Google Forms Operations
  const handleCreateWitnessForm = async () => {
    if (!token) return;
    setIsCreatingForm(true);
    try {
      const form = await createWitnessQuestionnaireForm(token, caseNumber);
      setActiveForm(form);
      showNotification(`Generated Google Form: "${form.title}"`);
      await loadFormResponses(token, form.formId);
    } catch (err) {
      console.error("Form creation error:", err);
    } finally {
      setIsCreatingForm(false);
    }
  };

  const loadFormResponses = async (accessToken: string, formId: string) => {
    setIsLoadingResponses(true);
    try {
      const responses = await fetchFormResponses(accessToken, formId);
      setFormResponses(responses);
    } catch (err) {
      console.error("Responses fetch error:", err);
    } finally {
      setIsLoadingResponses(false);
    }
  };

  // 3. Gmail Operations
  const loadEmails = async (accessToken: string, query?: string) => {
    setIsFetchingEmails(true);
    try {
      const emails = await listLegalEmails(accessToken, query);
      setLegalEmails(emails);
    } catch (err) {
      console.warn("Emails load error:", err);
    } finally {
      setIsFetchingEmails(false);
    }
  };

  const handleCreateDraft = async () => {
    if (!token) return;
    setIsDraftingEmail(true);
    try {
      const result = await createGmailDraft(token, draftRecipient, draftSubject, draftBody);
      setCreatedDraft(result);
      setShowSendConfirmation(false);
      showNotification(`Saved legal correspondence draft in Gmail (ID: ${result.draftId}).`);
    } catch (err) {
      console.error("Draft error:", err);
    } finally {
      setIsDraftingEmail(false);
    }
  };

  // 4. Google Drive & Docs Operations
  const loadDriveFiles = async (accessToken: string, query?: string) => {
    setIsFetchingFiles(true);
    try {
      const files = await listDriveFiles(accessToken, query);
      setDriveFiles(files);
    } catch (err) {
      console.warn("Drive files load warning:", err);
    } finally {
      setIsFetchingFiles(false);
    }
  };

  const handleExportMotionToDocs = async () => {
    if (!token) return;
    setIsExportingDoc(true);
    try {
      const result = await createGoogleDocLegalPleading(
        token,
        `Motion for Discovery - ${caseNumber}`,
        {
          court: courtName,
          caseNumber: caseNumber,
          caption: `${matterTitle}\nState of Indiana, Plaintiff, vs. Alex Thompson, Defendant`,
          documentTitle: "Verified Motion for Complete Discovery Production & Body-Cam Preservation",
          bodyContent: `COMES NOW Defendant Alex Thompson, appearing pro se (self-represented), pursuant to the Due Process Clause of the Fourteenth Amendment to the United States Constitution, Article 1, Section 12 of the Indiana Constitution, and Indiana Rule of Criminal Procedure 2.5, and respectfully moves this Honorable Court to order the Prosecuting Attorney to produce the following items within fourteen (14) days:

1. ALL officer body-worn camera (BWC) footage recorded by IMPD Officers on August 10, 2026, between 18:00 and 21:00 EST.
2. Complete audio recordings and verbatim transcripts of all 911 dispatch calls and radio dispatch logs concerning Incident Report #24-99182.
3. Unedited digital surveillance video retrieved from the retail premises at 450 N. Meridian St.
4. Any exculpatory or impeachment evidence under Brady v. Maryland, 373 U.S. 83 (1963) and Giglio v. United States, 405 U.S. 150 (1972).

WHEREFORE, Defendant prays that this Court grant this Motion and order timely production.`,
        }
      );
      setExportedDoc({ docUrl: result.docUrl, title: result.title });
      showNotification(`Created Google Doc: "${result.title}"`);
    } catch (err) {
      console.error("Export to Docs error:", err);
    } finally {
      setIsExportingDoc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#174E48]/40 via-[#0B2523]/60 to-black/60 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/15 shadow-inner">
              <Sparkles className="text-[#D4AF37] h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif font-bold text-white tracking-wide">
                  Google Workspace Legal Hub
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                  Sheets · Forms · Gmail · Drive
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">
                Organize case chronologies in Sheets, collect witness statements via Forms, scan court notices in Gmail, and edit pleadings in Docs.
              </p>
            </div>
          </div>

          <div>
            {!user ? (
              <button
                onClick={handleSignIn}
                disabled={isLoading}
                className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white text-[#1f1f1f] hover:bg-neutral-100 transition font-medium text-xs shadow-lg border border-neutral-300 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>{isLoading ? "Connecting..." : "Sign in with Google"}</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-medium text-white">{user.displayName || user.email}</div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Google Workspace Active
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition border border-white/10"
                  title="Sign out of Google"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Workspace Navigation Tabs */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("sheets")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold tracking-wider uppercase transition border-b-2 ${
            activeTab === "sheets"
              ? "border-[#34A853] text-[#34A853] bg-[#34A853]/10"
              : "border-transparent text-white/50 hover:text-white/80"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Google Sheets
        </button>
        <button
          onClick={() => setActiveTab("forms")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold tracking-wider uppercase transition border-b-2 ${
            activeTab === "forms"
              ? "border-[#7248B9] text-[#A78BFA] bg-[#7248B9]/10"
              : "border-transparent text-white/50 hover:text-white/80"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Google Forms
        </button>
        <button
          onClick={() => setActiveTab("gmail")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold tracking-wider uppercase transition border-b-2 ${
            activeTab === "gmail"
              ? "border-[#EA4335] text-[#F87171] bg-[#EA4335]/10"
              : "border-transparent text-white/50 hover:text-white/80"
          }`}
        >
          <Mail className="w-4 h-4" />
          Gmail Notices
        </button>
        <button
          onClick={() => setActiveTab("drive")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold tracking-wider uppercase transition border-b-2 ${
            activeTab === "drive"
              ? "border-[#4285F4] text-[#60A5FA] bg-[#4285F4]/10"
              : "border-transparent text-white/50 hover:text-white/80"
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          Drive & Docs
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. GOOGLE SHEETS VIEW */}
      {/* ======================================================== */}
      {activeTab === "sheets" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sheet Creator 1: Case Chronology */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Table className="w-5 h-5 text-[#34A853]" />
                  <h3 className="font-semibold text-white text-sm">Factual Chronology Spreadsheet</h3>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  Export timestamps, officer actions, dispatch CAD radio logs, and defense significance into a structured, formula-ready Google Spreadsheet.
                </p>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-[11px] text-white/70 font-mono">
                  <div className="text-emerald-400">✓ Auto-frozen header row</div>
                  <div>✓ Columns: Date, Time, Incident Event, Source Doc, Defense Note</div>
                  <div>✓ Ready for cross-examination exhibit indexing</div>
                </div>
              </div>

              <div>
                {!user ? (
                  <button
                    onClick={handleSignIn}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium border border-white/10 flex items-center justify-center gap-2 transition"
                  >
                    <Lock className="w-3.5 h-3.5" /> Sign in to Create Google Sheet
                  </button>
                ) : (
                  <button
                    onClick={handleExportChronologySheet}
                    disabled={isExportingSheet}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#34A853]/80 hover:bg-[#34A853] text-white text-xs font-semibold shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isExportingSheet ? "Generating Spreadsheet..." : "Create Case Chronology in Sheets"}
                  </button>
                )}
              </div>
            </div>

            {/* Sheet Creator 2: Witness Credibility Matrix */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#34A853]" />
                  <h3 className="font-semibold text-white text-sm">Witness & Credibility Matrix</h3>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  Generate a multi-tab Google Sheet mapping prosecution officers, civilian eyewitnesses, statements given, and contradictory physical evidence.
                </p>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-[11px] text-white/70 font-mono">
                  <div className="text-emerald-400">✓ Brady/Giglio impeachment trackers</div>
                  <div>✓ Witness role, contact info, statements & contradictions</div>
                </div>
              </div>

              <div>
                {!user ? (
                  <button
                    onClick={handleSignIn}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium border border-white/10 flex items-center justify-center gap-2 transition"
                  >
                    <Lock className="w-3.5 h-3.5" /> Sign in to Create Matrix
                  </button>
                ) : (
                  <button
                    onClick={handleExportWitnessMatrixSheet}
                    disabled={isExportingSheet}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#174E48] hover:bg-[#174E48]/80 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-semibold shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Table className="w-4 h-4 text-[#D4AF37]" />
                    {isExportingSheet ? "Generating..." : "Generate Witness Matrix Sheet"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active Spreadsheets List */}
          {exportedSheets.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md space-y-3">
              <h3 className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase">
                Active Google Sheets in Case Workspace
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {exportedSheets.map((sheet) => (
                  <a
                    key={sheet.spreadsheetId}
                    href={sheet.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between hover:bg-emerald-500/20 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white group-hover:text-emerald-300 transition">
                          {sheet.title}
                        </div>
                        <div className="text-[10px] text-emerald-400/70">
                          {sheet.sheets.length} tab(s) · Google Sheets Format
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. GOOGLE FORMS VIEW */}
      {/* ======================================================== */}
      {activeTab === "forms" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 1/3: Form Generator */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-[#A78BFA]" />
                  <h3 className="font-semibold text-white text-sm">Witness Statement Form</h3>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  Generate a structured Google Form with standardized legal questions to distribute to civilian witnesses and security camera owners.
                </p>
                <div className="space-y-2 text-[11px] text-white/70">
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                    <strong>Question 1:</strong> Exact location and line-of-sight during stop.
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                    <strong>Question 2:</strong> Lighting and weather visibility factors.
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                    <strong>Question 3:</strong> Surveillance video file availability.
                  </div>
                </div>
              </div>

              <div>
                {!user ? (
                  <button
                    onClick={handleSignIn}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium border border-white/10 flex items-center justify-center gap-2 transition"
                  >
                    <Lock className="w-3.5 h-3.5" /> Sign in to Create Form
                  </button>
                ) : (
                  <button
                    onClick={handleCreateWitnessForm}
                    disabled={isCreatingForm}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#7248B9] hover:bg-[#7248B9]/80 text-white text-xs font-semibold shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    {isCreatingForm ? "Building Google Form..." : "Deploy Witness Form"}
                  </button>
                )}
              </div>
            </div>

            {/* Right 2/3: Live Form Details & Responses */}
            <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white text-sm">Collected Witness Form Responses</h3>
                  <p className="text-xs text-white/50">
                    Live ingestion from Google Forms API ({formResponses.length} submissions recorded)
                  </p>
                </div>
                {activeForm && (
                  <div className="flex items-center gap-2">
                    <a
                      href={activeForm.responderUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#A78BFA]" /> Open Live Form
                    </a>
                    <a
                      href={activeForm.editUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#7248B9]/30 hover:bg-[#7248B9]/50 text-[#A78BFA] border border-[#7248B9]/40 text-xs flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Edit Form
                    </a>
                  </div>
                )}
              </div>

              {formResponses.length === 0 ? (
                <div className="p-8 rounded-xl bg-black/30 border border-white/5 text-center text-xs text-white/40 space-y-2">
                  <CheckSquare className="w-6 h-6 mx-auto text-white/20" />
                  <div>No witness submissions yet. Click "Deploy Witness Form" to generate your form link.</div>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                  {formResponses.map((resp) => (
                    <div
                      key={resp.responseId}
                      className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="font-semibold text-[#D4AF37]">{resp.respondentEmail}</span>
                        <span className="text-[10px] text-white/40">
                          {new Date(resp.createTime).toLocaleDateString()} · {new Date(resp.createTime).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {resp.answers.map((a, idx) => (
                          <div key={idx} className="space-y-0.5">
                            <div className="text-[11px] text-white/50">{a.question}</div>
                            <div className="text-white/90 bg-white/[0.02] p-2 rounded-lg border border-white/5">
                              "{a.answer}"
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. GMAIL VIEW */}
      {/* ======================================================== */}
      {activeTab === "gmail" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2/3: Legal Notice Scanner */}
            <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#EA4335]" />
                  <div>
                    <h3 className="font-semibold text-white text-sm">Court & Prosecutor Communications</h3>
                    <p className="text-xs text-white/50">
                      Scanned via Gmail API for docket notices, discovery links, and hearing summons
                    </p>
                  </div>
                </div>
                {user && (
                  <button
                    onClick={() => token && loadEmails(token, emailSearchQuery)}
                    disabled={isFetchingEmails}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
                    title="Refresh Gmail"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingEmails ? "animate-spin" : ""}`} />
                  </button>
                )}
              </div>

              {user && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Gmail for case notices, prosecutor emails, or docket updates..."
                    value={emailSearchQuery}
                    onChange={(e) => {
                      setEmailSearchQuery(e.target.value);
                      if (token) loadEmails(token, e.target.value);
                    }}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-black/40 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#EA4335]"
                  />
                </div>
              )}

              {!user ? (
                <div className="p-8 rounded-xl bg-black/30 border border-white/5 text-center text-xs text-white/50 space-y-3">
                  <Lock className="w-6 h-6 mx-auto text-white/30" />
                  <div>Connect your Google account to scan for electronic service and clerk notifications.</div>
                  <button
                    onClick={handleSignIn}
                    className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold mx-auto hover:bg-neutral-200 transition"
                  >
                    Sign in to Scan Gmail
                  </button>
                </div>
              ) : legalEmails.length === 0 ? (
                <div className="p-6 rounded-xl bg-black/30 text-center text-xs text-white/40">
                  {isFetchingEmails ? "Scanning mailbox..." : "No court or prosecutor emails found matching query."}
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                  {legalEmails.map((email) => (
                    <div
                      key={email.id}
                      className="p-3 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {email.isCourtNotice && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                              COURT NOTICE
                            </span>
                          )}
                          <span className="font-semibold text-xs text-white truncate max-w-xs">{email.from}</span>
                        </div>
                        <span className="text-[10px] text-white/40">
                          {new Date(email.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-white/90">{email.subject}</div>
                      <div className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">
                        {email.snippet}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right 1/3: Draft Legal Correspondence */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#EA4335]" />
                  <h3 className="font-semibold text-white text-sm">Draft Pro Se Inquiry</h3>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Compose formal email inquiries to the court reporter or prosecutor. Safeguarded by mandatory human review before draft creation.
                </p>

                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 block mb-1">To</label>
                    <input
                      type="text"
                      value={draftRecipient}
                      onChange={(e) => setDraftRecipient(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#EA4335]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 block mb-1">Subject</label>
                    <input
                      type="text"
                      value={draftSubject}
                      onChange={(e) => setDraftSubject(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#EA4335]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-white/40 block mb-1">Body Text</label>
                    <textarea
                      rows={4}
                      value={draftBody}
                      onChange={(e) => setDraftBody(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#EA4335] leading-relaxed resize-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                {!user ? (
                  <button
                    onClick={handleSignIn}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium border border-white/10 flex items-center justify-center gap-2 transition"
                  >
                    <Lock className="w-3.5 h-3.5" /> Sign in to Save Draft
                  </button>
                ) : showSendConfirmation ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
                    <div className="text-amber-300 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      Confirm Draft Creation in Gmail
                    </div>
                    <p className="text-[11px] text-white/70">
                      This will create a draft in your Gmail account for your review. (No email is sent automatically).
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleCreateDraft}
                        disabled={isDraftingEmail}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition"
                      >
                        {isDraftingEmail ? "Saving..." : "Confirm & Save"}
                      </button>
                      <button
                        onClick={() => setShowSendConfirmation(false)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSendConfirmation(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#EA4335]/80 hover:bg-[#EA4335] text-white text-xs font-semibold shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    Save Draft to Gmail
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. GOOGLE DRIVE & DOCS VIEW */}
      {/* ======================================================== */}
      {activeTab === "drive" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Card: Google Docs Exporter */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#4285F4]" />
                <h3 className="font-semibold text-white text-sm">Export Court Motion to Google Docs</h3>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Export the AI-drafted <strong className="text-white">Motion for Discovery & Body-Cam Production</strong> directly into a fresh Google Doc formatted with legal captions.
              </p>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 font-mono text-[11px] text-white/80 space-y-1">
                <div><strong>Court:</strong> {courtName}</div>
                <div><strong>Case:</strong> {caseNumber}</div>
                <div><strong>Doc:</strong> Motion for Discovery Production</div>
              </div>
            </div>

            <div className="pt-2">
              {!user ? (
                <button
                  onClick={handleSignIn}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium border border-white/10 flex items-center justify-center gap-2 transition"
                >
                  <Lock className="w-3.5 h-3.5" /> Sign in to Export to Google Docs
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleExportMotionToDocs}
                    disabled={isExportingDoc}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#4285F4]/80 hover:bg-[#4285F4] text-white text-xs font-semibold shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isExportingDoc ? "Formatting & Creating Google Doc..." : "Create Legal Pleading in Google Docs"}
                  </button>

                  {exportedDoc && (
                    <a
                      href={exportedDoc.docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between hover:bg-emerald-500/20 transition group"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-medium">Open "{exportedDoc.title}" in Google Docs</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Card: Google Drive Case Records */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="font-semibold text-white text-sm">Google Drive Case Records</h3>
                </div>
                {user && (
                  <button
                    onClick={() => token && loadDriveFiles(token, driveSearchQuery)}
                    disabled={isFetchingFiles}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
                    title="Refresh Drive files"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingFiles ? "animate-spin" : ""}`} />
                  </button>
                )}
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Browse discovery packets, police report scans, or witness statements directly from your personal Google Drive account.
              </p>

              {user && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search files in Google Drive..."
                    value={driveSearchQuery}
                    onChange={(e) => {
                      setDriveSearchQuery(e.target.value);
                      if (token) loadDriveFiles(token, e.target.value);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-black/40 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              )}
            </div>

            <div className="pt-2">
              {!user ? (
                <button
                  onClick={handleSignIn}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium border border-white/10 flex items-center justify-center gap-2 transition"
                >
                  <Lock className="w-3.5 h-3.5" /> Sign in to Browse Drive Files
                </button>
              ) : driveFiles.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-white/50">
                  {isFetchingFiles ? "Scanning Google Drive..." : "No matching court files found in Google Drive."}
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {driveFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 flex items-center justify-between transition"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileText className="w-4 h-4 text-[#D4AF37] shrink-0" />
                        <div className="truncate">
                          <div className="text-xs font-medium text-white truncate">{file.name}</div>
                          <div className="text-[10px] text-white/40">
                            {new Date(file.modifiedTime).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => showNotification(`Imported "${file.name}" into Acquit Case Workspace.`)}
                        className="px-2 py-1 rounded-lg bg-[#174E48]/80 hover:bg-[#174E48] text-[#D4AF37] text-[10px] font-semibold flex items-center gap-1 transition shrink-0 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" /> Import
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
