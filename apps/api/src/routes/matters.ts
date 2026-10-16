import { Router, type Response } from "express";
import { eq, and, desc } from "drizzle-orm";
import {
  db,
  mattersTable,
  partiesTable,
  deadlinesTable,
} from "@workspace/db";
import { AuthenticatedRequest, verifySession } from "../middleware/verifySession";
import { requirePermission } from "../middleware/authContext";
import { resolveAppUserId, isUuid } from "../lib/resolveAppUser";
import { logAudit } from "../lib/auditLog";
import type { AuthedRequest } from "../middleware/authContext";

export const mattersRouter = Router();
mattersRouter.use(verifySession);


function mapMatterStatus(status: string | null | undefined): string {
  if (!status) return "active";
  if (status === "open") return "active";
  if (status === "on_hold") return "pending";
  if (status === "archived") return "closed";
  return status;
}

function toDbStatus(status: string | null | undefined): "open" | "closed" | "on_hold" | "archived" {
  const s = (status || "open").toLowerCase();
  if (s === "active" || s === "discovery" || s === "trial_prep" || s === "open") return "open";
  if (s === "pending" || s === "on_hold") return "on_hold";
  if (s === "closed" || s === "archived") return "closed";
  return "open";
}

function mapMatterRow(m: typeof mattersTable.$inferSelect) {
  return {
    id: m.id,
    caseNumber: m.caseNumber || "",
    title: m.title || "",
    courtName: m.courtName || "",
    jurisdiction: m.jurisdiction || "",
    status: mapMatterStatus(m.status),
    description: m.description || "",
    summary: m.description || "",
    createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: m.updatedAt ? new Date(m.updatedAt).toISOString() : new Date().toISOString(),
    judge: "",
    prosecutor: "",
    defenseStatus: "Self-Represented (Pro Se)" as const,
    nextCourtDate: "",
    nextCourtType: "",
    speedyTrialDeadline: "",
    charges: [] as unknown[],
  };
}


async function assertMatterOwned(
  matterId: string,
  appUserId: string
): Promise<
  | { ok: true; matter: typeof mattersTable.$inferSelect }
  | { ok: false; status: number; error: string }
> {
  if (!isUuid(matterId)) {
    return { ok: false, status: 400, error: "Invalid matter ID format" };
  }
  try {
    const rows = await db
      .select()
      .from(mattersTable)
      .where(eq(mattersTable.id, matterId))
      .limit(1);
    const matter = rows[0];
    if (!matter) {
      return { ok: false, status: 404, error: "Matter not found" };
    }
    if (matter.userId !== appUserId) {
      console.warn(
        `[matters] User ${appUserId} attempted access to matter ${matterId} owned by ${matter.userId}`
      );
      return {
        ok: false,
        status: 403,
        error: "Forbidden: Matter does not belong to authenticated user",
      };
    }
    return { ok: true, matter };
  } catch (err) {
    console.error("[matters] ownership query failed:", err);
    return { ok: false, status: 503, error: "Database unavailable" };
  }
}

// ---------------------------------------------------------------------------
// LIST
// ---------------------------------------------------------------------------
mattersRouter.get("/matters", async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const resolved = await resolveAppUserId(req.user);
    if (!resolved.ok) {
      return res.status(resolved.status).json({ success: false, error: resolved.error });
    }

    const dbMatters = await db
      .select()
      .from(mattersTable)
      .where(eq(mattersTable.userId, resolved.userId))
      .orderBy(desc(mattersTable.updatedAt));

    return res.json({
      success: true,
      matters: (dbMatters || []).map(mapMatterRow),
    });
  } catch (err) {
    console.error("[matters] list error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch matters" });
  }
});

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------
mattersRouter.post("/matters", requirePermission({ resource: "case", action: "write" }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const resolved = await resolveAppUserId(req.user);
    if (!resolved.ok) {
      return res.status(resolved.status).json({ success: false, error: resolved.error });
    }

    const {
      title,
      caseNumber,
      courtName,
      jurisdiction,
      description,
      summary,
      status,
    } = req.body || {};

    if (!title || typeof title !== "string" || title.trim().length < 1) {
      return res.status(400).json({ success: false, error: "title is required" });
    }

    const [inserted] = await db
      .insert(mattersTable)
      .values({
        userId: resolved.userId,
        title: String(title).trim().slice(0, 300),
        caseNumber: caseNumber ? String(caseNumber).trim().slice(0, 100) : null,
        courtName: courtName ? String(courtName).trim().slice(0, 200) : null,
        jurisdiction: jurisdiction ? String(jurisdiction).trim().slice(0, 100) : null,
        description: (description || summary)
          ? String(description || summary).trim().slice(0, 5000)
          : null,
        status: toDbStatus(status),
      })
      .returning();

    if (!inserted) {
      return res.status(500).json({ success: false, error: "Matter insert returned no row" });
    }

    // COC-294: audit significant state change
    const tenantId =
      (req as AuthedRequest).auth?.tenantId ||
      (req.headers["x-tenant-id"] as string) ||
      "unknown";
    await logAudit({
      tenantId,
      actorType: "user",
      actorId: resolved.userId,
      action: "case.create",
      targetType: "matter",
      targetId: inserted.id,
      caseId: inserted.id,
      result: "success",
      traceId: (req as AuthedRequest).auth?.traceId,
      metadata: { title: inserted.title },
    }).catch((e) => console.error("[matters] audit write failed", e));

    return res.status(201).json({ success: true, matter: mapMatterRow(inserted) });
  } catch (err) {
    console.error("[matters] create error:", err);
    return res.status(500).json({ success: false, error: "Failed to create matter" });
  }
});

// ---------------------------------------------------------------------------
// GET ONE
// ---------------------------------------------------------------------------
mattersRouter.get("/matters/:matterId", async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const resolved = await resolveAppUserId(req.user);
    if (!resolved.ok) {
      return res.status(resolved.status).json({ success: false, error: resolved.error });
    }

    const owned = await assertMatterOwned(req.params.matterId, resolved.userId);
    if (!owned.ok) {
      return res.status(owned.status).json({ success: false, error: owned.error });
    }

    return res.json({ success: true, matter: mapMatterRow(owned.matter) });
  } catch (err) {
    console.error("[matters] get error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch matter" });
  }
});

// ---------------------------------------------------------------------------
// PATCH
// ---------------------------------------------------------------------------
mattersRouter.patch("/matters/:matterId", requirePermission({ resource: "case", action: "write" }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const resolved = await resolveAppUserId(req.user);
    if (!resolved.ok) {
      return res.status(resolved.status).json({ success: false, error: resolved.error });
    }

    const owned = await assertMatterOwned(req.params.matterId, resolved.userId);
    if (!owned.ok) {
      return res.status(owned.status).json({ success: false, error: owned.error });
    }

    const body = req.body || {};
    const updates: Partial<typeof mattersTable.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (typeof body.title === "string" && body.title.trim()) {
      updates.title = body.title.trim().slice(0, 300);
    }
    if (body.caseNumber !== undefined) {
      updates.caseNumber = body.caseNumber ? String(body.caseNumber).trim().slice(0, 100) : null;
    }
    if (body.courtName !== undefined) {
      updates.courtName = body.courtName ? String(body.courtName).trim().slice(0, 200) : null;
    }
    if (body.jurisdiction !== undefined) {
      updates.jurisdiction = body.jurisdiction
        ? String(body.jurisdiction).trim().slice(0, 100)
        : null;
    }
    if (body.description !== undefined || body.summary !== undefined) {
      const text = body.description ?? body.summary;
      updates.description = text ? String(text).trim().slice(0, 5000) : null;
    }
    if (body.status !== undefined) {
      updates.status = toDbStatus(body.status);
    }

    const [updated] = await db
      .update(mattersTable)
      .set(updates)
      .where(
        and(eq(mattersTable.id, req.params.matterId), eq(mattersTable.userId, resolved.userId))
      )
      .returning();

    if (!updated) {
      return res.status(404).json({ success: false, error: "Matter not found after update" });
    }

    return res.json({ success: true, matter: mapMatterRow(updated) });
  } catch (err) {
    console.error("[matters] patch error:", err);
    return res.status(500).json({ success: false, error: "Failed to update matter" });
  }
});

// ---------------------------------------------------------------------------
// PARTIES
// ---------------------------------------------------------------------------
mattersRouter.get(
  "/matters/:matterId/parties",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }
      const resolved = await resolveAppUserId(req.user);
      if (!resolved.ok) {
        return res.status(resolved.status).json({ success: false, error: resolved.error });
      }
      const owned = await assertMatterOwned(req.params.matterId, resolved.userId);
      if (!owned.ok) {
        return res.status(owned.status).json({ success: false, error: owned.error });
      }

      const parties = await db
        .select()
        .from(partiesTable)
        .where(eq(partiesTable.matterId, req.params.matterId));

      return res.json({
        success: true,
        parties: parties.map((p) => ({
          id: p.id,
          matterId: p.matterId,
          name: p.name,
          role: p.role,
          contactInfo: p.contactInfo,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
      });
    } catch (err) {
      console.error("[matters] list parties error:", err);
      return res.status(500).json({ success: false, error: "Failed to list parties" });
    }
  }
);

mattersRouter.post(
  "/matters/:matterId/parties",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }
      const resolved = await resolveAppUserId(req.user);
      if (!resolved.ok) {
        return res.status(resolved.status).json({ success: false, error: resolved.error });
      }
      const owned = await assertMatterOwned(req.params.matterId, resolved.userId);
      if (!owned.ok) {
        return res.status(owned.status).json({ success: false, error: owned.error });
      }

      const { name, role, contactInfo } = req.body || {};
      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ success: false, error: "name is required" });
      }
      const allowedRoles = [
        "defendant",
        "plaintiff",
        "prosecutor",
        "defense_attorney",
        "judge",
        "witness",
      ];
      if (!role || !allowedRoles.includes(String(role))) {
        return res.status(400).json({
          success: false,
          error: `role must be one of: ${allowedRoles.join(", ")}`,
        });
      }

      const [inserted] = await db
        .insert(partiesTable)
        .values({
          matterId: req.params.matterId,
          name: String(name).trim().slice(0, 200),
          role: role as
            | "defendant"
            | "plaintiff"
            | "prosecutor"
            | "defense_attorney"
            | "judge"
            | "witness",
          contactInfo: contactInfo && typeof contactInfo === "object" ? contactInfo : null,
        })
        .returning();

      return res.status(201).json({ success: true, party: inserted });
    } catch (err) {
      console.error("[matters] create party error:", err);
      return res.status(500).json({ success: false, error: "Failed to create party" });
    }
  }
);

// ---------------------------------------------------------------------------
// DEADLINES
// ---------------------------------------------------------------------------
mattersRouter.get(
  "/matters/:matterId/deadlines",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }
      const resolved = await resolveAppUserId(req.user);
      if (!resolved.ok) {
        return res.status(resolved.status).json({ success: false, error: resolved.error });
      }
      const owned = await assertMatterOwned(req.params.matterId, resolved.userId);
      if (!owned.ok) {
        return res.status(owned.status).json({ success: false, error: owned.error });
      }

      const rows = await db
        .select()
        .from(deadlinesTable)
        .where(eq(deadlinesTable.matterId, req.params.matterId))
        .orderBy(deadlinesTable.dueDate);

      return res.json({
        success: true,
        deadlines: rows.map((d) => ({
          id: d.id,
          matterId: d.matterId,
          title: d.title,
          dueDate: d.dueDate ? new Date(d.dueDate).toISOString() : null,
          status: d.status || "pending",
          relatedDocumentId: d.relatedDocumentId,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        })),
      });
    } catch (err) {
      console.error("[matters] list deadlines error:", err);
      return res.status(500).json({ success: false, error: "Failed to list deadlines" });
    }
  }
);

mattersRouter.post(
  "/matters/:matterId/deadlines",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }
      const resolved = await resolveAppUserId(req.user);
      if (!resolved.ok) {
        return res.status(resolved.status).json({ success: false, error: resolved.error });
      }
      const owned = await assertMatterOwned(req.params.matterId, resolved.userId);
      if (!owned.ok) {
        return res.status(owned.status).json({ success: false, error: owned.error });
      }

      const { title, dueDate, status, relatedDocumentId } = req.body || {};
      if (!title || typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ success: false, error: "title is required" });
      }
      if (!dueDate) {
        return res.status(400).json({ success: false, error: "dueDate is required (ISO 8601)" });
      }
      const parsedDue = new Date(dueDate);
      if (Number.isNaN(parsedDue.getTime())) {
        return res.status(400).json({ success: false, error: "dueDate must be a valid date" });
      }

      const [inserted] = await db
        .insert(deadlinesTable)
        .values({
          matterId: req.params.matterId,
          title: String(title).trim().slice(0, 300),
          dueDate: parsedDue,
          status: status ? String(status).slice(0, 40) : "pending",
          relatedDocumentId:
            relatedDocumentId && isUuid(String(relatedDocumentId))
              ? String(relatedDocumentId)
              : null,
        })
        .returning();

      return res.status(201).json({
        success: true,
        deadline: {
          id: inserted.id,
          matterId: inserted.matterId,
          title: inserted.title,
          dueDate: inserted.dueDate ? new Date(inserted.dueDate).toISOString() : null,
          status: inserted.status || "pending",
          relatedDocumentId: inserted.relatedDocumentId,
          createdAt: inserted.createdAt,
          updatedAt: inserted.updatedAt,
        },
      });
    } catch (err) {
      console.error("[matters] create deadline error:", err);
      return res.status(500).json({ success: false, error: "Failed to create deadline" });
    }
  }
);

mattersRouter.patch(
  "/matters/:matterId/deadlines/:deadlineId",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }
      const resolved = await resolveAppUserId(req.user);
      if (!resolved.ok) {
        return res.status(resolved.status).json({ success: false, error: resolved.error });
      }
      const owned = await assertMatterOwned(req.params.matterId, resolved.userId);
      if (!owned.ok) {
        return res.status(owned.status).json({ success: false, error: owned.error });
      }
      if (!isUuid(req.params.deadlineId)) {
        return res.status(400).json({ success: false, error: "Invalid deadline ID format" });
      }

      const body = req.body || {};
      const updates: Partial<typeof deadlinesTable.$inferInsert> = {
        updatedAt: new Date(),
      };
      if (typeof body.title === "string" && body.title.trim()) {
        updates.title = body.title.trim().slice(0, 300);
      }
      if (body.dueDate !== undefined) {
        const parsedDue = new Date(body.dueDate);
        if (Number.isNaN(parsedDue.getTime())) {
          return res.status(400).json({ success: false, error: "dueDate must be a valid date" });
        }
        updates.dueDate = parsedDue;
      }
      if (body.status !== undefined) {
        updates.status = String(body.status).slice(0, 40);
      }

      const [updated] = await db
        .update(deadlinesTable)
        .set(updates)
        .where(
          and(
            eq(deadlinesTable.id, req.params.deadlineId),
            eq(deadlinesTable.matterId, req.params.matterId)
          )
        )
        .returning();

      if (!updated) {
        return res.status(404).json({ success: false, error: "Deadline not found" });
      }

      return res.json({
        success: true,
        deadline: {
          id: updated.id,
          matterId: updated.matterId,
          title: updated.title,
          dueDate: updated.dueDate ? new Date(updated.dueDate).toISOString() : null,
          status: updated.status || "pending",
          relatedDocumentId: updated.relatedDocumentId,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        },
      });
    } catch (err) {
      console.error("[matters] patch deadline error:", err);
      return res.status(500).json({ success: false, error: "Failed to update deadline" });
    }
  }
);

export default mattersRouter;
