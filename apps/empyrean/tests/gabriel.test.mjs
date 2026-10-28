import test from "node:test";
import assert from "node:assert/strict";
import { Gabriel } from "../dist/gabriel/messenger.js";
import { StateStore } from "../dist/state/store.js";

test("emit records the event even when no webhook is configured", async () => {
  const previousWebhooks = process.env.GABRIEL_WEBHOOKS;
  const previousUrl = process.env.GABRIEL_WEBHOOK_URL;
  delete process.env.GABRIEL_WEBHOOKS;
  delete process.env.GABRIEL_WEBHOOK_URL;
  try {
    const store = new StateStore();
    const result = await new Gabriel(store).emit({ topic: "test.no_webhook", data: { ok: true } });
    assert.equal(result.delivered, false);
    const event = store.getEvents().find((item) => item.topic === "test.no_webhook");
    assert.ok(event);
    assert.deepEqual(event.data, { ok: true });
    assert.equal(event.webhooks, 0);
  } finally {
    if (previousWebhooks === undefined) delete process.env.GABRIEL_WEBHOOKS;
    else process.env.GABRIEL_WEBHOOKS = previousWebhooks;
    if (previousUrl === undefined) delete process.env.GABRIEL_WEBHOOK_URL;
    else process.env.GABRIEL_WEBHOOK_URL = previousUrl;
  }
});

test("emit awaits webhook fanout and counts only successful responses", async () => {
  const previousWebhooks = process.env.GABRIEL_WEBHOOKS;
  const previousUrl = process.env.GABRIEL_WEBHOOK_URL;
  const previousFetch = globalThis.fetch;
  process.env.GABRIEL_WEBHOOKS = "https://ok.example/hook,https://bad.example/hook";
  delete process.env.GABRIEL_WEBHOOK_URL;
  const requests = [];
  globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), init });
    const ok = String(url).includes("ok.example");
    return { ok, status: ok ? 200 : 503 };
  };
  try {
    const store = new StateStore();
    const result = await new Gabriel(store).emit({ topic: "test.webhook_fanout", data: { value: 7 } });
    assert.equal(result.delivered, true);
    assert.equal(requests.length, 2);
    assert.ok(requests.every((request) => request.init.method === "POST"));
    assert.ok(requests.every((request) => JSON.parse(request.init.body).payload.topic === "test.webhook_fanout"));
    const event = store.getEvents().find((item) => item.topic === "test.webhook_fanout");
    assert.ok(event);
    assert.equal(event.webhooks, 1);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousWebhooks === undefined) delete process.env.GABRIEL_WEBHOOKS;
    else process.env.GABRIEL_WEBHOOKS = previousWebhooks;
    if (previousUrl === undefined) delete process.env.GABRIEL_WEBHOOK_URL;
    else process.env.GABRIEL_WEBHOOK_URL = previousUrl;
  }
});
