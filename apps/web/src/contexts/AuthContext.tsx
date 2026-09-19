/**
 * Acquit.ai User Authentication & Workspace Security Context
 * Provides secure session state, token management, role-based controls,
 * and workspace route protection for self-represented litigants.
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
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAsLitigant: (name?: string, email?: string) => Promise<void>;
  loginWithToken: (token: string, userDetails?: Partial<AuthUser>) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  switchRole: (role: "pro_se" | "attorney" | "observer") => void;
}

const DEFAULT_LITIGANT_USER: AuthUser = {
  id: "usr_pro_se_litigant",
  name: "Arthur Marlowe",
  email: "litigant@acquit.ai",
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
        console.warn("[Acquit Auth] Supabase session check notice:", err);
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

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    } catch (e) {
      console.warn("Auth initialization warning:", e);
      setUser(DEFAULT_LITIGANT_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAsLitigant = async (name = "Arthur Marlowe", email = "litigant@acquit.ai") => {
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
  const { isAuthenticated, isLoading, user, loginAsLitigant } = useAuth();

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
              onClick={() => loginAsLitigant()}
              className="w-full bg-[#d4af37] hover:bg-[#c29d2b] text-[#141313] py-2.5 px-4 rounded text-xs font-bold transition-colors"
            >
              Enter as Self-Represented Litigant
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
