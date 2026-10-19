/**
 * Builds AuthContext from verified session + request headers (COC-294).
 * Server-resolved only — never trust client-supplied role/tenant as authority.
 */
import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./verifySession";
import type { AuthContext, TenantRole, CaseRole, PermissionCheck } from "@chain-of-command/auth";
import { authorize, requireAuth } from "@chain-of-command/auth";
import { AppError, makeError } from "@chain-of-command/shared";

export interface AuthedRequest extends AuthenticatedRequest {
  auth?: AuthContext;
}

function roleFromMetadata(meta: Record<string, unknown> | undefined): TenantRole {
  const r = (meta?.tenant_role || meta?.role) as string | undefined;
  if (r === "owner" || r === "admin" || r === "staff" || r === "member" || r === "viewer") {
    return r;
  }
  // pro_se / default litigant → member
  return "member";
}

/**
 * After verifySession, attach a full AuthContext.
 * tenantId resolution order: x-tenant-id header (from Next middleware cookie bridge)
 * → user_metadata.tenant_id → "default" (dev only).
 */
export function attachAuthContext(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    if (!req.user) {
      res.status(401).json(makeError("UNAUTHENTICATED"));
      return;
    }

    const meta = (req.user.user_metadata || {}) as Record<string, unknown>;
    const headerTenant = (req.headers["x-tenant-id"] as string | undefined)?.trim();
    const metaTenant = typeof meta.tenant_id === "string" ? meta.tenant_id : undefined;

    // In production never fall back to a shared default tenant
    const tenantId =
      headerTenant ||
      metaTenant ||
      (process.env.NODE_ENV === "production" ? undefined : "dev-tenant");

    if (!tenantId) {
      res.status(401).json(
        makeError("UNAUTHENTICATED", "No tenant bound to this session")
      );
      return;
    }

    // Case roles: only from server-side sources later; start empty (deny by default)
    const caseRoles: Record<string, CaseRole> = {};

    req.auth = {
      userId: req.user.id,
      tenantId,
      email: req.user.email,
      tenantRole: roleFromMetadata(meta),
      caseRoles,
      mfaVerifiedAt:
        typeof meta.mfa_verified_at === "string" ? meta.mfa_verified_at : undefined,
      sessionId: (req.headers["x-session-id"] as string) || req.user.id,
      traceId:
        (req.headers["x-trace-id"] as string) ||
        (req as { id?: string }).id ||
        crypto.randomUUID(),
    };

    next();
  } catch (err) {
    console.error("[attachAuthContext]", err);
    res.status(500).json(makeError("INTERNAL"));
  }
}

/**
 * Express middleware factory: require a specific permission.
 */
export function requirePermission(check: PermissionCheck) {
  return (req: AuthedRequest, res: Response, next: NextFunction): void => {
    try {
      requireAuth(req.auth);
      authorize(req.auth!, check);
      next();
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.httpStatus).json(err.toBody());
        return;
      }
      res.status(500).json(makeError("INTERNAL"));
    }
  };
}

export function handleAppError(err: unknown, res: Response): void {
  if (err instanceof AppError) {
    res.status(err.httpStatus).json(err.toBody());
    return;
  }
  console.error(err);
  res.status(500).json(makeError("INTERNAL"));
}
