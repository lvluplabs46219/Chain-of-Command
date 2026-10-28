/**
 * API-side audit logger backed by in-memory chain (swap for DB AuditStore in production).
 * COC-294 / §16 — every significant write should call logAudit().
 */
import {
  AuditWriter,
  type AuditStore,
  type AuditWriteInput,
  type AuditEvent,
  GENESIS_HASH,
} from "../../../../packages/audit/src/index";

class MemoryAuditStore implements AuditStore {
  private byTenant = new Map<string, AuditEvent[]>();

  async getLastHash(tenantId: string): Promise<string> {
    const list = this.byTenant.get(tenantId) || [];
    if (list.length === 0) return GENESIS_HASH;
    return list[list.length - 1].hash;
  }

  async append(event: AuditEvent): Promise<void> {
    const list = this.byTenant.get(event.tenantId) || [];
    list.push(event);
    this.byTenant.set(event.tenantId, list);
  }

  list(tenantId: string): AuditEvent[] {
    return [...(this.byTenant.get(tenantId) || [])];
  }
}

const store = new MemoryAuditStore();
const writer = new AuditWriter(store);

export async function logAudit(input: AuditWriteInput): Promise<AuditEvent> {
  try {
    return await writer.write(input);
  } catch (err) {
    console.error("[audit] write failed", err);
    throw err;
  }
}

export function listAuditForTenant(tenantId: string): AuditEvent[] {
  return store.list(tenantId);
}
