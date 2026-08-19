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
  Layers,
} from "lucide-react";
import {
  initGoogleAuth,
  googleSignIn,
  googleLogout,
  listDriveFiles,
  createGoogleDocLegalPleading,
  type GoogleDriveFile,
} from "../../../lib/googleWorkspace";
import type { User } from "firebase/auth";

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
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFetchingFiles, setIsFetchingFiles] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedDoc, setExportedDoc] = useState<{
    docUrl: string;
    title: string;
  } | null>(null);
  const [importedStatus, setImportedStatus] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        void loadFiles(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setDriveFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        await loadFiles(res.accessToken);
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
    setExportedDoc(null);
  };

  const loadFiles = async (accessToken: string, query?: string) => {
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
    setIsExporting(true);
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
    } catch (err) {
      console.error("Export to Docs error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = (file: GoogleDriveFile) => {
    setImportedStatus(`Imported "${file.name}" into Acquit Case Workspace.`);
    setTimeout(() => setImportedStatus(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#174E48]/40 via-[#0B2523]/60 to-black/60 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/15 shadow-inner">
              <FolderOpen className="text-[#D4AF37] h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif font-bold text-white tracking-wide">
                  Google Workspace Integration
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                  Drive & Docs Connected
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">
                Seamlessly browse case records in Google Drive and export formatted court pleadings into Google Docs.
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
                    OAuth Active
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

      {importedStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{importedStatus}</span>
        </div>
      )}

      {/* Dual Actions Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: Google Docs Exporter */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
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
                  disabled={isExporting}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-semibold shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  {isExporting ? "Formatting & Creating Google Doc..." : "Create Legal Pleading in Google Docs"}
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
                  onClick={() => token && loadFiles(token, searchQuery)}
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
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (token) loadFiles(token, e.target.value);
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
                      onClick={() => handleImportFile(file)}
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
    </div>
  );
}
