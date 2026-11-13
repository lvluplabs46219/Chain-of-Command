import { NextResponse } from "next/server";
import { appendMessage, listMessages, PREFAB_COUNSEL } from "@/lib/wire/agentRoster";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const chatId = url.searchParams.get("chatId") ?? undefined;
  return NextResponse.json(listMessages(chatId ?? undefined));
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    chatId?: string;
    text?: string;
    senderId?: string;
  };
  const text = (body.text ?? "").trim();
  const chatId = body.chatId ?? "general-swarm";
  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  const userMsg = appendMessage({
    chatId,
    senderId: "user",
    senderName: "You",
    senderAvatarColor: "#af0a78",
    text,
    isOutgoing: true,
  });

  const lead = PREFAB_COUNSEL.find((a) => a.id === "yhwh") ?? PREFAB_COUNSEL[0];
  const snippet = text.length > 280 ? `${text.slice(0, 280)}…` : text;
  const reply = appendMessage({
    chatId,
    senderId: lead.id,
    senderName: lead.displayName,
    senderAvatarColor: lead.avatarColor,
    text: [
      `Received in #${chatId}. I can help organize facts, suggest which retained specialists to involve, or open a channel.`,
      "This is general information only — not legal advice. No attorney-client relationship is formed.",
      `You said: “${snippet}”`,
    ].join("\n\n"),
    isOutgoing: false,
  });

  return NextResponse.json({ ok: true, messages: [userMsg, reply] });
}
