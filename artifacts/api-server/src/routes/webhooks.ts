import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db, mattersTable } from '@workspace/db';
import { eq } from 'drizzle-orm';

export function verifyWebhookSignature(req: Request, res: Response, next: NextFunction): void {
  const signature = req.headers['x-hub-signature-256'] as string;
  const secret = process.env.COURTLISTENER_WEBHOOK_SECRET;

  if (!signature || !secret) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing webhook signature or server secret configuration.' });
    return;
  }

  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex')}`;

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    console.error("Expected:", expectedSignature, "Got:", signature);
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid webhook signature.' });
    return;
  }

  next();
}

export const webhooksRouter = Router();

webhooksRouter.post('/webhooks/courtlistener', verifyWebhookSignature, async (req: Request, res: Response) => {
  try {
    const { docket_id, case_name } = req.body;
    console.log(`[CourtListener Webhook] Received live update for Docket: ${docket_id}`);

    if (!docket_id) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Missing docket_id in webhook payload' });
    }

    try {
      // Find the matter tracking this docket
      const existingMatter = await db.query.mattersTable.findFirst({
        where: (matters, { eq }) => eq(matters.caseNumber, String(docket_id))
      });

      if (!existingMatter) {
        console.warn(`[CourtListener Webhook] Docket ${docket_id} not found in system. Ignoring.`);
        return res.status(200).json({ success: true, message: 'Docket not tracked by any user' });
      }

      // Update the matter's updatedAt timestamp and potentially other fields
      // Ensure we preserve the existing userId, rather than trusting the webhook payload
      await db.update(mattersTable)
        .set({ 
          updatedAt: new Date(),
          ...(case_name ? { title: case_name } : {})
        })
        .where(eq(mattersTable.id, existingMatter.id));
        
      console.log(`[CourtListener Webhook] Successfully updated matter ${existingMatter.id} for user ${existingMatter.userId}`);
    } catch (e) {
      console.warn("Webhook DB sync note:", e);
    }

    res.status(200).json({ success: true, message: 'Docket synced successfully' });
  } catch (error: any) {
    console.error('CourtListener Webhook Error:', error);
    res.status(500).json({ error: 'Internal webhook error' });
  }
});
