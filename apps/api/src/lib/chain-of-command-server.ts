/**
 * Server-only persistence for the Chain of Command.
 *
 * Compose the synchronous snapshot signer/verifier rather than overriding its
 * synchronous readers with promises. PostgreSQL remains the authoritative store.
 */
import { and, asc, desc, eq, gte, inArray, isNull, lte, sql, type SQL } from 'drizzle-orm';
import { db } from '../db';
import {
  chainEvents,
  chainMetadata,
  chainVerificationLog,
  type NewChainEvent,
  type NewChainMetadata,
  type NewChainVerificationLog,
} from '@workspace/db';
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

type StoredEvent = typeof chainEvents.$inferSelect;
type StoredMetadata = typeof chainMetadata.$inferSelect;
type ChainDataAccess = Pick<typeof db, 'select' | 'insert' | 'update'>;
type ChainTransaction = ChainDataAccess & Pick<typeof db, 'execute'>;

export interface ChainDatabase extends ChainDataAccess {
  transaction<T>(work: (transaction: ChainTransaction) => Promise<T>): Promise<T>;
}

export interface SupabaseChainOptions {
  signingSecret: string;
  chainId?: string;
}

type CreateEventParams = Parameters<ChainOfCommand['createEvent']>[0] & { chainId?: string };
type GenesisParams = CreateEventParams & {
  chainType?: string;
  chainName?: string;
  chainDescription?: string;
};

function isPayload(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export class SupabaseChainOfCommand {
  private readonly signingSecret: string;
  private readonly chainId: string;

  constructor(options: SupabaseChainOptions, private readonly database: ChainDatabase = db) {
    this.signingSecret = options.signingSecret;
    this.chainId = options.chainId || 'default';
  }

  async createEvent(params: CreateEventParams): Promise<ChainEvent> {
    return this.appendEvent(params);
  }

  async createGenesisEvent(params: GenesisParams): Promise<ChainEvent> {
    return this.appendEvent(params, params);
  }

  async createEvents(events: CreateEventParams[]): Promise<ChainEvent[]> {
    const created: ChainEvent[] = [];
    for (const event of events) created.push(await this.createEvent(event));
    return created;
  }

  private async appendEvent(params: CreateEventParams, genesis?: GenesisParams): Promise<ChainEvent> {
    const chainId = params.chainId || this.chainId;
    return this.database.transaction(async (transaction) => {
      // Serialize the read/sign/append operation across processes, not just this object.
      // hashtextextended yields a bigint advisory key without changing any schema.
      await transaction.execute(
        sql`select pg_advisory_xact_lock(hashtextextended(${chainId}, 0))`,
      );
      const [latest] = await transaction.select().from(chainEvents)
        .where(eq(chainEvents.chainId, chainId))
        .orderBy(desc(chainEvents.sequenceNumber)).limit(1);
      if (genesis && latest) throw new Error(`Chain ${chainId} already has a genesis event`);

      const signer = this.snapshot(chainId, latest ? [this.mapDbEventToChainEvent(latest)] : []);
      const event = await signer.createEvent(params);
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
      const [inserted] = await transaction.insert(chainEvents).values(dbEvent).returning();
      if (!inserted) throw new Error('Chain event insert returned no row');
      await this.updateChainMetadata(chainId, inserted, transaction, genesis);
      return this.mapDbEventToChainEvent(inserted);
    });
  }

  async getEvent(eventId: string): Promise<ChainEvent | null> {
    const [event] = await this.database.select().from(chainEvents)
      .where(eq(chainEvents.id, eventId)).limit(1);
    return event ? this.mapDbEventToChainEvent(event) : null;
  }

  async getLatestEvent(chainId = this.chainId): Promise<ChainEvent | null> {
    const [event] = await this.database.select().from(chainEvents)
      .where(eq(chainEvents.chainId, chainId))
      .orderBy(desc(chainEvents.sequenceNumber)).limit(1);
    return event ? this.mapDbEventToChainEvent(event) : null;
  }

  async getGenesisEvent(chainId = this.chainId): Promise<ChainEvent | null> {
    const [event] = await this.database.select().from(chainEvents)
      .where(and(eq(chainEvents.chainId, chainId), isNull(chainEvents.previousHash)))
      .orderBy(asc(chainEvents.sequenceNumber)).limit(1);
    return event ? this.mapDbEventToChainEvent(event) : null;
  }

  async getChainEvents(options?: ChainQueryOptions): Promise<ChainEvent[]> {
    return this.readEvents(options, true);
  }

  async getResourceChain(resourceType: ChainResourceType, resourceId: string): Promise<ChainEvent[]> {
    return this.getChainEvents({ resourceType, resourceId });
  }

  async getCaseChain(caseId: string): Promise<ChainEvent[]> {
    return this.getChainEvents({ caseId });
  }

  private async readEvents(options: ChainQueryOptions = {}, paginate: boolean): Promise<ChainEvent[]> {
    const conditions: SQL[] = [eq(chainEvents.chainId, options.chainId || this.chainId)];
    if (options.caseId) conditions.push(eq(chainEvents.caseId, options.caseId));
    if (options.resourceId) conditions.push(eq(chainEvents.resourceId, options.resourceId));
    if (options.resourceType) conditions.push(eq(chainEvents.resourceType, options.resourceType));
    if (options.actorId) conditions.push(eq(chainEvents.actorId, options.actorId));
    if (options.actorType) conditions.push(eq(chainEvents.actorType, options.actorType));
    if (options.eventType) conditions.push(eq(chainEvents.type, options.eventType));
    if (options.startDate) conditions.push(gte(chainEvents.timestamp, this.parseDate(options.startDate)));
    if (options.endDate) conditions.push(lte(chainEvents.timestamp, this.parseDate(options.endDate)));

    const query = this.database.select().from(chainEvents)
      .where(and(...conditions)).orderBy(asc(chainEvents.sequenceNumber));
    const events = paginate
      ? await query.limit(options.limit ?? 1000).offset(options.offset ?? 0)
      : await query;
    return events.map((event) => this.mapDbEventToChainEvent(event));
  }

  async getChainMetadata(chainId = this.chainId): Promise<StoredMetadata | null> {
    const [metadata] = await this.database.select().from(chainMetadata)
      .where(eq(chainMetadata.chainId, chainId)).limit(1);
    return metadata || null;
  }

  async getCaseChains(caseId: string): Promise<StoredMetadata[]> {
    // Case ownership is stored on events, not on a nonexistent metadata.caseId column.
    const ids = this.database.select({ chainId: chainEvents.chainId }).from(chainEvents)
      .where(eq(chainEvents.caseId, caseId));
    return this.database.select().from(chainMetadata).where(inArray(chainMetadata.chainId, ids));
  }

  async getAllChains(): Promise<StoredMetadata[]> {
    return this.database.select().from(chainMetadata);
  }

  async verifyChain(options?: ChainQueryOptions & {
    requestedBy?: string;
    logResult?: boolean;
  }): Promise<ChainVerificationResult> {
    const startedAt = performance.now();
    const chainId = options?.chainId || this.chainId;
    // Verification must not silently stop at the browsing page-size limit.
    const events = await this.readEvents(options, false);
    const result = await this.snapshot(chainId, events).verifyChain();
    if (options?.logResult !== false && events.length > 0) {
      const log: NewChainVerificationLog = {
        chainId,
        requestedBy: options?.requestedBy || 'system',
        requestedAt: new Date(),
        valid: result.valid,
        totalEvents: result.totalEvents,
        verifiedEvents: result.verifiedEvents,
        tamperedHashesCount: result.errors.filter((e) => e.type === 'tampered_hash').length,
        brokenLinksCount: result.errors.filter((e) => e.type === 'broken_link').length,
        sequenceGapsCount: result.errors.filter((e) => e.type === 'sequence_gap').length,
        invalidSignaturesCount: result.errors.filter((e) => e.type === 'invalid_signature').length,
        duplicateSequencesCount: result.errors.filter((e) => e.type === 'duplicate_sequence').length,
        errors: result.errors,
        durationMs: Math.round(performance.now() - startedAt),
      };
      // A filtered result cannot certify or mark the entire chain as tampered.
      const isFullChain = !options?.caseId && !options?.resourceId && !options?.resourceType &&
        !options?.actorId && !options?.actorType && !options?.eventType &&
        !options?.startDate && !options?.endDate;
      await this.database.transaction(async (transaction) => {
        await transaction.insert(chainVerificationLog).values(log);
        if (isFullChain && result.latestEventId) {
          await transaction.update(chainMetadata).set({
            verificationStatus: result.valid ? 'verified' : 'tampered',
            verifiedEvents: result.verifiedEvents,
            lastVerificationTimestamp: new Date(),
          }).where(and(
            eq(chainMetadata.chainId, chainId),
            // Do not certify newer events appended after this verification snapshot.
            eq(chainMetadata.latestEventId, result.latestEventId),
          ));
        }
      });
    }
    return result;
  }

  async verifyEvent(eventId: string): Promise<ChainEvent | null> {
    const event = await this.getEvent(eventId);
    return event ? this.snapshot(event.chainId || this.chainId, [event]).verifyEvent(eventId) : null;
  }

  async getTrackingInfo(resourceType: ChainResourceType, resourceId: string): Promise<ChainTrackingInfo | null> {
    const events = await this.getChainEvents({ resourceType, resourceId });
    if (events.length === 0) return null;
    const chainId = events[0].chainId || this.chainId;
    const verification = await this.verifyChain({ chainId, resourceType, resourceId, logResult: false });
    return this.trackingInfo(events, verification, {
      resourceId,
      resourceType,
      resourceName: events[0].resourceName || resourceId,
      caseId: events[0].caseId || '',
    });
  }

  async getCaseTrackingInfo(caseId: string): Promise<ChainTrackingInfo[]> {
    const chains = await this.getCaseChains(caseId);
    const tracking: ChainTrackingInfo[] = [];
    for (const chain of chains) {
      const events = await this.getChainEvents({ chainId: chain.chainId, caseId });
      if (events.length === 0) continue;
      const verification = await this.verifyChain({ chainId: chain.chainId, logResult: false });
      tracking.push(this.trackingInfo(events, verification, {
        resourceId: chain.chainId,
        resourceType: 'chain',
        resourceName: chain.name || chain.chainId,
        caseId,
      }));
    }
    return tracking;
  }

  private snapshot(chainId: string, initialEvents: readonly ChainEvent[]): ChainOfCommand {
    return new ChainOfCommand({ signingSecret: this.signingSecret, chainId, initialEvents });
  }

  private parseDate(value: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) throw new Error(`Invalid chain query date: ${value}`);
    return date;
  }

  private mapDbEventToChainEvent(event: StoredEvent): ChainEvent {
    if (!isPayload(event.payload)) throw new Error(`Invalid chain event payload: ${event.id}`);
    return {
      id: event.id,
      chainId: event.chainId,
      createdAt: event.createdAt.toISOString(),
      sequenceNumber: event.sequenceNumber,
      type: event.type as ChainEventType,
      timestamp: event.timestamp.toISOString(),
      actorType: event.actorType as ChainActorType,
      actorId: event.actorId,
      actorName: event.actorName ?? undefined,
      resourceType: event.resourceType as ChainResourceType,
      resourceId: event.resourceId,
      resourceName: event.resourceName ?? undefined,
      hash: event.hash,
      previousHash: event.previousHash,
      evidenceFingerprint: event.evidenceFingerprint ?? undefined,
      evidenceId: event.evidenceId ?? undefined,
      caseId: event.caseId ?? undefined,
      sessionId: event.sessionId ?? undefined,
      agentRunId: event.agentRunId ?? undefined,
      payload: event.payload,
      signature: event.signature ?? undefined,
      immutable: event.immutable,
      // Retrieval is not verification; the verifier decides trust separately.
      verified: false,
      verificationErrors: [],
    };
  }

  private async updateChainMetadata(
    chainId: string,
    event: StoredEvent,
    transaction: ChainDataAccess,
    genesis?: GenesisParams,
  ): Promise<void> {
    const [metadata] = await transaction.select().from(chainMetadata)
      .where(eq(chainMetadata.chainId, chainId)).limit(1);
    const latest = {
      latestEventId: event.id,
      latestTimestamp: event.timestamp,
      latestHash: event.hash,
      latestSequenceNumber: event.sequenceNumber,
      verificationStatus: 'unverified',
      updatedAt: new Date(),
    };
    if (metadata) {
      await transaction.update(chainMetadata).set({
        ...latest,
        totalEvents: metadata.totalEvents + 1,
        ...(!metadata.genesisEventId ? {
          genesisEventId: event.id,
          genesisTimestamp: event.timestamp,
          genesisHash: event.hash,
        } : {}),
        ...(genesis ? {
          chainType: genesis.chainType || 'resource',
          name: genesis.chainName || `${event.resourceType}:${event.resourceId}`,
          description: genesis.chainDescription || null,
        } : {}),
      }).where(eq(chainMetadata.chainId, chainId));
    } else {
      const fresh: NewChainMetadata = {
        ...latest,
        chainId,
        chainType: genesis?.chainType || 'resource',
        name: genesis?.chainName || `${event.resourceType}:${event.resourceId}`,
        description: genesis?.chainDescription,
        genesisEventId: event.id,
        genesisTimestamp: event.timestamp,
        genesisHash: event.hash,
        totalEvents: 1,
        verifiedEvents: 0,
        status: 'active',
        signingSecretHash: ChainOfCommand.computeEvidenceFingerprint(this.signingSecret),
      };
      await transaction.insert(chainMetadata).values(fresh);
    }
  }

  private trackingInfo(
    events: ChainEvent[],
    verification: ChainVerificationResult,
    resource: Pick<ChainTrackingInfo, 'resourceId' | 'resourceType' | 'resourceName' | 'caseId'>,
  ): ChainTrackingInfo {
    let status: ChainTrackingInfo['status'] = 'verified';
    if (!verification.valid) {
      status = verification.hasTamperedHashes || verification.hasInvalidSignatures ? 'tampered'
        : verification.hasBrokenLinks || verification.hasSequenceGaps ? 'incomplete' : 'unverified';
    }
    return {
      ...resource,
      chainId: verification.chainId,
      totalEvents: events.length,
      timeline: events.map((event) => ({
        sequenceNumber: event.sequenceNumber,
        type: event.type,
        timestamp: event.timestamp,
        actorName: event.actorName || event.actorId,
        actorType: event.actorType,
        description: this.getEventDescription(event),
        hash: event.hash,
        previousHash: event.previousHash,
        verified: verification.valid,
      })),
      status,
      verificationResult: verification,
    };
  }

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
    return descriptions[event.type];
  }
}

export function createCaseChain(caseId: string, signingSecret: string): SupabaseChainOfCommand {
  return new SupabaseChainOfCommand({ signingSecret, chainId: `case-${caseId}` });
}

export function createResourceChain(
  resourceType: ChainResourceType,
  resourceId: string,
  signingSecret: string,
): SupabaseChainOfCommand {
  return new SupabaseChainOfCommand({ signingSecret, chainId: `${resourceType}-${resourceId}` });
}

export { chainEvents, chainMetadata, chainVerificationLog };
