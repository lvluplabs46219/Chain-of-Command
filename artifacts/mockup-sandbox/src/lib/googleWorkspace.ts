/**
 * Acquit.ai Google Workspace Integration Utilities
 * 
 * Provides client-side helpers, interfaces, and state management for
 * Google Drive, Docs, Calendar, and Gmail synchronization.
 */

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
  documentType: "Motion to Suppress" | "Notice of Appearance" | "Discovery Request" | "Witness List" | "Brief in Support";
  lastEditedBy: string;
  lastEditedTime: string;
  docUrl: string;
  status: "Draft (AI Assisted)" | "Human Review Required" | "Ready for Filing";
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
  urgency: "High" | "Medium" | "Critical";
  syncStatus: "Synchronized" | "Pending";
}

export interface GmailThreadLog {
  id: string;
  subject: string;
  sender: string;
  recipient: string;
  date: string;
  snippet: string;
  category: "Court Clerk" | "Prosecution" | "Public Defender" | "Judicial Notice";
}

export interface WorkspaceSyncState {
  isConnected: boolean;
  userEmail: string | null;
  lastSyncedAt: string | null;
  driveFolderId: string | null;
  calendarId: string | null;
  activeScopes: string[];
}

export const INITIAL_SYNC_STATE: WorkspaceSyncState = {
  isConnected: true,
  userEmail: "alex.thompson.defense@gmail.com",
  lastSyncedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  driveFolderId: "1A2B3C4D5E_Acquit_State_v_Thompson",
  calendarId: "primary",
  activeScopes: [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/calendar.events",
  ],
};

export const INITIAL_DRIVE_FILES: GoogleDriveItem[] = [
  {
    id: "gdrive_001",
    name: "01_Information_and_Charging_Affidavit.pdf",
    mimeType: "application/pdf",
    size: "2.4 MB",
    modifiedTime: "2026-08-11T14:20:00Z",
    webViewLink: "https://drive.google.com/file/d/01_Information_and_Charging_Affidavit/view",
    category: "Pleadings",
    status: "synced",
  },
  {
    id: "gdrive_002",
    name: "02_Officer_Martinez_Incident_Report_402.pdf",
    mimeType: "application/pdf",
    size: "1.1 MB",
    modifiedTime: "2026-08-12T09:15:00Z",
    webViewLink: "https://drive.google.com/file/d/02_Officer_Martinez_Incident_Report_402/view",
    category: "Discovery",
    status: "synced",
  },
  {
    id: "gdrive_003",
    name: "03_Retail_Store_CCTV_Timestamp_Log.pdf",
    mimeType: "application/pdf",
    size: "840 KB",
    modifiedTime: "2026-08-14T11:45:00Z",
    webViewLink: "https://drive.google.com/file/d/03_Retail_Store_CCTV_Timestamp_Log/view",
    category: "Evidence",
    status: "synced",
  },
  {
    id: "gdrive_004",
    name: "04_Miranda_Warning_Audio_Transcript.docx",
    mimeType: "application/vnd.google-apps.document",
    size: "420 KB",
    modifiedTime: "2026-08-16T16:00:00Z",
    webViewLink: "https://docs.google.com/document/d/04_Miranda_Warning_Audio_Transcript/edit",
    category: "Transcripts",
    status: "synced",
  },
  {
    id: "gdrive_005",
    name: "05_Notice_of_Pretrial_Conference.pdf",
    mimeType: "application/pdf",
    size: "310 KB",
    modifiedTime: "2026-08-18T10:30:00Z",
    webViewLink: "https://drive.google.com/file/d/05_Notice_of_Pretrial_Conference/view",
    category: "Court Notices",
    status: "synced",
  },
];

export const INITIAL_DOC_DRAFTS: GoogleDocDraft[] = [
  {
    id: "gdoc_001",
    title: "Draft Motion to Suppress Evidence - Warrantless Search",
    documentType: "Motion to Suppress",
    lastEditedBy: "Acquit AI Drafting Agent (reviewed by Alex Thompson)",
    lastEditedTime: "2026-08-20T18:45:00Z",
    docUrl: "https://docs.google.com/document/d/draft_motion_to_suppress/edit",
    status: "Human Review Required",
    wordCount: 1420,
  },
  {
    id: "gdoc_002",
    title: "Pro Se Notice of Appearance & Preservation of Rights",
    documentType: "Notice of Appearance",
    lastEditedBy: "Alex Thompson (Pro Se)",
    lastEditedTime: "2026-08-15T11:20:00Z",
    docUrl: "https://docs.google.com/document/d/pro_se_notice_of_appearance/edit",
    status: "Ready for Filing",
    wordCount: 580,
  },
  {
    id: "gdoc_003",
    title: "Motion for Discovery & Inspection under Ind. R. Crim. P. 2.5",
    documentType: "Discovery Request",
    lastEditedBy: "Paralegal AI Agent",
    lastEditedTime: "2026-08-19T14:10:00Z",
    docUrl: "https://docs.google.com/document/d/motion_for_discovery/edit",
    status: "Draft (AI Assisted)",
    wordCount: 1105,
  },
];

export const INITIAL_CALENDAR_EVENTS: GoogleCalendarHearing[] = [
  {
    id: "gcal_001",
    summary: "Pretrial Conference - State v. Thompson",
    description: "Initial pretrial conference regarding discovery compliance and omnibus date scheduling.",
    startDateTime: "2026-10-12T09:00:00",
    endDateTime: "2026-10-12T10:30:00",
    location: "Marion County Superior Court, Criminal Division 3",
    courtroom: "Courtroom 302, 3rd Floor",
    judge: "Hon. Sarah Jenkins",
    urgency: "Critical",
    syncStatus: "Synchronized",
  },
  {
    id: "gcal_002",
    summary: "Discovery Response Cutoff Deadline",
    description: "Statutory deadline for prosecution and defense to exchange witness lists and tangible exhibits.",
    startDateTime: "2026-09-28T17:00:00",
    endDateTime: "2026-09-28T17:00:00",
    location: "E-Filing Portal / Marion County Clerk",
    courtroom: "Online Filing",
    judge: "Hon. Sarah Jenkins",
    urgency: "High",
    syncStatus: "Synchronized",
  },
  {
    id: "gcal_003",
    summary: "Motion to Suppress Hearing",
    description: "Evidentiary hearing on Defense Motion to Suppress Store Surveillance Video Footage.",
    startDateTime: "2026-11-04T13:30:00",
    endDateTime: "2026-11-04T15:00:00",
    location: "Marion County Superior Court, Criminal Division 3",
    courtroom: "Courtroom 302, 3rd Floor",
    judge: "Hon. Sarah Jenkins",
    urgency: "High",
    syncStatus: "Synchronized",
  },
];

export const INITIAL_GMAIL_LOGS: GmailThreadLog[] = [
  {
    id: "gmail_001",
    subject: "Notice of Appearance Recorded - Cause No. IN-MAR-24-0187",
    sender: "clerk.criminal@marioncounty.gov",
    recipient: "alex.thompson.defense@gmail.com",
    date: "2026-08-16 10:12 AM",
    snippet: "Your Pro Se Notice of Appearance has been officially timestamped and added to the public docket...",
    category: "Court Clerk",
  },
  {
    id: "gmail_002",
    subject: "State's Initial Discovery Production - Link & Password",
    sender: "deputy.prosecutor.evans@marionprosecutor.org",
    recipient: "alex.thompson.defense@gmail.com",
    date: "2026-08-17 04:45 PM",
    snippet: "Pursuant to local discovery rules, attached please find the State's witness list and cloud vault access link...",
    category: "Prosecution",
  },
  {
    id: "gmail_003",
    subject: "Self-Representation Resource Advisory from Pro Se Assistance Project",
    sender: "helpdesk@indianalegalhelp.org",
    recipient: "alex.thompson.defense@gmail.com",
    date: "2026-08-18 01:20 PM",
    snippet: "Attached are standard criminal courtroom procedural guidelines and hearing preparation worksheets...",
    category: "Court Clerk",
  },
];
