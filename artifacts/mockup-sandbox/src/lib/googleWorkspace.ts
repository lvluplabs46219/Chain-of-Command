import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  type User,
  type Auth,
} from "firebase/auth";
import firebaseConfig from "../../../../firebase-applet-config.json";

export const GOOGLE_WORKSPACE_SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/documents.readonly",
];

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);

const provider = new GoogleAuthProvider();
GOOGLE_WORKSPACE_SCOPES.forEach((scope) => {
  provider.addScope(scope);
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to retrieve Google OAuth access token.");
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Google Sign-In Error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getGoogleAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleLogout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
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

// List case files from user's Google Drive
export async function listDriveFiles(
  accessToken: string,
  query?: string
): Promise<GoogleDriveFile[]> {
  try {
    const qParts = ["trashed = false"];
    if (query) {
      qParts.push(`name contains '${query.replace(/'/g, "\\'")}'`);
    }

    const url = new URL("https://www.googleapis.com/drive/v3/files");
    url.searchParams.set("q", qParts.join(" and "));
    url.searchParams.set("fields", "files(id, name, mimeType, modifiedTime, size, iconLink, webViewLink)");
    url.searchParams.set("pageSize", "20");
    url.searchParams.set("orderBy", "modifiedTime desc");

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Google Drive API error: ${res.statusText}`);
    }

    const data = (await res.json()) as { files?: GoogleDriveFile[] };
    return data.files || [];
  } catch (err) {
    console.error("Fetch Drive files error:", err);
    throw err;
  }
}

// Create a new Google Doc formatted with legal court caption and body text
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
  try {
    // 1. Create empty document
    const createRes = await fetch("https://docs.googleapis.com/v1/documents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title || "Court Pleading - Acquit Draft",
      }),
    });

    if (!createRes.ok) {
      throw new Error(`Google Docs creation error: ${createRes.statusText}`);
    }

    const doc = (await createRes.json()) as { documentId: string; title: string };
    const docId = doc.documentId;

    // 2. Insert structured legal text formatting
    const formattedText = 
`${courtCaption.court.toUpperCase()}
CASE NO. ${courtCaption.caseNumber}

${courtCaption.caption}

-------------------------------------------------------------------------------
${courtCaption.documentTitle.toUpperCase()}
-------------------------------------------------------------------------------

${courtCaption.bodyContent}

Respectfully submitted,

____________________________
Alex Thompson (Pro Se Litigant)
Self-Represented Litigant
Generated via Acquit.ai Legal Workspace
`;

    const updateRes = await fetch(
      `https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: formattedText,
              },
            },
          ],
        }),
      }
    );

    if (!updateRes.ok) {
      console.warn("Docs batchUpdate format warning:", await updateRes.text());
    }

    return {
      documentId: docId,
      docUrl: `https://docs.google.com/document/d/${docId}/edit`,
      title: doc.title,
    };
  } catch (err) {
    console.error("Create Google Doc error:", err);
    throw err;
  }
}
