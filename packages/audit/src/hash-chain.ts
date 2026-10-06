import { createHash } from 'node:crypto';
import type { AuditEvent } from './types';

/**
 * Hash-chain integrity for append-only audit log.
 * Tampering with any prior event breaks the chain from that point forward.
 */
export function computeEventHash(
  body: Omit<AuditEvent, 'hash'>,
  prevHash: string
): string {
  const payload = JSON.stringify({ ...body, prevHash });
  return createHash('sha256').update(payload).digest('hex');
}

export const GENESIS_HASH =
  '0000000000000000000000000000000000000000000000000000000000000000';

export function verifyChain(events: AuditEvent[]): {
  valid: boolean;
  brokenAt?: number;
  reason?: string;
} {
  if (events.length === 0) return { valid: true };

  let expectedPrev = GENESIS_HASH;
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (e.prevHash !== expectedPrev) {
      return {
        valid: false,
        brokenAt: i,
        reason: `prevHash mismatch at index ${i}`,
      };
    }
    const { hash: _h, ...body } = e;
    const recomputed = computeEventHash(body, e.prevHash);
    if (recomputed !== e.hash) {
      return {
        valid: false,
        brokenAt: i,
        reason: `content hash mismatch at index ${i}`,
      };
    }
    expectedPrev = e.hash;
  }
  return { valid: true };
}
