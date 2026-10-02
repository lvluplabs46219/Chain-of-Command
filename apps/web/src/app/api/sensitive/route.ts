import { checkBotId } from 'botid/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const verification = await checkBotId();

  if (verification.isBot) {
    return NextResponse.json({ error: 'Access denied: bot detected' }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({ success: true, verified: true, data: body });
  } catch {
    return NextResponse.json({ success: true, verified: true });
  }
}
