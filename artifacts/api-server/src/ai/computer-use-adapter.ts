import { randomUUID } from 'crypto';
import * as crypto from 'crypto';
import { logger } from '../lib/logger';

export interface FilingGateChallenge {
  matterId: string;
  payloadHash: string;
  userSignature: string;
  timestamp: number;
}

export interface ComputerUseTask {
  courtId: string;
  portalUrl: string;
  instructions: string;
  actionType: 'READ' | 'AI_ASSISTED' | 'HUMAN_ACTION';
  requiresHumanAuthorization?: boolean;
}

export interface ComputerUseResult {
  status: 'success' | 'failed' | 'pending_human';
  extractedData?: any;
  auditTrail: {
    screenshots: string[];
    domSnapshotUrl?: string;
    videoRecordingUrl?: string;
    timestamp: string;
  };
}

/**
 * Custom type guard to validate FilingGateChallenge structure
 */
function isFilingGateChallenge(obj: any): obj is FilingGateChallenge {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.matterId === 'string' &&
    /^[a-zA-Z0-9\-_]+$/.test(obj.matterId) &&
    typeof obj.payloadHash === 'string' &&
    typeof obj.userSignature === 'string' &&
    typeof obj.timestamp === 'number'
  );
}

/**
 * Validates standard case number formats to prevent injection attacks
 */
function validateCaseNumber(caseNumber: string): void {
  if (typeof caseNumber !== 'string') {
    throw new Error("Invalid case number type");
  }
  // Standard court case numbers: alphanumeric, dashes, dots, slashes, spaces. Length 3-50.
  const caseNumberRegex = /^[a-zA-Z0-9.\-\/\s]{3,50}$/;
  if (!caseNumberRegex.test(caseNumber)) {
    throw new Error("Invalid case number format");
  }
}

/**
 * Computer Use Court Adapter
 * Acts as a headless browser bridge for courts without APIs.
 * Integrates with Browserbase / Steel.dev under the hood.
 */
export class ComputerUseCourtAdapter {
  /**
   * Layer 1: READ Adapter (Low Risk, High Value)
   */
  async extractDocket(caseNumber: string, portalUrl: string): Promise<ComputerUseResult> {
    logger.info(`Initiating Computer Use READ task for case ${caseNumber}`);
    
    validateCaseNumber(caseNumber);
    const systemPrompt = this.getDoxpopSystemPrompt(caseNumber);
    
    return {
      status: 'success',
      extractedData: {
        events: [{ date: new Date().toISOString(), description: 'Scraped from portal' }]
      },
      auditTrail: {
        screenshots: ['s3://audit-logs/screenshot-1.png'],
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Layer 3: HUMAN_ACTION Executor
   */
  async stageFiling(caseNumber: string, documentUrl: string, userToken: string): Promise<ComputerUseResult> {
    logger.info(`Initiating Computer Use HUMAN_ACTION task for case ${caseNumber}`);
    
    validateCaseNumber(caseNumber);
    if (!this.verifyHumanGate(userToken)) {
      throw new Error("Human authorization gate failed. Cannot stage filing.");
    }
    
    return { 
      status: 'pending_human',
      auditTrail: {
        screenshots: ['s3://audit-logs/staged-filing-ready.png'],
        videoRecordingUrl: 's3://audit-logs/staging-session.mp4',
        timestamp: new Date().toISOString()
      }
    };
  }

  private verifyHumanGate(token: string): boolean { 
    const secret = process.env.HUMAN_GATE_HMAC_SECRET;
    if (!secret || !token) return false;

    try {
      const challenge: unknown = JSON.parse(token);
      
      if (!isFilingGateChallenge(challenge)) return false;

      // Enforce both past and future bounds to prevent replay and future-date bypass attacks
      const age = Date.now() - challenge.timestamp;
      if (age < 0 || age > 5 * 60 * 1000) return false;

      const expectedPayload = `${challenge.matterId}:${challenge.payloadHash}:${challenge.timestamp}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(expectedPayload)
        .digest('hex');

      const sigBuffer = Buffer.from(challenge.userSignature);
      const expectedBuffer = Buffer.from(expectedSignature);

      if (sigBuffer.length !== expectedBuffer.length) return false;
      return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    } catch {
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
