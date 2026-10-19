/**
 * Check the exact transitive leaves consumed by the audited SDKs, not only the
 * hoisted root packages. Tests stay offline and avoid production credentials.
 */
import { afterEach, describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const root = createRequire(import.meta.url);
const tempPaths: string[] = [];

function consumer(parent: string) {
  return createRequire(root.resolve(parent));
}

function installedPackage(entry: string, name: string): { version: string; path: string } {
  let directory = dirname(entry);
  for (;;) {
    const filename = join(directory, "package.json");
    try {
      const manifest = JSON.parse(readFileSync(filename, "utf8"));
      if (manifest.name === name) return { version: manifest.version, path: filename };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    const parent = dirname(directory);
    if (directory === parent) throw new Error(`Cannot find package ${name} from ${entry}`);
    directory = parent;
  }
}

afterEach(() => {
  for (const dir of tempPaths.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("scoped transitive security patches", () => {
  it("resolves patched major-compatible packages from their actual consumers", () => {
    const expected: Array<[string, string, string]> = [
      ["@firebase/firestore", "@grpc/grpc-js", "1.14.6"],
      ["@workflow/core", "devalue", "5.9.4"],
      ["@workflow/core", "nanoid", "5.1.16"],
      ["next", "postcss", "8.5.31"],
    ];
    for (const [parent, child, version] of expected) {
      const entry = consumer(parent).resolve(child);
      expect(installedPackage(entry, child).version).toBe(version);
    }
    expect(installedPackage(root.resolve("firebase/firestore"), "firebase").version).toBe("12.19.0");
    expect(installedPackage(root.resolve("workflow"), "workflow").version).toBe("5.0.1");
    expect(installedPackage(root.resolve("next"), "next").version).toBe("15.5.28");
  });

  it("round-trips workflow devalue without serializing unrelated Buffer pool bytes", async () => {
    const fromWorkflow = consumer("@workflow/core");
    const { stringify, parse } = await import(pathToFileURL(fromWorkflow.resolve("devalue")).href);
    const pooled = Buffer.from([1, 2, 3, 4]);
    expect(pooled.buffer.byteLength).toBeGreaterThan(pooled.byteLength);
    const encoded = stringify({ view: pooled, label: "workflow-compat" });
    const decoded = parse(encoded);
    expect(decoded.label).toBe("workflow-compat");
    expect(Array.from(decoded.view)).toEqual([1, 2, 3, 4]);
    expect(decoded.view.buffer.byteLength).toBe(4);
    expect(encoded).not.toContain(Buffer.from(pooled.buffer).toString("base64"));
    // The actual Workflow serialization module must still import successfully.
    const serializer = await import(pathToFileURL(fromWorkflow.resolve("@workflow/core/serialization")).href);
    expect(serializer).toBeDefined();
  });

  it("rejects negative secure Nano ID sizes and terminates non-secure generation", () => {
    const fromWorkflow = consumer("@workflow/core");
    const secure = fromWorkflow.resolve("nanoid");
    const nonsecure = fromWorkflow.resolve("nanoid/non-secure");
    // A bounded process prevents an older vulnerable nanoid from hanging the suite.
    const snippet = `
      import { nanoid } from ${JSON.stringify(pathToFileURL(secure).href)};
      import { nanoid as nonsecure } from ${JSON.stringify(pathToFileURL(nonsecure).href)};
      let rejected = false;
      try { nanoid(-1); } catch { rejected = true; }
      if (!rejected || typeof nonsecure(-1) !== "string" || nanoid(16).length !== 16) process.exit(1);
    `;
    const child = spawnSync(process.execPath, ["--input-type=module", "-e", snippet], {
      encoding: "utf8",
      timeout: 2000,
    });
    expect(child.error).toBeUndefined();
    expect(child.status, child.stderr).toBe(0);
  });

  it("prevents an absolute attacker-supplied source map from leaking into CSS output", async () => {
    const fromNext = consumer("next");
    const { default: postcss } = await import(pathToFileURL(fromNext.resolve("postcss")).href);
    const directory = mkdtempSync(join(tmpdir(), "coc-postcss-patch-"));
    tempPaths.push(directory);
    const secret = "private-map-data-only-for-test";
    const mapFile = join(directory, "outside.map");
    writeFileSync(mapFile, JSON.stringify({
      version: 3,
      sources: ["/private/outside-source.ts"],
      sourcesContent: [secret],
      mappings: "",
      names: [],
    }));
    const css = `a { color: red }\n/*# sourceMappingURL=${mapFile} */`;
    // No trusted base path: explicit undefined still exercises the no-from guard.
    const result = await postcss([]).process(css, { from: undefined, map: true });
    const serialized = JSON.stringify(result.map?.toJSON() ?? {});
    expect(serialized).not.toContain(secret);
    expect(serialized).not.toContain("/private/outside-source.ts");
    const normal = await postcss([]).process("a { color: red }", { map: false });
    expect(normal.css).toContain("color: red");
  });

  it("loads Firebase Firestore and exercises its patched gRPC server/client offline", async () => {
    const firebase = root("firebase/firestore");
    expect(typeof firebase.getFirestore).toBe("function");
    const grpc = consumer("@firebase/firestore")("@grpc/grpc-js");
    const encode = (value: unknown) => Buffer.from(JSON.stringify(value));
    const decode = (value: Buffer) => JSON.parse(value.toString("utf8"));
    const method = "/audit.Ping/Check";
    const server = new grpc.Server();
    const definition = {
      Check: {
        path: method, requestStream: false, responseStream: false,
        requestSerialize: encode, requestDeserialize: decode,
        responseSerialize: encode, responseDeserialize: decode,
      },
    };
    server.addService(definition, {
      Check: (_call: unknown, callback: (error: null, result: object) => void) =>
        callback(null, { ok: true }),
    });
    let client: InstanceType<typeof grpc.Client> | undefined;
    try {
      const port = await new Promise<number>((resolve, reject) =>
        server.bindAsync("127.0.0.1:0", grpc.ServerCredentials.createInsecure(),
          (error: Error | null, bound: number) => error ? reject(error) : resolve(bound)));
      client = new grpc.Client(`127.0.0.1:${port}`, grpc.credentials.createInsecure());
      const response = await new Promise<{ ok: boolean }>((resolve, reject) =>
        client!.makeUnaryRequest(method, encode, decode, { ping: true },
          new grpc.Metadata(), { deadline: Date.now() + 2000 },
          (error: Error | null, value: { ok: boolean }) =>
            error ? reject(error) : resolve(value)));
      expect(response).toEqual({ ok: true });
    } finally {
      client?.close();
      server.forceShutdown();
    }
  }, 10000);
});
