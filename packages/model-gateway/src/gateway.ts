/**
 * Model Gateway Dispatcher & Budget Enforcer
 * Implements Chain of Command Master Build Instructions §7.3.
 */

import { ModelRequest, ModelResponse, ModelAdapter, AttemptRecord } from './types';

export class ModelGateway {
  private adapters: Map<string, ModelAdapter> = new Map();

  registerAdapter(adapter: ModelAdapter) {
    this.adapters.set(adapter.provider, adapter);
  }

  async execute(req: ModelRequest): Promise<ModelResponse> {
    const allowed = req.policy.allowedProviders || ['gemini', 'anthropic', 'openai'];
    const attempts: AttemptRecord[] = [];

    // Pre-flight budget check
    if (req.policy.maxCostUsd && req.policy.maxCostUsd < 0.001) {
      throw new Error(`BUDGET_EXCEEDED: Maximum cost ceiling of $${req.policy.maxCostUsd} cannot support taskClass '${req.taskClass}'.`);
    }

    for (const provider of allowed) {
      const adapter = this.adapters.get(provider);
      if (!adapter) continue;

      const startTime = Date.now();
      try {
        const response = await adapter.generate(req);
        attempts.push({
          provider,
          model: response.model,
          success: true,
          latencyMs: Date.now() - startTime,
        });

        return {
          ...response,
          attempts,
        };
      } catch (err) {
        attempts.push({
          provider,
          model: 'unknown',
          success: false,
          error: err instanceof Error ? err.message : String(err),
          latencyMs: Date.now() - startTime,
        });
      }
    }

    throw new Error(`All providers failed for taskClass '${req.taskClass}'. Attempts: ${JSON.stringify(attempts)}`);
  }
}

export const globalModelGateway = new ModelGateway();
