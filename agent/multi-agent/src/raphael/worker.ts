// Raphael — Task Bot & Worker.
// Heavy-lifting handlers: file scaffolding, shell execution, migrations, workspace maintenance.
import { TaskNode, log } from "../protocol/types.js";
import { spawn } from "node:child_process";
import { promises as fsp } from "node:fs";
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

/** Run a shell command with a timeout; captures stdout+stderr and exit code. */
async function shell(cmd: string, cwd: string, timeoutMs: number): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const child = spawn("bash", ["-lc", cmd], { cwd });
    let out = "", err = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`command timed out after ${timeoutMs}ms: ${cmd}`));
    }, timeoutMs);
    child.stdout?.on("data", (d) => (out += d));
    child.stderr?.on("data", (d) => (err += d));
    child.on("error", (e) => { clearTimeout(timer); reject(e); });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve({ ok: true, code, stdout: out, stderr: err });
      else reject(new Error(`exit code ${code}: ${(err || out).slice(0, 4000)}`));
    });
  });
}

export class Raphael {
  private handlers = new Map<string, TaskHandler>();

  constructor() {
    this.registerBuiltins();
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
      const cwd = within(p?.cwd ?? ".");
      log("info", "raphael", "shell_exec", { cmd: p.cmd, cwd });
      return shell(p.cmd, cwd, Number(p?.timeoutMs ?? DEFAULT_TIMEOUT_MS));
    });

    this.register("db.migrate", async (p) => {
      const cmd = p?.cmd ?? "npx drizzle-kit migrate";
      log("info", "raphael", "db_migrate", { cmd });
      return shell(cmd, within(p?.cwd ?? "."), Number(p?.timeoutMs ?? DEFAULT_TIMEOUT_MS));
    });

    this.register("workspace.maintain", async (p) => {
      const cmd = p?.cmd ?? "npm run lint -- --fix";
      log("info", "raphael", "workspace_maintain", { cmd });
      return shell(cmd, within(p?.cwd ?? "."), Number(p?.timeoutMs ?? DEFAULT_TIMEOUT_MS));
    });

    this.register("notify", async (p) => ({ forwarded: "gabriel", payload: p }));
    this.register("deliver_payload", async (p) => ({ forwarded: "gabriel", payload: p }));
  }
}
