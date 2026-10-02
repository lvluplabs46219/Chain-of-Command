'use server';

import { checkBotId } from 'botid/server';

export async function createUser(formData: FormData) {
  const verification = await checkBotId();

  if (verification.isBot) {
    throw new Error('Access denied: bot detected');
  }

  const userData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
  };

  return { success: true, user: userData, verified: true };
}
