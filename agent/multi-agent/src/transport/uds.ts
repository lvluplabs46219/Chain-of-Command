// Newline-delimited JSON over a Unix Domain Socket.
// Drop-in swappable for loopback gRPC: same Envelope wire contract.
import net from "node:net";
import fs from "node:fs";
import path from "node:path";
import { Envelope, envelope } from "../protocol/types.js";

export const sockPath = (): string => process.env.MICHAEL_SOCK ?? "/tmp/coc-michael.sock";

/** Frame a message: JSON + newline. */
const frame = (env: Envelope): Buffer => Buffer.from(JSON.stringify(env) + "\n");

/** Michael-side listener. Every request gets exactly one reply (result, error, or ack). */
export function serve(sock: string, onMessage: (env: Envelope) => Promise<Envelope | null>): net.Server {
  if (fs.existsSync(sock)) fs.rmSync(sock);
  const parent = path.dirname(sock);
  fs.mkdirSync(parent, { recursive: true });
  const server = net.createServer((conn) => {
    let buf = "";
    conn.on("data", async (chunk) => {
      buf += chunk.toString("utf8");
      let idx: number;
      while ((idx = buf.indexOf("\n")) !== -1) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line) continue;
        let env: Envelope;
        try { env = JSON.parse(line); } catch { continue; }
        // Never swallow handler failures: a silent null made clients wait for the full timeout.
        const reply: Envelope = await onMessage(env)
          .then((r) => r ?? envelope("event", "michael", env.from, { ack: true }, env.correlationId))
          .catch((e) =>
            envelope("task_result", "michael", env.from, { error: String(e) }, env.correlationId),
          );
        if (!conn.destroyed) conn.write(frame(reply));
      }
    });
    conn.on("error", () => { /* connection reset — ignore */ });
  });
  server.listen(sock);
  return server;
}

/** Agent-side client: send one envelope, await one reply. */
export function call(env: Envelope, timeoutMs = 60_000): Promise<Envelope | null> {
  return new Promise((resolve, reject) => {
    const conn = net.connect(sockPath());
    let buf = "";
    let settled = false;
    const done = (fn: () => void) => { if (!settled) { settled = true; clearTimeout(timer); fn(); } };
    const timer = setTimeout(
      () => done(() => { conn.destroy(); reject(new Error(`UDS timeout after ${timeoutMs}ms (daemon reachable but no reply)`)); }),
      timeoutMs,
    );
    conn.on("connect", () => conn.write(frame(env)));
    conn.on("data", (chunk) => {
      buf += chunk.toString("utf8");
      const idx = buf.indexOf("\n");
      if (idx === -1) return;
      done(() => {
        try { resolve(JSON.parse(buf.slice(0, idx))); } catch (e) { reject(e); }
        conn.end();
      });
    });
    conn.on("close", () => done(() => reject(new Error("connection closed before a reply arrived"))));
    conn.on("error", (e: NodeJS.ErrnoException) =>
      done(() => {
        if (e.code === "ENOENT" || e.code === "ECONNREFUSED") {
          reject(new Error(`Michael daemon not reachable at ${sockPath()} (${e.code}) — start it with: npm start`));
        } else reject(e);
      }),
    );
  });
}
