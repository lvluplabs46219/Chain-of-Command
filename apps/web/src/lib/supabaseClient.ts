/**
 * Acquit.ai Client-Side Supabase Client & Realtime Engine
 * 
 * Configured for direct browser execution in embeds, Canva custom HTML blocks,
 * and Cloudflare Pages / Next.js deployments.
 * 
 * Interacts directly with public Supabase REST & Realtime websocket endpoints
 * using the public Anon Key. All operations respect Row Level Security (RLS).
 */

import { createClient, SupabaseClient, User, Session, RealtimeChannel } from "@supabase/supabase-js";

// Canonical Public Supabase Config (Environment Variables or Local Fallback)
const SUPABASE_URL = 
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL)) ||
  "https://fc3a93f4-2a16-445b-b0c4-aeaf0102f0ff.supabase.co";

const SUPABASE_ANON_KEY =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY)) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjcXVpdC1wbGF0Zm9ybSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjIwMDAwMDAwMDB9.mock-anon-key-acquit-ai";

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

    // Make available on window for custom client scripts
    if (typeof window !== "undefined") {
      (window as any).acquitSupabase = browserSupabaseInstance;
    }
  }

  return browserSupabaseInstance;
}

export const supabase = getSupabaseClient();

/**
 * Litigant Client-Side Authentication Service
 */
export const litigantAuth = {
  /**
   * Get current session directly from client storage
   */
  async getSession(): Promise<Session | null> {
    const client = getSupabaseClient();
    const { data } = await client.auth.getSession();
    return data.session;
  },

  /**
   * Get current user
   */
  async getUser(): Promise<User | null> {
    const client = getSupabaseClient();
    const { data } = await client.auth.getUser();
    return data.user;
  },

  /**
   * Sign in with Email & Password
   */
  async signInWithEmail(email: string, password: string) {
    const client = getSupabaseClient();
    return await client.auth.signInWithPassword({ email, password });
  },

  /**
   * Sign up as Self-Represented Litigant
   */
  async signUp(email: string, password: string, metadata?: Record<string, any>) {
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

  /**
   * Sign out entirely on client
   */
  async signOut() {
    const client = getSupabaseClient();
    return await client.auth.signOut();
  },

  /**
   * Subscribe to auth state transitions
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const client = getSupabaseClient();
    return client.auth.onAuthStateChange(callback);
  },
};

/**
 * Client-Side Case Matters & Docket Service
 * Interacts directly with public.matters and public.legal_chunks via Supabase PostgREST
 */
export const clientCaseData = {
  /**
   * Fetch active matters for currently authenticated litigant
   */
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

  /**
   * Fetch case timeline events
   */
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

  /**
   * Fetch legal authorities and statutory citations directly
   */
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

  /**
   * Subscribe to real-time docket updates for a case
   */
  subscribeToMatterUpdates(
    matterId: string,
    onUpdate: (payload: any) => void
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
          console.log("[Supabase Realtime] Matter change received:", payload);
          onUpdate(payload);
        }
      )
      .subscribe();
  },
};
