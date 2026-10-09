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
  | "watcher"
  // Specialized legal agent personas (routed through the hierarchy)
  | "head_counsel"
  | "paralegal"
  | "rights_checker"
  | "timeline_spotter"
  | "charge_explainer"
  | "research_counsel"
  | "court_prep"
  | "document_analyst";

export type SenderName = Exclude<AgentName, "external" | "watcher">;

export type TaskKind =
  // Core runtime
  | "llm.reason"          // YHWH / Metatron
  | "file.scaffold"       // Raphael: write a file (payload: {path, content})
  | "shell.exec"          // Raphael: run a shell command (payload: {cmd, cwd, timeoutMs})
  | "db.migrate"          // Raphael: run a DB migration command
  | "workspace.maintain"  // Raphael: lint/format/build maintenance
  | "notify"              // Gabriel
  | "deliver_payload"     // Gabriel
  // Divine-style coding workflow (diagnose → patch → verify → approve)
  | "code.diagnose"       // Seraphim-style: scan failures / errors
  | "code.patch"          // Gabriel-style: generate patch
  | "code.verify"         // Michael-style: sandbox / test verification
  | "code.approve"        // YHWH-style: policy gate before commit
  // Legal-specific workflow tasks (Raphael handlers)
  | "legal.charge_explain"
  | "legal.brady_demand"
  | "legal.court_prep_kit"
  | "legal.timeline_build"
  | "legal.contradiction_scan"
  | "legal.deadline_check"
  | "legal.motion_draft"
  | "legal.document_analyze"
  | "legal.evidence_organize"
  | "legal.rights_check";

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
  | "fallback"
  | "skipped";

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

/** Map specialized legal personas onto runtime layers */
export const LEGAL_AGENT_ROUTING: Record<string, AgentName> = {
  head_counsel: "michael",
  paralegal: "raphael",
  rights_checker: "raphael",
  timeline_spotter: "raphael",
  charge_explainer: "metatron",
  research_counsel: "seraphim",
  court_prep: "raphael",
  document_analyst: "raphael",
};
