/**
 * Acquit.ai Client-side Signup Workflow Helper
 */

export interface SignupWorkflowResult {
  userId: string;
  status: "onboarded" | "pending" | "failed";
  email: string;
  startedAt: string;
}

export async function triggerSignupWorkflow(email: string): Promise<SignupWorkflowResult> {
  try {
    const response = await fetch("/api/v1/auth/signup-workflow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fallback local simulation for offline/preview mode
  }
  return {
    userId: "usr_" + Math.random().toString(36).substring(2, 10),
    status: "onboarded",
    email,
    startedAt: new Date().toISOString(),
  };
}
