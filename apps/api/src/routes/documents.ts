import { Router, type Response } from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { eq } from "drizzle-orm";
import {
  db,
  documentsTable,
  documentChunksTable,
  mattersTable,
  auditLogsTable,
} from "@workspace/db";
import { verifySession, type AuthenticatedRequest } from "../middleware/verifySession";
import { resolveAppUserId } from "../lib/resolveAppUser";
import {
  assertAllowedMime,
  buildObjectKey,
  createSignedUploadUrl,
  isStorageConfigured,
  sanitizeFilename,
  sha256Hex,
  uploadBuffer,
} from "../lib/storage";

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

function extractUploadText(file: Express.Multer.File): string {
  const asText = file.buffer.toString("utf-8").slice(0, 20000);
  if (asText && /[\x20-\x7E\n\r\t]{50,}/.test(asText)) {
    return asText;
  }
  return `Uploaded ${file.originalname} (${(file.size / 1024).toFixed(1)} KB, ${file.mimetype || "application/octet-stream"}). Binary OCR is not applied; attach plain-text exports for AI indexing.`;
}

async function assertMatterOwnedByUser(
  matterId: string,
  userId: string
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (!matterId || typeof matterId !== "string") {
    return { ok: false, status: 400, error: "matterId is required" };
  }
  try {
    const rows = await db
      .select({ id: mattersTable.id, userId: mattersTable.userId })
      .from(mattersTable)
      .where(eq(mattersTable.id, matterId))
      .limit(1);
    const matter = rows[0];
    if (!matter) return { ok: false, status: 404, error: "Matter not found" };
    if (matter.userId !== userId) {
      return {
        ok: false,
        status: 403,
        error: "Forbidden: Matter does not belong to authenticated user",
      };
    }
    return { ok: true };
  } catch (err) {
    console.error("[documents] matter ownership query failed:", err);
    return { ok: false, status: 503, error: "Database unavailable" };
  }
}

async function writeAudit(params: {
  userId: string;
  matterId: string;
  action: string;
  details: Record<string, unknown>;
  ip?: string;
}) {
  try {
    await db.insert(auditLogsTable).values({
      userId: params.userId,
      matterId: params.matterId,
      action: params.action,
      details: params.details,
      ipAddress: params.ip || null,
    });
  } catch (err) {
    console.error("[documents] audit log write failed:", err);
  }
}

// Real Supabase signed upload URL (ownership required)
documentsRouter.post(
  "/documents/signed-upload-url",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });
      const resolved = await resolveAppUserId(req.user);
      if (!resolved.ok) {
        return res.status(resolved.status).json({ error: resolved.error });
      }

      const { filename, fileType, matterId } = req.body || {};
      if (!filename || !matterId) {
        return res.status(400).json({ error: "filename and matterId are required" });
      }

      const ownership = await assertMatterOwnedByUser(String(matterId), resolved.userId);
      if (!ownership.ok) {
        return res.status(ownership.status).json({ error: ownership.error });
      }

      const mimeCheck = assertAllowedMime(fileType);
      if (!mimeCheck.ok) {
        return res.status(415).json({ error: mimeCheck.error });
      }

      if (!isStorageConfigured()) {
        return res.status(501).json({
          error: "Object storage is not configured",
          message:
            "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, create bucket matter-documents. Fallback: POST /documents/upload",
        });
      }

      const objectKey = buildObjectKey(String(matterId), String(filename));
      const signed = await createSignedUploadUrl(objectKey, mimeCheck.mime);
      if (!signed.ok) {
        return res.status(signed.status).json({ error: signed.error });
      }

      await writeAudit({
        userId: resolved.userId,
        matterId: String(matterId),
        action: "document.signed_upload_url",
        details: { objectKey, mime: mimeCheck.mime, filename: sanitizeFilename(String(filename)) },
        ip: req.ip,
      });

      return res.status(200).json({
        signedUrl: signed.signedUrl,
        token: signed.token,
        path: signed.path,
        bucket: signed.bucket,
        objectKey,
        headers: { "Content-Type": mimeCheck.mime },
      });
    } catch (err) {
      console.error("[documents] signed-upload-url error:", err);
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

      const { caseId, matterId = caseId, documentType = "evidence" } = req.body || {};
      if (!matterId) {
        return res.status(400).json({ error: "matterId is required" });
      }

      const ownership = await assertMatterOwnedByUser(String(matterId), resolved.userId);
      if (!ownership.ok) {
        return res.status(ownership.status).json({ error: ownership.error });
      }

      const mimeCheck = assertAllowedMime(req.file.mimetype);
      if (!mimeCheck.ok) {
        return res.status(415).json({ error: mimeCheck.error });
      }

      const contentHash = sha256Hex(req.file.buffer);
      const objectKey = buildObjectKey(String(matterId), req.file.originalname);
      let storagePath = `memory://${objectKey}`;
      let storageBucket: string | null = null;

      if (isStorageConfigured()) {
        const uploaded = await uploadBuffer(objectKey, req.file.buffer, mimeCheck.mime);
        if (!uploaded.ok) {
          return res.status(uploaded.status).json({
            error: "Storage upload failed",
            message: uploaded.error,
          });
        }
        storagePath = `supabase://${uploaded.bucket}/${uploaded.path}`;
        storageBucket = uploaded.bucket;
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
            title: sanitizeFilename(req.file.originalname),
            type: documentType,
            filePath: storagePath,
            extractedText: analysisResult,
            aiSummary: analysisResult.slice(0, 500),
            metadata: {
              mimeType: mimeCheck.mime,
              size: req.file.size,
              chunkCount: chunks.length,
              contentSha256: contentHash,
              objectKey,
              storageBucket,
              uploadedAt: new Date().toISOString(),
              uploadedBy: resolved.userId,
              storageConfigured: isStorageConfigured(),
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

      await writeAudit({
        userId: resolved.userId,
        matterId: String(matterId),
        action: "document.upload",
        details: {
          documentId,
          contentSha256: contentHash,
          objectKey,
          storagePath,
          mime: mimeCheck.mime,
          size: req.file.size,
          chunks: chunks.length,
        },
        ip: authenticatedReq.ip,
      });

      return res.status(201).json({
        success: true,
        documentId,
        title: sanitizeFilename(req.file.originalname),
        contentSha256: contentHash,
        storagePath,
        analysis: analysisResult,
        chunksProcessed: chunks.length,
        message: isStorageConfigured()
          ? "Document stored in object storage and indexed."
          : "Document indexed in DB only (object storage not configured).",
      });
    } catch (error: unknown) {
      console.error("[documents] pipeline error:", error);
      const message =
        error instanceof Error ? error.message : "Document pipeline processing failed";
      return res.status(500).json({ error: message });
    }
  }
);

documentsRouter.get(
  "/matters/:matterId/documents",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });
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
