/**
 * Offline database-boundary regressions. Real Drizzle builds and decodes SQL;
 * a scripted pg Client returns rows without connecting to any database.
 * This does not substitute for PostgreSQL/RLS/concurrency integration testing.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { getTableColumns } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import {
  ChainOfCommand,
  createCanonicalEvent,
  computeSHA256,
  type ChainEvent,
} from '../../web/src/lib/chain-of-command';
import {
  chainEvents,
  chainMetadata,
} from '../../../packages/database/schema/chain-of-command';
import {
  SupabaseChainOfCommand,
  createCaseChain,
  createResourceChain,
  type ChainDatabase,
} from '../src/lib/chain-of-command-server';

// Never initialize the production pool or the workspace fallback during tests.
const runtime = vi.hoisted((): { database?: ChainDatabase } => ({}));
vi.mock('../src/db', () => ({ get db() { return runtime.database; } }));
vi.mock('@workspace/db', async () =>
  import('../../../packages/database/schema/chain-of-command'));

type StoredEvent = typeof chainEvents.$inferSelect;
type StoredMetadata = typeof chainMetadata.$inferSelect;
interface QueryCall { text: string; values: unknown[] }
interface Step {
  match: RegExp;
  rows?: unknown[][] | ((call: QueryCall) => unknown[][]);
  error?: string;
}

const secret = 'offline-chain-regression-secret';
const chainId = 'chain-regression';
const params = {
  type: 'document.uploaded',
  actorType: 'user',
  actorId: 'user-1',
  resourceType: 'document',
  resourceId: 'doc-1',
} as const;

function stored(event: ChainEvent, overrides: Partial<StoredEvent> = {}): StoredEvent {
  return {
    id: event.id,
    chainId: event.chainId || chainId,
    sequenceNumber: event.sequenceNumber,
    type: event.type,
    timestamp: new Date(event.timestamp),
    actorType: event.actorType,
    actorId: event.actorId,
    actorName: event.actorName ?? null,
    resourceType: event.resourceType,
    resourceId: event.resourceId,
    resourceName: event.resourceName ?? null,
    hash: event.hash,
    previousHash: event.previousHash,
    evidenceFingerprint: event.evidenceFingerprint ?? null,
    evidenceId: event.evidenceId ?? null,
    caseId: event.caseId ?? null,
    sessionId: event.sessionId ?? null,
    agentRunId: event.agentRunId ?? null,
    payload: event.payload,
    signature: event.signature ?? null,
    immutable: true,
    createdAt: new Date('2026-10-18T00:00:00.000Z'),
    ...overrides,
  };
}

function metadata(event: ChainEvent): StoredMetadata {
  return {
    chainId: event.chainId || chainId,
    chainType: 'resource',
    name: 'Document chain',
    description: null,
    genesisEventId: event.id,
    genesisTimestamp: new Date(event.timestamp),
    genesisHash: event.hash,
    latestEventId: event.id,
    latestTimestamp: new Date(event.timestamp),
    latestHash: event.hash,
    latestSequenceNumber: event.sequenceNumber,
    totalEvents: event.sequenceNumber,
    verifiedEvents: 0,
    status: 'active',
    verificationStatus: 'unverified',
    lastVerificationTimestamp: null,
    signingSecretHash: null,
    createdAt: new Date(event.timestamp),
    updatedAt: new Date(event.timestamp),
  };
}

function row(value: object, table: PgTable): unknown[] {
  return Object.keys(getTableColumns(table)).map((key) => {
    const field: unknown = Reflect.get(value, key);
    return field instanceof Date ? field.toISOString() : field ?? null;
  });
}

function insertedValues(call: QueryCall, table: PgTable): Record<string, unknown> {
  const match = call.text.match(/insert into "[^"]+" \((.*?)\) values \((.*?)\)/i);
  if (!match) throw new Error(`Unexpected INSERT SQL: ${call.text}`);
  const names = match[1].split(',').map((name) => name.trim().replaceAll('"', ''));
  const values = match[2].split(',').map((value) => value.trim());
  const output: Record<string, unknown> = {};
  for (const [key, column] of Object.entries(getTableColumns(table))) {
    const index = names.indexOf(column.name);
    const token = values[index]?.match(/^\$(\d+)$/);
    if (token) output[key] = call.values[Number(token[1]) - 1];
  }
  return output;
}

function harness(steps: Step[], selectedChain = chainId) {
  const client = new Client({ connectionString: 'postgresql://offline:offline@127.0.0.1:65432/offline' });
  const pending = [...steps];
  const calls: QueryCall[] = [];
  vi.spyOn(client, 'query').mockImplementation(async (query: unknown, values?: unknown) => {
    const text = typeof query === 'string' ? query
      : query && typeof query === 'object' ? Reflect.get(query, 'text') : undefined;
    if (typeof text !== 'string') throw new Error('Missing query text');
    const call = { text, values: Array.isArray(values) ? values : [] };
    calls.push(call);
    const step = pending.shift();
    if (!step) throw new Error(`Unexpected database call: ${text}`);
    expect(text).toMatch(step.match);
    if (step.error) throw new Error(step.error);
    const rows = typeof step.rows === 'function' ? step.rows(call) : step.rows || [];
    return { rows, rowCount: rows.length, fields: [], command: text.split(' ')[0], oid: 0 };
  });
  const database = drizzle(client);
  runtime.database = database;
  return {
    calls,
    client,
    service: new SupabaseChainOfCommand({ signingSecret: secret, chainId: selectedChain }, database),
    done: () => expect(pending).toHaveLength(0),
  };
}

async function fixture(count = 2, context = chainId): Promise<ChainEvent[]> {
  const signer = new ChainOfCommand({ signingSecret: secret, chainId: context });
  return signer.createEvents(Array.from({ length: count }, () => params));
}

afterEach(() => {
  runtime.database = undefined;
  vi.restoreAllMocks();
});

describe('chain persistence contracts', () => {
  it('preserves synchronous in-memory readers and restarts sequence/hash state from a snapshot', async () => {
    const [genesis, latest] = await fixture();
    const signer = new ChainOfCommand({ signingSecret: secret, chainId, initialEvents: [genesis, latest] });
    expect(signer.getEvent(genesis.id)).toEqual(genesis);
    expect(signer.getGenesisEvent()).toEqual(genesis);
    expect(signer.getLatestEvent()).toEqual(latest);
    const appended = await signer.createEvent(params);
    expect(appended.sequenceNumber).toBe(3);
    expect(appended.previousHash).toBe(latest.hash);
    expect(appended.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect((await signer.verifyChain()).valid).toBe(true);
  });

  it('keeps persisted metadata out of the established canonical hash format', async () => {
    const [event] = await fixture(1);
    expect(createCanonicalEvent(event)).toBe(createCanonicalEvent({
      ...event, chainId: 'metadata-only', createdAt: '2026-01-01T00:00:00Z',
    }));
    expect(computeSHA256(createCanonicalEvent(event))).toBe(event.hash);
  });

  it('matches a golden hash produced by the pre-repair implementation', () => {
    const body = {
      ...params,
      id: '11111111-1111-4111-8111-111111111111',
      sequenceNumber: 1,
      timestamp: '2026-10-18T00:00:00.000Z',
      previousHash: null,
      payload: { foo: 'bar' },
      immutable: true,
    };
    expect(computeSHA256(createCanonicalEvent(body))).toBe(
      '4bd4f91cf586b14e1a5f0b6c2278f6440081d40aa99720df1a96508869a2c693',
    );
  });

  it('clones snapshot inputs rather than sharing mutable evidence payloads', async () => {
    const [event] = await fixture(1);
    const signer = new ChainOfCommand({ signingSecret: secret, initialEvents: [event] });
    event.payload.externalMutation = true;
    expect((await signer.verifyChain()).valid).toBe(true);
  });

  it('maps nullable DB context to optional fields and does not claim retrieval is verification', async () => {
    const [event] = await fixture(1);
    const h = harness([{ match: /from "chain_events"/, rows: [row(stored(event), chainEvents)] }]);
    const result = await h.service.getEvent(event.id);
    expect(result).toMatchObject({
      chainId, createdAt: '2026-10-18T00:00:00.000Z', verified: false,
    });
    expect(result?.caseId).toBeUndefined();
    expect(result?.evidenceFingerprint).toBeUndefined();
    expect(createCanonicalEvent(result!)).toBe(createCanonicalEvent(event));
    h.done();
  });

  it('returns null for an absent persisted event', async () => {
    const h = harness([{ match: /from "chain_events"/ }]);
    expect(await h.service.getEvent(crypto.randomUUID())).toBeNull();
    h.done();
  });

  it('rejects non-object persisted payloads instead of trusting a type assertion', async () => {
    const [event] = await fixture(1);
    const h = harness([{ match: /from "chain_events"/, rows: [
      row(stored(event, { payload: ['invalid-payload'] }), chainEvents),
    ] }]);
    await expect(h.service.getEvent(event.id)).rejects.toThrow('Invalid chain event payload');
    h.done();
  });

  it('combines chain, context, actor and date predicates into one SQL WHERE', async () => {
    const h = harness([{ match: /from "chain_events"/ }]);
    await h.service.getChainEvents({
      chainId: 'explicit-chain', caseId: 'case-a', resourceId: 'doc-a',
      resourceType: 'document', actorId: 'actor-a', actorType: 'user',
      eventType: 'document.uploaded',
      startDate: '2026-10-01T00:00:00Z', endDate: '2026-10-18T00:00:00Z',
      limit: 10, offset: 5,
    });
    const query = h.calls[0];
    expect(query.text.match(/\bwhere\b/gi)).toHaveLength(1);
    expect(query.text).toContain('"chain_events"."timestamp" >=');
    expect(query.text).toContain('"chain_events"."timestamp" <=');
    expect(query.values).toEqual([
      'explicit-chain', 'case-a', 'doc-a', 'document', 'actor-a', 'user',
      'document.uploaded', '2026-10-01T00:00:00.000Z', '2026-10-18T00:00:00.000Z', 10, 5,
    ]);
    h.done();
  });

  it('preserves a zero page limit and rejects invalid query dates before any DB call', async () => {
    const h = harness([{ match: /limit \$2/ }]);
    await h.service.getChainEvents({ limit: 0 });
    expect(h.calls[0].values).toEqual([chainId, 0]);
    await expect(h.service.getChainEvents({ startDate: 'not-a-date' })).rejects.toThrow('Invalid chain query date');
    expect(h.calls).toHaveLength(1);
    h.done();
  });

  it('uses the requested chain for ordered latest/genesis readers', async () => {
    const [genesis, latest] = await fixture();
    const h = harness([
      { match: /order by .*"sequence_number" desc/, rows: [row(stored(latest), chainEvents)] },
      { match: /"previous_hash" is null.*order by .*"sequence_number" asc/, rows: [row(stored(genesis), chainEvents)] },
    ]);
    expect((await h.service.getLatestEvent('other-chain'))?.id).toBe(latest.id);
    expect((await h.service.getGenesisEvent('other-chain'))?.id).toBe(genesis.id);
    expect(h.calls.every((call) => call.values[0] === 'other-chain')).toBe(true);
    h.done();
  });

  it('signs an append from committed state under a transaction-scoped per-chain lock', async () => {
    const [previous] = await fixture(1);
    let inserted: Record<string, unknown> = {};
    const h = harness([
      { match: /^begin/ },
      { match: /pg_advisory_xact_lock\(hashtextextended\(\$1, 0\)\)/ },
      { match: /from "chain_events".*desc/, rows: [row(stored(previous), chainEvents)] },
      { match: /insert into "chain_events"/, rows: (call) => {
        inserted = insertedValues(call, chainEvents);
        return [row({ ...stored(previous), ...inserted }, chainEvents)];
      } },
      { match: /from "chain_metadata"/, rows: [row(metadata(previous), chainMetadata)] },
      { match: /update "chain_metadata"/ },
      { match: /^commit/ },
    ]);
    const event = await h.service.createEvent(params);
    expect(h.calls[1].values).toEqual([chainId]);
    expect(inserted.previousHash).toBe(previous.hash);
    expect(inserted.sequenceNumber).toBe(2);
    expect(inserted.chainId).toBe(chainId);
    expect(event.createdAt).toBe('2026-10-18T00:00:00.000Z');
    const verifier = new ChainOfCommand({ signingSecret: secret, chainId, initialEvents: [previous, event] });
    expect((await verifier.verifyChain()).valid).toBe(true);
    h.done();
  });

  it('rolls back a rejected insert without updating metadata or advancing signer state', async () => {
    const [previous] = await fixture(1);
    const h = harness([
      { match: /^begin/ }, { match: /pg_advisory_xact_lock/ },
      { match: /from "chain_events"/, rows: [row(stored(previous), chainEvents)] },
      { match: /insert into "chain_events"/, error: 'insert rejected' },
      { match: /^rollback/ },
      { match: /^begin/ }, { match: /pg_advisory_xact_lock/ },
      { match: /from "chain_events"/, rows: [row(stored(previous), chainEvents)] },
      { match: /insert into "chain_events"/, rows: (call) =>
        [row({ ...stored(previous), ...insertedValues(call, chainEvents) }, chainEvents)] },
      { match: /from "chain_metadata"/, rows: [row(metadata(previous), chainMetadata)] },
      { match: /update "chain_metadata"/ },
      { match: /^commit/ },
    ]);
    await expect(h.service.createEvent(params)).rejects.toMatchObject({
      cause: { message: 'insert rejected' },
    });
    expect(h.calls.some((call) => call.text.includes('chain_metadata'))).toBe(false);
    const retry = await h.service.createEvent(params);
    expect(retry.sequenceNumber).toBe(2);
    expect(retry.previousHash).toBe(previous.hash);
    h.done();
  });

  it('creates genesis and its descriptive metadata in the same transaction', async () => {
    const [fallback] = await fixture(1);
    let insertedMetadata: Record<string, unknown> = {};
    const h = harness([
      { match: /^begin/ }, { match: /pg_advisory_xact_lock/ },
      { match: /from "chain_events"/ },
      { match: /insert into "chain_events"/, rows: (call) =>
        [row({ ...stored(fallback), ...insertedValues(call, chainEvents) }, chainEvents)] },
      { match: /from "chain_metadata"/ },
      { match: /insert into "chain_metadata"/, rows: (call) => {
        insertedMetadata = insertedValues(call, chainMetadata);
        return [];
      } },
      { match: /^commit/ },
    ]);
    const event = await h.service.createGenesisEvent({
      ...params, chainType: 'case', chainName: 'Case chain', chainDescription: 'Regression fixture',
    });
    expect(event.sequenceNumber).toBe(1);
    expect(event.previousHash).toBeNull();
    expect(insertedMetadata).toMatchObject({
      chainType: 'case', name: 'Case chain', description: 'Regression fixture',
      genesisEventId: event.id, latestEventId: event.id, totalEvents: 1,
      verifiedEvents: 0, verificationStatus: 'unverified',
    });
    h.done();
  });

  it('rejects a second genesis instead of resetting a persisted chain', async () => {
    const [event] = await fixture(1);
    const h = harness([
      { match: /^begin/ }, { match: /pg_advisory_xact_lock/ },
      { match: /from "chain_events"/, rows: [row(stored(event), chainEvents)] },
      { match: /^rollback/ },
    ]);
    await expect(h.service.createGenesisEvent(params)).rejects.toThrow('already has a genesis');
    h.done();
  });

  it('rolls back the event when its metadata insert fails', async () => {
    const [fallback] = await fixture(1);
    const h = harness([
      { match: /^begin/ }, { match: /pg_advisory_xact_lock/ },
      { match: /from "chain_events"/ },
      { match: /insert into "chain_events"/, rows: (call) =>
        [row({ ...stored(fallback), ...insertedValues(call, chainEvents) }, chainEvents)] },
      { match: /from "chain_metadata"/ },
      { match: /insert into "chain_metadata"/, error: 'metadata rejected' },
      { match: /^rollback/ },
    ]);
    await expect(h.service.createEvent(params)).rejects.toMatchObject({
      cause: { message: 'metadata rejected' },
    });
    h.done();
  });

  it('verifies a restarted service from persisted rows with normalized nullable context', async () => {
    const events = await fixture();
    const h = harness([{ match: /from "chain_events"/, rows: events.map((event) => row(stored(event), chainEvents)) }]);
    expect(await h.service.verifyChain({ logResult: false })).toMatchObject({
      valid: true, chainId, totalEvents: 2, verifiedEvents: 2,
    });
    h.done();
  });

  it('does not truncate verification at the browsing page size', async () => {
    const events = await fixture(1001);
    const h = harness([{ match: /from "chain_events"/, rows: events.map((event) => row(stored(event), chainEvents)) }]);
    const result = await h.service.verifyChain({ limit: 1, offset: 900, logResult: false });
    expect(result.valid).toBe(true);
    expect(result.totalEvents).toBe(1001);
    expect(h.calls[0].text).not.toMatch(/\blimit\b|\boffset\b/i);
    h.done();
  });

  it.each(['payload', 'signature', 'missing-signature', 'previous-hash', 'sequence-gap', 'duplicate-sequence'] as const)(
    'detects persisted %s corruption rather than trusting a row flag',
    async (kind) => {
      const events = await fixture();
      const records = events.map((event) => stored(event));
      if (kind === 'payload') records[1].payload = { tampered: true };
      if (kind === 'signature') records[1].signature = '0'.repeat(64);
      if (kind === 'missing-signature') records[1].signature = null;
      if (kind === 'previous-hash') records[1].previousHash = '0'.repeat(64);
      if (kind === 'sequence-gap') records[1].sequenceNumber = 3;
      if (kind === 'duplicate-sequence') records[1].sequenceNumber = 1;
      const h = harness([{ match: /from "chain_events"/, rows: records.map((event) => row(event, chainEvents)) }]);
      const result = await h.service.verifyChain({ logResult: false });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      if (kind.includes('signature')) expect(result.hasInvalidSignatures).toBe(true);
      h.done();
    },
  );

  it('rejects a missing signature when verifying a single persisted event', async () => {
    const [event] = await fixture(1);
    const h = harness([{ match: /from "chain_events"/, rows: [row(stored(event, { signature: null }), chainEvents)] }]);
    const result = await h.service.verifyEvent(event.id);
    expect(result?.verified).toBe(false);
    expect(result?.verificationErrors?.map((error) => error.type)).toContain('invalid_signature');
    h.done();
  });

  it('logs verification and only certifies metadata that still refers to its snapshot head', async () => {
    const [event] = await fixture(1);
    const h = harness([
      { match: /from "chain_events"/, rows: [row(stored(event), chainEvents)] },
      { match: /^begin/ }, { match: /insert into "chain_verification_log"/ },
      { match: /update "chain_metadata".*where .*"chain_id".*and .*"latest_event_id"/ },
      { match: /^commit/ },
    ]);
    expect((await h.service.verifyChain({ requestedBy: 'auditor' })).valid).toBe(true);
    expect(h.calls[3].values).toContain(event.id);
    h.done();
  });

  it('does not certify whole-chain metadata from a resource-filtered verification', async () => {
    const [event] = await fixture(1);
    const h = harness([
      { match: /from "chain_events"/, rows: [row(stored(event), chainEvents)] },
      { match: /^begin/ }, { match: /insert into "chain_verification_log"/ },
      { match: /^commit/ },
    ]);
    await h.service.verifyChain({ resourceId: 'doc-1' });
    expect(h.calls.some((call) => call.text.startsWith('update'))).toBe(false);
    h.done();
  });

  it('reports an empty persisted chain as unverified, with its requested chain ID', async () => {
    const h = harness([{ match: /from "chain_events"/ }]);
    expect(await h.service.verifyChain({ chainId: 'empty-chain' })).toMatchObject({
      valid: false, chainId: 'empty-chain', totalEvents: 0,
    });
    h.done();
  });

  it('preserves the tracking presentation while computing trust from persisted events', async () => {
    const [event] = await fixture(1);
    const h = harness([
      { match: /from "chain_events"/, rows: [row(stored(event), chainEvents)] },
      { match: /from "chain_events"/, rows: [row(stored(event), chainEvents)] },
    ]);
    const tracking = await h.service.getTrackingInfo('document', 'doc-1');
    expect(tracking).toMatchObject({
      chainId, resourceType: 'document', resourceId: 'doc-1', status: 'verified',
      timeline: [{ description: 'Document uploaded by user-1', verified: true }],
    });
    h.done();
  });

  it('finds case chains through event ownership rather than an absent metadata column', async () => {
    const h = harness([{ match: /from "chain_metadata".*in \(select .*from "chain_events".*"case_id"/ }]);
    expect(await h.service.getCaseChains('case-a')).toEqual([]);
    expect(h.calls[0].values).toEqual(['case-a']);
    h.done();
  });

  it('preserves factory case/resource chain namespaces', async () => {
    const h = harness([{ match: /from "chain_events"/ }, { match: /from "chain_events"/ }]);
    await createCaseChain('case-a', secret).getLatestEvent();
    await createResourceChain('document', 'doc-a', secret).getLatestEvent();
    expect(h.calls[0].values[0]).toBe('case-case-a');
    expect(h.calls[1].values[0]).toBe('document-doc-a');
    h.done();
  });
});
