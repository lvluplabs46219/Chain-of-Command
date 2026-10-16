// packages/model-gateway/src/gateway.ts
import { ModelRequest, ModelResponse, ModelAdapter } from './types';

export class ModelGateway {
  private adapters: Map<string, ModelAdapter> = new Map();

  registerAdapter(adapter: ModelAdapter) {
    this.adapters.set(adapter.provider, adapter);
  }

  async generate(req: ModelRequest): Promise<ModelResponse> {
    const providerName = req.policy.allowedProviders?.[0] || 'gemini';
    const adapter = this.adapters.get(providerName);
    if (!adapter) {
      throw new Error(`No provider adapter registered for: ${providerName}`);
    }
    const start = Date.now();
    const res = await adapter.generate(req);
    return {
      ...res,
      latencyMs: Date.now() - start,
      attempts: [{ provider: providerName, model: 'default', success: true, timestamp: new Date().toISOString() }]
    };
  }
}
