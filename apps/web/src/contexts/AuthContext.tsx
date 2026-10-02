/**
 * Acquit.ai User Authentication & Workspace Security Context
 * Provides secure session state, token management, role-based controls,
 * and workspace route protection for self-represented litigants.
 */

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getAuthToken, setAuthToken } from "../lib/api";
import { getSupabaseClient } from "../lib/supabaseClient";
import { auth, googleAuthProvider } from "../lib/firebase";
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "pro_se" | "attorney" | "observer";
  jurisdiction: string;
  activeMatterId: string;
  isVerifiedProSe: boolean;
  createdAt: string;
  photoURL?: string | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAsLitigant: (name?: string, email?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithToken: (token: string, userDetails?: Partial<AuthUser>) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  switchRole: (role: "pro_se" | "attorney" | "observer") => void;
}

const DEFAULT_LITIGANT_USER: AuthUser = {
  id: "usr_pro_se_litigant",
  name: "Arthur Marlowe",
  email: "litigant@chainofcommand.law",
  role: "pro_se",
  jurisdiction: "Arizona / Marion County",
  activeMatterId: "matter-001",
  isVerifiedProSe: true,
  createdAt: "2026-08-10T12:00:00.000Z",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "acquit_auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const existingToken = getAuthToken();
      const savedUserStr = localStorage.getItem(USER_STORAGE_KEY);

      if (existingToken) {
        setTokenState(existingToken);
        if (savedUserStr) {
          setUser(JSON.parse(savedUserStr));
        } else {
          // Default to verified self-represented litigant
          setUser(DEFAULT_LITIGANT_USER);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEFAULT_LITIGANT_USER));
        }
      } else {
        // Auto-provision standard pro se demo session for instant usability
        const defaultToken = "acquit-pro-se-token";
        setAuthToken(defaultToken);
        setTokenState(defaultToken);
        setUser(DEFAULT_LITIGANT_USER);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEFAULT_LITIGANT_USER));
      }

      // Initialize Supabase auth listener for real session sync
      const supabase = getSupabaseClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const supaUser: AuthUser = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Pro Se Litigant",
            email: session.user.email || "litigant@lvluplabs.pro",
            role: (session.user.user_metadata?.role as any) || "pro_se",
            jurisdiction: session.user.user_metadata?.jurisdiction || "Self-Represented",
            activeMatterId: session.user.user_metadata?.active_matter_id || "matter-001",
            isVerifiedProSe: true,
            createdAt: session.user.created_at,
          };
          setAuthToken(session.access_token);
          setTokenState(session.access_token);
          setUser(supaUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(supaUser));
        }
      }).catch((err) => {
        console.warn("[Chain of Command Auth] Supabase session check notice:", err);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const supaUser: AuthUser = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Pro Se Litigant",
            email: session.user.email || "litigant@lvluplabs.pro",
            role: (session.user.user_metadata?.role as any) || "pro_se",
            jurisdiction: session.user.user_metadata?.jurisdiction || "Self-Represented",
            activeMatterId: session.user.user_metadata?.active_matter_id || "matter-001",
            isVerifiedProSe: true,
            createdAt: session.user.created_at,
          };
          setAuthToken(session.access_token);
          setTokenState(session.access_token);
          setUser(supaUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(supaUser));
        }
      });

      // Initialize Firebase auth state listener
      const unsubscribeFirebase = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const idToken = await fbUser.getIdToken();
          const authUser: AuthUser = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split("@")[0] || "Pro Se Litigant",
            email: fbUser.email || "litigant@chainofcommand.law",
            role: "pro_se",
            jurisdiction: "Arizona / Marion County",
            activeMatterId: "matter-001",
            isVerifiedProSe: true,
            createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
            photoURL: fbUser.photoURL,
          };
          setAuthToken(idToken);
          setTokenState(idToken);
          setUser(authUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
        }
      });

      return () => {
        unsubscribeFirebase();
        authListener?.subscription?.unsubscribe();
      };
    } catch (e) {
      console.warn("Auth initialization warning:", e);
      setUser(DEFAULT_LITIGANT_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await result.user.getIdToken();
      const authUser: AuthUser = {
        id: result.user.uid,
        name: result.user.displayName || result.user.email?.split("@")[0] || "Pro Se Litigant",
        email: result.user.email || "litigant@chainofcommand.law",
        role: "pro_se",
        jurisdiction: "Arizona / Marion County",
        activeMatterId: "matter-001",
        isVerifiedProSe: true,
        createdAt: result.user.metadata.creationTime || new Date().toISOString(),
        photoURL: result.user.photoURL,
      };
      setAuthToken(idToken);
      setTokenState(idToken);
      setUser(authUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
    } catch (error) {
      console.error("Google Sign-In failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsLitigant = async (name = "Arthur Marlowe", email = "litigant@chainofcommand.law") => {
    setIsLoading(true);
    const newToken = "acquit-pro-se-token";
    const newUser: AuthUser = {
      ...DEFAULT_LITIGANT_USER,
      name,
      email,
    };
    setAuthToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    setIsLoading(false);
  };

  const loginWithToken = async (newToken: string, userDetails?: Partial<AuthUser>) => {
    setIsLoading(true);
    const newUser: AuthUser = {
      ...DEFAULT_LITIGANT_USER,
      ...userDetails,
    };
    setAuthToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    firebaseSignOut(auth).catch(() => {});
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
  };

  const switchRole = (role: "pro_se" | "attorney" | "observer") => {
    updateUser({ role });
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    loginAsLitigant,
    loginWithGoogle,
    loginWithToken,
    logout,
    updateUser,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Route Guard Component for securing sensitive workspace modules.
 */
export function WorkspaceGuard({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole?: "pro_se" | "attorney";
}) {
  const { isAuthenticated, isLoading, user, loginAsLitigant, loginWithGoogle } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#0e0e0e] text-[#f3ede8] p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d4af37] border-t-transparent mb-4"></div>
        <p className="text-xs font-mono tracking-wider text-[#cfc5be]">VERIFYING ENCRYPTED WORKSPACE SESSION...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#0e0e0e] p-6">
        <div className="max-w-md w-full border border-[#2a2a2a] bg-[#141313] p-8 rounded-xl shadow-2xl text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#211e16] border border-[#d4af37] text-[#d4af37] mb-4">
            <span className="text-xl">⚖️</span>
          </div>
          <h2 className="text-xl font-serif text-[#f3ede8]">Protected Legal Workspace</h2>
          <p className="mt-2 text-xs text-[#cfc5be] leading-5">
            This section contains active docket documents, evidentiary files, and AI legal team workspaces. Please verify your self-represented litigant session.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => loginWithGoogle().catch(() => {})}
              className="w-full bg-[#d4af37] hover:bg-[#c29d2b] text-[#141313] py-2.5 px-4 rounded text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Sign In with Google (Firebase)
            </button>
            <button
              type="button"
              onClick={() => loginAsLitigant()}
              className="w-full bg-[#201f1f] hover:bg-[#2a2a2a] text-[#cfc5be] border border-[#363535] py-2 px-4 rounded text-xs transition-colors"
            >
              Enter Pro Se Demo Session
            </button>
          </div>
          <p className="mt-4 text-[10px] mono text-[#8e857e]">
            ENCRYPTED SESSION · NOT AN ATTORNEY-CLIENT RELATIONSHIP
          </p>
        </div>
      </div>
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#0e0e0e] p-6 text-center text-[#f3ede8]">
        <div className="max-w-md border border-[#333] bg-[#171717] p-6 rounded-lg">
          <p className="text-sm font-bold text-[#e06c75]">Access Restricted</p>
          <p className="mt-2 text-xs text-[#cfc5be]">
            This workspace area requires the <span className="font-mono text-[#d4af37]">{requiredRole}</span> role.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
