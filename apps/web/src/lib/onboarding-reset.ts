/**
 * Client-side helpers to simulate a brand-new user / first login.
 *
 * Preferred for local testing:
 *   1. Incognito / new Chrome profile, or
 *   2. Call resetClientOnboarding() from the browser console, or
 *   3. useAuth().resetFirstRun() then reload.
 *
 * Do NOT delete real cases/matters to "simulate" a new user.
 */

const KEYS = [
  "coc_onboarding_completed",
  "acquit_auth_user",
  "acquit_auth_token",
  "acquit_supabase_auth_token",
  "chain_of_command_matters",
  "chain_of_command_agents",
] as const;

/** Clear onboarding + auth keys so the FirstRunWizard shows again. */
export function resetClientOnboarding(opts?: { clearMatters?: boolean }): void {
  if (typeof window === "undefined") return;
  const clearMatters = opts?.clearMatters ?? false;
  for (const k of KEYS) {
    if (!clearMatters && (k === "chain_of_command_matters" || k.startsWith("chain_of_command_timeline") || k.startsWith("chain_of_command_evidence"))) {
      continue;
    }
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  }
  // Also clear any matter-scoped timeline/evidence keys when requested
  if (clearMatters) {
    try {
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("chain_of_command_") || key.startsWith("coc_"))) {
          toRemove.push(key);
        }
      }
      toRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
  }
}

/** True when this browser profile has not completed onboarding. */
export function isClientFirstRun(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem("coc_onboarding_completed") !== "1";
  } catch {
    return true;
  }
}
