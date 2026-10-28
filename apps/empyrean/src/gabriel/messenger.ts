// Gabriel — Messenger Specialists.
// Event-driven delivery: records events to the state log and fans out webhooks.
import { StateStore } from "../state/store.js";
import { Envelope, Event, envelope, log } from "../protocol/types.js";

export interface EmitMessageOptions {
  topic: string;
  data: unknown;
}

export class Gabriel {
  constructor(private store: StateStore) {}

  /** Record an event locally, then fan it out to configured webhooks. */
  async emit(options: EmitMessageOptions): Promise<{ delivered: boolean; timestamp: string }> {
    const timestamp = new Date().toISOString();
    const webhookSetting = process.env.GABRIEL_WEBHOOKS ?? process.env.GABRIEL_WEBHOOK_URL ?? "";
    const urls = webhookSetting.split(",").map((url) => url.trim()).filter(Boolean);
    let deliveredCount = 0;

    log("info", "gabriel", "emit", { topic: options.topic, timestamp, webhookCount: urls.length });

    const event: Event = {
      topic: options.topic,
      data: options.data && typeof options.data === "object" && !Array.isArray(options.data)
        ? options.data as Record<string, unknown>
        : { value: options.data },
    };

    const results = await Promise.allSettled(
      urls.map(async (url) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(envelope("event", "gabriel", "external", event)),
            signal: controller.signal,
          });
          if (!response.ok) {
            log("warn", "gabriel", "webhook_failed", { url, status: response.status });
            return false;
          }
          return true;
        } catch (error) {
          log("warn", "gabriel", "webhook_error", { url, error: String(error) });
          return false;
        } finally {
          clearTimeout(timeout);
        }
      })
    );
    deliveredCount = results.filter((result) => result.status === "fulfilled" && result.value).length;

    this.store.appendEvent(options.topic, event.data, "gabriel", undefined, deliveredCount);
    return { delivered: deliveredCount > 0, timestamp };
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
