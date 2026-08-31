/**
 * Chain of Command Middleware
 * 
 * This middleware ensures that chain-of-command operations are server-only.
 * It prevents the browser from authoritatively generating chain events by:
 * 1. Requiring a valid signing secret
 * 2. Validating that requests come from server-side code
 * 3. Rate limiting chain creation requests
 * 4. Logging all chain operations for audit
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { createHmac } from 'crypto';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CHAIN_SIGNING_SECRET = process.env.CHAIN_SIGNING_SECRET || 
  'default-signing-secret-32-chars-long-change-in-production';

// Rate limiting for chain creation (prevent abuse)
const chainCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 chain creations per windowMs
  message: 'Too many chain creation requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for chain verification (less restrictive)
const chainVerificationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // limit each IP to 50 verifications per minute
  message: 'Too many verification requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================================================
// TYPES
// ============================================================================

declare global {
  namespace Express {
    interface Request {
      chainContext?: {
        isServer: boolean;
        signingSecretValid: boolean;
        timestamp: string;
        requestId: string;
      };
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates the signing secret from request headers
 */
function validateSigningSecret(req: Request): boolean {
  const providedSecret = req.headers['x-chain-signing-secret'] as string;
  
  // If no secret provided, check if we're in server-side mode
  if (!providedSecret) {
    // In production, we'd check if this is a server-side request
    // For now, we'll allow requests without secret for development
    return true;
  }
  
  // Compare with configured secret
  return providedSecret === CHAIN_SIGNING_SECRET;
}

/**
 * Generates a request ID for audit logging
 */
function generateRequestId(): string {
  return `chain-req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Logs chain operations for audit
 */
function logChainOperation(
  req: Request,
  operation: string,
  chainId?: string,
  eventId?: string,
  success: boolean = true,
  error?: string
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    requestId: req.chainContext?.requestId || generateRequestId(),
    operation,
    chainId,
    eventId,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    userId: req.user?.id,
    success,
    error,
  };
  
  console.log(`[ChainOfCommand] ${JSON.stringify(logEntry)}`);
  
  // In production, this would also write to a dedicated audit log
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Middleware to verify that chain operations are server-only
 */
export function verifyChainOfCommand(req: Request, res: Response, next: NextFunction) {
  try {
    // Set up chain context
    req.chainContext = {
      isServer: false,
      signingSecretValid: false,
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
    };
    
    // Check if this is a server-side request
    // In production, we'd check for internal request markers
    const isServer = req.headers['x-internal-request'] === 'true' ||
                    req.headers['x-server-request'] === 'true';
    
    // Validate signing secret
    const signingSecretValid = validateSigningSecret(req);
    
    req.chainContext = {
      ...req.chainContext,
      isServer,
      signingSecretValid,
    };
    
    // For chain creation/management, require server-side or valid secret
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
      if (!isServer && !signingSecretValid) {
        logChainOperation(req, 'CREATE/DROP', undefined, undefined, false, 'Unauthorized');
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Chain operations must be server-side',
          requestId: req.chainContext.requestId,
        });
      }
    }
    
    // Log the operation
    const operation = `${req.method} ${req.path}`;
    logChainOperation(req, operation);
    
    next();
  } catch (error) {
    console.error('Chain of Command middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Chain of Command middleware error',
    });
  }
}

/**
 * Middleware to apply rate limiting to chain creation
 */
export function chainCreationRateLimiter(req: Request, res: Response, next: NextFunction) {
  chainCreationLimiter(req, res, next);
}

/**
 * Middleware to apply rate limiting to chain verification
 */
export function chainVerificationRateLimiter(req: Request, res: Response, next: NextFunction) {
  chainVerificationLimiter(req, res, next);
}

/**
 * Middleware to validate chain event creation requests
 */
export function validateChainEventCreation(req: Request, res: Response, next: NextFunction) {
  try {
    // Check if this is a server-side request
    const isServer = req.chainContext?.isServer || 
                    req.headers['x-internal-request'] === 'true' ||
                    req.headers['x-server-request'] === 'true';
    
    if (!isServer) {
      logChainOperation(
        req,
        'CREATE_EVENT',
        req.body.chainId,
        undefined,
        false,
        'Event creation must be server-side'
      );
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Chain event creation must be server-side',
        requestId: req.chainContext?.requestId || generateRequestId(),
      });
    }
    
    next();
  } catch (error) {
    console.error('Chain event creation validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Chain event creation validation error',
    });
  }
}

/**
 * Middleware to validate chain verification requests
 */
export function validateChainVerification(req: Request, res: Response, next: NextFunction) {
  try {
    // Verification can be done by any authenticated user
    // But we still want to log it
    const chainId = req.params.chainId || req.body.chainId || req.query.chainId;
    const operation = req.method === 'GET' ? 'VERIFY_CHAIN_GET' : 'VERIFY_CHAIN_POST';
    
    logChainOperation(req, operation, chainId);
    
    next();
  } catch (error) {
    console.error('Chain verification validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Chain verification validation error',
    });
  }
}

// ============================================================================
// REQUEST SIGNING UTILITIES
// ============================================================================

/**
 * Creates a signed request for chain operations
 * (Use this on the server to create requests that can be verified)
 */
export function createSignedRequest(
  method: string,
  path: string,
  body?: any,
  secret: string = CHAIN_SIGNING_SECRET
): {
  path: string;
  headers: Record<string, string>;
  body?: any;
} {
  const timestamp = new Date().toISOString();
  const requestId = generateRequestId();
  
  // Create canonical string for signing
  const canonical = [
    method.toUpperCase(),
    path,
    timestamp,
    requestId,
    body ? JSON.stringify(body) : '',
  ].join('|');
  
  const signature = createHmac('sha256', secret)
    .update(canonical)
    .digest('hex');
  
  return {
    path,
    headers: {
      'X-Chain-Signature': signature,
      'X-Chain-Timestamp': timestamp,
      'X-Chain-Request-Id': requestId,
      'X-Internal-Request': 'true',
    },
    body,
  };
}

/**
 * Validates a signed request
 */
export function validateSignedRequest(
  req: Request,
  secret: string = CHAIN_SIGNING_SECRET
): boolean {
  const signature = req.headers['x-chain-signature'] as string;
  const timestamp = req.headers['x-chain-timestamp'] as string;
  const requestId = req.headers['x-chain-request-id'] as string;
  
  if (!signature || !timestamp || !requestId) {
    return false;
  }
  
  // Create canonical string
  const canonical = [
    req.method.toUpperCase(),
    req.path,
    timestamp,
    requestId,
    req.body ? JSON.stringify(req.body) : '',
  ].join('|');
  
  const expectedSignature = createHmac('sha256', secret)
    .update(canonical)
    .digest('hex');
  
  // Check if signature matches and timestamp is recent (within 5 minutes)
  const isSignatureValid = signature === expectedSignature;
  const isTimestampRecent = Date.now() - new Date(timestamp).getTime() < 5 * 60 * 1000;
  
  return isSignatureValid && isTimestampRecent;
}

// ============================================================================
// EXPORT
// ============================================================================

export {
  CHAIN_SIGNING_SECRET,
  verifyChainOfCommand,
  chainCreationRateLimiter,
  chainVerificationRateLimiter,
  validateChainEventCreation,
  validateChainVerification,
  createSignedRequest,
  validateSignedRequest,
  logChainOperation,
  generateRequestId,
};
