import { AppError } from '@chain-of-command/shared';
import type { AuthContext, PermissionCheck, TenantRole, CaseRole } from './types';

const TENANT_ROLE_RANK: Record<TenantRole, number> = {
  viewer: 1,
  member: 2,
  staff: 3,
  admin: 4,
  owner: 5,
};

const CASE_ROLE_RANK: Record<CaseRole, number> = {
  viewer: 1,
  collaborator: 2,
  owner: 3,
};

/**
 * Server-side authorization. Client checks are UX only.
 * Deny by default.
 */
export function authorize(ctx: AuthContext, check: PermissionCheck): void {
  // External actions always require fresh MFA
  if (check.resource === 'external_action') {
    if (!ctx.mfaVerifiedAt) {
      throw new AppError('APPROVAL_REQUIRED', 'Fresh MFA required for external legal actions');
    }
    const ageMs = Date.now() - new Date(ctx.mfaVerifiedAt).getTime();
    if (ageMs > 5 * 60 * 1000) {
      // 5 minute freshness window
      throw new AppError('APPROVAL_REQUIRED', 'MFA re-verification required (expired)');
    }
  }

  if (check.resource === 'admin') {
    if (TENANT_ROLE_RANK[ctx.tenantRole] < TENANT_ROLE_RANK.admin) {
      throw new AppError('FORBIDDEN', 'Admin role required');
    }
    return;
  }

  if (check.caseId) {
    const caseRole = ctx.caseRoles[check.caseId];
    if (!caseRole) {
      throw new AppError('FORBIDDEN', 'No membership on this case');
    }
    if (check.action === 'read' && CASE_ROLE_RANK[caseRole] >= CASE_ROLE_RANK.viewer) return;
    if (check.action === 'write' && CASE_ROLE_RANK[caseRole] >= CASE_ROLE_RANK.collaborator) return;
    if (check.action === 'delete' && CASE_ROLE_RANK[caseRole] >= CASE_ROLE_RANK.owner) return;
    if (check.action === 'configure' && CASE_ROLE_RANK[caseRole] >= CASE_ROLE_RANK.owner) return;
    throw new AppError('FORBIDDEN', `Case role '${caseRole}' cannot ${check.action}`);
  }

  // Tenant-scoped non-case resources
  if (check.action === 'read' && TENANT_ROLE_RANK[ctx.tenantRole] >= TENANT_ROLE_RANK.viewer) return;
  if (check.action === 'write' && TENANT_ROLE_RANK[ctx.tenantRole] >= TENANT_ROLE_RANK.member) return;

  throw new AppError('FORBIDDEN');
}

export function requireAuth(ctx: AuthContext | null | undefined): asserts ctx is AuthContext {
  if (!ctx?.userId || !ctx?.tenantId) {
    throw new AppError('UNAUTHENTICATED');
  }
}
