// Daemon entrypoint: boots Michael (orchestrator) and listens on the UDS socket.
import { Michael } from "./michael/orchestrator.js";
import { serve } from "./transport/uds.js";
import { Envelope, log } from "./protocol/types.js";

async function main() {
  const michael = new Michael();
  const sock = process.env.MICHAEL_SOCK ?? "/tmp/coc-michael.sock";
  const server = serve(sock, (env: Envelope) => michael.onEnvelope(env));
  server.on("listening", () => log("info", "michael", "daemon_ready", { sock }));

  const shutdown = () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 2000).unref();
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((e) => {
  console.error(JSON.stringify({ level: "error", event: "fatal", error: String(e) }));
  process.exit(1);
});
