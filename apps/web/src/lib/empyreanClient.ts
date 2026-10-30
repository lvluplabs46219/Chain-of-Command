/**
 * Empyrean multi-agent daemon client.
 * Browser calls same-origin /empyrean-api/* which Next rewrites to EMPYREAN_URL (default :3100).
 * Not legal advice — educational / pro se assist only.
 */

const BASE = "/empyrean-api";

export type EmpyreanAgent = {
  id: string;
  display_name?: string;
  role_title?: string;
  status?: string;
  [key: string]: unknown;
};

export type EmpyreanMessage = {
  id?: string;
  chatId?: string;
  senderId?: string;
  senderName?: string;
  text?: string;
  timestamp?: string;
  isOutgoing?: boolean;
  [key: string]: unknown;
};

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text.slice(0, 200) || `HTTP ${res.status}`);
  }
}

export async function empyreanHealth(): Promise<{ ok: boolean; status?: string; agentsCount?: number }> {
  try {
    const res = await fetch(`${BASE}/health`, { method: "GET", cache: "no-store" });
    if (!res.ok) return { ok: false };
    const data = await parseJson<{ status?: string; agentsCount?: number }>(res);
    return { ok: true, status: data.status, agentsCount: data.agentsCount };
  } catch {
    return { ok: false };
  }
}

export async function empyreanListAgents(): Promise<EmpyreanAgent[]> {
  const res = await fetch(`${BASE}/agents`, { cache: "no-store" });
  if (!res.ok) throw new Error(`agents ${res.status}`);
  const data = await parseJson<EmpyreanAgent[] | { agents?: EmpyreanAgent[] }>(res);
  return Array.isArray(data) ? data : data.agents ?? [];
}

export async function empyreanListMessages(chatId: string): Promise<EmpyreanMessage[]> {
  const res = await fetch(`${BASE}/messages?chatId=${encodeURIComponent(chatId)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`messages ${res.status}`);
  const data = await parseJson<EmpyreanMessage[] | { messages?: EmpyreanMessage[] }>(res);
  return Array.isArray(data) ? data : data.messages ?? [];
}

/** Post a user message into an Empyrean channel / swarm chat. */
export async function empyreanSendMessage(chatId: string, text: string): Promise<{ ok: boolean; raw?: unknown }> {
  const res = await fetch(`${BASE}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, text }),
  });
  const raw = await parseJson<unknown>(res);
  if (!res.ok) {
    const err = (raw as { error?: string })?.error || `send ${res.status}`;
    throw new Error(err);
  }
  return { ok: true, raw };
}

/** Issue a top-level Michael directive (orchestrator). */
export async function empyreanDirective(
  text: string,
  context?: Record<string, unknown>,
): Promise<unknown> {
  const res = await fetch(`${BASE}/directive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, context }),
  });
  const raw = await parseJson<unknown>(res);
  if (!res.ok) {
    const err = (raw as { error?: string })?.error || `directive ${res.status}`;
    throw new Error(err);
  }
  return raw;
}
