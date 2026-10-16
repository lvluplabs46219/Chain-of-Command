// packages/auth/src/errors.ts
// Error types and utilities for Chain of Command authentication
// Based on Master Implementation Prompt §24

import { AuthError, AuthorizationError } from './types';
import { AuthErrorCode } from './types';

// ============================================================================
// ERROR CODES (runtime values)
// ============================================================================

// These are the runtime values for AuthErrorCode
export const AUTH_ERROR_CODES = {
  UNAUTHENTICATED: 'UNAUTHENTICATED' as AuthErrorCode,
  INVALID_SESSION: 'INVALID_SESSION' as AuthErrorCode,
  EXPIRED_SESSION: 'EXPIRED_SESSION' as AuthErrorCode,
  INVALID_TOKEN: 'INVALID_TOKEN' as AuthErrorCode,
  EXPIRED_TOKEN: 'EXPIRED_TOKEN' as AuthErrorCode,
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS' as AuthErrorCode,
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED' as AuthErrorCode,
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED' as AuthErrorCode,
  MFA_REQUIRED: 'MFA_REQUIRED' as AuthErrorCode,
  MFA_FAILED: 'MFA_FAILED' as AuthErrorCode,
  PERMISSION_DENIED: 'PERMISSION_DENIED' as AuthErrorCode,
  UNAUTHORIZED: 'UNAUTHORIZED' as AuthErrorCode,
  RLS_VIOLATION: 'RLS_VIOLATION' as AuthErrorCode,
  RATE_LIMITED: 'RATE_LIMITED' as AuthErrorCode,
  HUMAN_APPROVAL_REQUIRED: 'HUMAN_APPROVAL_REQUIRED' as AuthErrorCode,
} as const;

// ============================================================================
// ERROR FACTORIES
// ============================================================================

/**
 * Create an authentication error
 */
export function createAuthError(
  code: AuthErrorCode,
  message: string,
  details?: Record<string, unknown>,
  statusCode?: number,
): AuthError {
  return new AuthError(code, message, details, statusCode);
}

/**
 * Create an authorization error
 */
export function createAuthzError(
  code: AuthErrorCode,
  message: string,
  details?: Record<string, unknown>,
): AuthorizationError {
  return new AuthorizationError(code, message, details);
}

// ============================================================================
// COMMON ERROR INSTANCES
// ============================================================================

// Authentication errors
export const AUTH_ERRORS = {
  UNAUTHENTICATED: createAuthError(
    AUTH_ERROR_CODES.UNAUTHENTICATED,
    'Authentication required',
    undefined,
    401,
  ),
  
  INVALID_SESSION: createAuthError(
    AUTH_ERROR_CODES.INVALID_SESSION,
    'Invalid session',
    undefined,
    401,
  ),
  
  EXPIRED_SESSION: createAuthError(
    AUTH_ERROR_CODES.EXPIRED_SESSION,
    'Session has expired',
    undefined,
    401,
  ),
  
  INVALID_TOKEN: createAuthError(
    AUTH_ERROR_CODES.INVALID_TOKEN,
    'Invalid authentication token',
    undefined,
    401,
  ),
  
  EXPIRED_TOKEN: createAuthError(
    AUTH_ERROR_CODES.EXPIRED_TOKEN,
    'Authentication token has expired',
    undefined,
    401,
  ),
  
  INVALID_CREDENTIALS: createAuthError(
    AUTH_ERROR_CODES.INVALID_CREDENTIALS,
    'Invalid email or password',
    undefined,
    401,
  ),
  
  ACCOUNT_LOCKED: createAuthError(
    AUTH_ERROR_CODES.ACCOUNT_LOCKED,
    'Account is locked',
    { lockReason: 'too_many_failed_attempts' },
    401,
  ),
  
  ACCOUNT_DISABLED: createAuthError(
    AUTH_ERROR_CODES.ACCOUNT_DISABLED,
    'Account is disabled',
    undefined,
    401,
  ),
  
  MFA_REQUIRED: createAuthError(
    AUTH_ERROR_CODES.MFA_REQUIRED,
    'Multi-factor authentication required',
    { requiredMethods: ['totp', 'sms', 'email'] },
    401,
  ),
  
  MFA_FAILED: createAuthError(
    AUTH_ERROR_CODES.MFA_FAILED,
    'Multi-factor authentication failed',
    { attemptsRemaining: 3 },
    401,
  ),
  
  RATE_LIMITED: createAuthError(
    AUTH_ERROR_CODES.RATE_LIMITED,
    'Too many requests, please try again later',
    { retryAfter: 60 },
    429,
  ),
} as const;

// Authorization errors
export const AUTHZ_ERRORS = {
  UNAUTHORIZED: createAuthzError(
    AUTH_ERROR_CODES.UNAUTHORIZED,
    'Access denied',
    undefined,
  ),
  
  PERMISSION_DENIED: createAuthzError(
    AUTH_ERROR_CODES.PERMISSION_DENIED,
    'Permission denied',
    undefined,
  ),
  
  RLS_VIOLATION: createAuthzError(
    AUTH_ERROR_CODES.RLS_VIOLATION,
    'Row-level security violation',
    undefined,
  ),
  
  HUMAN_APPROVAL_REQUIRED: createAuthzError(
    AUTH_ERROR_CODES.HUMAN_APPROVAL_REQUIRED,
    'Human approval required for this action',
    { action: 'external_action' },
  ),
} as const;

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

/**
 * Error information extracted from an error
 */
export interface ErrorInfo {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
  isAuthError: boolean;
  isAuthzError: boolean;
}

/**
 * Extract error information from an error
 */
export function extractErrorInfo(error: Error): ErrorInfo {
  if (error instanceof AuthError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      isAuthError: true,
      isAuthzError: false,
    };
  }
  
  if (error instanceof AuthorizationError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      isAuthError: false,
      isAuthzError: true,
    };
  }
  
  return {
    code: 'INTERNAL_ERROR',
    message: error.message || 'Internal server error',
    statusCode: 500,
    isAuthError: false,
    isAuthzError: false,
  };
}

/**
 * Create an error response
 */
export function createErrorResponse(errorInfo: ErrorInfo) {
  return {
    success: false,
    error: {
      code: errorInfo.code,
      message: errorInfo.message,
      ...(errorInfo.details && { details: errorInfo.details }),
    },
  };
}

/**
 * Global error handler middleware
 * Logs errors to audit and returns appropriate response
 */
export const errorHandler: ErrorRequestHandler = async (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errorInfo = extractErrorInfo(error);
  
  // Log the error to audit (but don't fail if audit fails)
  try {
    // Import here to avoid circular dependency
    const { logAuditEvent } = require('./audit');
    await logAuditEvent('error' as any, {
      timestamp: new Date(),
      error: {
        code: errorInfo.code,
        message: errorInfo.message,
        ...(errorInfo.details && { details: errorInfo.details }),
      },
      path: req.path,
      method: req.method,
      statusCode: errorInfo.statusCode,
    }, {
      userId: (req as any).user?.id,
      tenantId: (req as any).user?.tenantId,
      sessionId: (req as any).user?.sessionId,
    });
  } catch (auditError) {
    console.error('[errorHandler] Failed to log error to audit:', auditError);
  }
  
  // Return the error response
  return res.status(errorInfo.statusCode).json(createErrorResponse(errorInfo));
};

/**
 * Async error handler wrapper
 * Wraps async route handlers to catch and forward errors
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

/**
 * 404 handler
 */
export function notFoundHandler(req: Request, res: Response) {
  return res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Resource not found',
      path: req.path,
    },
  });
}

/**
 * Generic error handler for uncaught exceptions
 */
export function genericErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    return next(err);
  }
  
  const errorInfo = extractErrorInfo(err);
  return res.status(errorInfo.statusCode).json(createErrorResponse(errorInfo));
}

// ============================================================================
// ERROR UTILITIES
// ============================================================================

/**
 * Check if an error is an authentication error
 */
export function isAuthError(error: Error): error is AuthError {
  return error instanceof AuthError;
}

/**
 * Check if an error is an authorization error
 */
export function isAuthzError(error: Error): error is AuthorizationError {
  return error instanceof AuthorizationError;
}

/**
 * Check if an error has a specific auth error code
 */
export function hasAuthErrorCode(error: Error, code: string): boolean {
  if (isAuthError(error)) {
    return error.code === code;
  }
  if (isAuthzError(error)) {
    return error.code === code;
  }
  return false;
}

/**
 * Create a user-friendly error message
 * Hides sensitive information from error messages shown to users
 */
export function createUserFriendlyError(error: Error): string {
  const errorInfo = extractErrorInfo(error);
  
  // For auth errors, use predefined messages
  switch (errorInfo.code) {
    case AUTH_ERROR_CODES.UNAUTHENTICATED:
      return 'Please sign in to continue';
    case AUTH_ERROR_CODES.INVALID_SESSION:
    case AUTH_ERROR_CODES.EXPIRED_SESSION:
      return 'Your session has expired. Please sign in again.';
    case AUTH_ERROR_CODES.INVALID_TOKEN:
    case AUTH_ERROR_CODES.EXPIRED_TOKEN:
      return 'Your authentication has expired. Please sign in again.';
    case AUTH_ERROR_CODES.INVALID_CREDENTIALS:
      return 'Invalid email or password';
    case AUTH_ERROR_CODES.ACCOUNT_LOCKED:
      return 'Your account has been locked. Please try again later or contact support.';
    case AUTH_ERROR_CODES.ACCOUNT_DISABLED:
      return 'Your account has been disabled. Please contact support.';
    case AUTH_ERROR_CODES.MFA_REQUIRED:
      return 'Please complete multi-factor authentication';
    case AUTH_ERROR_CODES.MFA_FAILED:
      return 'Invalid verification code. Please try again.';
    case AUTH_ERROR_CODES.PERMISSION_DENIED:
      return 'You do not have permission to perform this action';
    case AUTH_ERROR_CODES.UNAUTHORIZED:
      return 'Access denied';
    case AUTH_ERROR_CODES.RLS_VIOLATION:
      return 'Access to this resource is restricted';
    case AUTH_ERROR_CODES.RATE_LIMITED:
      return 'Too many requests. Please try again later.';
    case AUTH_ERROR_CODES.HUMAN_APPROVAL_REQUIRED:
      return 'This action requires explicit approval';
    default:
      // For internal errors, don't expose details to users
      return 'An error occurred. Please try again later.';
  }
}
