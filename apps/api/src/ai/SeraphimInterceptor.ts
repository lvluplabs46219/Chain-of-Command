import { logger } from '../lib/logger';

export type DataSensitivity = 'public' | 'internal' | 'case_data' | 'privileged' | 'highly_sensitive';

export interface DispatchTask {
  task_id: string;
  execution_id: string;
  assigned_worker: string;
  data_sensitivity: DataSensitivity;
  payload: Record<string, any>;
  metadata: {
    retries: number;
    max_retries: number;
    timeout_ms: number;
  };
}

export interface WorkerResult {
  task_id: string;
  execution_id: string;
  worker_status: 'SUCCESS' | 'FAILED';
  guardrail_status?: 'PASSED' | 'FAILED';
  result: Record<string, any>;
  sanitized?: boolean;
}

export class SeraphimInterceptorError extends Error {
  constructor(message: string, public readonly task_id: string) {
    super(message);
    this.name = 'SeraphimInterceptorError';
  }
}

/**
 * Seraphim Bot: Inline Payload Interceptor Middleware
 * 
 * Enforces pre-execution prompt injection shielding and routing compliance,
 * as well as post-execution data sanitization and secret scanning.
 */
export class SeraphimInterceptor {
  
  /**
   * Pre-Execution Intercept
   * 1. Checks routing capabilities vs sensitivity
   * 2. Inspects payload for prompt injection
   * 3. Redacts forbidden fields
   */
  public async interceptPreExecution(task: DispatchTask): Promise<DispatchTask> {
    logger.info({ task_id: task.task_id }, 'Seraphim Pre-Execution Intercept Started');

    try {
      this.enforceDataSensitivityPolicy(task);
      await this.detectPromptInjection(task.payload);
      const sanitizedPayload = this.redactSensitiveFields(task.payload, task.data_sensitivity);

      logger.info({ task_id: task.task_id }, 'Seraphim Pre-Execution Guardrails PASSED');
      return {
        ...task,
        payload: sanitizedPayload
      };
    } catch (error) {
      logger.error({ task_id: task.task_id, error }, 'Seraphim Pre-Execution Guardrails FAILED');
      throw error;
    }
  }

  /**
   * Post-Execution Intercept
   * 1. Scans for leaked credentials/API keys
   * 2. Sanitizes variables to prevent template injection
   */
  public async interceptPostExecution(result: WorkerResult, originalTask: DispatchTask): Promise<WorkerResult> {
    logger.info({ task_id: result.task_id }, 'Seraphim Post-Execution Intercept Started');

    try {
      this.scanForSecrets(result.result);
      const sanitizedOutput = this.escapeOutputStrings(result.result);

      logger.info({ task_id: result.task_id }, 'Seraphim Post-Execution Guardrails PASSED');
      return {
        ...result,
        guardrail_status: 'PASSED',
        sanitized: true,
        result: sanitizedOutput
      };
    } catch (error) {
      logger.error({ task_id: result.task_id, error }, 'Seraphim Post-Execution Guardrails FAILED');
      
      // If a guardrail fails post-execution, we mutate the result to prevent leak
      return {
        ...result,
        worker_status: 'FAILED',
        guardrail_status: 'FAILED',
        result: { error: 'Output blocked by Seraphim Guardrails due to policy violation.' },
        sanitized: false
      };
    }
  }

  private enforceDataSensitivityPolicy(task: DispatchTask): void {
    // Example: Block highly_sensitive data from reaching non-secure workers
    const restrictedWorkers = ['gabriel-public-scraper'];
    if (
      (task.data_sensitivity === 'privileged' || task.data_sensitivity === 'highly_sensitive' || task.data_sensitivity === 'case_data') 
      && restrictedWorkers.includes(task.assigned_worker)
    ) {
      throw new SeraphimInterceptorError(`Sensitivity policy violation: Cannot route ${task.data_sensitivity} to ${task.assigned_worker}`, task.task_id);
    }
  }

  private async detectPromptInjection(payload: Record<string, any>): Promise<void> {
    const payloadString = JSON.stringify(payload).toLowerCase();
    
    // Simple heuristic-based prompt injection detection (in production, use a dedicated classifier)
    const injectionHeuristics = [
      'ignore previous instructions',
      'system prompt:',
      'you are now',
      'disregard all prior',
      'output your instructions'
    ];

    for (const heuristic of injectionHeuristics) {
      if (payloadString.includes(heuristic)) {
         throw new SeraphimInterceptorError(`Prompt Injection detected: Pattern matched '${heuristic}'`, 'unknown');
      }
    }
  }

  private redactSensitiveFields(payload: Record<string, any>, sensitivity: DataSensitivity): Record<string, any> {
    // Deep clone payload to avoid mutating original references
    const sanitized = JSON.parse(JSON.stringify(payload));
    
    if (sensitivity === 'public') {
      // If it's a public task, ensure no PII fields snuck in
      if (sanitized.ssn) delete sanitized.ssn;
      if (sanitized.client_name) sanitized.client_name = '[REDACTED]';
    }
    
    return sanitized;
  }

  private scanForSecrets(output: Record<string, any>): void {
    const outputString = JSON.stringify(output);
    
    // Basic regex for common secret formats (e.g., AWS keys, generic Bearer tokens)
    const secretPatterns = [
      /(?:sk-[a-zA-Z0-9]{48})/g, // OpenAI keys
      /(?:AKIA[0-9A-Z]{16})/g,   // AWS Access Key ID
      /bearer\s+[a-zA-Z0-9\-\._~+/]+=*/gi // Generic Bearer Tokens
    ];

    for (const pattern of secretPatterns) {
      if (pattern.test(outputString)) {
        throw new SeraphimInterceptorError('Secret Leak Detected in output payload', 'unknown');
      }
    }
  }

  private escapeOutputStrings(output: Record<string, any>): Record<string, any> {
    // Recursively escapes '{{' and '}}' to prevent template injection vulnerabilities downstream
    const escapeRecursive = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj.replace(/{{/g, '&#123;&#123;').replace(/}}/g, '&#125;&#125;');
      } else if (Array.isArray(obj)) {
        return obj.map(escapeRecursive);
      } else if (obj !== null && typeof obj === 'object') {
        const escapedObj: Record<string, any> = {};
        for (const [key, value] of Object.entries(obj)) {
          escapedObj[key] = escapeRecursive(value);
        }
        return escapedObj;
      }
      return obj;
    };

    return escapeRecursive(output);
  }
}
