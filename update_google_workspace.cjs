const fs = require('fs');
const path = 'artifacts/mockup-sandbox/src/components/mockups/acquit-case-workspace/GoogleWorkspaceIntegration.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacementTypes = `
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
`;

content = content.replace(/import \{[\s\S]*?from "\.\.\/\.\.\/\.\.\/lib\/googleWorkspace";/, replacementTypes);

fs.writeFileSync(path, content);
