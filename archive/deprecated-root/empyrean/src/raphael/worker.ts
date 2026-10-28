// Raphael — Task Bot & Worker.
// Heavy-lifting handlers: file scaffolding, migrations, workspace maintenance.
import { TaskNode, log } from "../protocol/types.js";

export type TaskHandler = (payload: any) => Promise<unknown>;

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
      const { promises: fsp } = await import("node:fs");
      const path = await import("node:path");
      if (!p?.path) throw new Error("file.scaffold requires payload.path");
      await fsp.mkdir(path.dirname(p.path), { recursive: true });
      await fsp.writeFile(p.path, p.content ?? "");
      log("info", "raphael", "scaffolded", { path: p.path });
      return { written: p.path };
    });

    this.register("db.migrate", async (p) => {
      const { execSync } = await import("node:child_process");
      const cmd = p?.cmd ?? "npx drizzle-kit migrate";
      return execSync(cmd, { encoding: "utf8", cwd: p?.cwd ?? process.cwd() });
    });

    this.register("workspace.maintain", async (p) => {
      const { execSync } = await import("node:child_process");
      const cmd = p?.cmd ?? "npm run lint -- --fix";
      return execSync(cmd, { encoding: "utf8", cwd: p?.cwd ?? process.cwd() });
    });

    this.register("notify", async (p) => ({ forwarded: "gabriel", payload: p }));

    this.register("deliver_payload", async (p) => ({ forwarded: "gabriel", payload: p }));
  }
}
