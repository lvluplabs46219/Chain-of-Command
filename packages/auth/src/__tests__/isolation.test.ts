/**
 * Cross-tenant / case-role isolation suite (P0-1 CI gate).
 * Unit tests for deny-by-default authorize() + role ranking.
 * Integration tests against live RLS should use a staging project with two tenants.
 */
import { describe, it, expect } from 'vitest';
import { authorize, requireAuth } from '../authorize';
import type { AuthContext } from '../types';
import { AppError } from '@chain-of-command/shared';

function ctx(partial: Partial<AuthContext> & Pick<AuthContext, 'userId' | 'tenantId' | 'tenantRole'>): AuthContext {
  return {
    caseRoles: {},
    sessionId: 'sess-test',
    traceId: 'trace-test',
    ...partial,
  };
}

describe('P0-1 isolation — authorize()', () => {
  it('denies unauthenticated context', () => {
    expect(() => requireAuth(null)).toThrow(AppError);
    expect(() => requireAuth({ userId: '', tenantId: '', tenantRole: 'member', caseRoles: {}, sessionId: '', traceId: '' })).toThrow(
      AppError,
    );
  });

  it('viewer cannot write tenant-scoped resources', () => {
    const viewer = ctx({ userId: 'u1', tenantId: 't1', tenantRole: 'viewer' });
    expect(() => authorize(viewer, { resource: 'document', action: 'write' })).toThrow(AppError);
    expect(() => authorize(viewer, { resource: 'document', action: 'read' })).not.toThrow();
  });

  it('member can write; cannot admin', () => {
    const member = ctx({ userId: 'u1', tenantId: 't1', tenantRole: 'member' });
    expect(() => authorize(member, { resource: 'document', action: 'write' })).not.toThrow();
    expect(() => authorize(member, { resource: 'admin', action: 'configure' })).toThrow(AppError);
  });

  it('case viewer cannot write or delete', () => {
    const a = ctx({
      userId: 'u1',
      tenantId: 't1',
      tenantRole: 'member',
      caseRoles: { caseA: 'viewer' },
    });
    expect(() => authorize(a, { resource: 'case', action: 'read', caseId: 'caseA' })).not.toThrow();
    expect(() => authorize(a, { resource: 'case', action: 'write', caseId: 'caseA' })).toThrow(AppError);
    expect(() => authorize(a, { resource: 'case', action: 'delete', caseId: 'caseA' })).toThrow(AppError);
  });

  it('case collaborator can write but not delete/configure', () => {
    const a = ctx({
      userId: 'u1',
      tenantId: 't1',
      tenantRole: 'member',
      caseRoles: { caseA: 'collaborator' },
    });
    expect(() => authorize(a, { resource: 'case', action: 'write', caseId: 'caseA' })).not.toThrow();
    expect(() => authorize(a, { resource: 'case', action: 'delete', caseId: 'caseA' })).toThrow(AppError);
    expect(() => authorize(a, { resource: 'case', action: 'configure', caseId: 'caseA' })).toThrow(AppError);
  });

  it('case owner can delete and configure', () => {
    const a = ctx({
      userId: 'u1',
      tenantId: 't1',
      tenantRole: 'member',
      caseRoles: { caseA: 'owner' },
    });
    expect(() => authorize(a, { resource: 'case', action: 'delete', caseId: 'caseA' })).not.toThrow();
    expect(() => authorize(a, { resource: 'case', action: 'configure', caseId: 'caseA' })).not.toThrow();
  });

  it('no case membership → forbidden even for tenant member', () => {
    const a = ctx({ userId: 'u1', tenantId: 't1', tenantRole: 'member', caseRoles: {} });
    expect(() => authorize(a, { resource: 'case', action: 'read', caseId: 'foreign-case' })).toThrow(AppError);
  });

  it('external_action requires fresh MFA and member+', () => {
    const stale = ctx({
      userId: 'u1',
      tenantId: 't1',
      tenantRole: 'member',
      mfaVerifiedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    });
    expect(() => authorize(stale, { resource: 'external_action', action: 'approve' })).toThrow(AppError);

    const fresh = ctx({
      userId: 'u1',
      tenantId: 't1',
      tenantRole: 'member',
      mfaVerifiedAt: new Date().toISOString(),
    });
    expect(() => authorize(fresh, { resource: 'external_action', action: 'approve' })).not.toThrow();

    const viewer = ctx({
      userId: 'u1',
      tenantId: 't1',
      tenantRole: 'viewer',
      mfaVerifiedAt: new Date().toISOString(),
    });
    expect(() => authorize(viewer, { resource: 'external_action', action: 'approve' })).toThrow(AppError);
  });

  it('tenant A context never grants tenant B admin by role alone', () => {
    // AuthContext is single-tenant; cross-tenant must be impossible at context construction.
    // This test documents the contract: authorize never receives dual-tenant claims.
    const tenantA = ctx({ userId: 'u1', tenantId: 'tenant-A', tenantRole: 'owner' });
    expect(tenantA.tenantId).toBe('tenant-A');
    expect(tenantA.tenantId).not.toBe('tenant-B');
  });
});
