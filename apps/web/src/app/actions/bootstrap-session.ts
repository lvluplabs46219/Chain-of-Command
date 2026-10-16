"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/server/supabaseAdmin";
import { createSupabaseServerClient } from "@/lib/server/supabaseServer";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export type BootstrapResult =
  | { ok: true; tenantId: string; matterId: string; userId: string }
  | { ok: false; error: string };

/**
 * COC-294 bootstrap path:
 * 1. Service-role client inserts initial tenant (+ optional matter)
 * 2. Anon auth client runs signInAnonymously()
 * 3. Access + refresh tokens are written to httpOnly cookies
 * 4. Caller redirects to /
 */
export async function bootstrapWorkspaceSession(opts?: {
  displayName?: string;
  redirectTo?: string;
}): Promise<BootstrapResult> {
  const displayName = opts?.displayName?.trim() || "Pro Se Litigant";
  const redirectTo = opts?.redirectTo || "/";

  try {
    // --- 1. Establish anonymous session first so we have a user id ---
    const authClient = createSupabaseServerClient();
    const { data: signData, error: signError } =
      await authClient.auth.signInAnonymously({
        options: {
          data: {
            full_name: displayName,
            role: "pro_se",
            jurisdiction: "Self-Represented",
          },
        },
      });

    if (signError || !signData.session || !signData.user) {
      return {
        ok: false,
        error: signError?.message || "Anonymous sign-in failed",
      };
    }

    const { session, user } = signData;
    const userId = user.id;

    // --- 2. Service-role bootstrap: tenant + matter bound to this user ---
    const admin = getSupabaseAdmin();

    const slug = `tenant-${userId.slice(0, 8)}`;
    const { data: tenant, error: tenantErr } = await admin
      .from("tenants")
      .upsert(
        {
          name: `${displayName}'s Workspace`,
          slug,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (tenantErr || !tenant) {
      // tenants table may not exist yet in some envs — surface clearly
      return {
        ok: false,
        error: tenantErr?.message || "Failed to create tenant (run Phase 0 migration)",
      };
    }

    const tenantId = tenant.id as string;

    // Best-effort: ensure a profile / users row and an initial matter.
    // Tables may differ by migration state; ignore non-fatal errors.
    await admin.from("users").upsert(
      {
        auth_id: userId,
        email: user.email || `${userId}@anon.local`,
        full_name: displayName,
        tenant_id: tenantId,
      },
      { onConflict: "auth_id" }
    ).then(() => undefined).catch(() => undefined);

    let matterId = "matter-empty";
    const { data: matter } = await admin
      .from("matters")
      .insert({
        title: "My Case",
        status: "open",
        tenant_id: tenantId,
        user_id: userId, // may map differently depending on schema
      })
      .select("id")
      .maybeSingle();

    if (matter?.id) {
      matterId = matter.id as string;
    }

    // --- 3. Attach session tokens to response cookies ---
    const cookieStore = await cookies();
    cookieStore.set("sb-access-token", session.access_token, COOKIE_OPTS);
    cookieStore.set("sb-refresh-token", session.refresh_token, {
      ...COOKIE_OPTS,
      maxAge: 60 * 60 * 24 * 30,
    });
    // Also set the standard Supabase project cookie name pattern if needed by middleware
    cookieStore.set("coc-tenant-id", tenantId, COOKIE_OPTS);
    cookieStore.set("coc-matter-id", matterId, COOKIE_OPTS);

    // --- 4. Redirect into workspace ---
    redirect(redirectTo);
  } catch (err) {
    // redirect() throws a special NEXT_REDIRECT error — rethrow it
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
    const message = err instanceof Error ? err.message : "Bootstrap failed";
    return { ok: false, error: message };
  }
}
