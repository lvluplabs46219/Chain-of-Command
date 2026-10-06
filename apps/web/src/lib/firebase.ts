/**
 * ADR-001: Firebase is not a production identity or data plane.
 * This module intentionally does not initialize Firebase Auth or Firestore.
 * Importing auth/db from here will throw — migrate callers to Supabase.
 */

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

function removed(feature: string): never {
  throw new Error(
    `Firebase ${feature} was removed (ADR-001). Use Supabase Auth and the API/matters store instead.`,
  );
}

/** @deprecated ADR-001 — always null; do not use for sessions. */
export const auth = {
  get currentUser() {
    return null;
  },
};

/** @deprecated ADR-001 — Firestore client disabled. */
export const db = new Proxy(
  {},
  {
    get() {
      return removed("Firestore");
    },
  },
);

/** @deprecated ADR-001 */
export const app = null;

/** @deprecated ADR-001 — use Supabase Google OAuth via AuthContext.loginWithGoogle */
export const googleAuthProvider = null;

export function handleFirestoreError(_error: unknown, _operationType: OperationType, _path: string | null): never {
  return removed("error handler");
}

export async function testFirestoreConnection(): Promise<void> {
  // no-op: Firebase is not initialized
}
