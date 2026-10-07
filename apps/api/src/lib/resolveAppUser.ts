import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import type { AuthenticatedRequest } from "../middleware/verifySession";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Stable UUID for the pro-se demo token path (non-UUID auth ids). */
export const DEMO_APP_USER_ID = "00000000-0000-4000-8000-000000000001";

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/**
 * Map Supabase Auth user → application users.id.
 * Creates a users row when missing. Demo tokens get a fixed UUID.
 */
export async function resolveAppUserId(
  authUser: NonNullable<AuthenticatedRequest["user"]>
): Promise<{ ok: true; userId: string } | { ok: false; status: number; error: string }> {
  const authId = authUser.id;
  const email =
    (authUser.email && String(authUser.email).trim()) ||
    `user-${authId.slice(0, 8)}@local.chainofcommand`;
  const fullName =
    (authUser.user_metadata?.full_name as string | undefined) ||
    (authUser.user_metadata?.name as string | undefined) ||
    null;

  if (!isUuid(authId)) {
    try {
      const existing = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.id, DEMO_APP_USER_ID))
        .limit(1);
      if (existing[0]?.id) {
        return { ok: true, userId: existing[0].id };
      }
      await db.insert(usersTable).values({
        id: DEMO_APP_USER_ID,
        authId: DEMO_APP_USER_ID,
        email: email.includes("@") ? email : "litigant@chainofcommand.org",
        fullName: fullName || "Pro Se Litigant",
      });
      return { ok: true, userId: DEMO_APP_USER_ID };
    } catch (err) {
      console.error("[resolveAppUser] demo user upsert failed:", err);
      return { ok: false, status: 503, error: "Database unavailable while resolving user" };
    }
  }

  try {
    const byAuth = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.authId, authId))
      .limit(1);
    if (byAuth[0]?.id) {
      return { ok: true, userId: byAuth[0].id };
    }

    const byId = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, authId))
      .limit(1);
    if (byId[0]?.id) {
      return { ok: true, userId: byId[0].id };
    }

    const [inserted] = await db
      .insert(usersTable)
      .values({
        authId,
        email,
        fullName,
      })
      .returning({ id: usersTable.id });

    if (!inserted?.id) {
      return { ok: false, status: 500, error: "Failed to provision application user" };
    }
    return { ok: true, userId: inserted.id };
  } catch (err) {
    console.error("[resolveAppUser] failed:", err);
    return { ok: false, status: 503, error: "Database unavailable while resolving user" };
  }
}
