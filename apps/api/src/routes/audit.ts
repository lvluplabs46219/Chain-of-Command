import { Router, type Response } from "express";
import { and, desc, eq, or } from "drizzle-orm";
import { db, auditLogsTable, mattersTable } from "@workspace/db";
import { verifySession, type AuthenticatedRequest } from "../middleware/verifySession";
import { resolveAppUserId } from "../lib/resolveAppUser";

const router = Router();
router.use(verifySession);

async function assertMatterOwned(
  matterId: string,
  userId: string
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  try {
    const rows = await db
      .select({ id: mattersTable.id, userId: mattersTable.userId })
      .from(mattersTable)
      .where(eq(mattersTable.id, matterId))
      .limit(1);
    const matter = rows[0];
    if (!matter) return { ok: false, status: 404, error: "Matter not found" };
    if (matter.userId !== userId) {
      return { ok: false, status: 403, error: "Forbidden: matter not owned by user" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[audit] ownership check failed:", err);
    return { ok: false, status: 503, error: "Database unavailable" };
  }
}

/**
 * GET /audit/matter/:matterId
 * Ownership-scoped audit trail for a matter (no cross-tenant leakage).
 */
router.get("/matter/:matterId", async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });
    const resolved = await resolveAppUserId(req.user);
    if (!resolved.ok) {
      return res.status(resolved.status).json({ error: resolved.error });
    }

    const matterId = req.params.matterId;
    const owned = await assertMatterOwned(matterId, resolved.userId);
    if (!owned.ok) {
      return res.status(owned.status).json({ error: owned.error });
    }

    const events = await db
      .select()
      .from(auditLogsTable)
      .where(eq(auditLogsTable.matterId, matterId))
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(500);

    return res.json({
      matterId,
      status: "success",
      generatedAt: new Date().toISOString(),
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("[audit] matter trail failed:", error);
    return res.status(500).json({ error: "Failed to retrieve audit trail" });
  }
});

/** Legacy path: /audit/case/:caseId — same ownership rules (matter id). */
router.get("/case/:caseId", async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });
    const resolved = await resolveAppUserId(req.user);
    if (!resolved.ok) {
      return res.status(resolved.status).json({ error: resolved.error });
    }

    const caseId = req.params.caseId;
    const owned = await assertMatterOwned(caseId, resolved.userId);
    if (!owned.ok) {
      return res.status(owned.status).json({ error: owned.error });
    }

    const events = await db
      .select()
      .from(auditLogsTable)
      .where(
        or(eq(auditLogsTable.matterId, caseId), eq(auditLogsTable.userId, resolved.userId))
      )
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(500);

    // Still filter to this matter only for the response (userId OR was for empty legacy rows)
    const scoped = events.filter((e) => e.matterId === caseId);

    return res.json({
      caseId,
      status: "success",
      generatedAt: new Date().toISOString(),
      count: scoped.length,
      events: scoped,
      message: undefined,
    });
  } catch (error) {
    console.error("[audit] case trail failed:", error);
    return res.status(500).json({ error: "Failed to retrieve audit trail" });
  }
});

/**
 * GET /audit/agent-run/:runId/anomalies
 * Returns only runs the user can see via ownership on related matter in details —
 * without a full agent_runs table, respond honestly (no fabricated FrawdBot data).
 */
router.get(
  "/agent-run/:runId/anomalies",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });
      const resolved = await resolveAppUserId(req.user);
      if (!resolved.ok) {
        return res.status(resolved.status).json({ error: resolved.error });
      }

      const runId = req.params.runId;
      const rows = await db
        .select()
        .from(auditLogsTable)
        .where(
          and(eq(auditLogsTable.userId, resolved.userId), eq(auditLogsTable.agentId, runId))
        )
        .limit(50);

      return res.json({
        runId,
        riskScore: 0,
        anomalies: [],
        relatedAuditEvents: rows.length,
        status: rows.length ? "logged" : "no_data",
        message:
          "Agent anomaly detection (FrawdBot/Shield) is not fully wired; only ownership-scoped audit_logs are returned.",
      });
    } catch (error) {
      console.error("[audit] anomalies failed:", error);
      return res.status(500).json({ error: "Failed to retrieve agent anomalies" });
    }
  }
);

export default router;
