// Mock Google Workspace implementation (Firebase removed)
export interface User {
  displayName: string | null;
  email: string | null;
}

export const GOOGLE_WORKSPACE_SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/documents.readonly",
];

let isSigningIn = false;
let cachedAccessToken: string | null = null;
let mockUser: User | null = null;

type AuthCallback = (user: User | null) => void;
let authListener: AuthCallback | null = null;

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  authListener = (user) => {
    if (user && cachedAccessToken) {
      onAuthSuccess?.(user, cachedAccessToken);
    } else {
      onAuthFailure?.();
    }
  };
  return () => {
    authListener = null;
  };
};

export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  isSigningIn = true;
  // Mock login delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  mockUser = {
    displayName: "Alex Thompson (Pro Se)",
    email: "alex.thompson@example.com",
  };
  cachedAccessToken = "mock-google-access-token";
  
  if (authListener) {
    authListener(mockUser);
  }
  
  isSigningIn = false;
  return { user: mockUser, accessToken: cachedAccessToken };
};

export const getGoogleAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleLogout = async () => {
  mockUser = null;
  cachedAccessToken = null;
  if (authListener) {
    authListener(null);
  }
};

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  iconLink?: string;
  webViewLink?: string;
}

// Mock drive files
export async function listDriveFiles(
  accessToken: string,
  query?: string
): Promise<GoogleDriveFile[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  
  const files: GoogleDriveFile[] = [
    {
      id: "mock-1",
      name: "Incident_Report_24-99182.pdf",
      mimeType: "application/pdf",
      modifiedTime: new Date().toISOString(),
    },
    {
      id: "mock-2",
      name: "Witness_Statement_Smith.docx",
      mimeType: "application/vnd.google-apps.document",
      modifiedTime: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
  
  if (query) {
    return files.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));
  }
  
  return files;
}

export async function createGoogleDocLegalPleading(
  accessToken: string,
  title: string,
  courtCaption: {
    court: string;
    caseNumber: string;
    caption: string;
    documentTitle: string;
    bodyContent: string;
  }
): Promise<{ documentId: string; docUrl: string; title: string }> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  
  return {
    documentId: "mock-doc-id",
    docUrl: "https://docs.google.com/document/d/mock-doc-id/edit",
    title: title || "Court Pleading - Acquit Draft",
  };
}
