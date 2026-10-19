import { DispatchTask, WorkerResult } from './SeraphimInterceptor';
import { logger } from '../lib/logger';
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { executeTask } from './task-worker';
import { z } from 'zod';

const ProviderSchema = z.enum(["demo", "ollama", "openai", "gemini"]).optional();

export type TaskState = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface AuditTrailEntry {
  execution_id: string;
  task_id: string;
  action: 'START' | 'COMPLETE' | 'FAIL' | 'RETRY';
  timestamp: string;
  details: Record<string, unknown>;
  user_id?: string;
}

export interface PersistedExecutionGraph {
  id: string;
  execution_id: string;
  tasks: Record<string, TaskNode>;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  created_at: string;
  updated_at: string;
  audit_trail: AuditTrailEntry[];
}

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
 * 
 * NEW: Added persistence with Supabase and parallel execution support
 */
export class MichaelOrchestrator {
  private executions: Map<string, ExecutionGraph> = new Map();
  private supabase: SupabaseClient | null = null;
  private maxConcurrent: number = 5; // Default concurrency limit
  private executionTimeout: number = 3600000; // 1 hour default timeout
  
  // In-memory audit buffer for batch persistence
  private auditBuffer: AuditTrailEntry[] = [];
  private auditBufferSize: number = 100;
  private auditFlushInterval: number = 5000; // 5 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(maxConcurrent: number = 5, executionTimeout: number = 3600000) {
    this.maxConcurrent = maxConcurrent;
    this.executionTimeout = executionTimeout;
    this.initializeSupabase();
    this.startAuditFlush();
  }

  private initializeSupabase(): void {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (url && key) {
      this.supabase = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      logger.info('Supabase client initialized for MichaelOrchestrator');
    } else {
      logger.warn('Supabase not configured for MichaelOrchestrator - using in-memory only');
    }
  }

  private startAuditFlush(): void {
    if (this.supabase) {
      this.flushTimer = setInterval(() => {
        this.flushAuditBuffer();
      }, this.auditFlushInterval);
      // Process-level cleanup is handled by the module-level listeners on the singleton.
    }
  }

  /**
   * Registers a new DAG of tasks and persists to database
   */
  public async registerExecution(execution_id: string, tasks: TaskNode[], user_id?: string): Promise<void> {
    const taskMap = new Map<string, TaskNode>();
    for (const node of tasks) {
      taskMap.set(node.task.task_id, node);
    }
    
    const executionGraph: ExecutionGraph = {
      execution_id,
      tasks: taskMap,
      status: 'IN_PROGRESS'
    };
    
    this.executions.set(execution_id, executionGraph);

    // Persist to database
    if (this.supabase) {
      await this.persistExecutionGraph(execution_id, executionGraph, 'REGISTERED', user_id);
    }

    logger.info({ execution_id, taskCount: tasks.length }, 'Execution Graph Registered by Michael');
  }

  /**
   * Identifies tasks whose dependencies are met and are ready to be dispatched
   */
  public getReadyTasks(execution_id: string): DispatchTask[] {
    const graph = this.executions.get(execution_id);
    if (!graph || graph.status !== 'IN_PROGRESS') return [];

    const readyTasks: DispatchTask[] = [];

    Array.from(graph.tasks.entries()).forEach(([taskId, node]) => {
      if (node.state === 'PENDING') {
        const depsMet = node.dependencies.every(depId => {
          const depNode = graph.tasks.get(depId);
          return depNode && depNode.state === 'COMPLETED';
        });

        if (depsMet) {
          readyTasks.push(node.task);
        }
      }
    });

    return readyTasks;
  }

  /**
   * Execute all ready tasks in parallel with concurrency control
   */
  public async executeReadyTasksInParallel(execution_id: string, user_id?: string): Promise<WorkerResult[]> {
    const readyTasks = this.getReadyTasks(execution_id);
    
    if (readyTasks.length === 0) {
      logger.debug({ execution_id }, 'No ready tasks to execute');
      return [];
    }

    logger.info({ execution_id, taskCount: readyTasks.length }, 'Executing ready tasks in parallel');

    // Limit to maxConcurrent tasks
    const batch = readyTasks.slice(0, this.maxConcurrent);
    const results: WorkerResult[] = [];
    
    // Execute tasks in parallel
    const promises = batch.map(task => {
      return this.executeSingleTask(execution_id, task, user_id);
    });
    
    const batchResults = await Promise.allSettled(promises);
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        logger.error({ execution_id, error: result.reason }, 'Task execution failed');
        // The error will be handled by resolveTask, but we track it here
      }
    }
    
    return results;
  }

  /**
   * Execute a single task with state management
   */
  private async executeSingleTask(execution_id: string, task: DispatchTask, user_id?: string): Promise<WorkerResult> {
    const graph = this.executions.get(execution_id);
    if (!graph) {
      throw new Error(`Execution ${execution_id} not found`);
    }

    const node = graph.tasks.get(task.task_id);
    if (!node) {
      throw new Error(`Task ${task.task_id} not found in execution ${execution_id}`);
    }

    // Mark as running
    this.markTaskRunning(execution_id, task.task_id);
    
    // Add to audit trail
    this.addAuditEntry({
      execution_id,
      task_id: task.task_id,
      action: 'START',
      timestamp: new Date().toISOString(),
      details: { state: 'RUNNING', dependencies: node.dependencies },
      user_id
    });

    // Real execution: Seraphim guards → Model Gateway → Seraphim post-guards
    let workerResult: WorkerResult;
    try {
      workerResult = await executeTask(task, {
        provider: ProviderSchema.parse(task.payload?.provider),
        model: typeof task.payload?.model === 'string' ? task.payload.model : undefined,
        systemPrompt: typeof task.payload?.systemPrompt === 'string' ? task.payload.systemPrompt : undefined,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ execution_id, task_id: task.task_id, error: message }, 'Task worker threw');
      workerResult = {
        task_id: task.task_id,
        execution_id,
        worker_status: 'FAILED',
        guardrail_status: 'PASSED',
        result: { error: message },
        execution_time: 0,
        metadata: {
          retries: task.metadata?.retries ?? 0,
          max_retries: task.metadata?.max_retries ?? 2,
        },
      };
    }

    await this.resolveTask(execution_id, workerResult, user_id);
    return workerResult;
  }

  /**
   * Check if execution has pending tasks
   */
  public hasPendingTasks(execution_id: string): boolean {
    const graph = this.executions.get(execution_id);
    if (!graph || graph.status !== 'IN_PROGRESS') return false;
    
    let hasPending = false;
    Array.from(graph.tasks.values()).forEach(node => {
      if (node.state === 'PENDING' || node.state === 'RUNNING') {
        hasPending = true;
      }
    });
    return hasPending;
  }

  // =========================================================================
  // PERSISTENCE METHODS
  // =========================================================================

  /**
   * Persist execution graph to Supabase
   */
  private async persistExecutionGraph(
    execution_id: string, 
    graph: ExecutionGraph, 
    action: string, 
    user_id?: string
  ): Promise<void> {
    if (!this.supabase) {
      logger.debug({ execution_id }, 'Skipping persistence - Supabase not configured');
      return;
    }

    try {
      // Convert Map to plain object for serialization
      const tasksObject: Record<string, TaskNode> = {};
      Array.from(graph.tasks.entries()).forEach(([key, value]) => {
        tasksObject[key] = value;
      });

      const persistedGraph: PersistedExecutionGraph = {
        id: execution_id,
        execution_id,
        tasks: tasksObject,
        status: graph.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        audit_trail: [] // Will be populated separately
      };

      const { error } = await this.supabase
        .from('execution_graphs')
        .upsert(persistedGraph, { onConflict: 'id' });

      if (error) {
        logger.error({ execution_id, error: error.message }, 'Failed to persist execution graph');
        throw error;
      }

      logger.debug({ execution_id }, 'Execution graph persisted to Supabase');
    } catch (error) {
      logger.error({ execution_id, error }, 'Error persisting execution graph');
      // Don't throw to avoid breaking execution flow
    }
  }

  /**
   * Load execution graph from Supabase
   */
  public async loadExecutionGraph(execution_id: string): Promise<ExecutionGraph | null> {
    if (!this.supabase) {
      logger.debug({ execution_id }, 'Skipping load - Supabase not configured');
      return this.executions.get(execution_id) || null;
    }

    try {
      const { data, error } = await this.supabase
        .from('execution_graphs')
        .select('*')
        .eq('execution_id', execution_id)
        .single();

      if (error || !data) {
        logger.debug({ execution_id, error: error?.message }, 'No persisted execution graph found');
        return this.executions.get(execution_id) || null;
      }

      // Convert back to Map
      const taskMap = new Map<string, TaskNode>();
      Object.entries(data.tasks as Record<string, TaskNode>).forEach(([key, value]) => {
        taskMap.set(key, value as TaskNode);
      });

      const graph: ExecutionGraph = {
        execution_id: data.execution_id,
        tasks: taskMap,
        status: data.status as 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
      };

      // Cache in memory
      this.executions.set(execution_id, graph);
      logger.info({ execution_id }, 'Execution graph loaded from Supabase');
      
      return graph;
    } catch (error) {
      logger.error({ execution_id, error }, 'Error loading execution graph');
      return this.executions.get(execution_id) || null;
    }
  }

  /**
   * Add audit trail entry
   */
  public addAuditEntry(entry: AuditTrailEntry): void {
    this.auditBuffer.push(entry);
    
    // Flush if buffer is full
    if (this.auditBuffer.length >= this.auditBufferSize) {
      this.flushAuditBuffer();
    }
  }

  /**
   * Flush audit buffer to database
   */
  private async flushAuditBuffer(): Promise<void> {
    if (!this.supabase || this.auditBuffer.length === 0) {
      return;
    }

    try {
      const entriesToFlush = [...this.auditBuffer];
      this.auditBuffer = [];

      const { error } = await this.supabase
        .from('audit_trail')
        .insert(entriesToFlush);

      if (error) {
        logger.error({ error: error.message, count: entriesToFlush.length }, 'Failed to flush audit buffer');
        // Re-add to buffer if flush failed
        this.auditBuffer.unshift(...entriesToFlush);
      } else {
        logger.debug({ count: entriesToFlush.length }, 'Audit buffer flushed to Supabase');
      }
    } catch (error) {
      logger.error({ error }, 'Error flushing audit buffer');
    }
  }

  /**
   * Get complete audit trail for an execution
   */
  public async getAuditTrail(execution_id: string): Promise<AuditTrailEntry[]> {
    if (!this.supabase) {
      logger.debug({ execution_id }, 'Skipping audit trail - Supabase not configured');
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from('audit_trail')
        .select('*')
        .eq('execution_id', execution_id)
        .order('timestamp', { ascending: true });

      if (error) {
        logger.error({ execution_id, error: error.message }, 'Failed to fetch audit trail');
        return [];
      }

      return data as AuditTrailEntry[];
    } catch (error) {
      logger.error({ execution_id, error }, 'Error fetching audit trail');
      return [];
    }
  }

  // =========================================================================
  // RUN EXECUTION LOOP (NEW)
  // =========================================================================

  /**
   * Run complete execution with parallel processing
   */
  public async runExecution(execution_id: string, user_id?: string): Promise<ExecutionGraph> {
    const graph = this.executions.get(execution_id);
    if (!graph) {
      throw new Error(`Execution ${execution_id} not found`);
    }

    logger.info({ execution_id }, 'Starting execution loop');

    // Set timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Execution ${execution_id} timed out after ${this.executionTimeout}ms`));
      }, this.executionTimeout);
    });

    // Execution loop
    const executionLoop = async () => {
      while (this.hasPendingTasks(execution_id)) {
        const results = await this.executeReadyTasksInParallel(execution_id, user_id);
        
        if (results.length === 0 && this.hasPendingTasks(execution_id)) {
          // No tasks executed but there are still pending tasks
          // This could indicate circular dependencies or all tasks are blocked
          logger.warn({ execution_id }, 'No progress made - possible circular dependencies');
          break;
        }

        // Brief pause between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Return the final graph
      return this.executions.get(execution_id);
    };

    // Race execution against timeout
    try {
      const result = await Promise.race([
        executionLoop(),
        timeoutPromise
      ]) as ExecutionGraph;
      
      return result;
    } catch (error) {
      logger.error({ execution_id, error }, 'Execution failed or timed out');
      const graph = this.executions.get(execution_id);
      if (graph) {
        graph.status = 'FAILED';
        await this.persistExecutionGraph(execution_id, graph, 'FAILED', user_id);
      }
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    // Flush any remaining audit entries
    this.flushAuditBuffer();
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
      
      // Persist state change if Supabase is configured
      if (this.supabase) {
        this.persistExecutionGraph(execution_id, graph, 'TASK_RUNNING').catch(error => {
          logger.error({ execution_id, task_id, error }, 'Failed to persist running state');
        });
      }
    }
  }

  /**
   * Handles task completion/failure, updates the DAG, and resolves execution state
   */
  public async resolveTask(execution_id: string, result: WorkerResult, user_id?: string): Promise<void> {
    const graph = this.executions.get(execution_id);
    if (!graph) return;

    const node = graph.tasks.get(result.task_id);
    if (!node) return;

    if (result.worker_status === 'SUCCESS' && result.guardrail_status === 'PASSED') {
      node.state = 'COMPLETED';
      node.result = result;
      logger.info({ execution_id, task_id: result.task_id }, 'Task Transitioned to COMPLETED');
      
      // Add to audit trail
      this.addAuditEntry({
        execution_id,
        task_id: result.task_id,
        action: 'COMPLETE',
        timestamp: new Date().toISOString(),
        details: { status: 'SUCCESS', tokens_used: result.tokens_used || 0, execution_time: result.execution_time || 0 },
        user_id
      });
    } else {
      // Retry Logic
      if (node.task.metadata.retries < (node.task.metadata.max_retries || 2)) {
        node.task.metadata.retries = (node.task.metadata.retries || 0) + 1;
        node.state = 'PENDING'; // Re-queue
        logger.warn({ execution_id, task_id: result.task_id, attempt: node.task.metadata.retries }, 'Task Retrying');
        
        // Add to audit trail
        this.addAuditEntry({
          execution_id,
          task_id: result.task_id,
          action: 'RETRY',
          timestamp: new Date().toISOString(),
          details: { attempt: node.task.metadata.retries, error: result.result || 'Unknown error' },
          user_id
        });
      } else {
        node.state = 'FAILED';
        node.result = result;
        node.error = 'Max retries exceeded or Guardrail failure';
        logger.error({ execution_id, task_id: result.task_id }, 'Task Transitioned to FAILED');
        
        // Add to audit trail
        this.addAuditEntry({
          execution_id,
          task_id: result.task_id,
          action: 'FAIL',
          timestamp: new Date().toISOString(),
          details: { error: node.error, retries: node.task.metadata.retries },
          user_id
        });
      }
    }

    this.checkExecutionResolution(execution_id, user_id).catch(error => {
      logger.error({ execution_id, error }, 'Error in execution resolution check');
    });
    
    // Persist state changes
    if (this.supabase) {
      await this.persistExecutionGraph(execution_id, graph, 'RESOLVED_TASK', user_id);
    }
  }

  /**
   * Evaluates if the entire Execution Graph is complete or irrecoverably failed
   */
  private async checkExecutionResolution(execution_id: string, user_id?: string): Promise<void> {
    const graph = this.executions.get(execution_id);
    if (!graph) return;

    let allCompleted = true;
    let anyFailed = false;

    Array.from(graph.tasks.values()).forEach(node => {
      if (node.state === 'FAILED') anyFailed = true;
      if (node.state !== 'COMPLETED') allCompleted = false;
    });

    if (anyFailed) {
      graph.status = 'FAILED';
      logger.error({ execution_id }, 'Global Execution FAILED due to subtask failure');
      
      // Add final audit entry
      this.addAuditEntry({
        execution_id,
        task_id: 'GLOBAL',
        action: 'FAIL',
        timestamp: new Date().toISOString(),
        details: { message: 'Global execution failed due to subtask failure' },
        user_id
      });
    } else if (allCompleted) {
      graph.status = 'COMPLETED';
      logger.info({ execution_id }, 'Global Execution COMPLETED successfully');
      
      // Add final audit entry
      this.addAuditEntry({
        execution_id,
        task_id: 'GLOBAL',
        action: 'COMPLETE',
        timestamp: new Date().toISOString(),
        details: { message: 'Global execution completed successfully' },
        user_id
      });
    }
    
    // Persist final state
    if (this.supabase && (anyFailed || allCompleted)) {
      await this.persistExecutionGraph(execution_id, graph, 'RESOLVED', user_id);
    }
  }

  public getExecutionState(execution_id: string): ExecutionGraph | undefined {
    return this.executions.get(execution_id);
  }
}

// Initialize with configurable concurrency and timeout
const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_TASKS || '5');
const EXECUTION_TIMEOUT = parseInt(process.env.EXECUTION_TIMEOUT_MS || '3600000'); // 1 hour default

export const michaelOrchestrator = new MichaelOrchestrator(MAX_CONCURRENT, EXECUTION_TIMEOUT);

// Clean up on process exit
process.on('exit', () => michaelOrchestrator.cleanup());
process.on('SIGTERM', () => michaelOrchestrator.cleanup());
process.on('SIGINT', () => michaelOrchestrator.cleanup());
