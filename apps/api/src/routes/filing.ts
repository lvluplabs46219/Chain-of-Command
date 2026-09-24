import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/verifySession';

const filingRouter = Router();

interface VerifyGateRequest {
  documentId: string;
  userId: string;
  consentTimestamp: number;
  receivedSignature: string;
  matterId: string; // Added matterId for binding
}

// Store single-use consent nonces server-side (in production, use Redis/DB)
const activeNonces = new Set<string>();

// Generate a single-use nonce
function generateNonce(): string {
  return crypto.randomBytes(32).toString('hex');
}

// In production, this should be stored in Redis or database with TTL
function storeNonce(nonce: string, matterId: string, documentId: string, userId: string): void {
  // In memory for now - production should use Redis
  activeNonces.add(nonce);
  // Store with expiration: set timeout to remove after 15 minutes
  setTimeout(() => activeNonces.delete(nonce), 15 * 60 * 1000);
}

function validateNonce(nonce: string): boolean {
  return activeNonces.has(nonce);
}

function invalidateNonce(nonce: string): void {
  activeNonces.delete(nonce);
}

filingRouter.post('/filing/verify-gate', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body: VerifyGateRequest = req.body;
    const { documentId, userId, consentTimestamp, receivedSignature, matterId } = body;
    
    // Check that user is authenticated
    const authenticatedUser = req.user;
    if (!authenticatedUser || !authenticatedUser.id) {
      return res.status(401).json({
        error: 'Unauthorized: User not authenticated',
      });
    }

    // CRITICAL: Bind the signed userId to the authenticated user
    if (userId !== authenticatedUser.id) {
      return res.status(403).json({
        error: 'Forbidden: userId must match authenticated user',
      });
    }

    if (!consentTimestamp || !receivedSignature || !documentId || !userId || !matterId) {
      return res.status(400).json({
        error: 'Explicit human consent parameters (userId, documentId, matterId, timestamp, signature) are required.',
      });
    }

    // REQUIRED: GATE_HMAC_SECRET must be configured in all environments
    const secret = process.env.GATE_HMAC_SECRET || process.env.FILING_GATE_SECRET;
    if (!secret) {
      // In production OR development, refuse to proceed without secret
      // NO hardcoded fallback allowed
      console.error('GATE_HMAC_SECRET or FILING_GATE_SECRET is missing - cannot verify gate');
      return res.status(500).json({
        error: 'Gate configuration error: Missing required secret',
      });
    }

    // Check expiration window (Token valid for 15 minutes)
    const isExpired = Date.now() - consentTimestamp > 15 * 60 * 1000;
    if (isExpired) {
      return res.status(401).json({
        error: 'Consent token expired. Please re-authorize the filing package.',
      });
    }

    // Canonical payload tying user consent, document ID, matter ID, and authorization intent
    const payload = `${userId}:${matterId}:${documentId}:${consentTimestamp}:CONSENT_GIVEN_NOT_LEGAL_ADVICE`;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const receivedBuffer = Buffer.from(receivedSignature, 'utf-8');

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(403).json({
        error: 'Invalid cryptographic signature. Human authorization verification failed.',
      });
    }

    // HMAC success does NOT equal authorization to file
    // This is just verification of the consent token
    // The actual filing should use HumanAuthorizationGate with server-side nonce
    
    // Generate and store a single-use nonce for the actual filing
    const nonce = generateNonce();
    storeNonce(nonce, matterId, documentId, userId);

    return res.json({
      status: 'VERIFIED',
      documentId,
      userId,
      matterId,
      verifiedAt: new Date().toISOString(),
      consentNonce: nonce, // Single-use nonce for actual filing
      warning: 'Use consentNonce for actual filing authorization',
    });
  } catch (err: any) {
    console.error('Gate verification failure:', err);
    // Return generic error to avoid leaking internal details
    return res.status(500).json({
      error: 'Gate verification failed',
    });
  }
});

// Also alias /filings/verify-gate for full REST flexibility
filingRouter.post('/filings/verify-gate', async (req: Request, res: Response) => {
  return res.redirect(307, '/api/filing/verify-gate');
});

export default filingRouter;
