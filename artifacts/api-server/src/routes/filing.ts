import { Router, Request, Response } from 'express';
import crypto from 'crypto';

export const filingRouter = Router();

interface VerifyGateRequest {
  documentId: string;
  userId: string;
  consentTimestamp: number;
  receivedSignature: string;
}

filingRouter.post('/filing/verify-gate', async (req: Request, res: Response) => {
  try {
    const body: VerifyGateRequest = req.body;
    const { documentId, userId, consentTimestamp, receivedSignature } = body;

    if (!consentTimestamp || !receivedSignature || !documentId || !userId) {
      return res.status(400).json({
        error: 'Explicit human consent parameters (userId, documentId, timestamp, signature) are required.',
      });
    }

    const secret = process.env.GATE_HMAC_SECRET || process.env.FILING_GATE_SECRET;
    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('GATE_HMAC_SECRET configuration is missing on the server.');
      }
    }

    const activeSecret = secret || 'dev-hmac-secret-min-32-chars-long!';

    // Check expiration window (Token valid for 15 minutes)
    const isExpired = Date.now() - consentTimestamp > 15 * 60 * 1000;
    if (isExpired) {
      return res.status(401).json({
        error: 'Consent token expired. Please re-authorize the filing package.',
      });
    }

    // Canonical payload tying user consent, document ID, and authorization intent
    const payload = `${userId}:${documentId}:${consentTimestamp}:CONSENT_GIVEN_NOT_LEGAL_ADVICE`;

    const expectedSignature = crypto
      .createHmac('sha256', activeSecret)
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

    return res.json({
      status: 'AUTHORIZED',
      documentId,
      userId,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Gate verification failure:', err);
    return res.status(500).json({
      error: 'Internal gate verification failure',
    });
  }
});

// Also alias /filings/verify-gate for full REST flexibility
filingRouter.post('/filings/verify-gate', async (req: Request, res: Response) => {
  return res.redirect(307, '/api/filing/verify-gate');
});

export default filingRouter;
