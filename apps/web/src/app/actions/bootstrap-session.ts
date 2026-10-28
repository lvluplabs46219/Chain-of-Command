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
  | { ok: true; tenantId: string; matterId: string; userId: string; accessToken: string }
  | { ok: false; error: string };

/**
 * COC-294 bootstrap path:
 * 1. Anon auth client runs signInAnonymously()
 * 2. Service-role client inserts initial tenant (+ optional matter) — best-effort
 * 3. Access + refresh tokens written to httpOnly cookies
 * 4. Optional redirect when redirectTo is provided
 */
export async function bootstrapWorkspaceSession(opts?: {
  displayName?: string;
  /** If set, redirect after cookies are written. Omit to return result to the client. */
  redirectTo?: string;
}): Promise<BootstrapResult> {
  const displayName = opts?.displayName?.trim() || "Pro Se Litigant";
  const redirectTo = opts?.redirectTo; // undefined = no redirect

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
      const hint =
        signError?.message?.includes("disabled") ||
        signError?.message?.toLowerCase().includes("anonymous")
          ? " Enable Anonymous sign-ins in Supabase Auth → Providers."
          : "";
      return {
        ok: false,
        error: (signError?.message || "Anonymous sign-in failed") + hint,
      };
    }

    const { session, user } = signData;
    const userId = user.id;

    // --- 2. Service-role bootstrap: tenant + matter (best-effort) ---
    let tenantId = `local-${userId.slice(0, 8)}`;
    let matterId = "matter-empty";

    try {
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

      if (!tenantErr && tenant?.id) {
        tenantId = tenant.id as string;

        try {
          await admin
            .from("users")
            .upsert(
              {
                auth_id: userId,
                email: user.email || `${userId}@anon.local`,
                full_name: displayName,
                tenant_id: tenantId,
              },
              { onConflict: "auth_id" }
            );
        } catch {
          /* ignore bootstrap user upsert failures */
        }

        const { data: matter } = await admin
          .from("matters")
          .insert({
            title: "My Case",
            status: "open",
            tenant_id: tenantId,
            user_id: userId,
          })
          .select("id")
          .maybeSingle();

        if (matter?.id) {
          matterId = matter.id as string;
        }
      } else if (tenantErr) {
        console.warn(
          "[bootstrap] tenant upsert skipped (run Phase 0 migration):",
          tenantErr.message
        );
      }
    } catch (adminErr) {
      // Missing SERVICE_ROLE_KEY or network — session cookies still useful
      console.warn("[bootstrap] admin path skipped:", adminErr);
    }

    // --- 3. Attach session tokens to response cookies ---
    const cookieStore = await cookies();
    cookieStore.set("sb-access-token", session.access_token, COOKIE_OPTS);
    cookieStore.set("sb-refresh-token", session.refresh_token, {
      ...COOKIE_OPTS,
      maxAge: 60 * 60 * 24 * 30,
    });
    cookieStore.set("coc-tenant-id", tenantId, COOKIE_OPTS);
    cookieStore.set("coc-matter-id", matterId, COOKIE_OPTS);

    // --- 4. Optional redirect ---
    if (redirectTo) {
      redirect(redirectTo);
    }

    return {
      ok: true,
      tenantId,
      matterId,
      userId,
      accessToken: session.access_token,
    };
  } catch (err) {
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
