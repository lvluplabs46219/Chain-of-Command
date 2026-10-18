// Gabriel — Messenger Specialists.
// Event-driven delivery: records events to the state log and fans out webhooks.
import { Envelope, Event, envelope, log } from "../protocol/types.js";
import { StateStore } from "../state/store.js";

export class Gabriel {
  constructor(private store: StateStore) {}

  /** Record + fan out an event. */
  async emit(event: Event): Promise<{ topic: string; delivered: number }> {
    this.store.appendEvent(event.topic, event.data);
    const hooks = (process.env.GABRIEL_WEBHOOKS ?? "").split(",").map((h) => h.trim()).filter(Boolean);
    const settled = await Promise.allSettled(
      hooks.map(async (hook) => {
        try {
          await fetch(hook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(envelope("event", "gabriel", "external", event)),
          });
        } catch (e) {
          log("warn", "gabriel", "webhook_failed", { hook, error: String(e) });
        }
      })
    );
    return { topic: event.topic, delivered: settled.filter((s) => s.status === "fulfilled").length };
  }

  /** Deliver an execution-context payload to a named target. */
  async deliver(target: string, payload: unknown): Promise<void> {
    await this.emit({ topic: `deliver.${target}`, data: { payload } });
  }

  handle(env: Envelope): Envelope | null {
    if (env.type === "event") {
      void this.emit(env.payload as Event);
      return envelope("event", "gabriel", env.from, { ack: true }, env.correlationId);
    }
    return null;
  }
}
