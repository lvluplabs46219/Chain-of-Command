/**
 * The Wire multi-agent playground client.
 * Browser calls same-origin /wire-api/* (legacy: /empyrean-api/*) which Next rewrites
 * to WIRE_URL / EMPYREAN_URL (default :3100).
 */

const BASE = "/wire-api";

export type WireAgent = {
  id: string;
  name?: string;
  role?: string;
  status?: string;
  [key: string]: unknown;
};

/** @deprecated Use WireAgent — Empyrean was renamed to The Wire */
export type EmpyreanAgent = WireAgent;

export type WireMessage = {
  id?: string;
  senderId?: string;
  senderName?: string;
  text?: string;
  timestamp?: string;
  isOutgoing?: boolean;
  [key: string]: unknown;
};

/** @deprecated Use WireMessage */
export type EmpyreanMessage = WireMessage;

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`The Wire API ${res.status}`);
  return res.json() as Promise<T>;
}

export async function wireHealth(): Promise<{ ok: boolean; status?: string; agentsCount?: number }> {
  try {
    const res = await fetch(`${BASE}/health`, { cache: "no-store" });
    if (!res.ok) return { ok: false };
    const data = (await res.json()) as { status?: string; agentsCount?: number };
    return { ok: true, status: data.status, agentsCount: data.agentsCount };
  } catch {
    return { ok: false };
  }
}

/** @deprecated Use wireHealth */
export const empyreanHealth = wireHealth;

export async function wireListAgents(): Promise<WireAgent[]> {
  const res = await fetch(`${BASE}/agents`, { cache: "no-store" });
  const data = await parseJson<WireAgent[] | { agents?: WireAgent[] }>(res);
  return Array.isArray(data) ? data : data.agents ?? [];
}

/** @deprecated Use wireListAgents */
export const empyreanListAgents = wireListAgents;

export async function wireListMessages(chatId: string): Promise<WireMessage[]> {
  const res = await fetch(`${BASE}/chats/${encodeURIComponent(chatId)}/messages`, { cache: "no-store" });
  const data = await parseJson<WireMessage[] | { messages?: WireMessage[] }>(res);
  return Array.isArray(data) ? data : data.messages ?? [];
}

/** @deprecated Use wireListMessages */
export const empyreanListMessages = wireListMessages;

/** Post a user message into a Wire channel / swarm chat. */
export async function wireSendMessage(chatId: string, text: string): Promise<{ ok: boolean; raw?: unknown }> {
  const res = await fetch(`${BASE}/chats/${encodeURIComponent(chatId)}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`The Wire send failed (${res.status})`);
  try {
    return { ok: true, raw: await res.json() };
  } catch {
    return { ok: true };
  }
}

/** @deprecated Use wireSendMessage */
export const empyreanSendMessage = wireSendMessage;

export async function wireDirective(
  text: string,
  meta?: Record<string, unknown>,
): Promise<{ ok: boolean; raw?: unknown }> {
  const res = await fetch(`${BASE}/directive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, ...(meta ?? {}) }),
  });
  if (!res.ok) throw new Error(`The Wire directive failed (${res.status})`);
  try {
    return { ok: true, raw: await res.json() };
  } catch {
    return { ok: true };
  }
}

/** @deprecated Use wireDirective */
export const empyreanDirective = wireDirective;
