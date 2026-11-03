import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const API_URL = process.env.PASSWORDLESS_API_URL || "https://v4.passwordless.dev";
const API_SECRET = process.env.PASSWORDLESS_API_SECRET;

/**
 * Verify a Passwordless.dev sign-in token.
 * Maps verified identity for client session bridge (ADR-001: Supabase remains primary JWT source).
 */
export async function POST(request: Request) {
  if (!API_SECRET) {
    return NextResponse.json(
      { error: "Passwordless is not configured (missing PASSWORDLESS_API_SECRET)." },
      { status: 503 },
    );
  }

  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const token = (body.token || "").trim();
  if (!token) {
    return NextResponse.json({ error: "token is required." }, { status: 400 });
  }

  try {
    const verifyRes = await fetch(`${API_URL}/signin/verify`, {
      method: "POST",
      headers: {
        ApiSecret: API_SECRET,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });
    const verified = await verifyRes.json().catch(() => ({}));

    if (!verifyRes.ok || verified?.success === false) {
      return NextResponse.json(
        {
          success: false,
          error: verified?.title || verified?.error || "Passkey verification failed.",
        },
        { status: 401 },
      );
    }

    const userId = verified.userId as string;
    const alias =
      (Array.isArray(verified.aliases) && verified.aliases[0]) ||
      (verified.username as string) ||
      null;

    let supabaseLinked = false;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceKey && alias && String(alias).includes("@")) {
      try {
        const admin = createClient(supabaseUrl, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        const { data: listed } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
        // Supabase's inferred user type can collapse to `never` in some generated
        // client configurations; narrow only the field used for this lookup.
        const users = (listed?.users ?? []) as Array<{ email?: string | null }>;
        const match = users.find(
          (user) => user.email?.toLowerCase() === String(alias).toLowerCase(),
        );
        if (match) supabaseLinked = true;
      } catch (e) {
        console.warn("[passwordless/verify] supabase link lookup skipped:", e);
      }
    }

    return NextResponse.json({
      success: true,
      userId,
      alias,
      username: verified.username || alias,
      supabaseLinked,
      passkeyProof: {
        userId,
        alias,
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[passwordless/verify]", err);
    return NextResponse.json({ error: "Passwordless service unreachable." }, { status: 502 });
  }
}
