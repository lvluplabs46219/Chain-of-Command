// Send CLI: dispatch a directive through YHWH -> Michael over UDS.
import { call } from "../transport/uds.js";
import { Directive, envelope } from "../protocol/types.js";

async function main() {
  const text = process.argv.slice(2).join(" ");
  if (!text) {
    console.error('usage: npm run send -- "<directive>"');
    process.exit(1);
  }
  const directive: Directive = { text };
  const res = await call(envelope("directive", "yhwh", "michael", directive), 120_000);
  console.log(JSON.stringify(res, null, 2));
}

main().catch((e) => {
  console.error(String(e));
  process.exit(1);
});
