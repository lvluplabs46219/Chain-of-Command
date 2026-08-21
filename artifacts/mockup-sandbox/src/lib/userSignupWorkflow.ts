import { sleep } from "workflow";

export interface UserAccount {
  id: string;
  email: string;
  fullName?: string;
  createdAt: Date;
}

export async function createUser(email: string): Promise<UserAccount> {
  const id = "usr_" + Math.random().toString(36).substring(2, 11);
  return {
    id,
    email,
    fullName: email.split("@")[0].replace(".", " "),
    createdAt: new Date(),
  };
}

export async function sendWelcomeEmail(user: UserAccount): Promise<{ sent: boolean; messageId: string }> {
  console.log(`[Workflow Step] Sending Welcome Email to ${user.email} (User ID: ${user.id})`);
  return {
    sent: true,
    messageId: `msg_welcome_${user.id}`,
  };
}

export async function sendOnboardingEmail(user: UserAccount): Promise<{ sent: boolean; messageId: string }> {
  console.log(`[Workflow Step] Sending Onboarding Email to ${user.email} (User ID: ${user.id})`);
  return {
    sent: true,
    messageId: `msg_onboarding_${user.id}`,
  };
}

export async function handleUserSignup(email: string) {
  "use workflow";

  const user = await createUser(email);
  await sendWelcomeEmail(user);

  await sleep("5s");

  await sendOnboardingEmail(user);
  return { userId: user.id, status: "onboarded" };
}
