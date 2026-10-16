// packages/auth/src/audit.ts
// Audit logging for Chain of Command
// Based on Master Implementation Prompt §14, Invariant I-12

import { v4 as uuidv4 } from 'uuid';
import {
  AuditEventType,
  AuthAuditEvent,
  UserId,
  TenantId,
  SessionId,
  AgentId,
  CaseId,
} from './types';
import { getAuthConfig } from './config';

// ============================================================================
// AUDIT LOG STORAGE
// ============================================================================

/**
 * Audit event with hash chain for integrity
 */
export interface AuditEventWithHash extends AuthAuditEvent {
  id: string;
  previousHash: string;
  hash: string;
}

/**
 * In-memory audit log store (in production, use database)
 * This is for the append-only audit requirement (Invariant I-12)
 */
let auditLog: AuditEventWithHash[] = [];
let lastHash = '';

// ============================================================================
// HASH CHAIN IMPLEMENTATION
// ============================================================================

/**
 * Compute SHA-256 hash of audit event data
 */
async function computeHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Create hash from event data
 */
async function createEventHash(event: Omit<AuditEventWithHash, 'id' | 'hash' | 'previousHash'>): Promise<string> {
  const eventString = JSON.stringify({
    eventType: event.eventType,
    userId: event.userId,
    tenantId: event.tenantId,
    sessionId: event.sessionId,
    agentId: event.agentId,
    caseId: event.caseId,
    metadata: event.metadata,
    timestamp: event.metadata.timestamp?.toISOString(),
    previousHash: event.previousHash,
  });
  
  return computeHash(eventString);
}

// ============================================================================
// AUDIT LOGGING FUNCTIONS
// ============================================================================

/**
 * Log an audit event
 * This creates an append-only, hash-chained audit log (Invariant I-12)
 */
export async function logAuditEvent(
  eventType: AuditEventType,
  metadata: AuthAuditEvent['metadata'],
  context?: {
    userId?: UserId;
    tenantId?: TenantId;
    sessionId?: SessionId;
    agentId?: AgentId;
    caseId?: CaseId;
  },
): Promise<AuditEventWithHash> {
  const baseEvent: Omit<AuditEventWithHash, 'id' | 'hash' | 'previousHash'> = {
    eventType,
    metadata,
    userId: context?.userId,
    tenantId: context?.tenantId,
    sessionId: context?.sessionId,
    agentId: context?.agentId,
    caseId: context?.caseId,
  };
  
  // Compute hash for this event
  const eventHash = await createEventHash({ ...baseEvent, previousHash: lastHash });
  
  // Create the full event
  const auditEvent: AuditEventWithHash = {
    id: uuidv4(),
    eventType,
    metadata,
    userId: context?.userId,
    tenantId: context?.tenantId,
    sessionId: context?.sessionId,
    agentId: context?.agentId as any,
    caseId: context?.caseId,
    previousHash: lastHash,
    hash: eventHash,
  };
  
  // Append to log (append-only)
  auditLog.push(auditEvent);
  
  // Update last hash for chain
  lastHash = auditEvent.hash;
  
  // In production, also save to database
  if (getAuthConfig().NODE_ENV === 'production') {
    // TODO: Save to database
    // This would be an INSERT into the audit_logs table
    // with all the event data
  }
  
  return auditEvent;
}

/**
 * Log authentication event
 */
export async function logAuthEvent(
  eventType: Extract<AuditEventType, `auth:${string}`>,
  userId: UserId,
  metadata: Omit<AuthAuditEvent['metadata'], 'timestamp'>,
  context?: {
    tenantId?: TenantId;
    sessionId?: SessionId;
    ipAddress?: string;
    userAgent?: string;
  },
): Promise<AuditEventWithHash> {
  return logAuditEvent(eventType, {
    ...metadata,
    timestamp: new Date(),
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
  }, {
    userId,
    tenantId: context?.tenantId,
    sessionId: context?.sessionId,
  });
}

/**
 * Log authorization event
 */
export async function logAuthzEvent(
  eventType: Extract<AuditEventType, `permission:${string}` | `rls:${string}`>,
  userId: UserId,
  metadata: Omit<AuthAuditEvent['metadata'], 'timestamp'>,
  context?: {
    tenantId?: TenantId;
    sessionId?: SessionId;
    agentId?: AgentId;
    caseId?: CaseId;
  },
): Promise<AuditEventWithHash> {
  return logAuditEvent(eventType, {
    ...metadata,
    timestamp: new Date(),
  }, {
    userId,
    tenantId: context?.tenantId,
    sessionId: context?.sessionId,
    agentId: context?.agentId,
    caseId: context?.caseId,
  });
}

/**
 * Log AI/model gateway event
 */
export async function logModelEvent(
  eventType: Extract<AuditEventType, `model:${string}` | `tool:${string}`>,
  userId: UserId,
  metadata: Omit<AuthAuditEvent['metadata'], 'timestamp'> & {
    agentId?: string;
    model?: string;
    modelVersion?: string;
    tokenUsage?: { inputTokens: number; outputTokens: number };
    costUsd?: number;
  },
  context?: {
    tenantId?: TenantId;
    sessionId?: SessionId;
    caseId?: CaseId;
  },
): Promise<AuditEventWithHash> {
  return logAuditEvent(eventType, {
    ...metadata,
    timestamp: new Date(),
  }, {
    userId,
    tenantId: context?.tenantId,
    sessionId: context?.sessionId,
    agentId: metadata.agentId as AgentId | undefined,
    caseId: context?.caseId,
  });
}

// ============================================================================
// AUDIT VERIFICATION
// ============================================================================

/**
 * Verify the integrity of the audit log hash chain
 * This proves the log is append-only and hasn't been tampered with
 */
export async function verifyAuditChain(): Promise<{ valid: boolean; issues: string[] }> {
  const issues: string[] = [];
  
  if (auditLog.length === 0) {
    return { valid: true, issues: [] };
  }
  
  for (let i = 0; i < auditLog.length; i++) {
    const event = auditLog[i];
    
    // Check first event
    if (i === 0) {
      if (event.previousHash !== '') {
        issues.push(`First event should have empty previousHash`);
      }
      continue;
    }
    
    // Check previous hash matches
    const previousEvent = auditLog[i - 1];
    if (event.previousHash !== previousEvent.hash) {
      issues.push(`Event ${i} has incorrect previousHash. Expected: ${previousEvent.hash}, Got: ${event.previousHash}`);
    }
    
    // Verify hash
    const computedHash = await createEventHash({
      eventType: event.eventType,
      userId: event.userId,
      tenantId: event.tenantId,
      sessionId: event.sessionId,
      agentId: event.agentId,
      caseId: event.caseId,
      metadata: event.metadata,
      previousHash: event.previousHash,
    } as any);
    
    if (computedHash !== event.hash) {
      issues.push(`Event ${i} has tampered hash`);
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Get audit log entries for a specific user
 */
export function getAuditEventsForUser(userId: UserId): AuditEventWithHash[] {
  return auditLog.filter(event => event.userId === userId);
}

/**
 * Get audit log entries for a specific tenant
 */
export function getAuditEventsForTenant(tenantId: TenantId): AuditEventWithHash[] {
  return auditLog.filter(event => event.tenantId === tenantId);
}

/**
 * Get audit log entries for a specific case
 */
export function getAuditEventsForCase(caseId: CaseId): AuditEventWithHash[] {
  return auditLog.filter(event => event.caseId === caseId);
}

/**
 * Get audit log entries for a specific session
 */
export function getAuditEventsForSession(sessionId: SessionId): AuditEventWithHash[] {
  return auditLog.filter(event => event.sessionId === sessionId);
}

/**
 * Get audit log entries for a specific agent
 */
export function getAuditEventsForAgent(agentId: AgentId): AuditEventWithHash[] {
  return auditLog.filter(event => event.agentId === agentId);
}

/**
 * Get audit log entries by event type
 */
export function getAuditEventsByType(eventType: AuditEventType): AuditEventWithHash[] {
  return auditLog.filter(event => event.eventType === eventType);
}

/**
 * Get audit log entries in a time range
 */
export function getAuditEventsInRange(start: Date, end: Date): AuditEventWithHash[] {
  return auditLog.filter(event => {
    const eventTime = new Date(event.metadata.timestamp);
    return eventTime >= start && eventTime <= end;
  });
}

// ============================================================================
// AUDIT EXPORT
// ============================================================================

/**
 * Export audit log for external analysis
 * Only available to auditors and admins
 */
export async function exportAuditLog(
  start?: Date,
  end?: Date,
  filter?: {
    userId?: UserId;
    tenantId?: TenantId;
    caseId?: CaseId;
    agentId?: AgentId;
    eventTypes?: AuditEventType[];
  },
): Promise<AuditEventWithHash[]> {
  let events = [...auditLog];
  
  // Apply date filter
  if (start || end) {
    const startDate = start || new Date(0);
    const endDate = end || new Date();
    events = events.filter(event => {
      const eventTime = new Date(event.metadata.timestamp);
      return eventTime >= startDate && eventTime <= endDate;
    });
  }
  
  // Apply additional filters
  if (filter) {
    if (filter.userId) {
      events = events.filter(event => event.userId === filter.userId);
    }
    if (filter.tenantId) {
      events = events.filter(event => event.tenantId === filter.tenantId);
    }
    if (filter.caseId) {
      events = events.filter(event => event.caseId === filter.caseId);
    }
    if (filter.agentId) {
      events = events.filter(event => event.agentId === filter.agentId);
    }
    if (filter.eventTypes && filter.eventTypes.length > 0) {
      events = events.filter(event => filter.eventTypes!.includes(event.eventType));
    }
  }
  
  return events;
}

// ============================================================================
// AUDIT CLEANUP
// ============================================================================

/**
 * Clear audit log (useful for testing)
 */
export function clearAuditLog(): void {
  auditLog = [];
  lastHash = '';
}

/**
 * Initialize audit log with existing events (for persistence)
 */
export function initializeAuditLog(events: AuditEventWithHash[]): void {
  if (events.length > 0) {
    auditLog = events;
    lastHash = events[events.length - 1].hash;
  }
}

// ============================================================================
// AUDIT HOOKS
// ============================================================================

/**
 * Audit hook for important operations
 * This allows automatic logging of operations with their context
 */
export interface AuditHookContext {
  operation: string;
  userId?: UserId;
  tenantId?: TenantId;
  sessionId?: SessionId;
  agentId?: AgentId;
  caseId?: CaseId;
  metadata: Record<string, unknown>;
}

/**
 * Global audit hooks
 */
const auditHooks: Array<(context: AuditHookContext) => Promise<void>> = [];

/**
 * Register an audit hook
 */
export function registerAuditHook(hook: (context: AuditHookContext) => Promise<void>): void {
  auditHooks.push(hook);
}

/**
 * Remove an audit hook
 */
export function unregisterAuditHook(hook: (context: AuditHookContext) => Promise<void>): void {
  const index = auditHooks.indexOf(hook);
  if (index > -1) {
    auditHooks.splice(index, 1);
  }
}

/**
 * Trigger all audit hooks
 */
export async function triggerAuditHooks(context: AuditHookContext): Promise<void> {
  for (const hook of auditHooks) {
    try {
      await hook(context);
    } catch (error) {
      console.error('[audit] Hook error:', error);
    }
  }
}

// ============================================================================
// AUDIT MIDDLEWARE
// ============================================================================

import { Request, Response, NextFunction, Handler } from 'express';
import { AuthenticatedRequest } from './middleware';

/**
 * Middleware to automatically log API requests
 */
export function auditMiddleware(): Handler {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Store original response methods
    const originalJson = res.json;
    const originalStatus = res.status;
    
    // Override response methods to log after response
    res.json = function(data: any) {
      logRequest(req, res, startTime, data);
      return originalJson.call(this, data);
    };
    
    res.status = function(code: number) {
      (this as any).statusCode = code;
      return originalStatus.call(this, code);
    };
    
    // Also handle errors
    const originalSend = res.send;
    res.send = function(data: any) {
      logRequest(req, res, startTime, data);
      return originalSend.call(this, data);
    };
    
    next();
  };
}

/**
 * Log an HTTP request
 */
async function logRequest(
  req: AuthenticatedRequest,
  res: Response,
  startTime: number,
  data: any,
): Promise<void> {
  const duration = Date.now() - startTime;
  const timestamp = new Date();
  
  // Determine event type based on path and method
  const path = req.path.split('/').filter(Boolean);
  const resource = path[0] || 'unknown';
  const action = req.method.toLowerCase();
  
  // Map to audit event type
  const eventTypeMap: Record<string, Record<string, AuditEventType>> = {
    matters: {
      get: 'case:read' as AuditEventType,
      post: 'case:create' as AuditEventType,
      put: 'case:update' as AuditEventType,
      patch: 'case:update' as AuditEventType,
      delete: 'case:delete' as AuditEventType,
    },
    documents: {
      get: 'document:read' as AuditEventType,
      post: 'document:create' as AuditEventType,
      put: 'document:update' as AuditEventType,
      delete: 'document:delete' as AuditEventType,
      analyze: 'document:analyze' as AuditEventType,
    },
    agents: {
      post: 'agent:create' as AuditEventType,
      get: 'agent:read' as AuditEventType,
      put: 'agent:update' as AuditEventType,
      delete: 'agent:delete' as AuditEventType,
      execute: 'agent:execute' as AuditEventType,
    },
  };
  
  const eventType = eventTypeMap[resource]?.[action] || ('case:read' as AuditEventType);
  
  // Log the event
  await logAuditEvent(eventType, {
    action: `${action.toUpperCase()} ${req.path}`,
    statusCode: res.statusCode,
    success: res.statusCode < 400,
    timestamp,
    durationMs: duration,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  }, {
    userId: req.user?.id,
    tenantId: req.user?.tenantId,
    sessionId: req.user?.sessionId,
    caseId: req.params.caseId as CaseId | undefined,
  });
}
