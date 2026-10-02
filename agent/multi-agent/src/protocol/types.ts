// Shared wire contract for all agents (YHWH, Michael, Gabriel, Raphael, Metatron, Seraphim)
// "external" is a valid envelope recipient for deliveries that leave the
// agent mesh (e.g. Gabriel webhook fanout); it is never a valid sender.
// "watcher" is the GitHub Actions poller (cli/watch-github) — log-only identity.
export type AgentName =
  | "yhwh"
  | "michael"
  | "gabriel"
  | "raphael"
  | "metatron"
  | "seraphim"
  | "external"
  | "watcher";
export type SenderName = Exclude<AgentName, "external" | "watcher">;

export type TaskKind =
  | "llm.reason"          // YHWH / Metatron
  | "file.scaffold"       // Raphael: write a file (payload: {path, content})
  | "shell.exec"          // Raphael: run a shell command (payload: {cmd, cwd, timeoutMs})
  | "db.migrate"          // Raphael: run a DB migration command
  | "workspace.maintain"  // Raphael: lint/format/build maintenance
  | "notify"              // Gabriel
  | "deliver_payload";    // Gabriel

export interface TaskNode {
  id: string;
  kind: TaskKind;
  /** Task nodes this task depends on (DAG edges). */
  dependsOn: string[];
  payload: unknown;
}

export interface ExecutionTree {
  rootId: string;
  nodes: TaskNode[];
}

export type TaskState =
  | "pending"
  | "dispatched"
  | "running"
  | "succeeded"
  | "failed"
  | "fallback";

export interface Envelope<T = unknown> {
  id: string;
  type: "directive" | "task" | "task_result" | "event" | "query";
  from: AgentName;
  to: AgentName;
  correlationId?: string;
  createdAt: string;      // ISO
  payload: T;
}

export interface Directive { text: string; context?: Record<string, unknown>; }
export interface TaskResult { taskId: string; state: TaskState; output?: unknown; error?: string; }
export interface Event { topic: string; data: Record<string, unknown>; }

export const newId = (): string =>
  globalThis.crypto.randomUUID();

export const envelope = <T>(
  type: Envelope["type"], from: AgentName, to: AgentName, payload: T, correlationId?: string,
): Envelope<T> => ({
  id: newId(), type, from, to, payload,
  correlationId: correlationId ?? newId(),
  createdAt: new Date().toISOString(),
});

/** Structured JSON log line (audit-friendly). */
export const log = (level: "info" | "warn" | "error", agent: AgentName, event: string, data: Record<string, unknown> = {}) => {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, agent, event, ...data });
  if (level === "error") console.error(line); else console.log(line);
};
