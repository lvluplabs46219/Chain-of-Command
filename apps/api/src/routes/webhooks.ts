import { Router, Request, Response } from "express";
import crypto from "crypto";
import { db, timelineEventsTable, mattersTable } from "@workspace/db";

export const webhooksRouter = Router();

// Helper to verify HMAC signature
function verifyWebhookSignature(req: Request, secret: string): boolean {
  const signature = req.headers['x-webhook-signature'];
  if (!signature || typeof signature !== 'string') return false;

  const payload = JSON.stringify(req.body);
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(signature, 'utf-8'), Buffer.from(expectedSig, 'utf-8'));
  } catch {
    return false;
  }
}

webhooksRouter.post("/webhooks/courtlistener", async (req: Request, res: Response) => {
  try {
    const secret = process.env.COURTLISTENER_WEBHOOK_SECRET;
    if (secret && !verifyWebhookSignature(req, secret)) {
      return res.status(403).json({ error: "Invalid webhook signature" });
    }

    const { matterId, eventDescription, eventDate } = req.body;

    if (matterId) {
      await db.insert(timelineEventsTable).values({
        matterId,
        title: "CourtListener Update",
        description: eventDescription || "New docket entry received",
        eventDate: eventDate ? new Date(eventDate) : new Date(),
        eventType: "court_event"
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("CourtListener Webhook Error:", error);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
});

webhooksRouter.post("/webhooks/doxpop", async (req: Request, res: Response) => {
  try {
    const secret = process.env.DOXPOP_WEBHOOK_SECRET;
    if (secret && !verifyWebhookSignature(req, secret)) {
      return res.status(403).json({ error: "Invalid webhook signature" });
    }

    const { matterId, eventDescription, eventDate } = req.body;

    if (matterId) {
      await db.insert(timelineEventsTable).values({
        matterId,
        title: "Doxpop Update",
        description: eventDescription || "New docket entry received from Doxpop",
        eventDate: eventDate ? new Date(eventDate) : new Date(),
        eventType: "court_event"
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Doxpop Webhook Error:", error);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
});
