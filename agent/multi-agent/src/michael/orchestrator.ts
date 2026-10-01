// Michael — Orchestrator Core.
// State machine coordinator: receives directives from YHWH, resolves the task
// DAG, dispatches to Raphael (work) or Gabriel (events), routes llm.reason via Metatron.
import {
  AgentName, Directive, Envelope, ExecutionTree, TaskNode, TaskResult, TaskState,
  envelope, log,
} from "../protocol/types.js";
import { StateStore } from "../state/store.js";
import { Gabriel } from "../gabriel/messenger.js";
import { Raphael } from "../raphael/worker.js";
import * as metatron from "../metatron/gateway.js";
import * as yhwh from "../yhwh/core.js";

const LLM_KINDS = new Set(["llm.reason"]);
const GABRIEL_KINDS = new Set(["notify", "deliver_payload"]);

export class Michael {
  private store = new StateStore();
  private gabriel = new Gabriel(this.store);
  private raphael = new Raphael();
  private results = new Map<string, TaskResult>();

  /** Entry point for a raw directive: plan with YHWH, then execute the DAG. */
  async handleDirective(directive: Directive): Promise<{ tree: ExecutionTree; results: TaskResult[] }> {
    const tree = await yhwh.plan(directive);
    for (const node of tree.nodes) {
      this.store.upsertTask({ id: node.id, kind: node.kind, state: "pending", payload: node.payload });
    }
    const order = this.topoSort(tree);
    for (const node of order) await this.execute(node);
    return { tree, results: [...this.results.values()] };
  }

  private async execute(node: TaskNode): Promise<void> {
    const depsOk = node.dependsOn.every((d) => this.results.get(d)?.state === "succeeded");
    if (!depsOk) {
      this.settle(node.id, "failed", undefined, "dependency not satisfied");
      return;
    }
    this.store.upsertTask({ id: node.id, kind: node.kind, state: "running", payload: node.payload });
    try {
      let output: unknown;
      if (LLM_KINDS.has(node.kind)) {
        const prompt = typeof node.payload === "string"
          ? node.payload
          : JSON.stringify(node.payload);
        output = await metatron.complete(prompt);
      } else if (GABRIEL_KINDS.has(node.kind)) {
        output = await this.gabriel.emit({ topic: node.kind, data: { task: node.id, payload: node.payload } });
      } else {
        output = await this.raphael.run(node);
      }
      this.settle(node.id, "succeeded", output);
    } catch (e) {
      this.settle(node.id, "failed", undefined, String(e));
      await this.gabriel.emit({ topic: "task.failed", data: { task: node.id, error: String(e) } });
    }
  }

  private settle(taskId: string, state: TaskState, output?: unknown, error?: string) {
    const r: TaskResult = { taskId, state, output, error };
    this.results.set(taskId, r);
    this.store.completeTask(taskId, state, output, error);
    log(state === "succeeded" ? "info" : "error", "michael", "task_settled", { taskId, state, error });
  }

  /** Topological sort (Kahn); cycle => remaining nodes dispatched in listed order. */
  private topoSort(tree: ExecutionTree): TaskNode[] {
    const byId = new Map(tree.nodes.map((n) => [n.id, n]));
    const indeg = new Map(tree.nodes.map((n) => [n.id, n.dependsOn.filter((d) => byId.has(d)).length]));
    const queue = tree.nodes.filter((n) => (indeg.get(n.id) ?? 0) === 0);
    const out: TaskNode[] = [];
    const seen = new Set<string>();
    while (queue.length) {
      const n = queue.shift()!;
      out.push(n);
      seen.add(n.id);
      for (const m of tree.nodes) {
        if (m.dependsOn.includes(n.id)) {
          const d = (indeg.get(m.id) ?? 1) - 1;
          indeg.set(m.id, d);
          if (d === 0) queue.push(m);
        }
      }
    }
    for (const n of tree.nodes) if (!seen.has(n.id)) out.push(n); // cycle fallback
    return out;
  }

  /** UDS message handler: routes envelopes by type. */
  async onEnvelope(env: Envelope): Promise<Envelope | null> {
    log("info", "michael", "envelope_received", { type: env.type, from: env.from });
    switch (env.type) {
      case "directive": {
        const { results } = await this.handleDirective(env.payload as Directive);
        return envelope("task_result", "michael", env.from, results, env.correlationId);
      }
      case "task":
        return this.gabriel.handle(env);
      case "query": {
        const me: AgentName = "michael";
        return envelope("task_result", "michael", env.from, { ok: true, agent: me }, env.correlationId);
      }
      default:
        return null;
    }
  }
}
