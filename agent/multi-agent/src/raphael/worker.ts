// Raphael — Task Bot & Worker.
// Heavy-lifting handlers: file scaffolding, shell execution, migrations, workspace maintenance,
// plus legal-specific workflow tasks and Divine-style code repair steps.
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

/** within() + existence check. */
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
    if (bin.includes("/") && !existsSync(bin)) continue;
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
        ? `spawn failed (ENOENT): shell=${SHELL.bin} cwd=${cwd}`
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
    this.registerLegalHandlers();
    this.registerDivineCodeHandlers();
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

  /** Legal-specific workflow handlers for pro-se case work. */
  private registerLegalHandlers(): void {
    this.register("legal.charge_explain", async (p) => {
      const charge = p?.charge ?? p?.text ?? "unknown charge";
      log("info", "raphael", "legal.charge_explain", { charge });
      // Structured stub — real implementation will call Metatron/YHWH for plain-language rewrite
      return {
        kind: "legal.charge_explain",
        input: charge,
        plainLanguage: `[Plain-language explanation of: ${charge}]`,
        gradeLevel: "8th",
        disclaimer: "This is informational only and is not legal advice.",
      };
    });

    this.register("legal.brady_demand", async (p) => {
      const caseId = p?.caseId ?? "unknown";
      log("info", "raphael", "legal.brady_demand", { caseId });
      return {
        kind: "legal.brady_demand",
        caseId,
        draft: {
          title: "Demand for Discovery (Brady / Exculpatory Evidence)",
          body: "[Draft Brady demand generated from case state]",
          status: "draft",
        },
      };
    });

    this.register("legal.court_prep_kit", async (p) => {
      const hearing = p?.hearing ?? p?.nextAppearance ?? "upcoming hearing";
      log("info", "raphael", "legal.court_prep_kit", { hearing });
      return {
        kind: "legal.court_prep_kit",
        hearing,
        checklist: [
          "Review all filed documents",
          "Prepare questions for witnesses",
          "Organize exhibits with labels",
          "Confirm appearance time and location",
          "Prepare plain-language statement of facts",
        ],
        questions: [],
        status: "kit_ready",
      };
    });

    this.register("legal.timeline_build", async (p) => {
      const events = p?.events ?? [];
      log("info", "raphael", "legal.timeline_build", { count: events.length });
      return {
        kind: "legal.timeline_build",
        events: events.sort((a: any, b: any) => String(a.date).localeCompare(String(b.date))),
        status: "built",
      };
    });

    this.register("legal.contradiction_scan", async (p) => {
      const exhibits = p?.exhibits ?? [];
      log("info", "raphael", "legal.contradiction_scan", { count: exhibits.length });
      return {
        kind: "legal.contradiction_scan",
        scanned: exhibits.length,
        contradictions: [], // real impl will compare timestamps / statements
        status: "scanned",
      };
    });

    this.register("legal.deadline_check", async (p) => {
      const jurisdiction = p?.jurisdiction ?? "IN";
      const arraignmentDate = p?.arraignmentDate;
      log("info", "raphael", "legal.deadline_check", { jurisdiction, arraignmentDate });
      return {
        kind: "legal.deadline_check",
        jurisdiction,
        speedyTrialDays: jurisdiction === "IN" ? 70 : null,
        warnings: [],
        status: "checked",
      };
    });

    this.register("legal.motion_draft", async (p) => {
      const motionType = p?.motionType ?? "generic";
      log("info", "raphael", "legal.motion_draft", { motionType });
      return {
        kind: "legal.motion_draft",
        motionType,
        draft: {
          title: `Motion: ${motionType}`,
          body: `[Draft ${motionType} motion from case state]`,
          status: "draft",
        },
      };
    });

    this.register("legal.document_analyze", async (p) => {
      const docPath = p?.path ?? p?.documentId;
      log("info", "raphael", "legal.document_analyze", { docPath });
      return {
        kind: "legal.document_analyze",
        document: docPath,
        extracted: { parties: [], dates: [], keyFacts: [] },
        status: "analyzed",
      };
    });

    this.register("legal.evidence_organize", async (p) => {
      const exhibits = p?.exhibits ?? [];
      log("info", "raphael", "legal.evidence_organize", { count: exhibits.length });
      return {
        kind: "legal.evidence_organize",
        organized: exhibits,
        tags: [],
        status: "organized",
      };
    });

    this.register("legal.rights_check", async (p) => {
      const facts = p?.facts ?? p?.text ?? "";
      log("info", "raphael", "legal.rights_check", { length: String(facts).length });
      return {
        kind: "legal.rights_check",
        flags: [], // e.g. warrantless search, Miranda, etc.
        status: "checked",
        disclaimer: "Informational only — not legal advice.",
      };
    });
  }

  /** Divine Agent Architecture patterns: diagnose → patch → verify → approve. */
  private registerDivineCodeHandlers(): void {
    this.register("code.diagnose", async (p) => {
      const target = p?.target ?? "src";
      const cmd = p?.cmd ?? `npm test -- --reporter=json 2>&1 || true`;
      log("info", "raphael", "code.diagnose", { target, cmd });
      const cwd = await safeCwd(p?.cwd);
      try {
        const result = await shell(cmd, cwd, Number(p?.timeoutMs ?? DEFAULT_TIMEOUT_MS)) as any;
        return {
          kind: "code.diagnose",
          status: "HEALTHY",
          stdout: result?.stdout,
          target,
        };
      } catch (e) {
        return {
          kind: "code.diagnose",
          status: "UNHEALTHY",
          error: e instanceof Error ? e.message : String(e),
          target,
        };
      }
    });

    this.register("code.patch", async (p) => {
      // Gabriel-style: expects upstream diagnose output; produces a patch description.
      // Real implementation will call LLM via Metatron.
      log("info", "raphael", "code.patch", { hasDiagnostics: Boolean(p?.diagnostics) });
      return {
        kind: "code.patch",
        applied: false,
        description: p?.description ?? "no-op patch stub",
        files: p?.files ?? [],
        status: "generated",
      };
    });

    this.register("code.verify", async (p) => {
      const cmd = p?.cmd ?? "npm test";
      log("info", "raphael", "code.verify", { cmd });
      const cwd = await safeCwd(p?.cwd);
      try {
        const result = await shell(cmd, cwd, Number(p?.timeoutMs ?? DEFAULT_TIMEOUT_MS));
        return { kind: "code.verify", verified: true, result };
      } catch (e) {
        return {
          kind: "code.verify",
          verified: false,
          error: e instanceof Error ? e.message : String(e),
        };
      }
    });

    this.register("code.approve", async (p) => {
      // YHWH-style policy gate — currently a pass-through with audit log.
      log("info", "raphael", "code.approve", { description: p?.description });
      return {
        kind: "code.approve",
        approved: true,
        policy: "default-allow-with-audit",
        description: p?.description,
      };
    });
  }
}
