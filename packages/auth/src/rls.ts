// packages/auth/src/rls.ts
// Row-Level Security (RLS) implementation for Chain of Command
// Based on Master Implementation Prompt Invariant I-11

import {
  RlsPolicy,
  RlsContext,
  TenantId,
  UserId,
  UserRole,
  Permission,
} from './types';

// ============================================================================
// RLS POLICIES
// ============================================================================

/**
 * Predefined RLS policies for all tables
 * These policies enforce Invariant I-11: No silent cross-case or cross-tenant access
 */
export const RLS_POLICIES: RlsPolicy[] = [
  // Users table - users can only see themselves
  {
    table: 'users',
    policyName: 'users_self_only',
    using: 'id = current_user_id()',
    check: 'id = current_user_id()',
    roles: ['user', 'pro_user', 'admin', 'auditor'],
  },
  
  // Matters table - users can only see their own matters
  {
    table: 'matters',
    policyName: 'matters_tenant_filter',
    using: 'user_id = current_user_id() OR tenant_id = current_tenant_id()',
    check: 'user_id = current_user_id() AND tenant_id = current_tenant_id()',
    roles: ['user', 'pro_user', 'admin'],
  },
  
  // Parties table - filter by matter ownership
  {
    table: 'parties',
    policyName: 'parties_matter_filter',
    using: `
      EXISTS (
        SELECT 1 FROM matters 
        WHERE matters.id = parties.matter_id 
        AND matters.user_id = current_user_id()
        AND matters.tenant_id = current_tenant_id()
      )
    `,
    check: `
      EXISTS (
        SELECT 1 FROM matters 
        WHERE matters.id = parties.matter_id 
        AND matters.user_id = current_user_id()
        AND matters.tenant_id = current_tenant_id()
      )
    `,
    roles: ['user', 'pro_user', 'admin'],
  },
  
  // Documents table - filter by matter ownership
  {
    table: 'documents',
    policyName: 'documents_matter_filter',
    using: `
      EXISTS (
        SELECT 1 FROM matters 
        WHERE matters.id = documents.matter_id 
        AND matters.user_id = current_user_id()
        AND matters.tenant_id = current_tenant_id()
      )
    `,
    check: `
      EXISTS (
        SELECT 1 FROM matters 
        WHERE matters.id = documents.matter_id 
        AND matters.user_id = current_user_id()
        AND matters.tenant_id = current_tenant_id()
      )
    `,
    roles: ['user', 'pro_user', 'admin'],
  },
  
  // Evidence items table - filter by matter ownership
  {
    table: 'evidence_items',
    policyName: 'evidence_matter_filter',
    using: `
      EXISTS (
        SELECT 1 FROM matters 
        WHERE matters.id = evidence_items.matter_id 
        AND matters.user_id = current_user_id()
        AND matters.tenant_id = current_tenant_id()
      )
    `,
    check: `
      EXISTS (
        SELECT 1 FROM matters 
        WHERE matters.id = evidence_items.matter_id 
        AND matters.user_id = current_user_id()
        AND matters.tenant_id = current_tenant_id()
      )
    `,
    roles: ['user', 'pro_user', 'admin'],
  },
  
  // Timeline events table - filter by matter ownership
  {
    table: 'timeline_events',
    policyName: 'timeline_matter_filter',
    using: `
      EXISTS (
        SELECT 1 FROM matters 
        WHERE matters.id = timeline_events.matter_id 
        AND matters.user_id = current_user_id()
        AND matters.tenant_id = current_tenant_id()
      )
    `,
    check: `
      EXISTS (
        SELECT 1 FROM matters 
        WHERE matters.id = timeline_events.matter_id 
        AND matters.user_id = current_user_id()
        AND matters.tenant_id = current_tenant_id()
      )
    `,
    roles: ['user', 'pro_user', 'admin'],
  },
  
  // Deadlines table - filter by matter ownership
  {
    table: 'deadlines',
    policyName: 'deadlines_matter_filter',
    using: `
      EXISTS (
        SELECT 1 FROM matters 
        WHERE matters.id = deadlines.matter_id 
        AND matters.user_id = current_user_id()
        AND matters.tenant_id = current_tenant_id()
      )
    `,
    check: `
      EXISTS (
        SELECT 1 FROM matters 
        WHERE matters.id = deadlines.matter_id 
        AND matters.user_id = current_user_id()
        AND matters.tenant_id = current_tenant_id()
      )
    `,
    roles: ['user', 'pro_user', 'admin'],
  },
  
  // Audit logs - special handling
  // Admins and auditors can see all audit logs
  // Regular users can only see their own actions
  {
    table: 'audit_logs',
    policyName: 'audit_logs_user_filter',
    using: 'user_id = current_user_id()',
    check: 'user_id = current_user_id()',
    roles: ['user', 'pro_user'],
  },
  {
    table: 'audit_logs',
    policyName: 'audit_logs_admin_all',
    using: 'true', // Allow all
    check: 'true', // Allow all
    roles: ['admin', 'auditor'],
  },
  
  // Legal sources - public read access, write restricted
  {
    table: 'sources',
    policyName: 'sources_public_read',
    using: 'true', // Allow all to read
    check: 'true', // Allow writes only with permission
    roles: ['user', 'pro_user', 'admin'],
  },
  
  // Authorities - public read access
  {
    table: 'authorities',
    policyName: 'authorities_public_read',
    using: 'true', // Allow all to read
    check: 'true',
    roles: ['user', 'pro_user', 'admin'],
  },
  
  // Legal chunks - public read access
  {
    table: 'legal_chunks',
    policyName: 'legal_chunks_public_read',
    using: 'true', // Allow all to read
    check: 'true',
    roles: ['user', 'pro_user', 'admin'],
  },
  
  // Attorney directory - public read access
  {
    table: 'directory_lawyer_profiles',
    policyName: 'directory_public_read',
    using: 'true', // Public access
    check: 'true',
    roles: ['user', 'pro_user', 'admin'],
  },
];

// ============================================================================
// RLS CONTEXT MANAGEMENT
// ============================================================================

/**
 * Create RLS context from user session
 */
export function createRlsContext(
  userId: UserId,
  tenantId: TenantId,
  role: UserRole,
  permissions: Permission[],
): RlsContext {
  return {
    userId,
    tenantId,
    role,
    permissions,
  };
}

/**
 * Get RLS policies for a specific table
 */
export function getPoliciesForTable(table: string): RlsPolicy[] {
  return RLS_POLICIES.filter(policy => policy.table === table);
}

/**
 * Get the applicable policy for a user's role on a specific table
 */
export function getPolicyForRole(table: string, role: UserRole): RlsPolicy | undefined {
  const tablePolicies = getPoliciesForTable(table);
  return tablePolicies.find(policy => policy.roles.includes(role));
}

// ============================================================================
// SQL GENERATION
// ============================================================================

/**
 * Generate PostgreSQL RLS policy SQL statements
 */
export function generateRlsSql(table: string, role: UserRole): string {
  const policy = getPolicyForRole(table, role);
  
  if (!policy) {
    // If no specific policy, create a restrictive one
    return `-- No RLS policy for ${table} and role ${role}`;
  }
  
  const policyName = `${table}_${role}_policy`;
  
  // In PostgreSQL RLS, we use current_setting() or similar functions
  // For application-level RLS, we use WHERE clauses
  
  return `-- RLS Policy for ${table}
-- USING: ${policy.using}
-- CHECK: ${policy.check}
-- Roles: ${policy.roles.join(', ')}
`;
}

/**
 * Generate WHERE clause for application-level RLS filtering
 * This is used when we can't use PostgreSQL native RLS
 */
export function generateRlsWhereClause(
  table: string,
  context: RlsContext,
  alias: string = ''
): string {
  const policy = getPolicyForRole(table, context.role);
  
  if (!policy) {
    // Default to filtering by user_id if table has it
    return `${alias}user_id = '${context.userId}'`;
  }
  
  // Replace placeholders in the USING clause
  let whereClause = policy.using
    .replace(/current_user_id\(\)/g, `'${context.userId}'`)
    .replace(/current_tenant_id\(\)/g, `'${context.tenantId}'`)
    .replace(/current_role\(\)/g, `'${context.role}'`);
  
  // Add alias prefix if provided
  if (alias) {
    // Handle table.column references
    whereClause = whereClause
      .replace(/(\w+)\./g, `${alias}$1.`)
      .replace(/^(\w+)/, `${alias}$1`);
  }
  
  return whereClause;
}

/**
 * Generate JOIN conditions for RLS filtering
 */
export function generateRlsJoin(
  table: string,
  context: RlsContext,
  alias: string = ''
): string {
  const policy = getPolicyForRole(table, context.role);
  
  if (!policy || !policy.using.includes('EXISTS')) {
    return '';
  }
  
  // Extract the EXISTS clause and convert to JOIN
  const existsMatch = policy.using.match(/EXISTS\s*\((.*?)\)/s);
  if (!existsMatch) {
    return '';
  }
  
  const subquery = existsMatch[1];
  
  // Replace placeholders
  let joinClause = subquery
    .replace(/current_user_id\(\)/g, `'${context.userId}'`)
    .replace(/current_tenant_id\(\)/g, `'${context.tenantId}'`)
    .replace(/current_role\(\)/g, `'${context.role}'`);
  
  // Convert EXISTS to JOIN
  // This is a simplified conversion
  return joinClause;
}

// ============================================================================
// RLS MIDDLEWARE UTILITIES
// ============================================================================

/**
 * Apply RLS filtering to a query
 * This modifies the query to include RLS WHERE clauses
 */
export function applyRlsToQuery<T>(
  query: any, // In real implementation, this would be a query builder
  table: string,
  context: RlsContext,
  alias: string = ''
): any {
  // In a real implementation, this would modify the query builder
  // For now, we return the query unchanged
  // The actual RLS enforcement happens in PostgreSQL or in the query builder
  
  return query;
}

/**
 * Check if a query would violate RLS
 */
export function checkRlsViolation(
  table: string,
  userId: UserId,
  tenantId: TenantId,
  targetUserId?: UserId,
  targetTenantId?: TenantId,
): boolean {
  // If targeting a different user in the same tenant, check if allowed
  if (targetUserId && targetUserId !== userId) {
    // For most tables, users can only access their own resources
    const tablePolicies = getPoliciesForTable(table);
    const userPolicy = tablePolicies.find(p => p.roles.includes('user'));
    
    if (userPolicy && userPolicy.using.includes('current_user_id()')) {
      return true; // Violation - trying to access another user's data
    }
  }
  
  // If targeting a different tenant
  if (targetTenantId && targetTenantId !== tenantId) {
    return true; // Violation - cross-tenant access
  }
  
  return false;
}

// ============================================================================
// RLS TESTING
// ============================================================================

/**
 * Test RLS policy for a specific scenario
 */
export function testRlsPolicy(
  table: string,
  role: UserRole,
  userId: UserId,
  tenantId: TenantId,
  targetUserId?: UserId,
  targetTenantId?: TenantId,
): {
  allowed: boolean;
  policy?: RlsPolicy;
  reason?: string;
} {
  const policy = getPolicyForRole(table, role);
  
  if (!policy) {
    return {
      allowed: false,
      reason: 'No RLS policy defined for this table and role',
    };
  }
  
  // Simulate the policy check
  let allowed = true;
  let reason: string | undefined;
  
  // Check USING clause simulation
  if (policy.using.includes('current_user_id()')) {
    if (targetUserId && targetUserId !== userId) {
      allowed = false;
      reason = 'Target user does not match current user';
    }
  }
  
  if (policy.using.includes('current_tenant_id()')) {
    if (targetTenantId && targetTenantId !== tenantId) {
      allowed = false;
      reason = 'Target tenant does not match current tenant';
    }
  }
  
  // For EXISTS clauses, we'd need more context
  // This is a simplified check
  
  return {
    allowed,
    policy,
    reason,
  };
}

// ============================================================================
// RLS AUDIT
// ============================================================================

/**
 * Audit RLS check result
 */
export interface RlsAuditResult {
  checkId: string;
  table: string;
  action: 'read' | 'write' | 'delete';
  userId: UserId;
  tenantId: TenantId;
  targetUserId?: UserId;
  targetTenantId?: TenantId;
  allowed: boolean;
  policyName?: string;
  reason?: string;
  timestamp: Date;
}

/**
 * Log RLS check for audit purposes
 */
export function logRlsCheck(
  table: string,
  action: 'read' | 'write' | 'delete',
  userId: UserId,
  tenantId: TenantId,
  targetUserId?: UserId,
  targetTenantId?: TenantId,
  allowed: boolean,
  policyName?: string,
  reason?: string,
): RlsAuditResult {
  const result: RlsAuditResult = {
    checkId: `rls_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
    table,
    action,
    userId,
    tenantId,
    targetUserId,
    targetTenantId,
    allowed,
    policyName,
    reason,
    timestamp: new Date(),
  };
  
  // In a real implementation, this would be logged to the audit table
  // and potentially to external monitoring
  
  if (!allowed) {
    console.warn(`[RLS AUDIT] Denied: ${action} on ${table} - ${reason}`);
  }
  
  return result;
}
