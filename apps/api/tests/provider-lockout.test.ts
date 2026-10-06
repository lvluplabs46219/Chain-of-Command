/**
 * Production demo-provider lockout (no server required).
 * Run: npx tsx apps/api/tests/provider-lockout.test.ts
 */
import { resolveModelProvider } from "../src/routes/ai";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error("FAIL:", message);
    process.exit(1);
  }
}

const originalEnv = process.env.NODE_ENV;
const originalDefault = process.env.LLM_DEFAULT_PROVIDER;

try {
  process.env.NODE_ENV = "production";
  delete process.env.LLM_DEFAULT_PROVIDER;

  assert(resolveModelProvider(undefined) === "ollama", "prod default must be ollama when env unset");

  let threw = false;
  try {
    resolveModelProvider("demo");
  } catch {
    threw = true;
  }
  assert(threw, "prod must reject explicit demo provider");

  process.env.LLM_DEFAULT_PROVIDER = "demo";
  threw = false;
  try {
    resolveModelProvider(undefined);
  } catch {
    threw = true;
  }
  assert(threw, "prod must reject LLM_DEFAULT_PROVIDER=demo");

  process.env.NODE_ENV = "development";
  delete process.env.LLM_DEFAULT_PROVIDER;
  assert(resolveModelProvider(undefined) === "demo", "dev may default to demo");
  assert(resolveModelProvider("gemini") === "gemini", "explicit non-demo always allowed");

  console.log("provider-lockout: all checks passed");
} finally {
  process.env.NODE_ENV = originalEnv;
  if (originalDefault === undefined) delete process.env.LLM_DEFAULT_PROVIDER;
  else process.env.LLM_DEFAULT_PROVIDER = originalDefault;
}
