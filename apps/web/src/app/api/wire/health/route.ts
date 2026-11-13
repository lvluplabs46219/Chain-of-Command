import { NextResponse } from "next/server";
import { PREFAB_COUNSEL } from "@/lib/wire/agentRoster";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    orchestrator: "next-wire",
    agentsCount: PREFAB_COUNSEL.length,
    mode: "same-origin",
    timestamp: new Date().toISOString(),
  });
}
