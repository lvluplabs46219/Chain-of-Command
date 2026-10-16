import { describe, it, expect } from "vitest";
import { computeEventHash, GENESIS_HASH, verifyChain } from "../hash-chain";
import type { AuditEvent } from "../types";

function makeEvent(
  prevHash: string,
  overrides: Partial<AuditEvent> = {}
): AuditEvent {
  const body: Omit<AuditEvent, "hash"> = {
    id: overrides.id || crypto.randomUUID(),
    tenantId: "tenant-a",
    at: new Date().toISOString(),
    actorType: "user",
    actorId: "user-1",
    action: "case.create",
    result: "success",
    prevHash,
    ...overrides,
    prevHash,
  };
  const hash = computeEventHash(body, prevHash);
  return { ...body, hash };
}

describe("audit hash chain", () => {
  it("empty chain is valid", () => {
    expect(verifyChain([])).toEqual({ valid: true });
  });

  it("single genesis-linked event verifies", () => {
    const e = makeEvent(GENESIS_HASH);
    expect(verifyChain([e]).valid).toBe(true);
  });

  it("detects tampered payload", () => {
    const e = makeEvent(GENESIS_HASH);
    const tampered = { ...e, action: "admin.config" };
    const result = verifyChain([tampered]);
    expect(result.valid).toBe(false);
    expect(result.brokenAt).toBe(0);
  });

  it("detects broken prevHash link", () => {
    const e1 = makeEvent(GENESIS_HASH);
    const e2 = makeEvent("deadbeef");
    const result = verifyChain([e1, e2]);
    expect(result.valid).toBe(false);
    expect(result.brokenAt).toBe(1);
  });

  it("multi-event chain verifies end-to-end", () => {
    const e1 = makeEvent(GENESIS_HASH);
    const e2 = makeEvent(e1.hash);
    const e3 = makeEvent(e2.hash);
    expect(verifyChain([e1, e2, e3]).valid).toBe(true);
  });
});
