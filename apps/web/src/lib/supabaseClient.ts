/**
 * Chain of Command Client-Side Supabase Client & Realtime Engine
 *
 * Browser client. Uses the public anon key only. RLS still applies.
 */

import { createClient, SupabaseClient, User, Session, RealtimeChannel } from "@supabase/supabase-js";

const PROJECT_REF = "othxichdhzdxgtatautb";
const PROJECT_URL = `https://${PROJECT_REF}.supabase.co`;
// Public anon key for this project. Safe in the browser. Not the service role.
const PROJECT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aHhpY2hkaHpkeGd0YXRhdXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDA5NTIsImV4cCI6MjA5NjMxNjk1Mn0.FGYkAsb1nLOB1oTy4crS0mmtzRJ6Od98YlZkGhZdfiA";

function usableUrl(value: string | undefined): string {
  const v = (value || "").trim().replace(/^["']|["']$/g, "");
  if (!v || v.includes("fc3a93f4") || v.includes("localhost")) return "";
  return v;
}

function usableAnonKey(value: string | undefined): string {
  const v = (value || "").trim().replace(/^["']|["']$/g, "");
  if (!v || /mock|your-anon|acquit-platform|placeholder/i.test(v)) return "";
  if (v.startsWith("sb_publishable_")) return v;
  if (!v.startsWith("eyJ")) return "";
  try {
    const json = atob(v.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as { ref?: string; role?: string };
    if (payload.ref === PROJECT_REF && payload.role === "anon") return v;
  } catch {
    return "";
  }
  return "";
}

const SUPABASE_URL =
  usableUrl(typeof import.meta !== "undefined" ? (import.meta as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL : undefined) ||
  usableUrl(typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined) ||
  usableUrl(typeof process !== "undefined" ? process.env.VITE_SUPABASE_URL : undefined) ||
  PROJECT_URL;

const SUPABASE_ANON_KEY =
  usableAnonKey(typeof import.meta !== "undefined" ? (import.meta as { env?: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY : undefined) ||
  usableAnonKey(typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined) ||
  usableAnonKey(typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY : undefined) ||
  usableAnonKey(typeof process !== "undefined" ? process.env.VITE_SUPABASE_ANON_KEY : undefined) ||
  PROJECT_ANON_KEY;

let browserSupabaseInstance: SupabaseClient | null = null;

/**
 * Initializes or retrieves the singleton client-side Supabase client.
 * Configured for persistent local auth storage, auto-refreshing tokens,
 * and browser Realtime channels.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!browserSupabaseInstance) {
    browserSupabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "acquit_supabase_auth_token",
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });

    if (typeof window !== "undefined") {
      (window as unknown as { acquitSupabase?: SupabaseClient }).acquitSupabase = browserSupabaseInstance;
    }
  }

  return browserSupabaseInstance;
}

export const supabase = getSupabaseClient();

/**
 * Litigant Client-Side Authentication Service
 */
export const litigantAuth = {
  async getSession(): Promise<Session | null> {
    const client = getSupabaseClient();
    const { data } = await client.auth.getSession();
    return data.session;
  },

  async getUser(): Promise<User | null> {
    const client = getSupabaseClient();
    const { data } = await client.auth.getUser();
    return data.user;
  },

  async signInWithEmail(email: string, password: string) {
    const client = getSupabaseClient();
    return await client.auth.signInWithPassword({ email, password });
  },

  async signUp(email: string, password: string, metadata?: Record<string, unknown>) {
    const client = getSupabaseClient();
    return await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: "pro_se",
          is_pro_se: true,
          ...metadata,
        },
      },
    });
  },

  async signOut() {
    const client = getSupabaseClient();
    return await client.auth.signOut();
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const client = getSupabaseClient();
    return client.auth.onAuthStateChange(callback);
  },
};

export const clientCaseData = {
  async fetchUserMatters(userId?: string) {
    const client = getSupabaseClient();
    let query = client.from("matters").select("*").order("created_at", { ascending: false });
    if (userId) {
      query = query.eq("user_id", userId);
    }
    const { data, error } = await query;
    if (error) {
      console.warn("[Supabase Client] fetchUserMatters notice:", error.message);
      return [];
    }
    return data || [];
  },

  async fetchTimelineEvents(matterId: string) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("timeline_events")
      .select("*")
      .eq("matter_id", matterId)
      .order("event_date", { ascending: true });

    if (error) {
      console.warn("[Supabase Client] fetchTimelineEvents notice:", error.message);
      return [];
    }
    return data || [];
  },

  async searchAuthorities(queryTerm: string, jurisdiction?: string) {
    const client = getSupabaseClient();
    let query = client.from("authorities").select("*").limit(25);
    if (queryTerm) {
      query = query.or(`title.ilike.%${queryTerm}%,citation.ilike.%${queryTerm}%`);
    }
    if (jurisdiction && jurisdiction !== "all") {
      query = query.ilike("court", `%${jurisdiction}%`);
    }
    const { data, error } = await query;
    if (error) {
      console.warn("[Supabase Client] searchAuthorities notice:", error.message);
      return [];
    }
    return data || [];
  },

  subscribeToMatterUpdates(
    matterId: string,
    onUpdate: (payload: unknown) => void
  ): RealtimeChannel {
    const client = getSupabaseClient();
    const channelName = `realtime-matter-${matterId}`;

    return client
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matters",
          filter: `id=eq.${matterId}`,
        },
        (payload) => {
          onUpdate(payload);
        }
      )
      .subscribe();
  },
};
