/**
 * Chain of Command — Auth context (Supabase-only for API credentials).
 * ADR-001: Firebase is not an API identity provider.
 */

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getAuthToken, setAuthToken } from "../lib/api";
import { getSupabaseClient } from "../lib/supabaseClient";

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

function isDemoToken(token: string): boolean {
  return (
    token === "acquit-pro-se-token" ||
    token.startsWith("demo-token") ||
    token.startsWith("mock-token") ||
    token.startsWith("dev-token") ||
    token.startsWith("coc-session-")
  );
}

function allowDemoAuth(): boolean {
  const isProd =
    typeof process !== "undefined" && process.env.NODE_ENV === "production";
  if (isProd) return false;
  return process.env.NEXT_PUBLIC_ALLOW_DEMO_AUTH !== "false";
}

function sessionToUser(sessionUser: {
  id: string;
  email?: string | null;
  created_at?: string;
  user_metadata?: Record<string, unknown>;
}): AuthUser {
  const meta = sessionUser.user_metadata || {};
  return {
    id: sessionUser.id,
    name:
      (meta.full_name as string) ||
      (meta.name as string) ||
      sessionUser.email?.split("@")[0] ||
      "Pro Se Litigant",
    email: sessionUser.email || "litigant@chainofcommand.law",
    role: ((meta.role as string) as AuthUser["role"]) || "pro_se",
    jurisdiction: (meta.jurisdiction as string) || "Self-Represented",
    activeMatterId: (meta.active_matter_id as string) || "matter-001",
    isVerifiedProSe: true,
    createdAt: sessionUser.created_at || new Date().toISOString(),
    photoURL: (meta.avatar_url as string) || (meta.picture as string) || null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      const existingToken = getAuthToken();
      const savedUserStr = localStorage.getItem(USER_STORAGE_KEY);

      if (existingToken) {
        if (isDemoToken(existingToken) && !allowDemoAuth()) {
          setAuthToken(null);
          localStorage.removeItem(USER_STORAGE_KEY);
        } else {
          setTokenState(existingToken);
          if (savedUserStr) {
            setUser(JSON.parse(savedUserStr));
          } else if (allowDemoAuth() && isDemoToken(existingToken)) {
            setUser(DEFAULT_LITIGANT_USER);
          }
        }
      }

      const supabase = getSupabaseClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user && session.access_token) {
          const supaUser = sessionToUser(session.user);
          setAuthToken(session.access_token);
          setTokenState(session.access_token);
          setUser(supaUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(supaUser));
        }
      }).catch((err) => {
        console.warn("[Auth] Supabase session check:", err);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session?.user && session.access_token) {
            const supaUser = sessionToUser(session.user);
            setAuthToken(session.access_token);
            setTokenState(session.access_token);
            setUser(supaUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(supaUser));
          } else if (_event === "SIGNED_OUT") {
            setAuthToken(null);
            setTokenState(null);
            setUser(null);
            localStorage.removeItem(USER_STORAGE_KEY);
          }
        }
      );
      unsub = () => authListener?.subscription?.unsubscribe();
    } catch (e) {
      console.warn("[Auth] init warning:", e);
    } finally {
      setIsLoading(false);
    }
    return () => unsub?.();
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Supabase Google sign-in failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsLitigant = async (
    name = "Arthur Marlowe",
    email = "litigant@chainofcommand.law"
  ) => {
    if (!allowDemoAuth()) {
      throw new Error(
        "Demo pro se sessions are disabled. Sign in with Supabase Auth (ADR-001)."
      );
    }
    setIsLoading(true);
    const newToken = `coc-session-${
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now())
    }`;
    const newUser: AuthUser = { ...DEFAULT_LITIGANT_USER, name, email };
    setAuthToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    setIsLoading(false);
  };

  const loginWithToken = async (
    newToken: string,
    userDetails?: Partial<AuthUser>
  ) => {
    setIsLoading(true);
    const newUser: AuthUser = { ...DEFAULT_LITIGANT_USER, ...userDetails };
    setAuthToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    try {
      getSupabaseClient().auth.signOut().catch(() => {});
    } catch {
      /* ignore */
    }
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

export function WorkspaceGuard({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole?: "pro_se" | "attorney";
}) {
  const { isAuthenticated, isLoading, user, loginAsLitigant, loginWithGoogle } =
    useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#0e0e0e] text-[#f3ede8] p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d4af37] border-t-transparent mb-4" />
        <p className="text-xs font-mono tracking-wider text-[#cfc5be]">
          VERIFYING WORKSPACE SESSION...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#0e0e0e] p-6">
        <div className="max-w-md w-full border border-[#2a2a2a] bg-[#141313] p-8 rounded-xl shadow-2xl text-center">
          <h2 className="text-xl font-serif text-[#f3ede8]">Protected Legal Workspace</h2>
          <p className="mt-2 text-xs text-[#cfc5be] leading-5">
            Sign in with Supabase Auth. Demo sessions are development-only (ADR-001).
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => loginWithGoogle().catch(() => {})}
              className="w-full bg-[#d4af37] hover:bg-[#c29d2b] text-[#141313] py-2.5 px-4 rounded text-xs font-bold"
            >
              Sign In with Google (Supabase)
            </button>
            <button
              type="button"
              onClick={() => loginAsLitigant().catch((e) => alert(String(e.message || e)))}
              className="w-full bg-[#201f1f] hover:bg-[#2a2a2a] text-[#cfc5be] border border-[#363535] py-2 px-4 rounded text-xs"
            >
              Enter Pro Se Demo Session (dev)
            </button>
          </div>
          <p className="mt-4 text-[10px] font-mono text-[#8e857e]">
            NOT AN ATTORNEY-CLIENT RELATIONSHIP
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
            Requires role <span className="font-mono text-[#d4af37]">{requiredRole}</span>.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
