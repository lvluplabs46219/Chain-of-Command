/**
 * Object storage via Supabase Storage (service role).
 * Bucket default: matter-documents (override with SUPABASE_STORAGE_BUCKET).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "matter-documents";
const SIGNED_URL_TTL_SEC = Number(process.env.STORAGE_SIGNED_URL_TTL || 900);

const ALLOWED_MIME = new Set([
  "application/pdf",
  "text/plain",
  "text/csv",
  "text/markdown",
  "application/json",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

let admin: SupabaseClient | null = null;

function getAdminClient(): SupabaseClient | null {
  if (admin) return admin;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return admin;
}

export function isStorageConfigured(): boolean {
  return getAdminClient() !== null;
}

export function sanitizeFilename(name: string): string {
  return String(name || "file")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 180);
}

export function assertAllowedMime(mime: string | undefined): {
  ok: true;
  mime: string;
} | { ok: false; error: string } {
  const m = (mime || "application/octet-stream").toLowerCase();
  if (!ALLOWED_MIME.has(m)) {
    return {
      ok: false,
      error: `MIME type not allowed: ${m}. Allowed: ${[...ALLOWED_MIME].join(", ")}`,
    };
  }
  return { ok: true, mime: m };
}

export function buildObjectKey(matterId: string, filename: string): string {
  const safe = sanitizeFilename(filename);
  return `matters/${matterId}/${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${safe}`;
}

export async function createSignedUploadUrl(
  objectKey: string,
  _contentType?: string
): Promise<
  | { ok: true; signedUrl: string; token: string; path: string; bucket: string }
  | { ok: false; status: number; error: string }
> {
  const client = getAdminClient();
  if (!client) {
    return { ok: false, status: 501, error: "Object storage is not configured" };
  }
  const { data, error } = await client.storage
    .from(DEFAULT_BUCKET)
    .createSignedUploadUrl(objectKey);
  if (error || !data) {
    console.error("[storage] createSignedUploadUrl:", error?.message);
    return {
      ok: false,
      status: 502,
      error: error?.message || "Failed to create signed upload URL",
    };
  }
  return {
    ok: true,
    signedUrl: data.signedUrl,
    token: data.token,
    path: data.path,
    bucket: DEFAULT_BUCKET,
  };
}

export async function uploadBuffer(
  objectKey: string,
  buffer: Buffer,
  contentType: string
): Promise<
  | { ok: true; path: string; bucket: string; publicUrl: string | null }
  | { ok: false; status: number; error: string }
> {
  const client = getAdminClient();
  if (!client) {
    return { ok: false, status: 501, error: "Object storage is not configured" };
  }
  const { data, error } = await client.storage
    .from(DEFAULT_BUCKET)
    .upload(objectKey, buffer, {
      contentType,
      upsert: false,
    });
  if (error) {
    console.error("[storage] upload:", error.message);
    return { ok: false, status: 502, error: error.message };
  }
  const { data: pub } = client.storage.from(DEFAULT_BUCKET).getPublicUrl(data.path);
  return {
    ok: true,
    path: data.path,
    bucket: DEFAULT_BUCKET,
    publicUrl: pub?.publicUrl ?? null,
  };
}

export async function createSignedDownloadUrl(
  objectKey: string
): Promise<{ ok: true; signedUrl: string } | { ok: false; status: number; error: string }> {
  const client = getAdminClient();
  if (!client) {
    return { ok: false, status: 501, error: "Object storage is not configured" };
  }
  const { data, error } = await client.storage
    .from(DEFAULT_BUCKET)
    .createSignedUrl(objectKey, SIGNED_URL_TTL_SEC);
  if (error || !data?.signedUrl) {
    return { ok: false, status: 502, error: error?.message || "Failed to sign download URL" };
  }
  return { ok: true, signedUrl: data.signedUrl };
}

export function sha256Hex(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}
