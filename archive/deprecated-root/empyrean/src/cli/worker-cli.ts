// Raphael worker CLI: register against the Michael daemon over UDS.
import { call, sockPath } from "../transport/uds.js";
import { envelope } from "../protocol/types.js";

async function main() {
  const workerName = process.argv[2] ?? "raphael-1";
  const res = await call(envelope("query", "raphael", "michael", { register: workerName }));
  console.log(JSON.stringify(res));
}

main().catch((e) => {
  console.error(JSON.stringify({ error: String(e), sock: sockPath() }));
  process.exit(1);
});
