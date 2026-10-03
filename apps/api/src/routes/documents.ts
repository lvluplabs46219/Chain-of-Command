import { Router, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import { verifySession, type AuthenticatedRequest } from "../middleware/verifySession";
import { resolveAppUserId } from "../lib/resolveAppUser";
import multer from "multer";
import { db, documentsTable, documentChunksTable, mattersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export const documentsRouter = Router();

documentsRouter.use(verifySession);

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many document uploads from this IP, please try again later",
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

/** Text extraction only — Ollama for LLM; no cloud vision OCR. */
function extractUploadText(file: Express.Multer.File): string {
  const asText = file.buffer.toString("utf-8").slice(0, 20000);
  if (asText && /[\x20-\x7E\n\r\t]{50,}/.test(asText)) {
    return asText;
  }
  return `Uploaded ${file.originalname} (${(file.size / 1024).toFixed(1)} KB, ${file.mimetype || "application/octet-stream"}). Binary OCR is not applied; attach plain-text exports for AI indexing.`;
}

/** Ensure the matter exists and belongs to the authenticated user. */
async function assertMatterOwnedByUser(
  matterId: string,
  userId: string
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (!matterId || typeof matterId !== "string") {
    return { ok: false, status: 400, error: "matterId is required" };
  }

  let matter: { id: string; userId: string | null } | undefined;
  try {
    const rows = await db
      .select({ id: mattersTable.id, userId: mattersTable.userId })
      .from(mattersTable)
      .where(eq(mattersTable.id, matterId))
      .limit(1);
    matter = rows[0];
  } catch (err) {
    console.error("[documents] matter ownership query failed:", err);
    return { ok: false, status: 503, error: "Database unavailable" };
  }

  if (!matter) {
    return { ok: false, status: 404, error: "Matter not found" };
  }
  if (matter.userId !== userId) {
    console.warn(
      `[documents] User ${userId} attempted access to matter ${matterId} owned by ${matter.userId}`
    );
    return {
      ok: false,
      status: 403,
      error: "Forbidden: Matter does not belong to authenticated user",
    };
  }
  return { ok: true };
}

// Signed upload URL — ownership required; URL is a placeholder until real object storage is wired
documentsRouter.post(
  "/documents/signed-upload-url",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const resolved = await resolveAppUserId(req.user);
      if (!resolved.ok) {
        return res.status(resolved.status).json({ error: resolved.error });
      }
      const { filename, fileType, matterId } = req.body;
      if (!filename || !matterId) {
        return res.status(400).json({ error: "filename and matterId are required" });
      }

      const ownership = await assertMatterOwnedByUser(String(matterId), resolved.userId);
      if (!ownership.ok) {
        return res.status(ownership.status).json({ error: ownership.error });
      }

      // Not a real signed URL — fail closed rather than invent storage credentials
      if (!process.env.SUPABASE_URL && !process.env.PINATA_JWT) {
        return res.status(501).json({
          error: "Object storage is not configured",
          message:
            "Signed uploads require SUPABASE storage or equivalent. Use POST /documents/upload for direct multipart upload.",
        });
      }

      const safeFilename = String(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
      const objectKey = `matters/${matterId}/${Date.now()}-${safeFilename}`;

      return res.status(501).json({
        error: "Signed upload not implemented",
        objectKey,
        hint: "Use multipart POST /documents/upload until storage signing is configured",
        headers: { "Content-Type": fileType || "application/pdf" },
      });
    } catch (err) {
      console.error("Signed upload URL error occurred");
      return res.status(500).json({ error: "Failed to generate signed upload URL" });
    }
  }
);

documentsRouter.post(
  "/documents/upload",
  uploadLimiter,
  upload.single("document") as any,
  async (req, res) => {
    const authenticatedReq = req as AuthenticatedRequest;
    try {
      if (!authenticatedReq.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const resolved = await resolveAppUserId(authenticatedReq.user);
      if (!resolved.ok) {
        return res.status(resolved.status).json({ error: resolved.error });
      }
      if (!req.file) {
        return res.status(400).json({ error: "No document file uploaded" });
      }
      const { caseId, matterId = caseId, documentType = "evidence" } = req.body;
      if (!matterId) {
        return res.status(400).json({ error: "matterId is required" });
      }

      const ownership = await assertMatterOwnedByUser(
        String(matterId),
        resolved.userId
      );
      if (!ownership.ok) {
        return res.status(ownership.status).json({ error: ownership.error });
      }

      const analysisResult = extractUploadText(req.file);
      const words = analysisResult.split(/\s+/);
      const chunks: string[] = [];
      for (let i = 0; i < words.length; i += 250) {
        chunks.push(words.slice(i, i + 250).join(" "));
      }

      let documentId: string;
      try {
        const [insertedDoc] = await db
          .insert(documentsTable)
          .values({
            matterId: String(matterId),
            title: req.file.originalname,
            type: documentType,
            filePath: `storage://${matterId}/${req.file.originalname}`,
            extractedText: analysisResult,
            aiSummary: analysisResult.slice(0, 500),
            metadata: {
              mimeType: req.file.mimetype,
              size: req.file.size,
              chunkCount: chunks.length,
              uploadedAt: new Date().toISOString(),
              uploadedBy: resolved.userId,
            },
          })
          .returning({ id: documentsTable.id });

        if (!insertedDoc?.id) {
          return res.status(500).json({ error: "Document insert returned no id" });
        }
        documentId = insertedDoc.id;

        for (let i = 0; i < chunks.length; i++) {
          await db.insert(documentChunksTable).values({
            documentId,
            chunkIndex: i,
            chunkText: chunks[i],
            metadata: { wordCount: chunks[i].split(" ").length },
          });
        }
      } catch (dbErr) {
        console.error("[documents] DB insert failed:", dbErr);
        return res.status(500).json({
          error: "Failed to persist document",
          message: "Upload was not indexed. Retry after checking database connectivity.",
        });
      }

      return res.status(201).json({
        success: true,
        documentId,
        title: req.file.originalname,
        analysis: analysisResult,
        chunksProcessed: chunks.length,
        message: "Document stored and chunked. Embeddings/OCR not applied in this path.",
      });
    } catch (error: unknown) {
      console.error("Document Pipeline Error occurred");
      const message = error instanceof Error ? error.message : "Document pipeline processing failed";
      return res.status(500).json({ error: message });
    }
  }
);

documentsRouter.get(
  "/matters/:matterId/documents",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const resolved = await resolveAppUserId(req.user);
      if (!resolved.ok) {
        return res.status(resolved.status).json({ error: resolved.error });
      }
      const { matterId } = req.params;

      const ownership = await assertMatterOwnedByUser(matterId, resolved.userId);
      if (!ownership.ok) {
        return res.status(ownership.status).json({ error: ownership.error });
      }

      try {
        const docs = await db
          .select()
          .from(documentsTable)
          .where(eq(documentsTable.matterId, matterId));
        return res.json({ documents: docs });
      } catch (e) {
        console.error("[documents] list query failed:", e);
        return res.status(503).json({
          error: "Failed to list documents",
          message: "Database query failed. No placeholder documents are returned.",
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      return res.status(500).json({ error: message });
    }
  }
);

export default documentsRouter;
