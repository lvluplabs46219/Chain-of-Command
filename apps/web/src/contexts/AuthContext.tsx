/**
 * Chain of Command — authentication & session context.
 * First visit: no auto-login. Returning users restore local session only.
 */

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getAuthToken, setAuthToken } from "../lib/api";
import { getSupabaseClient } from "../lib/supabaseClient";
import { auth, googleAuthProvider } from "../lib/firebase";
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";

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
  isFirstRun: boolean;
  completeFirstRun: () => void;
  loginAsLitigant: (name?: string, email?: string, jurisdiction?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithToken: (token: string, userDetails?: Partial<AuthUser>) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  switchRole: (role: "pro_se" | "attorney" | "observer") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "coc_auth_user";
const FIRST_RUN_KEY = "coc_first_run_complete";
/** Migrate away from legacy demo identity */
const LEGACY_USER_KEY = "acquit_auth_user";

function isLegacyDemoUser(u: AuthUser | null): boolean {
  if (!u) return false;
  return (
    u.id === "usr_pro_se_litigant" ||
    u.name === "Arthur Marlowe" ||
    u.email === "litigant@chainofcommand.law"
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstRun, setIsFirstRun] = useState(true);

  useEffect(() => {
    try {
      // Clear legacy demo session so first-time experience is clean
      const legacy = localStorage.getItem(LEGACY_USER_KEY);
      if (legacy) {
        try {
          const parsed = JSON.parse(legacy) as AuthUser;
          if (isLegacyDemoUser(parsed)) {
            localStorage.removeItem(LEGACY_USER_KEY);
            localStorage.removeItem(USER_STORAGE_KEY);
            setAuthToken(null);
          }
        } catch {
          localStorage.removeItem(LEGACY_USER_KEY);
        }
      }

      const firstDone = localStorage.getItem(FIRST_RUN_KEY) === "1";
      setIsFirstRun(!firstDone);

      const existingToken = getAuthToken();
      const savedUserStr = localStorage.getItem(USER_STORAGE_KEY);

      if (existingToken && savedUserStr) {
        try {
          const saved = JSON.parse(savedUserStr) as AuthUser;
          if (isLegacyDemoUser(saved)) {
            setAuthToken(null);
            localStorage.removeItem(USER_STORAGE_KEY);
            setUser(null);
            setTokenState(null);
            setIsFirstRun(true);
          } else {
            setTokenState(existingToken);
            setUser(saved);
          }
        } catch {
          setUser(null);
        }
      } else {
        // No auto-provision — wait for onboarding or login
        setUser(null);
        setTokenState(null);
      }

      const supabase = getSupabaseClient();
      supabase.auth
        .getSession()
        .then(({ data: { session } }) => {
          if (session?.user) {
            const supaUser: AuthUser = {
              id: session.user.id,
              name:
                session.user.user_metadata?.full_name ||
                session.user.email?.split("@")[0] ||
                "Pro Se Litigant",
              email: session.user.email || "",
              role: (session.user.user_metadata?.role as AuthUser["role"]) || "pro_se",
              jurisdiction: session.user.user_metadata?.jurisdiction || "Self-Represented",
              activeMatterId: session.user.user_metadata?.active_matter_id || "",
              isVerifiedProSe: true,
              createdAt: session.user.created_at,
            };
            setAuthToken(session.access_token);
            setTokenState(session.access_token);
            setUser(supaUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(supaUser));
            localStorage.setItem(FIRST_RUN_KEY, "1");
            setIsFirstRun(false);
          }
        })
        .catch((err) => {
          console.warn("[Chain of Command Auth] Supabase session check:", err);
        });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const supaUser: AuthUser = {
            id: session.user.id,
            name:
              session.user.user_metadata?.full_name ||
              session.user.email?.split("@")[0] ||
              "Pro Se Litigant",
            email: session.user.email || "",
            role: (session.user.user_metadata?.role as AuthUser["role"]) || "pro_se",
            jurisdiction: session.user.user_metadata?.jurisdiction || "Self-Represented",
            activeMatterId: session.user.user_metadata?.active_matter_id || "",
            isVerifiedProSe: true,
            createdAt: session.user.created_at,
          };
          setAuthToken(session.access_token);
          setTokenState(session.access_token);
          setUser(supaUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(supaUser));
          localStorage.setItem(FIRST_RUN_KEY, "1");
          setIsFirstRun(false);
        }
      });

      const unsubscribeFirebase = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const idToken = await fbUser.getIdToken();
          const authUser: AuthUser = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split("@")[0] || "Pro Se Litigant",
            email: fbUser.email || "",
            role: "pro_se",
            jurisdiction: "Self-Represented",
            activeMatterId: "",
            isVerifiedProSe: true,
            createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
            photoURL: fbUser.photoURL,
          };
          setAuthToken(idToken);
          setTokenState(idToken);
          setUser(authUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
          localStorage.setItem(FIRST_RUN_KEY, "1");
          setIsFirstRun(false);
        }
      });

      return () => {
        unsubscribeFirebase();
        authListener?.subscription?.unsubscribe();
      };
    } catch (e) {
      console.warn("Auth initialization warning:", e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeFirstRun = () => {
    localStorage.setItem(FIRST_RUN_KEY, "1");
    setIsFirstRun(false);
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await result.user.getIdToken();
      const authUser: AuthUser = {
        id: result.user.uid,
        name: result.user.displayName || result.user.email?.split("@")[0] || "Pro Se Litigant",
        email: result.user.email || "",
        role: "pro_se",
        jurisdiction: "Self-Represented",
        activeMatterId: "",
        isVerifiedProSe: true,
        createdAt: result.user.metadata.creationTime || new Date().toISOString(),
        photoURL: result.user.photoURL,
      };
      setAuthToken(idToken);
      setTokenState(idToken);
      setUser(authUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
      localStorage.setItem(FIRST_RUN_KEY, "1");
      setIsFirstRun(false);
    } catch (error) {
      console.error("Google Sign-In failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsLitigant = async (
    name = "Pro Se Litigant",
    email = "",
    jurisdiction = "Self-Represented"
  ) => {
    setIsLoading(true);
    const newToken = `coc-session-${crypto.randomUUID()}`;
    const newUser: AuthUser = {
      id: `usr_${crypto.randomUUID().slice(0, 8)}`,
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, ".")}@local.chainofcommand`,
      role: "pro_se",
      jurisdiction,
      activeMatterId: "",
      isVerifiedProSe: true,
      createdAt: new Date().toISOString(),
    };
    setAuthToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    localStorage.setItem(FIRST_RUN_KEY, "1");
    setIsFirstRun(false);
    setIsLoading(false);
  };

  const loginWithToken = async (newToken: string, userDetails?: Partial<AuthUser>) => {
    setIsLoading(true);
    const newUser: AuthUser = {
      id: userDetails?.id || `usr_${crypto.randomUUID().slice(0, 8)}`,
      name: userDetails?.name || "Pro Se Litigant",
      email: userDetails?.email || "",
      role: userDetails?.role || "pro_se",
      jurisdiction: userDetails?.jurisdiction || "Self-Represented",
      activeMatterId: userDetails?.activeMatterId || "",
      isVerifiedProSe: userDetails?.isVerifiedProSe ?? true,
      createdAt: userDetails?.createdAt || new Date().toISOString(),
      photoURL: userDetails?.photoURL,
    };
    setAuthToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    localStorage.setItem(FIRST_RUN_KEY, "1");
    setIsFirstRun(false);
    setIsLoading(false);
  };

  const logout = () => {
    firebaseSignOut(auth).catch(() => {});
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    // Keep first-run complete so logout returns to login, not full wizard
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const switchRole = (role: "pro_se" | "attorney" | "observer") => {
    updateUser({ role });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        isFirstRun,
        completeFirstRun,
        loginAsLitigant,
        loginWithGoogle,
        loginWithToken,
        logout,
        updateUser,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
