import { requirePermission } from "../middleware/authContext";
import { Router, Request, Response } from "express";
import { handleUserSignup } from "../workflows/userSignup";
import { michaelOrchestrator, TaskNode } from "../ai/MichaelOrchestrator";
import { SPECIALIST_AGENTS } from "./ai";
import type { AuthenticatedRequest } from "../middleware/verifySession";
import crypto from "crypto";

const workflowRouter = Router();

/** Defense in depth: router is mounted after verifySession in routes/index.ts */
function requireUser(req: Request, res: Response): req is AuthenticatedRequest {
  const user = (req as AuthenticatedRequest).user;
  if (!user?.id) {
    res.status(401).json({ error: "UNAUTHORIZED", message: "Authentication required" });
    return false;
  }
  return true;
}

/**
 * Global Status of AI Agents & Workflow Engines
 */
workflowRouter.get("/workflow/status", (req: Request, res: Response) => {
  if (!requireUser(req, res)) return;
  const registeredAgents = Object.entries(SPECIALIST_AGENTS).map(([id, meta]) => ({
    id,
    name: meta.name,
    roleDescription: meta.roleDescription,
    policy: meta.policy,
  }));

  return res.json({
    status: "active",
    runtime: "Node.js 22 + Express + Next.js 16",
    orchestrator: "Michael Orchestrator (DAG Engine)",
    durableWorkflows: ["userSignup", "caseIntakeDAG", "evidenceReviewWorkflow"],
    agentsCount: registeredAgents.length,
    agents: registeredAgents,
    uplGuardsActive: true,
    disclaimerEnforced: true,
  });
});

/**
 * Trigger User Onboarding Durable Workflow
 */
workflowRouter.post("/workflow/signup", requirePermission({ resource: "case", action: "write" }), async (req: Request, res: Response) => {
  if (!requireUser(req, res)) return;
  const { email } = req.body;
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "VALIDATION_ERROR", message: "A valid email address is required" });
  }

  try {
    const result = await handleUserSignup(email);
    return res.status(200).json({
      success: true,
      workflow: "userSignup",
      result,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: "WORKFLOW_EXECUTION_ERROR",
      message: err.message || "Failed to execute signup workflow",
    });
  }
});

/**
 * Dispatch Multi-Agent Legal Workflow DAG
 */
workflowRouter.post("/workflow/dag/dispatch", requirePermission({ resource: "agent", action: "write" }), async (req: Request, res: Response) => {
  if (!requireUser(req, res)) return;
  const { matterId, objective, selectedAgents } = req.body;
  const executionId = "exec_" + crypto.randomBytes(8).toString("hex");

  const agentIds: string[] = Array.isArray(selectedAgents) && selectedAgents.length > 0
    ? selectedAgents
    : ["lead-counsel", "paralegal", "rights-checker", "court-prep"];

  // Construct DAG nodes
  const tasks: TaskNode[] = [];
  
  // 1. Initial intake task
  tasks.push({
    task: {
      task_id: `${executionId}_intake`,
      execution_id: executionId,
      assigned_worker: "lead-counsel",
      data_sensitivity: "case_data",
      payload: { objective: objective || "Case Analysis and Procedural Roadmap", matterId },
      metadata: { retries: 0, max_retries: 2, timeout_ms: 30000 },
    },
    state: "PENDING",
    dependencies: [],
  });

  // 2. Parallel specialist tasks depending on intake
  if (agentIds.includes("rights-checker")) {
    tasks.push({
      task: {
        task_id: `${executionId}_rights`,
        execution_id: executionId,
        assigned_worker: "rights-checker",
        data_sensitivity: "case_data",
        payload: { matterId, scope: "Constitutional and Procedural Rights Audit" },
        metadata: { retries: 0, max_retries: 2, timeout_ms: 30000 },
      },
      state: "PENDING",
      dependencies: [`${executionId}_intake`],
    });
  }

  if (agentIds.includes("paralegal")) {
    tasks.push({
      task: {
        task_id: `${executionId}_deadlines`,
        execution_id: executionId,
        assigned_worker: "paralegal",
        data_sensitivity: "case_data",
        payload: { matterId, scope: "Statutory Deadline & Filing Checklist Calculation" },
        metadata: { retries: 0, max_retries: 2, timeout_ms: 30000 },
      },
      state: "PENDING",
      dependencies: [`${executionId}_intake`],
    });
  }

  // 3. Final synthesis prep task depending on prior tasks
  if (agentIds.includes("court-prep")) {
    const prepDeps = tasks.map(t => t.task.task_id);
    tasks.push({
      task: {
        task_id: `${executionId}_prep`,
        execution_id: executionId,
        assigned_worker: "court-prep",
        data_sensitivity: "case_data",
        payload: { matterId, scope: "Court Appearance & Readiness Brief" },
        metadata: { retries: 0, max_retries: 2, timeout_ms: 30000 },
      },
      state: "PENDING",
      dependencies: prepDeps,
    });
  }

  // Register with Michael Orchestrator
  michaelOrchestrator.registerExecution(executionId, tasks);
  const readyTasks = michaelOrchestrator.getReadyTasks(executionId);

  // Automatically start ready tasks
  for (const t of readyTasks) {
    michaelOrchestrator.markTaskRunning(executionId, t.task_id);
  }

  return res.status(202).json({
    success: true,
    executionId,
    status: "IN_PROGRESS",
    taskCount: tasks.length,
    readyTasks: readyTasks.map(t => ({ taskId: t.task_id, worker: t.assigned_worker })),
  });
});

/**
 * Query DAG Execution State
 */
workflowRouter.get("/workflow/dag/:executionId", (req: Request<{ executionId: string }>, res: Response) => {
  if (!requireUser(req, res)) return;
  const { executionId } = req.params;
  const state = michaelOrchestrator.getExecutionState(executionId);

  if (!state) {
    return res.status(404).json({ error: "NOT_FOUND", message: `Execution ${executionId} not found` });
  }

  const tasksArray = Array.from(state.tasks.entries()).map(([id, node]) => ({
    taskId: id,
    worker: node.task.assigned_worker,
    state: node.state,
    dependencies: node.dependencies,
    result: node.result,
    error: node.error,
  }));

  return res.json({
    executionId: state.execution_id,
    status: state.status,
    tasks: tasksArray,
  });
});

export { workflowRouter };
export default workflowRouter;
