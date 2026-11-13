import { NextResponse } from "next/server";
import { PREFAB_COUNSEL, listRetained, retainCounsel, releaseCounsel } from "@/lib/wire/agentRoster";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const retainedOnly = url.searchParams.get("retained") === "1";
  const retained = new Set(listRetained());
  const agents = PREFAB_COUNSEL.filter((a) => (retainedOnly ? retained.has(a.id) : true)).map((a) => ({
    ...a,
    retained: retained.has(a.id),
  }));
  return NextResponse.json(agents);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { action?: string; id?: string };
  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  if (body.action === "release") {
    return NextResponse.json({ retained: releaseCounsel(body.id) });
  }
  return NextResponse.json({ retained: retainCounsel(body.id) });
}
