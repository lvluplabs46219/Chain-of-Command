import { NextResponse } from "next/server";

const API_URL = process.env.PASSWORDLESS_API_URL || "https://v4.passwordless.dev";
const API_SECRET = process.env.PASSWORDLESS_API_SECRET;

/**
 * Create a Passwordless.dev registration token (server-side only).
 * Body: { userId, username, displayName?, aliases? }
 */
export async function POST(request: Request) {
  if (!API_SECRET) {
    return NextResponse.json(
      { error: "Passwordless is not configured (missing PASSWORDLESS_API_SECRET)." },
      { status: 503 },
    );
  }

  let body: {
    userId?: string;
    username?: string;
    displayName?: string;
    aliases?: string[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const userId = (body.userId || "").trim();
  const username = (body.username || "").trim();
  if (!userId || !username) {
    return NextResponse.json(
      { error: "userId and username are required." },
      { status: 400 },
    );
  }

  const payload = {
    userId,
    username,
    displayname: body.displayName || username,
    authenticatorType: "any",
    aliases: body.aliases?.length ? body.aliases : [username],
    aliasHashing: true,
  };

  try {
    const res = await fetch(`${API_URL}/register/token`, {
      method: "POST",
      headers: {
        ApiSecret: API_SECRET,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.title || data?.error || "Failed to create registration token." },
        { status: res.status >= 400 ? res.status : 502 },
      );
    }
    return NextResponse.json({ token: data.token });
  } catch (err) {
    console.error("[passwordless/register]", err);
    return NextResponse.json({ error: "Passwordless service unreachable." }, { status: 502 });
  }
}
