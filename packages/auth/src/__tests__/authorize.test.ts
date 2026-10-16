/**
 * COC-294 / COC-038 / COC-113 acceptance: cross-tenant and unauthorized access must be refused.
 */
import { describe, it, expect } from "vitest";
import { authorize, requireAuth } from "../authorize";
import type { AuthContext } from "../types";
import { AppError } from "@chain-of-command/shared";

function ctx(overrides: Partial<AuthContext> = {}): AuthContext {
  return {
    userId: "user-a",
    tenantId: "tenant-a",
    tenantRole: "member",
    caseRoles: { "case-1": "collaborator" },
    sessionId: "sess-1",
    traceId: "trace-1",
    ...overrides,
  };
}

describe("authorize — tenancy & RBAC", () => {
  it("requireAuth throws UNAUTHENTICATED when missing", () => {
    expect(() => requireAuth(null)).toThrow(AppError);
    try {
      requireAuth(undefined);
    } catch (e) {
      expect((e as AppError).code).toBe("UNAUTHENTICATED");
    }
  });

  it("denies cross-case access when user has no membership", () => {
    const c = ctx();
    expect(() =>
      authorize(c, { resource: "case", action: "read", caseId: "case-other-tenant" })
    ).toThrow(AppError);
    try {
      authorize(c, { resource: "case", action: "read", caseId: "case-other-tenant" });
    } catch (e) {
      expect((e as AppError).code).toBe("FORBIDDEN");
    }
  });

  it("allows read on owned case", () => {
    expect(() =>
      authorize(ctx(), { resource: "case", action: "read", caseId: "case-1" })
    ).not.toThrow();
  });

  it("denies write for viewer case role", () => {
    const c = ctx({ caseRoles: { "case-1": "viewer" } });
    expect(() =>
      authorize(c, { resource: "case", action: "write", caseId: "case-1" })
    ).toThrow(AppError);
  });

  it("denies admin actions for non-admin tenant roles", () => {
    expect(() =>
      authorize(ctx({ tenantRole: "member" }), { resource: "admin", action: "configure" })
    ).toThrow(AppError);
  });

  it("allows admin for owner", () => {
    expect(() =>
      authorize(ctx({ tenantRole: "owner" }), { resource: "admin", action: "configure" })
    ).not.toThrow();
  });

  it("requires fresh MFA for external_action", () => {
    expect(() =>
      authorize(ctx(), { resource: "external_action", action: "approve" })
    ).toThrow(AppError);

    const fresh = ctx({ mfaVerifiedAt: new Date().toISOString() });
    // Still needs case/tenant permission path — MFA gate runs first
    expect(() =>
      authorize(fresh, { resource: "external_action", action: "approve" })
    ).not.toThrow(); // MFA ok; no further case check for this resource in current impl
  });

  it("rejects stale MFA for external_action", () => {
    const stale = ctx({
      mfaVerifiedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    });
    try {
      authorize(stale, { resource: "external_action", action: "approve" });
      expect.unreachable("should have thrown");
    } catch (e) {
      expect((e as AppError).code).toBe("APPROVAL_REQUIRED");
    }
  });
});
