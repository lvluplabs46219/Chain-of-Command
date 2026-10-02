// Raphael — Task Bot & Worker.
// Heavy-lifting handlers: file scaffolding, shell execution, migrations, workspace maintenance.
import { TaskNode, log } from "../protocol/types.js";
import { spawn } from "node:child_process";
import { promises as fsp, existsSync } from "node:fs";
import * as path from "node:path";

export type TaskHandler = (payload: any) => Promise<unknown>;

const DEFAULT_TIMEOUT_MS = Number(process.env.RAPHAEL_TIMEOUT_MS ?? 120_000);
/** Restrict all file/shell operations to this directory (default: cwd). */
const WORKSPACE = process.env.RAPHAEL_WORKSPACE ?? process.cwd();

/** Resolve a cwd relative to the workspace and refuse escapes. */
function within(rel: string): string {
  const target = path.resolve(WORKSPACE, rel ?? ".");
  const root = path.resolve(WORKSPACE);
  if (target !== root && !target.startsWith(root + path.sep)) {
    throw new Error(`path escapes workspace: ${rel}`);
  }
  return target;
}

/** within() + existence check. A missing cwd makes spawn fail with a misleading "spawn <shell> ENOENT". */
async function safeCwd(rel?: string): Promise<string> {
  const dir = within(rel ?? ".");
  let st;
  try { st = await fsp.stat(dir); }
  catch { throw new Error(`cwd does not exist: ${dir} (workspace root: ${path.resolve(WORKSPACE)})`); }
  if (!st.isDirectory()) throw new Error(`cwd is not a directory: ${dir}`);
  return dir;
}

const MAX_CAPTURE = 1_000_000; // bytes of stdout/stderr kept per command

/** Pick a real shell binary that exists on this machine. */
function resolveShell(): { bin: string; args: string[] } {
  const candidates = [
    process.env.SHELL,
    process.env.RAPHAEL_SHELL,
    "/bin/bash",
    "/usr/bin/bash",
    "/bin/sh",
    "/usr/bin/sh",
    "bash",
    "sh",
  ].filter((s): s is string => Boolean(s));

  for (const bin of candidates) {
    // Absolute paths: only accept if the file exists.
    // Bare names ("bash", "sh"): let PATH resolve them.
    if (bin.includes("/") && !existsSync(bin)) continue;
    // Prefer bash-style -lc when the binary looks like bash.
    const isBash = /bash/i.test(bin);
    return { bin, args: isBash ? ["-lc"] : ["-c"] };
  }
  throw new Error(
    "no shell found (tried $SHELL, /bin/bash, /usr/bin/bash, /bin/sh). " +
      "Set RAPHAEL_SHELL to an absolute path (e.g. /bin/bash).",
  );
}

const SHELL = resolveShell();

/** Run a shell command with a timeout; captures stdout+stderr and exit code. */
async function shell(cmd: string, cwd: string, timeoutMs: number): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const child = spawn(SHELL.bin, [...SHELL.args, cmd], {
      cwd,
      env: process.env,
      // Keep stdio piped so we can capture output.
      stdio: ["ignore", "pipe", "pipe"],
    });
    let out = "", err = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`command timed out after ${timeoutMs}ms: ${cmd}`));
    }, timeoutMs);
    child.stdout?.on("data", (d) => { if (out.length < MAX_CAPTURE) out += d; });
    child.stderr?.on("data", (d) => { if (err.length < MAX_CAPTURE) err += d; });
    child.on("error", (e) => {
      clearTimeout(timer);
      const code = (e as NodeJS.ErrnoException).code;
      reject(new Error(code === "ENOENT"
        ? `spawn failed (ENOENT): shell=${SHELL.bin} cwd=${cwd} — check the shell binary and that cwd exists`
        : String(e)));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve({ ok: true, code, stdout: out, stderr: err, shell: SHELL.bin });
      else reject(new Error(`exit code ${code}: ${(err || out).slice(0, 4000)}`));
    });
  });
}

export class Raphael {
  private handlers = new Map<string, TaskHandler>();

  constructor() {
    this.registerBuiltins();
    log("info", "raphael", "shell_resolved", { bin: SHELL.bin, args: SHELL.args });
  }

  register(kind: string, handler: TaskHandler): void {
    this.handlers.set(kind, handler);
  }

  async run(task: TaskNode): Promise<unknown> {
    const handler = this.handlers.get(task.kind);
    if (!handler) throw new Error(`no handler for ${task.kind}`);
    return handler(task.payload);
  }

  private registerBuiltins(): void {
    this.register("file.scaffold", async (p) => {
      if (!p?.path) throw new Error("file.scaffold requires payload.path");
      const target = within(p.path);
      await fsp.mkdir(path.dirname(target), { recursive: true });
      await fsp.writeFile(target, p.content ?? "");
      log("info", "raphael", "scaffolded", { path: target });
      return { written: target };
    });

    this.register("shell.exec", async (p) => {
      if (!p?.cmd) throw new Error("shell.exec requires payload.cmd");
      const cwd = await safeCwd(p?.cwd);
      log("info", "raphael", "shell_exec", { cmd: p.cmd, cwd, shell: SHELL.bin });
      return shell(p.cmd, cwd, Number(p?.timeoutMs ?? DEFAULT_TIMEOUT_MS));
    });

    this.register("db.migrate", async (p) => {
      const cmd = p?.cmd ?? "npx drizzle-kit migrate";
      log("info", "raphael", "db_migrate", { cmd });
      return shell(cmd, await safeCwd(p?.cwd), Number(p?.timeoutMs ?? DEFAULT_TIMEOUT_MS));
    });

    this.register("workspace.maintain", async (p) => {
      const cmd = p?.cmd ?? "npm run lint -- --fix";
      log("info", "raphael", "workspace_maintain", { cmd });
      return shell(cmd, await safeCwd(p?.cwd), Number(p?.timeoutMs ?? DEFAULT_TIMEOUT_MS));
    });

    this.register("notify", async (p) => ({ forwarded: "gabriel", payload: p }));
    this.register("deliver_payload", async (p) => ({ forwarded: "gabriel", payload: p }));
  }
}
