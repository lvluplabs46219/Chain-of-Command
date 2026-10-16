import { randomUUID } from 'node:crypto';
import { computeEventHash, GENESIS_HASH } from './hash-chain';
import type { AuditEvent, AuditWriteInput } from './types';

/**
 * In-memory / injectable store interface so tests don't need a DB.
 */
export interface AuditStore {
  getLastHash(tenantId: string): Promise<string>;
  append(event: AuditEvent): Promise<void>;
}

export class AuditWriter {
  constructor(private store: AuditStore) {}

  async write(input: AuditWriteInput): Promise<AuditEvent> {
    const prevHash = (await this.store.getLastHash(input.tenantId)) || GENESIS_HASH;
    const body: Omit<AuditEvent, 'hash'> = {
      id: randomUUID(),
      at: new Date().toISOString(),
      prevHash,
      ...input,
    };
    const hash = computeEventHash(body, prevHash);
    const event: AuditEvent = { ...body, hash };
    await this.store.append(event);
    return event;
  }
}
