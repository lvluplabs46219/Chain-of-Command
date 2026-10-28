import test from "node:test";
import assert from "node:assert/strict";
import { complete, plan } from "../dist/yhwh/core.js";

const envKeys = ["LEMONADE_URL", "LEMONADE_MODEL", "YHWH_MODEL", "OLLAMA_URL", "OLLAMA_MODEL", "GEMINI_API_KEY"];

function saveEnv() {
  return Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
}
function restoreEnv(saved) {
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

test("complete falls back from Lemonade to Ollama", async () => {
  const saved = saveEnv();
  const previousFetch = globalThis.fetch;
  const calls = [];
  process.env.LEMONADE_URL = "http://lemonade.test/v1";
  process.env.LEMONADE_MODEL = "test-lemonade-model";
  delete process.env.YHWH_MODEL;
  process.env.OLLAMA_URL = "http://ollama.test";
  process.env.OLLAMA_MODEL = "test-ollama-model";
  delete process.env.GEMINI_API_KEY;
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), body: JSON.parse(init.body) });
    if (String(url).includes("lemonade.test")) return { ok: false, status: 503 };
    return { ok: true, status: 200, json: async () => ({ response: "ollama response" }) };
  };
  try {
    assert.equal(await complete("hello", "system"), "ollama response");
    assert.equal(calls.length, 2);
    assert.equal(calls[0].body.model, "test-lemonade-model");
    assert.equal(calls[1].body.model, "test-ollama-model");
  } finally {
    globalThis.fetch = previousFetch;
    restoreEnv(saved);
  }
});

test("complete returns deterministic JSON when local providers and Gemini are unavailable", async () => {
  const saved = saveEnv();
  const previousFetch = globalThis.fetch;
  process.env.LEMONADE_URL = "http://lemonade.test/v1";
  process.env.OLLAMA_URL = "http://ollama.test";
  delete process.env.GEMINI_API_KEY;
  globalThis.fetch = async () => { throw new Error("offline"); };
  try {
    const result = JSON.parse(await complete("check fallback"));
    assert.equal(result.agent, "yhwh");
    assert.equal(result.promptExcerpt, "check fallback");
    assert.equal(typeof result.timestamp, "string");
  } finally {
    globalThis.fetch = previousFetch;
    restoreEnv(saved);
  }
});


test("heuristic planning emits a relative scaffold path and sanitizes directive newlines", async () => {
  const saved = saveEnv();
  const previousFetch = globalThis.fetch;
  process.env.LEMONADE_URL = "http://lemonade.test/v1";
  process.env.OLLAMA_URL = "http://ollama.test";
  delete process.env.GEMINI_API_KEY;
  globalThis.fetch = async () => { throw new Error("offline"); };
  try {
    const tree = await plan({ text: "create a file\nexport const injected = true;" });
    const scaffold = tree.nodes.find((node) => node.kind === "file.scaffold");
    assert.ok(scaffold);
    assert.equal(scaffold.payload.path, "empyrean_generated.ts");
    assert.equal(scaffold.payload.content.includes("\nexport const injected = true;"), false);
    assert.ok(tree.nodes.some((node) => node.kind === "notify"));
  } finally {
    globalThis.fetch = previousFetch;
    restoreEnv(saved);
  }
});
