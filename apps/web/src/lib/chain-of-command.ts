/**
 * Chain of Command - Immutable Audit Trail Service
 * 
 * This service provides cryptographic chain-of-custody tracking for all evidence,
 * documents, and actions in the Aquit platform. Each event is SHA-256 hashed and
 * linked to the previous event, creating an immutable chain that can be verified
 * for tampering, broken links, and sequence gaps.
 * 
 * Key Features:
 * - SHA-256 chained events with previous-hash linking
 * - Deterministic/canonical JSON serialization
 * - Sequence numbers for ordering
 * - Case/resource/actor tracking
 * - Evidence fingerprints
 * - AI/source/citation events
 * - Filing and continuance events
 * - Security/compliance events
 * - Full-chain verification
 * - Detection of tampered hashes
 * - Detection of broken links
 * - Detection of sequence gaps
 * - Server-only protection (browser cannot authoritatively generate chain)
 */

import { createHash, createHmac } from 'crypto';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Event types that can be recorded in the chain
 */
export type ChainEventType =
  // Document lifecycle
  | 'document.uploaded'
  | 'document.accessed'
  | 'document.extracted'
  | 'document.analyzed'
  | 'document.exported'
  | 'document.modified'
  | 'document.deleted'
  
  // Case lifecycle
  | 'case.created'
  | 'case.accessed'
  | 'case.modified'
  | 'case.closed'
  | 'case.reopened'
  
  // AI/Agent events
  | 'ai.model_request'
  | 'ai.model_response'
  | 'ai.tool_call'
  | 'ai.tool_result'
  | 'ai.citation_verified'
  | 'ai.citation_unverifiable'
  | 'ai.injection_detected'
  
  // Filing events
  | 'filing.created'
  | 'filing.submitted'
  | 'filing.accepted'
  | 'filing.rejected'
  | 'filing.appealed'
  
  // Security/Compliance events
  | 'security.permission_check'
  | 'security.permission_denied'
  | 'security.scope_escalation_attempt'
  | 'security.external_action_authorized'
  | 'security.external_action_blocked'
  | 'security.audit_exported'
  
  // Evidence events
  | 'evidence.uploaded'
  | 'evidence.processed'
  | 'evidence.verified'
  | 'evidence.challenged'
  | 'evidence.linked'
  
  // System events
  | 'system.backup_created'
  | 'system.restore_performed'
  | 'system.migration_applied';

/**
 * Actor types that can perform actions
 */
export type ChainActorType = 
  | 'user'
  | 'agent'
  | 'system'
  | 'api'
  | 'admin';

/**
 * Resource types that can be tracked
 */
export type ChainResourceType =
  | 'document'
  | 'case'
  | 'filing'
  | 'evidence'
  | 'citation'
  | 'session'
  | 'agent_run';

/**
 * A single link in the chain of command
 */
export interface ChainEvent {
  // Core identifiers
  id: string;                    // UUID v7 or similar
  sequenceNumber: number;        // Monotonically increasing
  
  // Event metadata
  type: ChainEventType;
  timestamp: string;             // ISO 8601
  
  // Actor information
  actorType: ChainActorType;
  actorId: string;              // userId, agentId, systemId, etc.
  actorName?: string;           // Human-readable name
  
  // Resource information
  resourceType: ChainResourceType;
  resourceId: string;           // documentId, caseId, etc.
  resourceName?: string;        // Human-readable name
  
  // Chain integrity
  hash: string;                 // SHA-256 of this event's canonical representation
  previousHash: string | null;   // SHA-256 of previous event (null for genesis)
  
  // Evidence tracking
  evidenceFingerprint?: string; // SHA-256 of associated evidence/document
  evidenceId?: string;          // Reference to evidence document
  
  // Additional context
  caseId?: string;              // Case context if applicable
  sessionId?: string;            // Session context if applicable
  agentRunId?: string;           // Agent run context if applicable
  
  // Payload (deterministic serialization)
  payload: Record<string, unknown>;
  
  // Security
  signature?: string;           // HMAC signature for tamper detection
  immutable: boolean;            // Cannot be modified once created
  
  // Verification status (computed)
  verified: boolean;
  verificationErrors?: ChainVerificationError[];
}

/**
 * Verification error types
 */
export type ChainVerificationErrorType =
  | 'tampered_hash'
  | 'broken_link'
  | 'sequence_gap'
  | 'missing_previous'
  | 'invalid_signature'
  | 'duplicate_sequence';

/**
 * Single verification error
 */
export interface ChainVerificationError {
  type: ChainVerificationErrorType;
  message: string;
  eventId: string;
  sequenceNumber: number;
  details?: Record<string, unknown>;
}

/**
 * Result of chain verification
 */
export interface ChainVerificationResult {
  valid: boolean;
  chainId: string;
  totalEvents: number;
  verifiedEvents: number;
  errors: ChainVerificationError[];
  
  // Summary flags
  hasTamperedHashes: boolean;
  hasBrokenLinks: boolean;
  hasSequenceGaps: boolean;
  hasInvalidSignatures: boolean;
  
  // Genesis event info
  genesisEventId: string | null;
  genesisTimestamp: string | null;
  
  // Latest event info
  latestEventId: string | null;
  latestTimestamp: string | null;
  latestHash: string | null;
}

/**
 * Filter options for querying chain events
 */
export interface ChainQueryOptions {
  chainId?: string;              // Specific chain ID to query
  caseId?: string;               // Filter by case
  resourceId?: string;           // Filter by resource
  resourceType?: ChainResourceType; // Filter by resource type
  actorId?: string;              // Filter by actor
  actorType?: ChainActorType;    // Filter by actor type
  eventType?: ChainEventType;    // Filter by event type
  startDate?: string;            // ISO 8601 start date
  endDate?: string;              // ISO 8601 end date
  limit?: number;                // Max number of events to return
  offset?: number;               // Pagination offset
}

/**
 * Tracking information for a single item (for FedEx-style UI)
 */
export interface ChainTrackingInfo {
  resourceId: string;
  resourceType: ChainResourceType;
  resourceName: string;
  caseId: string;
  caseName?: string;
  
  // Chain metadata
  chainId: string;
  totalEvents: number;
  
  // Timeline
  timeline: ChainTrackingEvent[];
  
  // Status
  status: 'verified' | 'unverified' | 'tampered' | 'incomplete';
  verificationResult: ChainVerificationResult;
}

/**
 * Simplified event for tracking UI
 */
export interface ChainTrackingEvent {
  sequenceNumber: number;
  type: ChainEventType;
  timestamp: string;
  actorName: string;
  actorType: ChainActorType;
  description: string;
  hash: string;
  previousHash: string | null;
  verified: boolean;
  location?: string;             // For FedEx-style tracking
  status?: string;               // For FedEx-style tracking
}

// ============================================================================
// CANONICAL SERIALIZATION
// ============================================================================

/**
 * Creates a canonical string representation of an event for hashing.
 * This ensures deterministic hashing regardless of object key order.
 * 
 * Rules:
 * 1. Keys are sorted alphabetically
 * 2. Values are serialized in a deterministic way
 * 3. Nested objects are recursively canonicalized
 * 4. Arrays are sorted (if elements are primitives) or canonicalized (if objects)
 */
function canonicalize(value: unknown): string {
  if (value === null) {
    return 'null';
  }
  
  if (value === undefined) {
    return 'undefined';
  }
  
  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (Array.isArray(value)) {
    // Sort primitives, canonicalize objects
    const canonicalized = value.map(item => {
      if (typeof item === 'object' && item !== null) {
        return canonicalize(item);
      }
      return String(item);
    }).sort();
    return `[${canonicalized.join(',')}]`;
  }
  
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    const pairs: string[] = [];
    
    for (const key of keys) {
      const canonicalValue = canonicalize(obj[key]);
      pairs.push(`${key}:${canonicalValue}`);
    }
    
    return `{${pairs.join(',')}}`;
  }
  
  return String(value);
}

/**
 * Creates canonical representation of a chain event for hashing.
 * Only includes fields that affect the chain's integrity.
 */
function createCanonicalEvent(event: Omit<ChainEvent, 'hash' | 'signature' | 'verified' | 'verificationErrors'>): string {
  const canonicalObj = {
    id: event.id,
    sequenceNumber: event.sequenceNumber,
    type: event.type,
    timestamp: event.timestamp,
    actorType: event.actorType,
    actorId: event.actorId,
    resourceType: event.resourceType,
    resourceId: event.resourceId,
    previousHash: event.previousHash,
    evidenceFingerprint: event.evidenceFingerprint,
    caseId: event.caseId,
    sessionId: event.sessionId,
    agentRunId: event.agentRunId,
    payload: event.payload,
  };
  
  return canonicalize(canonicalObj);
}

/**
 * Computes SHA-256 hash of a string
 */
function computeSHA256(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Computes HMAC-SHA256 signature for tamper detection
 */
function computeHMAC(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('hex');
}

// ============================================================================
// CHAIN SERVICE
// ============================================================================

/**
 * Options for creating a ChainOfCommand service
 */
export interface ChainOfCommandOptions {
  signingSecret: string;        // Secret for HMAC signatures
  chainId?: string;             // Optional chain ID (defaults to caseId or resourceId)
}

/**
 * ChainOfCommand - Main service class
 * 
 * This service manages immutable chains of events with cryptographic verification.
 * It is designed to be server-only to prevent the browser from authoritatively
 * generating the chain.
 */
export class ChainOfCommand {
  private signingSecret: string;
  private chainId: string;
  private events: Map<string, ChainEvent> = new Map();
  private sequenceCounter: number = 0;
  private genesisHash: string | null = null;
  
  // In-memory cache for performance (would be backed by database)
  private chainCache: Map<string, ChainEvent[]> = new Map();
  
  constructor(options: ChainOfCommandOptions) {
    this.signingSecret = options.signingSecret;
    this.chainId = options.chainId || 'default';
  }
  
  // ==========================================================================
  // EVENT CREATION
  // ==========================================================================
  
  /**
   * Creates a new chain event and adds it to the chain.
   * 
   * @param params Event creation parameters
   * @returns The created chain event
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
  }): Promise<ChainEvent> {
    // Generate event ID (in production, use UUID v7 or database-generated)
    const id = this.generateEventId();
    const sequenceNumber = ++this.sequenceCounter;
    const timestamp = new Date().toISOString();
    
    // Get previous hash (last event in chain)
    const previousEvent = this.getLatestEvent();
    const previousHash = previousEvent ? previousEvent.hash : null;
    
    // Create the event (without hash and signature first)
    const event: Omit<ChainEvent, 'hash' | 'signature' | 'verified' | 'verificationErrors' | 'immutable'> = {
      id,
      sequenceNumber,
      type: params.type,
      timestamp,
      actorType: params.actorType,
      actorId: params.actorId,
      actorName: params.actorName,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceName: params.resourceName,
      previousHash,
      evidenceFingerprint: params.evidenceFingerprint,
      evidenceId: params.evidenceId,
      caseId: params.caseId,
      sessionId: params.sessionId,
      agentRunId: params.agentRunId,
      payload: params.payload || {},
    };
    
    // Compute hash from canonical representation
    const canonical = createCanonicalEvent(event);
    const hash = computeSHA256(canonical);
    
    // Compute signature for tamper detection
    const signature = computeHMAC(canonical, this.signingSecret);
    
    // Create final event
    const finalEvent: ChainEvent = {
      ...event,
      hash,
      signature,
      immutable: true,
      verified: true, // New events are verified by construction
      verificationErrors: [],
    };
    
    // Store in memory (in production, persist to database)
    this.events.set(id, finalEvent);
    
    // Update genesis hash if this is the first event
    if (previousHash === null) {
      this.genesisHash = hash;
    }
    
    // Invalidate cache
    this.chainCache.delete(this.chainId);
    
    return finalEvent;
  }
  
  /**
   * Creates the genesis (first) event in a chain
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
  }): Promise<ChainEvent> {
    // Reset sequence counter for new chain
    this.sequenceCounter = 0;
    this.events.clear();
    this.genesisHash = null;
    
    return this.createEvent(params);
  }
  
  /**
   * Batch creates multiple events (for bulk operations)
   */
  async createEvents(events: Array<Parameters<typeof this.createEvent>[0]>): Promise<ChainEvent[]> {
    return Promise.all(events.map(params => this.createEvent(params)));
  }
  
  // ==========================================================================
  // EVENT RETRIEVAL
  // ==========================================================================
  
  /**
   * Gets a specific event by ID
   */
  getEvent(eventId: string): ChainEvent | null {
    return this.events.get(eventId) || null;
  }
  
  /**
   * Gets the latest event in the chain
   */
  getLatestEvent(): ChainEvent | null {
    let latest: ChainEvent | null = null;
    
    for (const event of this.events.values()) {
      if (!latest || event.sequenceNumber > latest.sequenceNumber) {
        latest = event;
      }
    }
    
    return latest;
  }
  
  /**
   * Gets the genesis (first) event in the chain
   */
  getGenesisEvent(): ChainEvent | null {
    let genesis: ChainEvent | null = null;
    
    for (const event of this.events.values()) {
      if (event.previousHash === null) {
        genesis = event;
        break;
      }
    }
    
    return genesis;
  }
  
  /**
   * Gets all events in the chain, ordered by sequence number
   */
  async getChainEvents(options?: ChainQueryOptions): Promise<ChainEvent[]> {
    const chainId = options?.chainId || this.chainId;
    
    // Check cache
    if (this.chainCache.has(chainId)) {
      return this.chainCache.get(chainId)!;
    }
    
    // Get all events
    let events = Array.from(this.events.values());
    
    // Apply filters
    if (options?.caseId) {
      events = events.filter(e => e.caseId === options.caseId);
    }
    if (options?.resourceId) {
      events = events.filter(e => e.resourceId === options.resourceId);
    }
    if (options?.resourceType) {
      events = events.filter(e => e.resourceType === options.resourceType);
    }
    if (options?.actorId) {
      events = events.filter(e => e.actorId === options.actorId);
    }
    if (options?.actorType) {
      events = events.filter(e => e.actorType === options.actorType);
    }
    if (options?.eventType) {
      events = events.filter(e => e.type === options.eventType);
    }
    if (options?.startDate) {
      events = events.filter(e => e.timestamp >= options.startDate!);
    }
    if (options?.endDate) {
      events = events.filter(e => e.timestamp <= options.endDate!);
    }
    
    // Sort by sequence number
    events.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    
    // Apply pagination
    const limit = options?.limit || events.length;
    const offset = options?.offset || 0;
    events = events.slice(offset, offset + limit);
    
    // Cache result
    this.chainCache.set(chainId, events);
    
    return events;
  }
  
  /**
   * Gets events for a specific resource
   */
  async getResourceChain(resourceType: ChainResourceType, resourceId: string): Promise<ChainEvent[]> {
    return this.getChainEvents({ resourceType, resourceId });
  }
  
  /**
   * Gets events for a specific case
   */
  async getCaseChain(caseId: string): Promise<ChainEvent[]> {
    return this.getChainEvents({ caseId });
  }
  
  // ==========================================================================
  // CHAIN VERIFICATION
  // ==========================================================================
  
  /**
   * Verifies the entire chain for integrity
   * 
   * Checks for:
   * - Tampered hashes (event hash doesn't match computed hash)
   * - Broken links (previousHash doesn't match actual previous event hash)
   * - Sequence gaps (missing sequence numbers)
   * - Invalid signatures
   */
  async verifyChain(options?: ChainQueryOptions): Promise<ChainVerificationResult> {
    const events = await this.getChainEvents(options);
    
    if (events.length === 0) {
      return {
        valid: false,
        chainId: this.chainId,
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
    
    const errors: ChainVerificationError[] = [];
    let verifiedCount = 0;
    
    // Sort by sequence number for verification
    const sortedEvents = [...events].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    
    // Track expected sequence number
    let expectedSequence = sortedEvents[0].sequenceNumber;
    
    // Track previous event for link verification
    let previousEvent: ChainEvent | null = null;
    
    for (const event of sortedEvents) {
      const eventErrors: ChainVerificationError[] = [];
      
      // 1. Check sequence continuity
      if (event.sequenceNumber !== expectedSequence) {
        eventErrors.push({
          type: 'sequence_gap',
          message: `Sequence gap detected: expected ${expectedSequence}, got ${event.sequenceNumber}`,
          eventId: event.id,
          sequenceNumber: event.sequenceNumber,
          details: {
            expected: expectedSequence,
            actual: event.sequenceNumber,
          },
        });
      }
      
      // 2. Verify hash integrity
      const canonical = createCanonicalEvent({
        id: event.id,
        sequenceNumber: event.sequenceNumber,
        type: event.type,
        timestamp: event.timestamp,
        actorType: event.actorType,
        actorId: event.actorId,
        actorName: event.actorName,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        resourceName: event.resourceName,
        previousHash: event.previousHash,
        evidenceFingerprint: event.evidenceFingerprint,
        caseId: event.caseId,
        sessionId: event.sessionId,
        agentRunId: event.agentRunId,
        payload: event.payload,
      });
      
      const computedHash = computeSHA256(canonical);
      
      if (computedHash !== event.hash) {
        eventErrors.push({
          type: 'tampered_hash',
          message: `Hash mismatch: event ${event.id} has been tampered with`,
          eventId: event.id,
          sequenceNumber: event.sequenceNumber,
          details: {
            expectedHash: computedHash,
            actualHash: event.hash,
          },
        });
      }
      
      // 3. Verify signature
      if (this.signingSecret) {
        const computedSignature = computeHMAC(canonical, this.signingSecret);
        if (event.signature && computedSignature !== event.signature) {
          eventErrors.push({
            type: 'invalid_signature',
            message: `Invalid signature: event ${event.id} signature is invalid`,
            eventId: event.id,
            sequenceNumber: event.sequenceNumber,
            details: {
              expectedSignature: computedSignature,
              actualSignature: event.signature,
            },
          });
        }
      }
      
      // 4. Verify previous hash link
      if (previousEvent) {
        if (event.previousHash !== previousEvent.hash) {
          eventErrors.push({
            type: 'broken_link',
            message: `Broken link: event ${event.id} previousHash doesn't match previous event hash`,
            eventId: event.id,
            sequenceNumber: event.sequenceNumber,
            details: {
              expectedPreviousHash: previousEvent.hash,
              actualPreviousHash: event.previousHash,
            },
          });
        }
      } else if (event.previousHash !== null) {
        // First event should have null previousHash
        eventErrors.push({
          type: 'broken_link',
          message: `Genesis event should have null previousHash`,
          eventId: event.id,
          sequenceNumber: event.sequenceNumber,
          details: {
            previousHash: event.previousHash,
          },
        });
      }
      
      // Update tracking
      previousEvent = event;
      expectedSequence++;
      
      if (eventErrors.length === 0) {
        verifiedCount++;
      }
      
      errors.push(...eventErrors);
    }
    
    // Check for duplicate sequences
    const sequenceNumbers = sortedEvents.map(e => e.sequenceNumber);
    const uniqueSequences = new Set(sequenceNumbers);
    if (sequenceNumbers.length !== uniqueSequences.size) {
      const duplicates = sequenceNumbers.filter((seq, idx) => sequenceNumbers.indexOf(seq) !== idx);
      for (const dupSeq of duplicates) {
        const dupEvent = sortedEvents.find(e => e.sequenceNumber === dupSeq);
        if (dupEvent) {
          errors.push({
            type: 'duplicate_sequence',
            message: `Duplicate sequence number: ${dupSeq}`,
            eventId: dupEvent.id,
            sequenceNumber: dupSeq,
          });
        }
      }
    }
    
    // Summary flags
    const hasTamperedHashes = errors.some(e => e.type === 'tampered_hash');
    const hasBrokenLinks = errors.some(e => e.type === 'broken_link');
    const hasSequenceGaps = errors.some(e => e.type === 'sequence_gap');
    const hasInvalidSignatures = errors.some(e => e.type === 'invalid_signature');
    
    const genesis = sortedEvents[0];
    const latest = sortedEvents[sortedEvents.length - 1];
    
    return {
      valid: errors.length === 0,
      chainId: this.chainId,
      totalEvents: sortedEvents.length,
      verifiedEvents: verifiedCount,
      errors,
      hasTamperedHashes,
      hasBrokenLinks,
      hasSequenceGaps,
      hasInvalidSignatures,
      genesisEventId: genesis.id,
      genesisTimestamp: genesis.timestamp,
      latestEventId: latest.id,
      latestTimestamp: latest.timestamp,
      latestHash: latest.hash,
    };
  }
  
  /**
   * Verifies a single event
   */
  async verifyEvent(eventId: string): Promise<ChainEvent | null> {
    const event = this.getEvent(eventId);
    if (!event) return null;
    
    // Re-compute hash
    const canonical = createCanonicalEvent({
      id: event.id,
      sequenceNumber: event.sequenceNumber,
      type: event.type,
      timestamp: event.timestamp,
      actorType: event.actorType,
      actorId: event.actorId,
      actorName: event.actorName,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      resourceName: event.resourceName,
      previousHash: event.previousHash,
      evidenceFingerprint: event.evidenceFingerprint,
      caseId: event.caseId,
      sessionId: event.sessionId,
      agentRunId: event.agentRunId,
      payload: event.payload,
    });
    
    const computedHash = computeSHA256(canonical);
    const isValid = computedHash === event.hash;
    
    return {
      ...event,
      verified: isValid,
      verificationErrors: isValid ? [] : [{
        type: 'tampered_hash',
        message: 'Event hash does not match computed hash',
        eventId: event.id,
        sequenceNumber: event.sequenceNumber,
      }],
    };
  }
  
  // ==========================================================================
  // TRACKING UI HELPERS
  // ==========================================================================
  
  /**
   * Gets tracking information for a resource (FedEx-style UI)
   */
  async getTrackingInfo(resourceType: ChainResourceType, resourceId: string): Promise<ChainTrackingInfo | null> {
    const events = await this.getResourceChain(resourceType, resourceId);
    
    if (events.length === 0) {
      return null;
    }
    
    const verification = await this.verifyChain({ resourceType, resourceId });
    
    // Map to tracking events
    const timeline: ChainTrackingEvent[] = events.map(event => ({
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
      chainId: this.chainId,
      totalEvents: events.length,
      timeline,
      status,
      verificationResult: verification,
    };
  }
  
  /**
   * Gets a human-readable description for an event
   */
  private getEventDescription(event: ChainEvent): string {
    const descriptions: Record<ChainEventType, string> = {
      // Document lifecycle
      'document.uploaded': `Document uploaded by ${event.actorName || event.actorId}`,
      'document.accessed': `Document accessed by ${event.actorName || event.actorId}`,
      'document.extracted': `Document extracted for analysis`,
      'document.analyzed': `Document analyzed by AI`,
      'document.exported': `Document exported`,
      'document.modified': `Document modified by ${event.actorName || event.actorId}`,
      'document.deleted': `Document deleted`,
      
      // Case lifecycle
      'case.created': `Case created`,
      'case.accessed': `Case accessed by ${event.actorName || event.actorId}`,
      'case.modified': `Case modified by ${event.actorName || event.actorId}`,
      'case.closed': `Case closed`,
      'case.reopened': `Case reopened`,
      
      // AI/Agent events
      'ai.model_request': `AI model request`,
      'ai.model_response': `AI model response`,
      'ai.tool_call': `AI tool called`,
      'ai.tool_result': `AI tool result`,
      'ai.citation_verified': `Citation verified`,
      'ai.citation_unverifiable': `Citation unverifiable`,
      'ai.injection_detected': `Injection attempt detected and blocked`,
      
      // Filing events
      'filing.created': `Filing created`,
      'filing.submitted': `Filing submitted to court`,
      'filing.accepted': `Filing accepted`,
      'filing.rejected': `Filing rejected`,
      'filing.appealed': `Filing appealed`,
      
      // Security/Compliance events
      'security.permission_check': `Permission check performed`,
      'security.permission_denied': `Permission denied`,
      'security.scope_escalation_attempt': `Scope escalation attempt`,
      'security.external_action_authorized': `External action authorized`,
      'security.external_action_blocked': `External action blocked`,
      'security.audit_exported': `Audit log exported`,
      
      // Evidence events
      'evidence.uploaded': `Evidence uploaded`,
      'evidence.processed': `Evidence processed`,
      'evidence.verified': `Evidence verified`,
      'evidence.challenged': `Evidence challenged`,
      'evidence.linked': `Evidence linked to case`,
      
      // System events
      'system.backup_created': `System backup created`,
      'system.restore_performed': `System restore performed`,
      'system.migration_applied': `Database migration applied`,
    };
    
    return descriptions[event.type] || `Event: ${event.type}`;
  }
  
  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================
  
  /**
   * Generates a unique event ID
   * In production, this would use UUID v7 or database-generated IDs
   */
  private generateEventId(): string {
    // Simple implementation for now
    return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Computes SHA-256 fingerprint for evidence/documents
   */
  static computeEvidenceFingerprint(data: string | Buffer): string {
    if (typeof data === 'string') {
      return createHash('sha256').update(data).digest('hex');
    }
    return createHash('sha256').update(data).digest('hex');
  }
  
  /**
   * Validates that a hash is a valid SHA-256 hex string
   */
  static isValidSHA256(hash: string): boolean {
    return /^[a-f0-9]{64}$/.test(hash);
  }
  
  // ==========================================================================
  // STATIC FACTORY METHODS
  // ==========================================================================
  
  /**
   * Creates a ChainOfCommand instance for a specific case
   */
  static forCase(caseId: string, signingSecret: string): ChainOfCommand {
    return new ChainOfCommand({
      signingSecret,
      chainId: `case-${caseId}`,
    });
  }
  
  /**
   * Creates a ChainOfCommand instance for a specific resource
   */
  static forResource(resourceType: ChainResourceType, resourceId: string, signingSecret: string): ChainOfCommand {
    return new ChainOfCommand({
      signingSecret,
      chainId: `${resourceType}-${resourceId}`,
    });
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  canonicalize,
  computeSHA256,
  computeHMAC,
  createCanonicalEvent,
};
