import { Router, Request, Response } from "express";
import crypto from "crypto";
import { db, timelineEventsTable, mattersTable } from "@workspace/db";
import { eq } from 'drizzle-orm';

export const webhooksRouter = Router();

// Helper to verify HMAC signature using raw request body
// Uses constant-time comparison on equal-length hex buffers
function verifyWebhookSignature(rawBody: string, secret: string, signatureHeader: string | undefined): boolean {
  if (!signatureHeader || typeof signatureHeader !== 'string') {
    return false;
  }

  const expectedSig = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  const sigBuffer = Buffer.from(signatureHeader, 'utf8');
  const expectedBuffer = Buffer.from(expectedSig, 'utf8');

  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

// Helper to get raw body from request
function getRawBody(req: Request): string {
  if (typeof (req as any).rawBody === 'string') {
    return (req as any).rawBody;
  }
  
  if (req.body && typeof req.body === 'object') {
    return JSON.stringify(req.body);
  }
  
  return '';
}

// Middleware to capture raw body for HMAC verification
function captureRawBody(req: Request, res: Response, next: Function) {
  let rawBody = '';
  
  req.on('data', (chunk) => {
    rawBody += chunk.toString('utf8');
  });

  req.on('end', () => {
    (req as any).rawBody = rawBody;
    next();
  });

  req.on('error', (err: any) => {
    console.error('Raw body capture error:', err);
    next();
  });
}

// Apply raw body capture middleware to webhook routes
webhooksRouter.use(captureRawBody);

// Validate matterId exists and is valid UUID
async function isValidMatterId(matterId: string): Promise<boolean> {
  if (!matterId) return false;
  
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(matterId)) {
      return false;
    }
    
    const result = await db.select().from(mattersTable).where(eq(mattersTable.id, matterId));
    return result.length > 0;
  } catch (error) {
    console.error('Matter validation error:', error);
    return false;
  }
}

webhooksRouter.post("/webhooks/courtlistener", async (req: Request, res: Response) => {
  try {
    const secret = process.env.COURTLISTENER_WEBHOOK_SECRET;
    const isLocal = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
    
    if (!secret) {
      if (isLocal) {
        console.warn('COURTLISTENER_WEBHOOK_SECRET is not set - webhook verification disabled in development');
      } else {
        console.error('COURTLISTENER_WEBHOOK_SECRET is missing - rejecting webhook');
        return res.status(403).json({ error: "Webhook secret not configured" });
      }
    }
    
    const rawBody = getRawBody(req);
    const signatureHeader = req.headers['x-webhook-signature'] as string | undefined;
    
    if (secret && !verifyWebhookSignature(rawBody, secret, signatureHeader)) {
      console.warn('CourtListener webhook signature verification failed');
      return res.status(403).json({ error: "Invalid webhook signature" });
    }
    
    const { matterId, eventDescription, eventDate } = req.body;
    
    if (!matterId || !(await isValidMatterId(matterId))) {
      console.warn(`CourtListener webhook rejected: invalid matterId ${matterId}`);
      return res.status(400).json({ error: "Invalid matterId" });
    }
    
    await db.insert(timelineEventsTable).values({
      matterId,
      title: "CourtListener Update",
      description: eventDescription || "New docket entry received",
      eventDate: eventDate ? new Date(eventDate) : new Date(),
      eventType: "court_event",
    });
    
    return res.json({ success: true });
  } catch (error) {
    console.error("CourtListener Webhook Error:", error);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
});

webhooksRouter.post("/webhooks/doxpop", async (req: Request, res: Response) => {
  try {
    const secret = process.env.DOXPOP_WEBHOOK_SECRET;
    const isLocal = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
    
    if (!secret) {
      if (isLocal) {
        console.warn('DOXPOP_WEBHOOK_SECRET is not set - webhook verification disabled in development');
      } else {
        console.error('DOXPOP_WEBHOOK_SECRET is missing - rejecting webhook');
        return res.status(403).json({ error: "Webhook secret not configured" });
      }
    }
    
    const rawBody = getRawBody(req);
    const signatureHeader = req.headers['x-webhook-signature'] as string | undefined;
    
    if (secret && !verifyWebhookSignature(rawBody, secret, signatureHeader)) {
      console.warn('Doxpop webhook signature verification failed');
      return res.status(403).json({ error: "Invalid webhook signature" });
    }
    
    const { matterId, eventDescription, eventDate } = req.body;
    
    if (!matterId || !(await isValidMatterId(matterId))) {
      console.warn(`Doxpop webhook rejected: invalid matterId ${matterId}`);
      return res.status(400).json({ error: "Invalid matterId" });
    }
    
    await db.insert(timelineEventsTable).values({
      matterId,
      title: "Doxpop Update",
      description: eventDescription || "New docket entry received from Doxpop",
      eventDate: eventDate ? new Date(eventDate) : new Date(),
      eventType: "court_event",
    });
    
    return res.json({ success: true });
  } catch (error) {
    console.error("Doxpop Webhook Error:", error);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default webhooksRouter;
