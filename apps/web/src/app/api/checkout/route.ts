import { checkBotId } from 'botid/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const verification = await checkBotId();

  if (verification.isBot) {
    return NextResponse.json(
      { error: 'Access denied: bot detected', isBot: true },
      { status: 403 }
    );
  }

  const data = await request.json().catch(() => ({}));
  return NextResponse.json({
    success: true,
    message: 'BotID verification passed',
    data,
  });
}
