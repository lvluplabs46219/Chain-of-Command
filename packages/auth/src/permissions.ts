// packages/auth/src/permissions.ts
// Permission checking utilities for Chain of Command

import {
  Permission,
  UserRole,
  AuthorizationContext,
  PermissionCheckResult,
  ResourceAccessResult,
  ROLE_PERMISSIONS,
} from './types';
import { AuthErrorCode, AuthorizationError } from './errors';

// ============================================================================
// PERMISSION CHECKING
// ============================================================================

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  context: AuthorizationContext,
  permission: Permission,
): boolean {
  return context.permissions.has(permission);
}

/**
 * Check if a user has all required permissions
 */
export function hasPermissions(
  context: AuthorizationContext,
  permissions: Permission[],
): PermissionCheckResult {
  const missing: Permission[] = [];
  
  for (const permission of permissions) {
    if (!context.permissions.has(permission)) {
      missing.push(permission);
    }
  }
  
  return {
    allowed: missing.length === 0,
    permission: permissions[0],
    reason: missing.length === 0 ? 'All permissions granted' : 'Missing permissions',
    missingPermissions: missing,
  };
}

/**
 * Check if a user has any of the required permissions
 */
export function hasAnyPermission(
  context: AuthorizationContext,
  permissions: Permission[],
): boolean {
  return permissions.some(p => context.permissions.has(p));
}

/**
 * Check if a user has a specific role
 */
export function hasRole(context: AuthorizationContext, role: UserRole): boolean {
  // For now, simple role check
  // In a real implementation with hierarchical roles, we'd check role hierarchy
  return context.role === role;
}

/**
 * Check if a user has any of the required roles
 */
export function hasAnyRole(context: AuthorizationContext, roles: UserRole[]): boolean {
  return roles.includes(context.role);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return getRolePermissions(role).includes(permission);
}

// ============================================================================
// RESOURCE ACCESS CONTROL
// ============================================================================

/**
 * Check if user can access a resource
 * @param context - Authorization context
 * @param action - The action being performed (e.g., 'read', 'write', 'delete')
 * @param resourceType - Type of resource (e.g., 'case', 'document')
 * @param ownerId - ID of the resource owner
 * @param tenantId - Tenant ID of the resource
 */
export function canAccessResource(
  context: AuthorizationContext,
  action: 'read' | 'write' | 'delete' | 'create' | 'list',
  resourceType: string,
  ownerId?: string,
  tenantId?: string,
): ResourceAccessResult {
  // Check tenant access
  if (tenantId && context.tenantId !== tenantId) {
    return {
      allowed: false,
      resourceType,
      resourceId: ownerId || '',
      action,
      reason: 'Resource is in a different tenant',
    };
  }
  
  // Check ownership (for user-scoped resources)
  if (ownerId && context.userId !== ownerId) {
    return {
      allowed: false,
      resourceType,
      resourceId: ownerId,
      action,
      reason: 'User does not own this resource',
    };
  }
  
  // Check permission based on action and resource type
  const permissionMap: Record<string, Record<'read' | 'write' | 'delete' | 'create' | 'list', Permission>> = {
    case: {
      read: 'case:read',
      write: 'case:update',
      delete: 'case:delete',
      create: 'case:create',
      list: 'case:list',
    },
    document: {
      read: 'document:read',
      write: 'document:update',
      delete: 'document:delete',
      create: 'document:create',
      list: 'document:read', // List typically uses read permission
    },
    matter: {
      read: 'matter:read',
      write: 'matter:update',
      delete: 'matter:delete',
      create: 'matter:create',
      list: 'matter:read',
    },
    agent: {
      read: 'agent:read',
      write: 'agent:update',
      delete: 'agent:delete',
      create: 'agent:create',
      list: 'agent:read',
    },
    authority: {
      read: 'legal_library:read',
      write: 'legal_library:ingest',
      delete: 'legal_library:ingest',
      create: 'legal_library:ingest',
      list: 'legal_library:read',
    },
    directory: {
      read: 'directory:read',
      write: 'directory:search', // Write to directory is search
      delete: 'directory:search',
      create: 'directory:search',
      list: 'directory:read',
    },
  };
  
  const requiredPermission = permissionMap[resourceType]?.[action];
  
  if (!requiredPermission) {
    // Unknown resource type or action - deny by default
    return {
      allowed: false,
      resourceType,
      resourceId: ownerId || '',
      action,
      reason: 'Unknown resource type or action',
    };
  }
  
  if (!hasPermission(context, requiredPermission)) {
    return {
      allowed: false,
      resourceType,
      resourceId: ownerId || '',
      action,
      reason: `Missing permission: ${requiredPermission}`,
    };
  }
  
  return {
    allowed: true,
    resourceType,
    resourceId: ownerId || '',
    action,
  };
}

// ============================================================================
// EXTERNAL ACTION AUTHORIZATION
// ============================================================================

/**
 * External action types that ALWAYS require human approval (Invariant I-8)
 */
export const EXTERNAL_ACTIONS = new Set([
  'file',
  'submit',
  'contact_court',
  'serve',
  'enter_plea',
  'sign_document',
  'send_email',
  'publish',
]);

/**
 * Check if an action requires human approval
 */
export function requiresHumanApproval(action: string): boolean {
  return EXTERNAL_ACTIONS.has(action);
}

/**
 * Validate that an action has required human approval
 */
export function validateHumanApproval(
  action: string,
  approval: { userId: string; approved: boolean } | undefined,
  context: AuthorizationContext,
): boolean {
  // External actions always require approval
  if (requiresHumanApproval(action)) {
    if (!approval?.approved) {
      return false;
    }
    
    // The approving user must be the same as the acting user
    // (or an admin with override capability)
    if (approval.userId !== context.userId && context.role !== 'admin') {
      return false;
    }
  }
  
  return true;
}

// ============================================================================
// PERMISSION UTILITIES
// ============================================================================

/**
 * Create an authorization context from a user object
 */
export function createAuthorizationContext(
  userId: string,
  tenantId: string,
  sessionId: string,
  role: UserRole,
  permissions: Permission[],
  mfaVerified: boolean,
  ipAddress?: string,
  userAgent?: string,
): AuthorizationContext {
  return {
    userId: userId as UserId,
    tenantId: tenantId as TenantId,
    sessionId: sessionId as SessionId,
    role,
    permissions: new Set(permissions),
    mfaVerified,
    ipAddress,
    userAgent,
    isAuthenticated: true,
    isServiceAccount: false,
  };
}

/**
 * Check if user is a system administrator
 */
export function isAdmin(context: AuthorizationContext): boolean {
  return context.role === 'admin';
}

/**
 * Check if user can perform system-level operations
 */
export function isSystemAdmin(context: AuthorizationContext): boolean {
  return hasPermission(context, 'system:admin');
}

/**
 * Check if user can access audit logs
 */
export function canAudit(context: AuthorizationContext): boolean {
  return hasPermission(context, 'system:audit');
}

/**
 * Assert that a user has permission (throws if not)
 */
export function assertPermission(
  context: AuthorizationContext,
  permission: Permission,
): void {
  if (!hasPermission(context, permission)) {
    throw new AuthorizationError(
      AuthErrorCode.PERMISSION_DENIED,
      `Permission denied: ${permission} required`
    );
  }
}

/**
 * Assert that a user has all permissions (throws if not)
 */
export function assertPermissions(
  context: AuthorizationContext,
  permissions: Permission[],
): void {
  const result = hasPermissions(context, permissions);
  
  if (!result.allowed) {
    throw new AuthorizationError(
      AuthErrorCode.PERMISSION_DENIED,
      `Missing permissions: ${result.missingPermissions?.join(', ') || 'Unknown'}`
    );
  }
}

/**
 * Assert that a user has a role (throws if not)
 */
export function assertRole(
  context: AuthorizationContext,
  role: UserRole,
): void {
  if (!hasRole(context, role)) {
    throw new AuthorizationError(
      AuthErrorCode.UNAUTHORIZED,
      `Requires role: ${role}`
    );
  }
}

// ============================================================================
// TEST HELPERS
// ============================================================================

/**
 * Create a test authorization context for unit testing
 */
export function createTestAuthContext(
  overrides?: Partial<AuthorizationContext>,
): AuthorizationContext {
  return {
    userId: 'test-user-id' as UserId,
    tenantId: 'test-tenant-id' as TenantId,
    sessionId: 'test-session-id' as SessionId,
    role: 'user',
    permissions: new Set(ROLE_PERMISSIONS.user),
    mfaVerified: false,
    isAuthenticated: true,
    isServiceAccount: false,
    ...overrides,
  };
}

/**
 * Create an admin test context
 */
export function createAdminTestContext(): AuthorizationContext {
  return createTestAuthContext({
    role: 'admin',
    permissions: new Set([...ROLE_PERMISSIONS.admin, ...ROLE_PERMISSIONS.user]),
  });
}
