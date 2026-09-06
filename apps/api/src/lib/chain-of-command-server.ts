/**
 * Chain of Command - Server-Side Supabase Integration
 * 
 * This module provides server-side persistence for the Chain of Command service.
 * It connects to Supabase and provides CRUD operations for chain events.
 * 
 * IMPORTANT: This is server-only code. The browser cannot authoritatively generate
 * the chain - only the server can create and sign chain events.
 */

import { eq, and, desc, asc, isNull, not, count } from 'drizzle-orm';
import { db } from '../db';
import {
  chainEvents,
  chainMetadata,
  chainVerificationLog,
  type NewChainEvent,
  type NewChainMetadata,
  type NewChainVerificationLog,
} from '../../../../packages/database/schema/chain-of-command';
import {
  ChainOfCommand,
  type ChainEvent,
  type ChainEventType,
  type ChainActorType,
  type ChainResourceType,
  type ChainVerificationResult,
  type ChainQueryOptions,
  type ChainTrackingInfo,
} from '../../../../apps/web/src/lib/chain-of-command';

// ============================================================================
// SUPABASE CHAIN SERVICE
// ============================================================================

/**
 * Options for the Supabase Chain of Command service
 */
export interface SupabaseChainOptions {
  signingSecret: string;
}

/**
 * Supabase-backed Chain of Command service
 * 
 * This class extends the base ChainOfCommand service with Supabase persistence.
 * All chain events are stored in the database for durability and auditability.
 */
export class SupabaseChainOfCommand extends ChainOfCommand {
  private db: typeof db;
  
  constructor(options: SupabaseChainOptions, database: typeof db = db) {
    super(options);
    this.db = database;
  }
  
  // ==========================================================================
  // EVENT CREATION (with persistence)
  // ==========================================================================
  
  /**
   * Creates a new chain event and persists it to Supabase
   */
  async createEvent(params: {
    type: ChainEventType;
    actorType: ChainActorType;
    actorId: string;
    actorName?: string;
    resourceType: ChainResourceType;
    resourceId: string;
    resourceName?: string;
    caseId?: string;
    sessionId?: string;
    agentRunId?: string;
    evidenceFingerprint?: string;
    evidenceId?: string;
    payload?: Record<string, unknown>;
    chainId?: string;  // Override default chain ID
  }): Promise<ChainEvent> {
    // First, create the event in memory (to get hash, signature, etc.)
    const event = await super.createEvent(params);
    
    // Get chain ID
    const chainId = params.chainId || this['chainId'];
    
    // Prepare database insert
    const dbEvent: NewChainEvent = {
      id: event.id,
      chainId,
      sequenceNumber: event.sequenceNumber,
      type: event.type,
      timestamp: new Date(event.timestamp),
      actorType: event.actorType,
      actorId: event.actorId,
      actorName: event.actorName,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      resourceName: event.resourceName,
      hash: event.hash,
      previousHash: event.previousHash,
      evidenceFingerprint: event.evidenceFingerprint,
      evidenceId: event.evidenceId,
      caseId: event.caseId,
      sessionId: event.sessionId,
      agentRunId: event.agentRunId,
      payload: event.payload,
      signature: event.signature,
      immutable: true,
    };
    
    // Insert into database
    const [insertedEvent] = await this.db
      .insert(chainEvents)
      .values(dbEvent)
      .returning();
    
    // Update chain metadata
    await this.updateChainMetadata(chainId, insertedEvent);
    
    // Return the event (with database metadata)
    return {
      ...event,
      createdAt: insertedEvent.createdAt,
    };
  }
  
  /**
   * Creates the genesis event and initializes the chain metadata
   */
  async createGenesisEvent(params: {
    type: ChainEventType;
    actorType: ChainActorType;
    actorId: string;
    actorName?: string;
    resourceType: ChainResourceType;
    resourceId: string;
    resourceName?: string;
    caseId?: string;
    payload?: Record<string, unknown>;
    chainId?: string;
    chainType?: string;
    chainName?: string;
    chainDescription?: string;
  }): Promise<ChainEvent> {
    const chainId = params.chainId || this['chainId'];
    const chainType = params.chainType || 'resource';
    
    // Create the genesis event
    const event = await this.createEvent({ ...params, chainId });
    
    // Initialize chain metadata
    const metadata: NewChainMetadata = {
      chainId,
      chainType,
      name: params.chainName || `${params.resourceType}:${params.resourceId}`,
      description: params.chainDescription || `Chain for ${params.resourceType} ${params.resourceId}`,
      genesisEventId: event.id,
      genesisTimestamp: new Date(event.timestamp),
      genesisHash: event.hash,
      latestEventId: event.id,
      latestTimestamp: new Date(event.timestamp),
      latestHash: event.hash,
      latestSequenceNumber: event.sequenceNumber,
      totalEvents: 1,
      verifiedEvents: 1,
      status: 'active',
      verificationStatus: 'verified',
      lastVerificationTimestamp: new Date(),
      signingSecretHash: ChainOfCommand.computeEvidenceFingerprint(this['signingSecret']),
    };
    
    await this.db
      .insert(chainMetadata)
      .values(metadata)
      .onConflictDoUpdate({
        target: chainMetadata.chainId,
        set: metadata,
      });
    
    return event;
  }
  
  // ==========================================================================
  // EVENT RETRIEVAL (from database)
  // ==========================================================================
  
  /**
   * Gets a specific event by ID from the database
   */
  async getEvent(eventId: string): Promise<ChainEvent | null> {
    const [event] = await this.db
      .select()
      .from(chainEvents)
      .where(eq(chainEvents.id, eventId))
      .limit(1);
    
    if (!event) return null;
    
    return this.mapDbEventToChainEvent(event);
  }
  
  /**
   * Gets the latest event in a chain from the database
   */
  async getLatestEvent(chainId?: string): Promise<ChainEvent | null> {
    const targetChainId = chainId || this['chainId'];
    
    const [event] = await this.db
      .select()
      .from(chainEvents)
      .where(eq(chainEvents.chainId, targetChainId))
      .orderBy(desc(chainEvents.sequenceNumber))
      .limit(1);
    
    if (!event) return null;
    
    return this.mapDbEventToChainEvent(event);
  }
  
  /**
   * Gets the genesis event in a chain from the database
   */
  async getGenesisEvent(chainId?: string): Promise<ChainEvent | null> {
    const targetChainId = chainId || this['chainId'];
    
    const [event] = await this.db
      .select()
      .from(chainEvents)
      .where(and(
        eq(chainEvents.chainId, targetChainId),
        isNull(chainEvents.previousHash)
      ))
      .orderBy(asc(chainEvents.sequenceNumber))
      .limit(1);
    
    if (!event) return null;
    
    return this.mapDbEventToChainEvent(event);
  }
  
  /**
   * Gets all events in a chain from the database
   */
  async getChainEvents(options?: ChainQueryOptions): Promise<ChainEvent[]> {
    const chainId = options?.chainId || this['chainId'];
    const limit = options?.limit || 1000;
    const offset = options?.offset || 0;
    
    let query = this.db
      .select()
      .from(chainEvents)
      .where(eq(chainEvents.chainId, chainId))
      .orderBy(asc(chainEvents.sequenceNumber))
      .limit(limit)
      .offset(offset);
    
    // Apply additional filters
    if (options?.caseId) {
      query = query.where(eq(chainEvents.caseId, options.caseId));
    }
    if (options?.resourceId) {
      query = query.where(eq(chainEvents.resourceId, options.resourceId));
    }
    if (options?.resourceType) {
      query = query.where(eq(chainEvents.resourceType, options.resourceType));
    }
    if (options?.actorId) {
      query = query.where(eq(chainEvents.actorId, options.actorId));
    }
    if (options?.actorType) {
      query = query.where(eq(chainEvents.actorType, options.actorType));
    }
    if (options?.eventType) {
      query = query.where(eq(chainEvents.type, options.eventType));
    }
    if (options?.startDate) {
      query = query.where(chainEvents.timestamp >= new Date(options.startDate));
    }
    if (options?.endDate) {
      query = query.where(chainEvents.timestamp <= new Date(options.endDate));
    }
    
    const events = await query;
    
    return events.map(e => this.mapDbEventToChainEvent(e));
  }
  
  /**
   * Gets chain metadata
   */
  async getChainMetadata(chainId?: string): Promise<any | null> {
    const targetChainId = chainId || this['chainId'];
    
    const [metadata] = await this.db
      .select()
      .from(chainMetadata)
      .where(eq(chainMetadata.chainId, targetChainId))
      .limit(1);
    
    return metadata || null;
  }
  
  /**
   * Gets all chains for a specific case
   */
  async getCaseChains(caseId: string): Promise<any[]> {
    const metadata = await this.db
      .select()
      .from(chainMetadata)
      .where(eq(chainMetadata.chainId, caseId));
    
    return metadata;
  }
  
  /**
   * Gets all chains
   */
  async getAllChains(): Promise<any[]> {
    return this.db.select().from(chainMetadata);
  }
  
  // ==========================================================================
  // CHAIN VERIFICATION (with database)
  // ==========================================================================
  
  /**
   * Verifies the entire chain and logs the result
   */
  async verifyChain(options?: ChainQueryOptions & { 
    requestedBy?: string;
    logResult?: boolean;
  }): Promise<ChainVerificationResult> {
    const chainId = options?.chainId || this['chainId'];
    const requestedBy = options?.requestedBy || 'system';
    
    // Get events from database
    const events = await this.getChainEvents(options);
    
    if (events.length === 0) {
      return {
        valid: false,
        chainId,
        totalEvents: 0,
        verifiedEvents: 0,
        errors: [],
        hasTamperedHashes: false,
        hasBrokenLinks: false,
        hasSequenceGaps: false,
        hasInvalidSignatures: false,
        genesisEventId: null,
        genesisTimestamp: null,
        latestEventId: null,
        latestTimestamp: null,
        latestHash: null,
      };
    }
    
    // Perform verification
    const result = await super.verifyChain(options);
    
    // Log the verification result
    if (options?.logResult !== false) {
      const log: NewChainVerificationLog = {
        chainId,
        requestedBy,
        requestedAt: new Date(),
        valid: result.valid,
        totalEvents: result.totalEvents,
        verifiedEvents: result.verifiedEvents,
        tamperedHashesCount: result.errors.filter(e => e.type === 'tampered_hash').length,
        brokenLinksCount: result.errors.filter(e => e.type === 'broken_link').length,
        sequenceGapsCount: result.errors.filter(e => e.type === 'sequence_gap').length,
        invalidSignaturesCount: result.errors.filter(e => e.type === 'invalid_signature').length,
        duplicateSequencesCount: result.errors.filter(e => e.type === 'duplicate_sequence').length,
        errors: result.errors,
        durationMs: 0, // Would be measured in actual implementation
      };
      
      await this.db.insert(chainVerificationLog).values(log);
      
      // Update chain metadata verification status
      await this.db
        .update(chainMetadata)
        .set({
          verificationStatus: result.valid ? 'verified' : 'tampered',
          lastVerificationTimestamp: new Date(),
        })
        .where(eq(chainMetadata.chainId, chainId));
    }
    
    return result;
  }
  
  // ==========================================================================
  // TRACKING UI HELPERS
  // ==========================================================================
  
  /**
   * Gets tracking information for a resource (FedEx-style UI)
   */
  async getTrackingInfo(resourceType: ChainResourceType, resourceId: string): Promise<ChainTrackingInfo | null> {
    // Get events for this resource
    const events = await this.getChainEvents({ resourceType, resourceId });
    
    if (events.length === 0) {
      return null;
    }
    
    // Get chain metadata
    const chainId = events[0].chainId || this['chainId'];
    const metadata = await this.getChainMetadata(chainId);
    
    // Perform verification
    const verification = await this.verifyChain({ resourceType, resourceId, logResult: false });
    
    // Map to tracking events
    const timeline = events.map(event => ({
      sequenceNumber: event.sequenceNumber,
      type: event.type,
      timestamp: event.timestamp,
      actorName: event.actorName || event.actorId,
      actorType: event.actorType,
      description: this.getEventDescription(event),
      hash: event.hash,
      previousHash: event.previousHash,
      verified: verification.valid,
    }));
    
    // Determine status
    let status: 'verified' | 'unverified' | 'tampered' | 'incomplete' = 'verified';
    if (!verification.valid) {
      if (verification.hasTamperedHashes) {
        status = 'tampered';
      } else if (verification.hasBrokenLinks || verification.hasSequenceGaps) {
        status = 'incomplete';
      } else {
        status = 'unverified';
      }
    }
    
    return {
      resourceId,
      resourceType,
      resourceName: events[0].resourceName || resourceId,
      caseId: events[0].caseId || '',
      chainId: chainId,
      totalEvents: events.length,
      timeline,
      status,
      verificationResult: verification,
    };
  }
  
  /**
   * Gets tracking information for a case
   */
  async getCaseTrackingInfo(caseId: string): Promise<ChainTrackingInfo[]> {
    const chains = await this.getAllChains();
    const caseChains = chains.filter(c => c.caseId === caseId);
    
    const trackingInfos: ChainTrackingInfo[] = [];
    
    for (const chain of caseChains) {
      const events = await this.getChainEvents({ chainId: chain.chainId });
      
      if (events.length > 0) {
        const verification = await this.verifyChain({ chainId: chain.chainId, logResult: false });
        
        const timeline = events.map(event => ({
          sequenceNumber: event.sequenceNumber,
          type: event.type,
          timestamp: event.timestamp,
          actorName: event.actorName || event.actorId,
          actorType: event.actorType,
          description: this.getEventDescription(event),
          hash: event.hash,
          previousHash: event.previousHash,
          verified: verification.valid,
        }));
        
        let status: 'verified' | 'unverified' | 'tampered' | 'incomplete' = 'verified';
        if (!verification.valid) {
          if (verification.hasTamperedHashes) {
            status = 'tampered';
          } else if (verification.hasBrokenLinks || verification.hasSequenceGaps) {
            status = 'incomplete';
          } else {
            status = 'unverified';
          }
        }
        
        trackingInfos.push({
          resourceId: chain.chainId,
          resourceType: 'chain',
          resourceName: chain.name || chain.chainId,
          caseId,
          chainId: chain.chainId,
          totalEvents: events.length,
          timeline,
          status,
          verificationResult: verification,
        });
      }
    }
    
    return trackingInfos;
  }
  
  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================
  
  /**
   * Maps a database event to a ChainEvent
   */
  private mapDbEventToChainEvent(dbEvent: any): ChainEvent {
    return {
      id: dbEvent.id,
      chainId: dbEvent.chainId,
      sequenceNumber: dbEvent.sequenceNumber,
      type: dbEvent.type as ChainEventType,
      timestamp: dbEvent.timestamp.toISOString(),
      actorType: dbEvent.actorType as ChainActorType,
      actorId: dbEvent.actorId,
      actorName: dbEvent.actorName,
      resourceType: dbEvent.resourceType as ChainResourceType,
      resourceId: dbEvent.resourceId,
      resourceName: dbEvent.resourceName,
      hash: dbEvent.hash,
      previousHash: dbEvent.previousHash,
      evidenceFingerprint: dbEvent.evidenceFingerprint,
      evidenceId: dbEvent.evidenceId,
      caseId: dbEvent.caseId,
      sessionId: dbEvent.sessionId,
      agentRunId: dbEvent.agentRunId,
      payload: dbEvent.payload,
      signature: dbEvent.signature,
      immutable: dbEvent.immutable,
      verified: true, // Will be verified on retrieval
      verificationErrors: [],
      createdAt: dbEvent.createdAt?.toISOString(),
    };
  }
  
  /**
   * Updates chain metadata after inserting a new event
   */
  private async updateChainMetadata(chainId: string, event: any): Promise<void> {
    const metadata = await this.getChainMetadata(chainId);
    
    if (metadata) {
      // Check if this is a new genesis event
      if (!metadata.genesisEventId) {
        await this.db
          .update(chainMetadata)
          .set({
            genesisEventId: event.id,
            genesisTimestamp: new Date(event.timestamp),
            genesisHash: event.hash,
            latestEventId: event.id,
            latestTimestamp: new Date(event.timestamp),
            latestHash: event.hash,
            latestSequenceNumber: event.sequenceNumber,
            totalEvents: 1,
            verifiedEvents: 1,
          })
          .where(eq(chainMetadata.chainId, chainId));
      } else {
        // Update latest event info
        await this.db
          .update(chainMetadata)
          .set({
            latestEventId: event.id,
            latestTimestamp: new Date(event.timestamp),
            latestHash: event.hash,
            latestSequenceNumber: event.sequenceNumber,
            totalEvents: metadata.totalEvents + 1,
          })
          .where(eq(chainMetadata.chainId, chainId));
      }
    } else {
      // Create new metadata if it doesn't exist
      await this.db.insert(chainMetadata).values({
        chainId,
        chainType: 'resource',
        name: `${event.resourceType}:${event.resourceId}`,
        genesisEventId: event.id,
        genesisTimestamp: new Date(event.timestamp),
        genesisHash: event.hash,
        latestEventId: event.id,
        latestTimestamp: new Date(event.timestamp),
        latestHash: event.hash,
        latestSequenceNumber: event.sequenceNumber,
        totalEvents: 1,
        verifiedEvents: 1,
        status: 'active',
        verificationStatus: 'verified',
        lastVerificationTimestamp: new Date(),
        signingSecretHash: ChainOfCommand.computeEvidenceFingerprint(this['signingSecret']),
      });
    }
  }
  
  /**
   * Gets a human-readable description for an event
   * (Inherited from parent class, but we need to make it accessible)
   */
  private getEventDescription(event: ChainEvent): string {
    const descriptions: Record<ChainEventType, string> = {
      'document.uploaded': `Document uploaded by ${event.actorName || event.actorId}`,
      'document.accessed': `Document accessed by ${event.actorName || event.actorId}`,
      'document.extracted': 'Document extracted for analysis',
      'document.analyzed': 'Document analyzed by AI',
      'document.exported': 'Document exported',
      'document.modified': `Document modified by ${event.actorName || event.actorId}`,
      'document.deleted': 'Document deleted',
      'case.created': 'Case created',
      'case.accessed': `Case accessed by ${event.actorName || event.actorId}`,
      'case.modified': `Case modified by ${event.actorName || event.actorId}`,
      'case.closed': 'Case closed',
      'case.reopened': 'Case reopened',
      'ai.model_request': 'AI model request',
      'ai.model_response': 'AI model response',
      'ai.tool_call': 'AI tool called',
      'ai.tool_result': 'AI tool result',
      'ai.citation_verified': 'Citation verified',
      'ai.citation_unverifiable': 'Citation unverifiable',
      'ai.injection_detected': 'Injection attempt detected and blocked',
      'filing.created': 'Filing created',
      'filing.submitted': 'Filing submitted to court',
      'filing.accepted': 'Filing accepted',
      'filing.rejected': 'Filing rejected',
      'filing.appealed': 'Filing appealed',
      'security.permission_check': 'Permission check performed',
      'security.permission_denied': 'Permission denied',
      'security.scope_escalation_attempt': 'Scope escalation attempt',
      'security.external_action_authorized': 'External action authorized',
      'security.external_action_blocked': 'External action blocked',
      'security.audit_exported': 'Audit log exported',
      'evidence.uploaded': 'Evidence uploaded',
      'evidence.processed': 'Evidence processed',
      'evidence.verified': 'Evidence verified',
      'evidence.challenged': 'Evidence challenged',
      'evidence.linked': 'Evidence linked to case',
      'system.backup_created': 'System backup created',
      'system.restore_performed': 'System restore performed',
      'system.migration_applied': 'Database migration applied',
    };
    
    return descriptions[event.type] || `Event: ${event.type}`;
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Creates a Supabase-backed ChainOfCommand instance for a specific case
 */
export function createCaseChain(caseId: string, signingSecret: string): SupabaseChainOfCommand {
  return new SupabaseChainOfCommand(
    { signingSecret },
    db
  );
}

/**
 * Creates a Supabase-backed ChainOfCommand instance for a specific resource
 */
export function createResourceChain(
  resourceType: ChainResourceType,
  resourceId: string,
  signingSecret: string
): SupabaseChainOfCommand {
  return new SupabaseChainOfCommand(
    { signingSecret },
    db
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  chainEvents,
  chainMetadata,
  chainVerificationLog,
};
