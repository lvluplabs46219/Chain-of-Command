/**
 * Client-side helpers to simulate a brand-new user / first login.
 *
 * Preferred for local testing:
 *   1. Incognito / new Chrome profile, or
 *   2. Call resetClientOnboarding({ clearMatters: true }) from the browser console, or
 *   3. useAuth().resetFirstRun() then reload.
 *
 * Do NOT delete real cases/matters in production to "simulate" a new user.
 */

const AUTH_AND_ONBOARDING_KEYS = [
  "coc_onboarding_completed",
  "acquit_auth_user",
  "acquit_auth_token",
  "acquit_supabase_auth_token",
  "acquit_github_pat",
  "acquit_github_profile",
] as const;

/** Clear onboarding + auth keys so the FirstRunWizard shows again. */
export function resetClientOnboarding(opts?: { clearMatters?: boolean }): void {
  if (typeof window === "undefined") return;
  const clearMatters = opts?.clearMatters ?? false;

  for (const k of AUTH_AND_ONBOARDING_KEYS) {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  }

  // Always clear sessionStorage auth scraps
  try {
    sessionStorage.removeItem("acquit_github_pat");
    sessionStorage.removeItem("acquit_github_profile");
  } catch {
    /* ignore */
  }

  if (clearMatters) {
    try {
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith("chain_of_command_") ||
            key.startsWith("coc_") ||
            key.startsWith("acquit_"))
        ) {
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

/**
 * Full local wipe for a clean first-run experience.
 * Call from console: clearAppAndRestart()
 */
export function clearAppAndRestart(): void {
  resetClientOnboarding({ clearMatters: true });
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

// Expose for browser console testing in development
if (typeof window !== "undefined") {
  (window as unknown as { clearAppAndRestart?: () => void }).clearAppAndRestart =
    clearAppAndRestart;
  (window as unknown as { resetClientOnboarding?: typeof resetClientOnboarding }).resetClientOnboarding =
    resetClientOnboarding;
}
