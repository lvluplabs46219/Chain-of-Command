import { Client } from "pg";
import {
  withDb,
  equipGear,
  recordPaymentAndGrant,
  listEntitlements,
} from "./db";

export interface Env {
  HYPERDRIVE: Hyperdrive;
}

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

function notFound(paths: string[]): Response {
  return json({ error: "Not found", paths }, 404);
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "") || "/";

    if (path === "/health") {
      return json({
        ok: true,
        service: "chain-of-command-worker",
        storage: "hyperdrive-planetscale",
      });
    }

    // Routes that need DB
    try {
      return await withDb(env.HYPERDRIVE.connectionString, async (client) => {
        // ---- diagnostics ----
        if (path === "/" || path === "/tables") {
          const result = await client.query(
            `SELECT schemaname, tablename
             FROM pg_tables
             WHERE schemaname = 'public'
             ORDER BY tablename`
          );
          return json({ ok: true, source: "hyperdrive", tables: result.rows });
        }

        if (path === "/size") {
          const result = await client.query(`
            SELECT
              schemaname || '.' || relname AS table_name,
              pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
              n_live_tup AS approx_rows
            FROM pg_stat_user_tables
            ORDER BY pg_total_relation_size(relid) DESC
            LIMIT 20
          `);
          return json({ ok: true, tables: result.rows });
        }

        // ---- POST /equip ----
        if (path === "/equip" && request.method === "POST") {
          const body = await readJson(request);
          const agentInstanceId = String(body.agentInstanceId ?? "");
          const agentTitleId = String(body.agentTitleId ?? "");
          const slot = String(body.slot ?? "") as
            | "primary"
            | "secondary"
            | "tools"
            | "knowledge";
          const gearId = String(body.gearId ?? "");
          const subjectType = String(body.subjectType ?? "account");
          const subjectId = String(body.subjectId ?? "");

          if (!agentInstanceId || !agentTitleId || !slot || !gearId || !subjectId) {
            return json(
              {
                error:
                  "agentInstanceId, agentTitleId, slot, gearId, subjectId required",
              },
              400
            );
          }
          if (!["primary", "secondary", "tools", "knowledge"].includes(slot)) {
            return json({ error: "invalid slot" }, 400);
          }

          try {
            const loadout = await equipGear(client, {
              agentInstanceId,
              agentTitleId,
              slot,
              gearId,
              subjectType,
              subjectId,
              userId: body.userId ? String(body.userId) : subjectId,
            });
            return json({ ok: true, loadout });
          } catch (e) {
            const status =
              e instanceof Error && "status" in e
                ? (e as Error & { status: number }).status
                : 400;
            return json(
              { error: e instanceof Error ? e.message : String(e) },
              status
            );
          }
        }

        // ---- POST /checkout (Base USDC → entitlement) ----
        if (path === "/checkout" && request.method === "POST") {
          const body = await readJson(request);
          const subjectType = String(body.subjectType ?? "wallet");
          const subjectId = String(body.subjectId ?? "");
          const skuId = String(body.skuId ?? "");
          const amountUsdc = Number(body.amountUsdc);
          const txHash = body.txHash ? String(body.txHash) : null;
          const grantType = body.grantType
            ? String(body.grantType)
            : undefined;
          const grantId = body.grantId ? String(body.grantId) : undefined;
          const durationDays = body.durationDays
            ? Number(body.durationDays)
            : 30;

          if (!subjectId || !skuId || Number.isNaN(amountUsdc)) {
            return json(
              { error: "subjectId, skuId, amountUsdc required" },
              400
            );
          }

          const result = await recordPaymentAndGrant(client, {
            subjectType,
            subjectId,
            skuId,
            amountUsdc,
            txHash,
            grantType,
            grantId,
            durationDays,
          });

          return json({
            success: true,
            chain: "base",
            token: "USDC",
            ...result,
            message:
              result.status === "confirmed"
                ? "Payment confirmed; entitlement granted"
                : "Payment pending — submit txHash to confirm",
          });
        }

        // ---- GET /entitlements?subjectType=&subjectId= ----
        if (path === "/entitlements" && request.method === "GET") {
          const subjectType = url.searchParams.get("subjectType") ?? "wallet";
          const subjectId = url.searchParams.get("subjectId") ?? "";
          if (!subjectId) {
            return json({ error: "subjectId required" }, 400);
          }
          const rows = await listEntitlements(client, subjectType, subjectId);
          return json({ ok: true, entitlements: rows });
        }

        // ---- GET /loadout?agentInstanceId= ----
        if (path === "/loadout" && request.method === "GET") {
          const agentInstanceId = url.searchParams.get("agentInstanceId") ?? "";
          if (!agentInstanceId) {
            return json({ error: "agentInstanceId required" }, 400);
          }
          const { rows } = await client.query(
            `SELECT * FROM public.agent_loadouts WHERE agent_instance_id = $1 LIMIT 1`,
            [agentInstanceId]
          );
          return json({ ok: true, loadout: rows[0] ?? null });
        }

        return notFound([
          "/health",
          "/tables",
          "/size",
          "POST /equip",
          "POST /checkout",
          "GET /entitlements",
          "GET /loadout",
        ]);
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return json({ ok: false, error: message }, 500);
    }
  },
} satisfies ExportedHandler<Env>;
