import * as crypto from "crypto";
import { logger } from "../lib/logger";

export interface FilingGateChallenge {
  matterId: string;
  payloadHash: string;
  userSignature: string;
  timestamp: number;
}

export interface ComputerUseResult {
  status: "success" | "failed" | "pending_human";
  extractedData?: any;
  auditTrail: {
    screenshots: string[];
    domSnapshotUrl?: string;
    videoRecordingUrl?: string;
    timestamp: string;
  };
}

function isFilingGateChallenge(obj: any): obj is FilingGateChallenge {
  return (
    obj !== null &&
    typeof obj === "object" &&
    typeof obj.matterId === "string" &&
    /^[a-zA-Z0-9\-_]+$/.test(obj.matterId) &&
    typeof obj.payloadHash === "string" &&
    typeof obj.userSignature === "string" &&
    typeof obj.timestamp === "number"
  );
}

function validateCaseNumber(caseNumber: string): void {
  if (typeof caseNumber !== "string") {
    throw new Error("Invalid case number type");
  }
  const caseNumberRegex = /^[a-zA-Z0-9.\-\/\s]{3,50}$/;
  if (!caseNumberRegex.test(caseNumber)) {
    throw new Error("Invalid case number format");
  }
}

function validateDocumentUrl(documentUrl: string): void {
  if (typeof documentUrl !== "string" || documentUrl.length === 0) {
    throw new Error("Invalid document URL: must be a non-empty string.");
  }

  try {
    const url = new URL(documentUrl);

    if (url.protocol !== "https:") {
      throw new Error("Invalid document URL: only HTTPS protocol is allowed.");
    }

    const hostname = url.hostname.toLowerCase();
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0") {
      throw new Error("Invalid document URL: localhost access is forbidden.");
    }

    const ipMatch = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipMatch) {
      const parts = ipMatch.slice(1).map(Number);
      if (
        parts[0] === 10 ||
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 192 && parts[1] === 168) ||
        (parts[0] === 169 && parts[1] === 254)
      ) {
        throw new Error("Invalid document URL: access to private or metadata IP ranges is forbidden.");
      }
    }

    if (documentUrl.length > 2048) {
      throw new Error("Invalid document URL: exceeds maximum length (2048 characters).");
    }
  } catch (error: any) {
    throw new Error(`Document URL validation failed: ${error.message}`);
  }
}

export class ComputerUseCourtAdapter {
  async extractDocket(caseNumber: string, portalUrl: string): Promise<ComputerUseResult> {
    logger.info(`Initiating Computer Use READ task for case ${caseNumber}`);
    validateCaseNumber(caseNumber);
    validateDocumentUrl(portalUrl);

    return {
      status: "success",
      extractedData: {
        events: [{ date: new Date().toISOString(), description: "Scraped from portal" }]
      },
      auditTrail: {
        screenshots: ["s3://audit-logs/screenshot-1.png"],
        timestamp: new Date().toISOString()
      }
    };
  }

  async stageFiling(caseNumber: string, documentUrl: string, userToken: string): Promise<ComputerUseResult> {
    logger.info(`Initiating Computer Use HUMAN_ACTION task for case ${caseNumber}`);
    validateCaseNumber(caseNumber);
    validateDocumentUrl(documentUrl);

    const documentUrlHash = crypto.createHash("sha256").update(documentUrl).digest("hex");

    if (!this.verifyHumanGate(userToken, documentUrlHash)) {
      throw new Error("Human authorization gate failed. Cannot stage filing.");
    }

    return {
      status: "pending_human",
      auditTrail: {
        screenshots: ["s3://audit-logs/staged-filing-ready.png"],
        videoRecordingUrl: "s3://audit-logs/staging-session.mp4",
        timestamp: new Date().toISOString()
      }
    };
  }

  private verifyHumanGate(token: string, expectedDocumentHash: string): boolean {
    const secret = process.env.HUMAN_GATE_HMAC_SECRET;
    if (!secret || !token) {
      logger.warn("Human gate verification failed: secret or token missing.");
      return false;
    }

    try {
      const challenge: unknown = JSON.parse(token);
      if (!isFilingGateChallenge(challenge)) {
        logger.warn("Human gate verification failed: invalid challenge structure.");
        return false;
      }

      if (challenge.payloadHash !== expectedDocumentHash) {
        logger.warn("Human gate challenge failed: payloadHash does not match document.");
        return false;
      }

      const age = Date.now() - challenge.timestamp;
      if (age < 0 || age > 5 * 60 * 1000) {
        logger.warn("Human gate challenge failed: token expired or future-dated.");
        return false;
      }

      const expectedPayload = `${challenge.matterId}:${challenge.payloadHash}:${challenge.timestamp}`;
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(expectedPayload)
        .digest("hex");

      const sigBuffer = Buffer.from(challenge.userSignature, "hex");
      const expectedBuffer = Buffer.from(expectedSignature, "hex");

      if (sigBuffer.length !== expectedBuffer.length) {
        return false;
      }
      return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    } catch (error: any) {
      logger.error(`Error during human gate verification: ${error.message}`);
      return false;
    }
  }

  public getDoxpopSystemPrompt(caseNumber: string): string {
    validateCaseNumber(caseNumber);
    return `
You are an authorized legal agent navigating the Doxpop / MyCase court portal on behalf of a verified pro se litigant.
Your objective is to locate a specific case and accurately extract its chronological docket events.

RULES OF ENGAGEMENT:
1. ONLY navigate to public case search.
2. Enter the case number EXACTLY as provided: ${caseNumber}.
3. Once on the Case Detail page, identify the HTML table or list containing "Chronological Case Summary" or "Docket".
4. DO NOT click on any sealed documents or restricted areas.
5. You MUST capture a screenshot immediately after the docket loads for audit trailing.
6. Extract the data into the provided JSON schema.
7. If a CAPTCHA appears, pause execution and yield to the CAPTCHA solver or human fallback.

CRITICAL SAFETY: You are in READ-ONLY mode. Under no circumstances are you permitted to click buttons labeled "File", "Submit", "Pay", or "Acknowledge".
    `.trim();
  }
}
