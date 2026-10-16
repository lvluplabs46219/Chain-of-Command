// packages/auth/src/types.ts
// Authentication and Authorization types for Chain of Command
// Based on Master Implementation Prompt §2, §4, §9

import { z } from "zod";

// ============================================================================
// USER & SESSION TYPES
// ============================================================================

/** Unique identifier types for tenancy */
export type TenantId = string & { __brand: "TenantId" };
export type UserId = string & { __brand: "UserId" };
export type SessionId = string & { __brand: "SessionId" };
export type AgentId = string & { __brand: "AgentId" };
export type CaseId = string & { __brand: "CaseId" };

/** User authentication provider */
export const AuthProviderEnum = z.enum([
  "email_password",
  "google_oauth",
  "github_oauth",
  "microsoft_oauth",
  "apple_oauth",
  "sso",
]);
export type AuthProvider = z.infer<typeof AuthProviderEnum>;

/** User role in the system (RBAC) */
export const UserRoleEnum = z.enum([
  "user",           // Regular user (default)
  "pro_user",      // Pro user with advanced features
  "admin",         // System administrator
  "auditor",        // Read-only auditor
  "service",        // Service account
]);
export type UserRole = z.infer<typeof UserRoleEnum>;

/** Permission names (ABAC) */
export const PermissionEnum = z.enum([
  // Case permissions
  "case:create",
  "case:read",
  "case:update",
  "case:delete",
  "case:list",
  
  // Document permissions
  "document:create",
  "document:read",
  "document:update",
  "document:delete",
  "document:analyze",
  
  // Matter permissions
  "matter:create",
  "matter:read",
  "matter:update",
  "matter:delete",
  
  // Agent permissions
  "agent:create",
  "agent:read",
  "agent:update",
  "agent:delete",
  "agent:execute",
  
  // System permissions
  "system:admin",
  "system:audit",
  "system:config",
  
  // External action permissions (ALWAYS require human approval)
  "external:file",
  "external:submit",
  "external:contact_court",
  "external:serve",
  
  // Legal library permissions
  "legal_library:read",
  "legal_library:ingest",
  
  // Directory permissions
  "directory:read",
  "directory:search",
]);
export type Permission = z.infer<typeof PermissionEnum>;

/** Role-Permission mapping */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  user: [
    "case:create", "case:read", "case:update", "case:list",
    "document:create", "document:read", "document:update", "document:analyze",
    "matter:create", "matter:read", "matter:update",
    "agent:read", "agent:execute",
    "legal_library:read",
    "directory:read", "directory:search",
  ],
  pro_user: [
    ...ROLE_PERMISSIONS.user,
    "case:delete",
    "document:delete",
    "matter:delete",
    "agent:create", "agent:update", "agent:delete",
    "legal_library:ingest",
  ],
  admin: [
    ...ROLE_PERMISSIONS.pro_user,
    "system:admin",
    "system:audit",
    "system:config",
  ],
  auditor: [
    "case:read", "case:list",
    "document:read",
    "matter:read",
    "agent:read",
    "system:audit",
    "legal_library:read",
    "directory:read", "directory:search",
  ],
  service: [
    // Service accounts have custom permissions
  ],
};

// ============================================================================
// SESSION & TOKEN TYPES
// ============================================================================

/** JWT token types */
export const TokenTypeEnum = z.enum([
  "access_token",
  "refresh_token",
  "email_verification_token",
  "password_reset_token",
  "mfa_token",
  "api_key",
]);
export type TokenType = z.infer<typeof TokenTypeEnum>;

/** Token payload for access tokens */
export interface AccessTokenPayload {
  sub: UserId;               // Subject (user ID)
  tenantId: TenantId;        // Tenant ID
  sessionId: SessionId;      // Session ID
  role: UserRole;            // User role
  permissions: Permission[]; // Granted permissions
  iat: number;               // Issued at timestamp
  exp: number;               // Expiration timestamp
  jti: string;               // JWT ID
  authProvider: AuthProvider;
  email: string;
  mfaVerified: boolean;       // Whether MFA was completed
}

/** Token payload for refresh tokens */
export interface RefreshTokenPayload {
  sub: UserId;
  tenantId: TenantId;
  sessionId: SessionId;
  jti: string;
  iat: number;
  exp: number;
  tokenVersion: number;       // Version for token rotation
}

/** Decoded token with verification status */
export interface DecodedToken<T extends object> {
  payload: T;
  valid: boolean;
  expired: boolean;
  error?: string;
}

// ============================================================================
// AUTHORIZATION CONTEXT
// ============================================================================

/** Request authorization context (server-resolved, never client-supplied) */
export interface AuthorizationContext {
  userId: UserId;
  tenantId: TenantId;
  sessionId: SessionId;
  role: UserRole;
  permissions: Set<Permission>;
  mfaVerified: boolean;
  ipAddress?: string;
  userAgent?: string;
  isAuthenticated: boolean;
  isServiceAccount: boolean;
}

/** Human approval object for external actions (§9.5) */
export interface HumanApproval {
  approvalId: string;
  userId: UserId;
  action: string;              // What action is being approved
  scope: string;               // What it applies to (e.g., caseId, documentId)
  target: string;              // Specific target
  approvedAt: Date;
  expiresAt: Date;             // Approval expiry
  approvedBy: UserId;
  context: Record<string, unknown>; // Additional context
  signature: string;           // Cryptographic signature
}

/** Permission check result */
export interface PermissionCheckResult {
  allowed: boolean;
  permission: Permission;
  reason?: string;
  missingPermissions?: Permission[];
}

/** Resource access check result */
export interface ResourceAccessResult {
  allowed: boolean;
  resourceType: string;
  resourceId: string;
  action: string;
  reason?: string;
}

// ============================================================================
// RLS (Row-Level Security) TYPES
// ============================================================================

/** RLS Policy for a table */
export interface RlsPolicy {
  table: string;
  policyName: string;
  using: string;  // SQL USING clause
  check: string;  // SQL CHECK clause (for inserts/updates)
  roles: UserRole[]; // Which roles this policy applies to
}

/** RLS Context for query building */
export interface RlsContext {
  userId: UserId;
  tenantId: TenantId;
  role: UserRole;
  permissions: Permission[];
}

// ============================================================================
// FEATURE FLAG TYPES
// ============================================================================

/** Feature flag definition */
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;  // 0-100
  rolloutTo: UserRole[];      // Which roles have access
  env: "development" | "staging" | "production" | "all";
}

/** Feature flag evaluation result */
export interface FeatureFlagResult {
  flag: FeatureFlag;
  enabled: boolean;
  reason: "enabled" | "disabled" | "not_rolled_out" | "role_excluded" | "env_excluded";
}

// ============================================================================
// AUDIT TYPES
// ============================================================================

/** Audit event types */
export const AuditEventTypeEnum = z.enum([
  "auth:login",
  "auth:logout",
  "auth:failed",
  "auth:mfa_challenge",
  "auth:mfa_verified",
  "auth:token_refresh",
  "auth:password_change",
  "case:create",
  "case:read",
  "case:update",
  "case:delete",
  "document:create",
  "document:read",
  "document:update",
  "document:delete",
  "document:analyze",
  "agent:create",
  "agent:read",
  "agent:update",
  "agent:delete",
  "agent:execute",
  "model:invoke",
  "tool:execute",
  "external:action_requested",
  "external:action_approved",
  "external:action_executed",
  "permission:check",
  "permission:denied",
  "rls:violation",
]);
export type AuditEventType = z.infer<typeof AuditEventTypeEnum>;

/** Audit event for authentication/authorization */
export interface AuthAuditEvent {
  eventType: AuditEventType;
  userId?: UserId;
  tenantId?: TenantId;
  sessionId?: SessionId;
  agentId?: AgentId;
  caseId?: CaseId;
  metadata: {
    action?: string;
    resourceType?: string;
    resourceId?: string;
    permission?: Permission;
    role?: UserRole;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    error?: string;
    timestamp: Date;
  };
  hash: string;  // Hash of previous event for chain
  previousHash: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/** Authentication error codes */
export const AuthErrorCodeEnum = z.enum([
  "UNAUTHENTICATED",
  "UNAUTHORIZED",
  "INVALID_SESSION",
  "EXPIRED_SESSION",
  "INVALID_TOKEN",
  "EXPIRED_TOKEN",
  "INVALID_CREDENTIALS",
  "ACCOUNT_LOCKED",
  "ACCOUNT_DISABLED",
  "MFA_REQUIRED",
  "MFA_FAILED",
  "PERMISSION_DENIED",
  "RLS_VIOLATION",
  "RATE_LIMITED",
  "HUMAN_APPROVAL_REQUIRED",
]);
export type AuthErrorCode = z.infer<typeof AuthErrorCodeEnum>;

/** Authentication error */
export class AuthError extends Error {
  constructor(
    public readonly code: AuthErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>,
    public readonly statusCode: number = 401,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/** Authorization error */
export class AuthorizationError extends Error {
  constructor(
    public readonly code: AuthErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>,
    public readonly statusCode: number = 403,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

// ============================================================================
// RESULT ENVELOPE TYPES (§24.4)
// ============================================================================

/** Output kind labeling (Invariant I-2) */
export const OutputKindEnum = z.enum([
  "Information",   // Factual data retrieval
  "Analysis",      // AI analysis and reasoning
  "Draft",        // AI-generated draft for user review
]);
export type OutputKind = z.infer<typeof OutputKindEnum>;

/** Document state (Invariant I-3) */
export const DocumentStateEnum = z.enum([
  "draft",           // User-created or AI-generated draft
  "user_edited",     // User has edited
  "user_approved",   // User has approved
  "final",           // Final version
]);
export type DocumentState = z.infer<typeof DocumentKindEnum>;

/** Result envelope for all structured operations */
export interface ResultEnvelope<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  warnings?: string[];
  metadata: {
    // Provenance
    agentId?: AgentId;
    model?: string;
    modelVersion?: string;
    promptVersion?: string;
    
    // Execution
    executionId: string;
    timestamp: Date;
    durationMs?: number;
    
    // Output classification
    outputKind?: OutputKind;
    documentState?: DocumentState;
    
    // Citations
    citations?: CitationObject[];
    
    // Cost
    tokenUsage?: {
      inputTokens: number;
      outputTokens: number;
      costUsd?: number;
    };
    
    // Approvals
    approvals?: HumanApproval[];
    approvalsRequired?: string[]; // Actions that still need approval
  };
}

/** Citation object (§12.6) - The atom of trust */
export interface CitationObject {
  id: string;
  authorityId: string;
  authorityType: string;
  citation: string;  // Formal citation
  text: string;      // Cited text
  sourceUri?: string;
  relevance: number; // 0-1
  verificationStatus: VerificationStatus;
  jurisdiction?: string;
  court?: string;
  date?: Date;
}

/** Verification status for authorities (Invariant I-4) */
export const VerificationStatusEnum = z.enum([
  "verified",      // Confirmed authoritative
  "unverified",    // Not yet verified
  "disputed",      // Conflicting information
  "deprecated",    // No longer valid
]);
export type VerificationStatus = z.infer<typeof VerificationStatusEnum>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Tenant configuration */
export interface TenantConfig {
  id: TenantId;
  name: string;
  dataResidency: "us" | "eu" | string;
  maxCostUsdPerRun: number;
  maxCostUsdPerDay: number;
  allowedProviders: string[];
  allowExternalGrounding: boolean;
  mfaRequired: boolean;
  sessionTimeoutHours: number;
  createdAt: Date;
  updatedAt: Date;
}

/** User session */
export interface UserSession {
  id: SessionId;
  userId: UserId;
  tenantId: TenantId;
  createdAt: Date;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  mfaVerified: boolean;
  tokenVersion: number;
}

/** MFA method */
export interface MfaMethod {
  id: string;
  userId: UserId;
  type: "totp" | "sms" | "email" | "backup_code";
  secret?: string;  // Only for TOTP
  verified: boolean;
  default: boolean;
  createdAt: Date;
}

/** API Key */
export interface ApiKey {
  id: string;
  userId: UserId;
  tenantId: TenantId;
  keyHash: string;  // Hashed key
  name: string;
  permissions: Permission[];
  rateLimit: number;
  rateLimitWindow: number; // seconds
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  fullName: z.string().min(1).max(100),
  authProvider: AuthProviderEnum,
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export const SessionSchema = z.object({
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  role: UserRoleEnum,
  permissions: z.array(PermissionEnum),
  mfaVerified: z.boolean(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
