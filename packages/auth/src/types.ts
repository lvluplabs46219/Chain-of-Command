export type TenantRole = 'owner' | 'admin' | 'staff' | 'member' | 'viewer';
export type CaseRole = 'owner' | 'collaborator' | 'viewer';

export interface AuthContext {
  userId: string;
  tenantId: string;
  email?: string;
  tenantRole: TenantRole;
  caseRoles: Record<string, CaseRole>; // caseId -> role
  mfaVerifiedAt?: string; // ISO; required freshness for external actions
  sessionId: string;
  traceId: string;
}

export interface PermissionCheck {
  resource: 'case' | 'document' | 'agent' | 'audit' | 'admin' | 'external_action';
  action: 'read' | 'write' | 'delete' | 'approve' | 'configure';
  caseId?: string;
  documentSensitivity?: 'standard' | 'high' | 'restricted';
}
