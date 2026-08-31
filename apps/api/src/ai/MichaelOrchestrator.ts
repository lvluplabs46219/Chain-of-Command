import { DispatchTask, WorkerResult } from './SeraphimInterceptor';
import { logger } from '../lib/logger';

export type TaskState = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface TaskNode {
  task: DispatchTask;
  state: TaskState;
  dependencies: string[]; // Array of task_ids that must complete before this runs
  result?: WorkerResult;
  error?: string;
}

export interface ExecutionGraph {
  execution_id: string;
  tasks: Map<string, TaskNode>;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
}

/**
 * Michael Orchestrator: State Manager & Execution Controller
 * 
 * Maintains the global execution graph, handles state machine transitions,
 * evaluates DAG dependencies, and triggers Raphael for dispatch.
 */
export class MichaelOrchestrator {
  private executions: Map<string, ExecutionGraph> = new Map();

  /**
   * Registers a new DAG of tasks
   */
  public registerExecution(execution_id: string, tasks: TaskNode[]): void {
    const taskMap = new Map<string, TaskNode>();
    for (const node of tasks) {
      taskMap.set(node.task.task_id, node);
    }
    
    this.executions.set(execution_id, {
      execution_id,
      tasks: taskMap,
      status: 'IN_PROGRESS'
    });

    logger.info({ execution_id, taskCount: tasks.length }, 'Execution Graph Registered by Michael');
  }

  /**
   * Identifies tasks whose dependencies are met and are ready to be dispatched
   */
  public getReadyTasks(execution_id: string): DispatchTask[] {
    const graph = this.executions.get(execution_id);
    if (!graph || graph.status !== 'IN_PROGRESS') return [];

    const readyTasks: DispatchTask[] = [];

    for (const [taskId, node] of graph.tasks.entries()) {
      if (node.state === 'PENDING') {
        const depsMet = node.dependencies.every(depId => {
          const depNode = graph.tasks.get(depId);
          return depNode && depNode.state === 'COMPLETED';
        });

        if (depsMet) {
          readyTasks.push(node.task);
        }
      }
    }

    return readyTasks;
  }

  /**
   * Transitions a task to RUNNING
   */
  public markTaskRunning(execution_id: string, task_id: string): void {
    const graph = this.executions.get(execution_id);
    if (!graph) return;

    const node = graph.tasks.get(task_id);
    if (node) {
      node.state = 'RUNNING';
      logger.info({ execution_id, task_id }, 'Task Transitioned to RUNNING');
    }
  }

  /**
   * Handles task completion/failure, updates the DAG, and resolves execution state
   */
  public resolveTask(execution_id: string, result: WorkerResult): void {
    const graph = this.executions.get(execution_id);
    if (!graph) return;

    const node = graph.tasks.get(result.task_id);
    if (!node) return;

    if (result.worker_status === 'SUCCESS' && result.guardrail_status === 'PASSED') {
      node.state = 'COMPLETED';
      node.result = result;
      logger.info({ execution_id, task_id: result.task_id }, 'Task Transitioned to COMPLETED');
    } else {
      // Retry Logic
      if (node.task.metadata.retries < node.task.metadata.max_retries) {
        node.task.metadata.retries += 1;
        node.state = 'PENDING'; // Re-queue
        logger.warn({ execution_id, task_id: result.task_id, attempt: node.task.metadata.retries }, 'Task Retrying');
      } else {
        node.state = 'FAILED';
        node.result = result;
        node.error = 'Max retries exceeded or Guardrail failure';
        logger.error({ execution_id, task_id: result.task_id }, 'Task Transitioned to FAILED');
      }
    }

    this.checkExecutionResolution(execution_id);
  }

  /**
   * Evaluates if the entire Execution Graph is complete or irrecoverably failed
   */
  private checkExecutionResolution(execution_id: string): void {
    const graph = this.executions.get(execution_id);
    if (!graph) return;

    let allCompleted = true;
    let anyFailed = false;

    for (const node of graph.tasks.values()) {
      if (node.state === 'FAILED') anyFailed = true;
      if (node.state !== 'COMPLETED') allCompleted = false;
    }

    if (anyFailed) {
      graph.status = 'FAILED';
      logger.error({ execution_id }, 'Global Execution FAILED due to subtask failure');
    } else if (allCompleted) {
      graph.status = 'COMPLETED';
      logger.info({ execution_id }, 'Global Execution COMPLETED successfully');
    }
  }

  public getExecutionState(execution_id: string): ExecutionGraph | undefined {
    return this.executions.get(execution_id);
  }
}
