import { SICClient } from './client';
import { CustodyRecord, AuditExport, CitationChainReport } from './types';

/**
 * Evidentiary chain of custody.
 * When a document is uploaded or accessed, we record an immutable 
 * chain-of-custody entry that can be exported for litigation.
 */
export class ComplianceChain {
  constructor(private client: SICClient) {}

  async recordCustodyEvent(opts: {
    documentId: string;
    caseId: string;
    userId: string;
    action: 'uploaded' | 'accessed' | 'extracted' | 'analyzed' | 'exported';
    hash: string;          // SHA-256 of document at time of action
    agentId?: string;
    notes?: string;
  }): Promise<CustodyRecord> {
    return this.client.recordCustody({
      ...opts,
      timestamp: new Date().toISOString(),
      immutable: true,
    });
  }

  /**
   * Export full audit trail for a case — for litigation, FOIA, or 
   * regulatory submission.
   */
  async exportCaseAuditTrail(
    caseId: string,
    format: 'json' | 'pdf' | 'csv'
  ): Promise<AuditExport> {
    return this.client.exportCaseAudit(caseId, format);
  }

  /**
   * Validate that all agent decisions in a run are traceable
   * to specific retrieved sources.
   */
  async validateCitationChain(agentRunId: string): Promise<CitationChainReport> {
    return this.client.validateCitations(agentRunId);
  }
}
