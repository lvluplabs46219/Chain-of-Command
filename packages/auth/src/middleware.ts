// packages/auth/src/middleware.ts
// Authentication and Authorization middleware for Express

import { Request, Response, NextFunction, Handler } from 'express';
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
  createSession,
  validateSession,
  getSessionCookieOptions,
  parseSessionCookie,
  isTokenRevoked,
} from './session';
import {
  AuthError,
  AuthorizationError,
  AuthorizationContext,
  UserId,
  SessionId,
  TenantId,
  UserRole,
  Permission,
  ROLE_PERMISSIONS,
} from './types';
import { getAuthConfig } from './config';
import { AUTH_ERROR_CODES } from './errors';

// ============================================================================
// TYPES
// ============================================================================

/** Extended request type with auth info */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: UserId;
    tenantId: TenantId;
    sessionId: SessionId;
    role: UserRole;
    permissions: Permission[];
    email: string;
    mfaVerified: boolean;
  };
  auth?: AuthorizationContext;
}

/** Middleware factory options */
export interface AuthMiddlewareOptions {
  requireAuth?: boolean;           // Default: true
  requireMfa?: boolean;           // Default: false
  permissions?: Permission[];     // Required permissions
  roles?: UserRole[];             // Required roles
  rateLimit?: {                   // Optional rate limiting
    windowMs: number;
    maxRequests: number;
  };
}

// ============================================================================
// SESSION MIDDLEWARE
// ============================================================================

/**
 * Session middleware - extracts and validates session from cookies/headers
 */
export function sessionMiddleware(options: AuthMiddlewareOptions = {}): Handler {
  const { requireAuth = true } = options;
  
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Try to get token from Authorization header (Bearer)
    const authHeader = req.headers.authorization;
    let token: string | undefined;
    
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Try to get token from cookie
    if (!token && req.cookies) {
      const sessionCookie = req.cookies.coc_session;
      if (sessionCookie) {
        const session = parseSessionCookie(sessionCookie);
        if (session) {
          const decoded = verifyAccessToken(sessionCookie);
          if (decoded.valid && !decoded.expired) {
            token = sessionCookie;
          }
        }
      }
    }
    
    if (!token) {
      if (requireAuth) {
        return handleAuthError(res, AUTH_ERROR_CODES.UNAUTHENTICATED, 'No authentication token provided');
      }
      return next();
    }
    
    // Check if token is revoked
    if (isTokenRevoked(token)) {
      return handleAuthError(res, AUTH_ERROR_CODES.INVALID_SESSION, 'Token has been revoked');
    }
    
    // Verify the token
    const decoded = verifyAccessToken(token);
    
    if (!decoded.valid) {
      if (decoded.expired) {
        return handleAuthError(res, AUTH_ERROR_CODES.EXPIRED_SESSION, 'Token has expired');
      }
      return handleAuthError(res, AUTH_ERROR_CODES.INVALID_TOKEN, 'Invalid token');
    }
    
    const { sub: userId, tenantId, sessionId, role, permissions, email, mfaVerified } = decoded.payload;
    
    // Attach user to request
    req.user = {
      id: userId,
      tenantId,
      sessionId,
      role,
      permissions,
      email,
      mfaVerified,
    };
    
    // Create authorization context
    req.auth = {
      userId,
      tenantId,
      sessionId,
      role,
      permissions: new Set(permissions),
      mfaVerified,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      isAuthenticated: true,
      isServiceAccount: false,
    };
    
    next();
  };
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Authentication middleware - ensures user is authenticated
 */
export function authenticateMiddleware(): Handler {
  return sessionMiddleware({ requireAuth: true });
}

// ============================================================================
// AUTHORIZATION MIDDLEWARE
// ============================================================================

/**
 * Authorization middleware - checks permissions and roles
 */
export function authorizeMiddleware(options: AuthMiddlewareOptions = {}): Handler {
  const { requireAuth = true, requireMfa = false, permissions = [], roles = [] } = options;
  
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // First, ensure authenticated
    if (!req.user && requireAuth) {
      return handleAuthError(res, AUTH_ERROR_CODES.UNAUTHENTICATED, 'Authentication required');
    }
    
    if (!req.user) {
      return next();
    }
    
    // Check MFA requirement
    if (requireMfa && !req.user.mfaVerified) {
      return handleAuthError(
        res,
        AUTH_ERROR_CODES.MFA_REQUIRED,
        'Multi-factor authentication required for this action'
      );
    }
    
    // Check roles
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return handleAuthError(
        res,
        AUTH_ERROR_CODES.UNAUTHORIZED,
        `Requires one of the following roles: ${roles.join(', ')}`
      );
    }
    
    // Check permissions
    if (permissions.length > 0) {
      const missingPermissions = permissions.filter(p => !req.user.permissions.includes(p));
      
      if (missingPermissions.length > 0) {
        return handleAuthError(
          res,
          AUTH_ERROR_CODES.PERMISSION_DENIED,
          `Missing permissions: ${missingPermissions.join(', ')}`
        );
      }
    }
    
    next();
  };
}

// ============================================================================
// PERMISSION MIDDLEWARE FACTORY
// ============================================================================

/**
 * Create middleware that checks for specific permissions
 */
export function requirePermissions(permissions: Permission[]): Handler {
  return authorizeMiddleware({ permissions });
}

/**
 * Create middleware that checks for specific roles
 */
export function requireRoles(roles: UserRole[]): Handler {
  return authorizeMiddleware({ roles });
}

/**
 * Create middleware that requires MFA
 */
export function requireMfa(): Handler {
  return authorizeMiddleware({ requireAuth: true, requireMfa: true });
}

// ============================================================================
// OWNERSHIP MIDDLEWARE
// ============================================================================

/**
 * Middleware to check if current user owns a resource
 * @param getResourceOwner - Function that extracts ownerId from resource
 * @param resourceName - Name of the resource for error messages
 */
export function requireOwnership<T>(
  getResourceOwner: (resource: T) => string | undefined,
  resourceName: string = 'resource'
) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction, resource: T) => {
    if (!req.user) {
      return handleAuthError(res, AUTH_ERROR_CODES.UNAUTHENTICATED, 'Authentication required');
    }
    
    const ownerId = getResourceOwner(resource);
    
    if (!ownerId) {
      return handleAuthError(
        res,
        AUTH_ERROR_CODES.PERMISSION_DENIED,
        `${resourceName} has no owner`
      );
    }
    
    if (ownerId !== req.user.id) {
      console.warn(
        `[auth:ownership] User ${req.user.id} attempted to access ${resourceName} ${(resource as any).id} owned by ${ownerId}`
      );
      
      return handleAuthError(
        res,
        AUTH_ERROR_CODES.PERMISSION_DENIED,
        `You do not own this ${resourceName}`
      );
    }
    
    next();
  };
}

// ============================================================================
// TENANT MIDDLEWARE
// ============================================================================

/**
 * Middleware to ensure user is in the correct tenant
 */
export function requireTenant(tenantId: string): Handler {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return handleAuthError(res, AUTH_ERROR_CODES.UNAUTHENTICATED, 'Authentication required');
    }
    
    if (req.user.tenantId !== tenantId) {
      return handleAuthError(
        res,
        AUTH_ERROR_CODES.PERMISSION_DENIED,
        'Access denied: resource is in a different tenant'
      );
    }
    
    next();
  };
}

// ============================================================================
// RLS (Row-Level Security) MIDDLEWARE
// ============================================================================

/**
 * Middleware to apply RLS filtering to queries
 */
export function applyRlsMiddleware(
  tableName: string,
  userIdColumn: string = 'userId',
  tenantIdColumn?: string
): Handler {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Store RLS context on request for use in query builders
    if (req.user) {
      (req as any).rlsContext = {
        userId: req.user.id,
        tenantId: req.user.tenantId,
        userIdColumn,
        tenantIdColumn,
        tableName,
      };
    }
    
    next();
  };
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Handle authentication/authorization errors
 */
function handleAuthError(
  res: Response,
  code: string,
  message: string,
  statusCode?: number,
  details?: Record<string, unknown>
): Response {
  const finalStatusCode = statusCode || (code === AUTH_ERROR_CODES.UNAUTHENTICATED ? 401 : 403);
  
  return res.status(finalStatusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  });
}

/**
 * Error handler middleware for auth errors
 */
export function authErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): any {
  if (err instanceof AuthError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }
  
  if (err instanceof AuthorizationError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }
  
  next(err);
}

// ============================================================================
// UTILITY MIDDLEWARE
// ============================================================================

/**
 * Middleware to extract and validate API key
 */
export function apiKeyMiddleware(): Handler {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] as string | undefined;
    
    if (!apiKey) {
      return handleAuthError(
        res,
        AUTH_ERROR_CODES.UNAUTHENTICATED,
        'API key required'
      );
    }
    
    if (!apiKey || apiKey.length < 32) {
      return handleAuthError(
        res,
        AUTH_ERROR_CODES.INVALID_TOKEN,
        'Invalid API key'
      );
    }
    
    next();
  };
}

/**
 * Middleware to check rate limiting
 */
export function rateLimitMiddleware(options?: { windowMs?: number; maxRequests?: number }): Handler {
  const windowMs = options?.windowMs || getAuthConfig().RATE_LIMIT_WINDOW_MS;
  const maxRequests = options?.maxRequests || getAuthConfig().RATE_LIMIT_MAX_REQUESTS;
  
  // In-memory rate limiter (in production, use Redis)
  const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
  
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress;
    const now = Date.now();
    
    if (!ip) {
      return next();
    }
    
    const key = `${ip}:${req.user?.id || 'anonymous'}`;
    const record = rateLimitStore.get(key);
    
    if (!record || now > record.resetAt) {
      // Start new window
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    
    // Check if limit exceeded
    if (record.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          code: AUTH_ERROR_CODES.RATE_LIMITED,
          message: 'Too many requests, please try again later',
          details: {
            retryAfter: Math.ceil((record.resetAt - now) / 1000),
          },
        },
      });
    }
    
    // Increment counter
    record.count++;
    rateLimitStore.set(key, record);
    
    next();
  };
}

// ============================================================================
// DEFAULT EXPORTS
// ============================================================================

// Remove duplicate exports
export {
  sessionMiddleware,
  authenticateMiddleware,
  authorizeMiddleware,
  requirePermissions,
  requireRoles,
  requireMfa,
  requireOwnership,
  requireTenant,
  applyRlsMiddleware,
  authErrorHandler,
  apiKeyMiddleware,
  rateLimitMiddleware,
};
