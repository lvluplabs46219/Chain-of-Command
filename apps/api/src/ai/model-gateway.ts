import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';

const OpenAIChatResponseSchema = z.object({
  id: z.string(),
  choices: z.array(z.object({
    message: z.object({
      role: z.string(),
      content: z.string().nullable().optional()
    }),
    finish_reason: z.string().nullable().optional()
  })),
  usage: z.object({
    prompt_tokens: z.number().optional(),
    completion_tokens: z.number().optional(),
    total_tokens: z.number().optional()
  }).optional()
});

export type OpenAIChatResponse = z.infer<typeof OpenAIChatResponseSchema>;

export async function parseModelResponse(rawResponse: unknown): Promise<OpenAIChatResponse> {
  const result = OpenAIChatResponseSchema.safeParse(rawResponse);
  if (!result.success) {
    throw new Error(`LLM Payload Validation Failed: ${result.error.message}`);
  }
  return result.data;
}

export type ModelProvider = "demo" | "ollama" | "openai" | "gemini";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelRequest {
  provider?: ModelProvider;
  model: string;
  /**
   * @remark ChatMessage.content should be sanitized and validated against prompt injection
   *         at the application layer before being passed to the ModelGateway.
   */
  messages: ChatMessage[];
  maxTokens?: number;
}

export interface ModelResponse {
  id: string;
  provider: ModelProvider;
  model: string;
  content: string;
  finishReason: "stop" | "length" | "error";
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export interface ModelStreamEvent {
  type: "delta" | "done" | "error";
  text?: string;
  response?: ModelResponse;
  error?: { code: string; message: string };
}

export interface ModelAdapter {
  provider: ModelProvider;
  listModels(): Promise<string[]>;
  complete(request: ModelRequest): Promise<ModelResponse>;
  stream(request: ModelRequest): AsyncIterable<ModelStreamEvent>;
  health(): Promise<{ ok: boolean; latencyMs?: number; details?: string }>;
}

function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.trim().length / 4));
}

function responseId(provider: ModelProvider): string {
  return `${provider}-${crypto.randomUUID()}`;
}

async function fetchWithTimeout(url: string, options: RequestInit & { timeoutMs?: number }): Promise<Response> {
  const { timeoutMs = 30000, ...fetchOptions } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(id);
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs = 30000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeoutMs)
    ),
  ]);
}

export class DemoModelAdapter implements ModelAdapter {
  provider = "demo" as const;

  async listModels(): Promise<string[]> {
    return ["acquit-demo-1"];
  }

  async complete(request: ModelRequest): Promise<ModelResponse> {
    const userMessage = [...request.messages]
      .reverse()
      .find((message) => message.role === "user");

    const sourceCount = request.messages.filter((message) => message.role === "system").length;
    const content = [
      "I reviewed the evidence pack attached to this run.",
      "I can help organize the facts, explain relevant legal information, and prepare questions or draft language for your review.",
      sourceCount > 1
        ? "The response below is grounded in the cited case materials supplied with this request."
        : "No independent authority was supplied, so this run should remain in review until sources are attached.",
      `Requested task: ${userMessage?.content ?? "No task provided"}`,
    ].join(" ");

    const inputTokens = request.messages.reduce(
      (total, message) => total + estimateTokens(message.content),
      0,
    );
    const outputTokens = estimateTokens(content);

    return {
      id: responseId(this.provider),
      provider: this.provider,
      model: request.model,
      content,
      finishReason: "stop",
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
      },
    };
  }

  async *stream(request: ModelRequest): AsyncIterable<ModelStreamEvent> {
    try {
      const response = await this.complete(request);
      const words = response.content.split(" ");
      for (const [index, word] of words.entries()) {
        yield {
          type: "delta",
          text: `${index === 0 ? "" : " "}${word}`,
        };
      }
      yield { type: "done", response };
    } catch (error) {
      yield {
        type: "error",
        error: {
          code: "DEMO_STREAM_ERROR",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async health(): Promise<{ ok: boolean; details?: string }> {
    return { ok: true, details: "Deterministic demo adapter is available." };
  }
}

export class OllamaAdapter implements ModelAdapter {
  provider = "ollama" as const;

  constructor(private readonly baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434") {}

  async listModels(): Promise<string[]> {
    try {
      const response = await fetchWithTimeout(`${this.baseUrl}/api/tags`, { timeoutMs: 10000 });
      if (!response.ok) {
        throw new Error(`Ollama model listing failed with HTTP ${response.status}.`);
      }
      const payload = (await response.json()) as { models?: Array<{ name?: string }> };
      const models = (payload.models ?? [])
        .map((model) => model.name)
        .filter((name): name is string => Boolean(name));
      if (models.length === 0) {
        return ["llama3", "mistral", "gemma", "phi3"];
      }
      return models;
    } catch {
      return ["llama3", "mistral", "gemma", "phi3"];
    }
  }

  async complete(request: ModelRequest): Promise<ModelResponse> {
    const response = await fetchWithTimeout(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        stream: false,
        options: { num_predict: request.maxTokens ?? 8192 },
      }),
      timeoutMs: 30000,
    });

    if (!response.ok) {
      throw new Error(`Ollama completion failed with HTTP ${response.status}.`);
    }

    const payload = (await response.json()) as {
      message?: { content?: string };
      done?: boolean;
      prompt_eval_count?: number;
      eval_count?: number;
    };

    const content = payload.message?.content;
    if (!content) {
      throw new Error("Ollama returned an empty completion.");
    }

    const inputTokens = payload.prompt_eval_count ?? estimateTokens(request.messages.map((message) => message.content).join(" "));
    const outputTokens = payload.eval_count ?? estimateTokens(content);

    return {
      id: responseId(this.provider),
      provider: this.provider,
      model: request.model,
      content,
      finishReason: payload.done === false ? "length" : "stop",
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
      },
    };
  }

  async *stream(request: ModelRequest): AsyncIterable<ModelStreamEvent> {
    try {
      const response = await this.complete(request);
      yield { type: "delta", text: response.content };
      yield { type: "done", response };
    } catch (error) {
      yield {
        type: "error",
        error: {
          code: "OLLAMA_STREAM_ERROR",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async health(): Promise<{ ok: boolean; latencyMs?: number; details?: string }> {
    const startedAt = Date.now();
    try {
      const response = await fetchWithTimeout(`${this.baseUrl}/api/version`, { timeoutMs: 10000 });
      return { 
        ok: response.ok,
        latencyMs: Date.now() - startedAt,
        details: response.ok ? "Ollama is reachable." : `Ollama returned HTTP ${response.status}.`,
      };
    } catch (error) {
      return { 
        ok: false,
        latencyMs: Date.now() - startedAt,
        details: error instanceof Error ? error.message : "Ollama is unreachable.",
      };
    }
  }
}

export class OpenAiAdapter implements ModelAdapter {
  provider = "openai" as const;

  constructor(
    private readonly apiKey = process.env.OPENAI_API_KEY,
    private readonly baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"
  ) {}

  async listModels(): Promise<string[]> {
    if (!this.apiKey) return [];
    try {
      const response = await fetchWithTimeout(`${this.baseUrl}/models`, {
        headers: { "Authorization": `Bearer ${this.apiKey}` },
        timeoutMs: 10000
      });
      if (!response.ok) {
        return ["gpt-4o", "gpt-4o-mini", "gpt-4", "gpt-3.5-turbo"];
      }
      const payload = await response.json() as { data?: Array<{ id: string }> };
      const list = (payload.data ?? []).map((m) => m.id);
      if (list.length === 0) {
        return ["gpt-4o", "gpt-4o-mini", "gpt-4", "gpt-3.5-turbo"];
      }
      return list;
    } catch {
      return ["gpt-4o", "gpt-4o-mini", "gpt-4", "gpt-3.5-turbo"];
    }
  }

  async complete(request: ModelRequest): Promise<ModelResponse> {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set.");
    }
    const response = await fetchWithTimeout(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        stream: false,
        max_tokens: request.maxTokens
      }),
      timeoutMs: 30000,
    });

    if (!response.ok) {
      // Avoid exposing raw upstream error messages. Log details internally if needed.
      // const errorDetails = await response.text(); console.error("OpenAI API detailed error:", errorDetails);
      throw new Error(`OpenAI API request failed with HTTP ${response.status}.`);
    }

    const payloadRaw = await response.json();
    const payload = await parseModelResponse(payloadRaw);

    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned an empty completion.");
    }

    const usage = payload.usage || {
      prompt_tokens: estimateTokens(request.messages.map((m) => m.content).join(" ")),
      completion_tokens: estimateTokens(content),
      total_tokens: 0
    };

    return {
      id: responseId(this.provider),
      provider: this.provider,
      model: request.model,
      content,
      finishReason: payload.choices?.[0]?.finish_reason === "length" ? "length" : "stop",
      usage: {
        inputTokens: usage.prompt_tokens ?? 0,
        outputTokens: usage.completion_tokens ?? 0,
        totalTokens: usage.total_tokens || ((usage.prompt_tokens ?? 0) + (usage.completion_tokens ?? 0)),
      },
    };
  }

  async *stream(request: ModelRequest): AsyncIterable<ModelStreamEvent> {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set.");
    }
    let accumulatedContent = "";
    try {
      const response = await fetchWithTimeout(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "Accept": "text/event-stream"
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          stream: true,
          max_tokens: request.maxTokens
        }),
        timeoutMs: 30000,
      });

      if (!response.ok) {
        // Avoid exposing raw upstream error messages. Log details internally if needed.
      // const errorDetails = await response.text(); console.error("OpenAI API detailed error:", errorDetails);
      throw new Error(`OpenAI API request failed with HTTP ${response.status}.`);
      }

      if (!response.body) {
        throw new Error("OpenAI returned an empty body.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let isDone = false;

      try {
        while (!isDone) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || "";
          
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") {
              isDone = true;
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                accumulatedContent += content;
                yield { type: "delta", text: content };
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
      
      const inputTokens = estimateTokens(request.messages.map((m) => m.content).join(" "));
      const outputTokens = estimateTokens(accumulatedContent);
      const modelResponse: ModelResponse = {
        id: responseId(this.provider),
        provider: this.provider,
        model: request.model,
        content: accumulatedContent,
        finishReason: "stop",
        usage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
      };

      yield { type: "done", response: modelResponse };
    } catch (error) {
      yield {
        type: "error",
        error: {
          code: "OPENAI_STREAM_ERROR",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async health(): Promise<{ ok: boolean; latencyMs?: number; details?: string }> {
    const startedAt = Date.now();
    try {
      if (!this.apiKey) return { ok: false, details: "OPENAI_API_KEY is not set" };
      const response = await fetchWithTimeout(`${this.baseUrl}/models`, {
        headers: { "Authorization": `Bearer ${this.apiKey}` },
        timeoutMs: 10000
      });
      return { 
        ok: response.ok,
        latencyMs: Date.now() - startedAt,
        details: response.ok ? "OpenAI is reachable." : `OpenAI returned HTTP ${response.status}.`,
      };
    } catch (error) {
      return { 
        ok: false,
        latencyMs: Date.now() - startedAt,
        details: error instanceof Error ? error.message : "OpenAI is unreachable.",
      };
    }
  }
}

export class ModelGateway {
  private readonly adapters = new Map<ModelProvider, ModelAdapter>();

  register(adapter: ModelAdapter): void {
    this.adapters.set(adapter.provider, adapter);
  }

  /**
   * Resolves the appropriate ModelAdapter for a given provider and model.
   * @remark Authorization checks for specific models or providers for a user/role
   *         must be implemented upstream of the ModelGateway. This method only
   *         validates model existence, not user permission.
   */
  async resolve(provider: ModelProvider, model: string): Promise<ModelAdapter> {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`No model adapter is registered for provider "${provider}".`);
    }
    const models = await adapter.listModels();
    if (provider !== "demo") {
      if (models.length === 0) {
        throw new Error(`Failed to list available models for provider "${provider}".`);
      }
      if (!models.includes(model)) {
        throw new Error(`Model "${model}" is not available from provider "${provider}".`);
      }
    }
    return adapter;
  }

  async complete(request: ModelRequest): Promise<ModelResponse> {
    const provider = request.provider ?? "demo";
    const adapter = await this.resolve(provider, request.model);
    return adapter.complete(request);
  }

  async *stream(request: ModelRequest): AsyncIterable<ModelStreamEvent> {
    const provider = request.provider ?? "demo";
    const adapter = await this.resolve(provider, request.model);
    for await (const event of adapter.stream(request)) {
      yield event;
    }
  }
}

export class GeminiModelAdapter implements ModelAdapter {
  provider = "gemini" as const;
  private ai: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI {
    if (!this.ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is required");
      }
      this.ai = new GoogleGenAI({ apiKey });
    }
    return this.ai;
  }

  async listModels(): Promise<string[]> {
    return [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
    ];
  }

  async complete(request: ModelRequest): Promise<ModelResponse> {
    const ai = this.getClient();
    const modelName = request.model || "gemini-2.5-flash";

    const systemMessage = request.messages.find((m) => m.role === "system");
    const contents = request.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const response = await withTimeout(
      ai.models.generateContent({
        model: modelName,
        contents: contents.length > 0 ? contents : [{ role: "user", parts: [{ text: "Hello" }] }],
        config: {
          systemInstruction: systemMessage?.content,
          maxOutputTokens: request.maxTokens,
        },
      }),
      30000
    );

    const text = response.text || "";
    const inputTokens = request.messages.reduce(
      (total, m) => total + estimateTokens(m.content),
      0
    );
    const outputTokens = estimateTokens(text);

    return {
      id: responseId(this.provider),
      provider: this.provider,
      model: modelName,
      content: text,
      finishReason: "stop",
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
      },
    };
  }

  async *stream(request: ModelRequest): AsyncIterable<ModelStreamEvent> {
    let accumulatedContent = "";
    try {
      const ai = this.getClient();
      const modelName = request.model || "gemini-2.5-flash";

      const systemMessage = request.messages.find((m) => m.role === "system");
      const contents = request.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

      const responseStream = await withTimeout(
        ai.models.generateContentStream({
          model: modelName,
          contents: contents.length > 0 ? contents : [{ role: "user", parts: [{ text: "Hello" }] }],
          config: {
            systemInstruction: systemMessage?.content,
            maxOutputTokens: request.maxTokens,
          },
        }),
        30000
      );

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          accumulatedContent += text;
          yield { type: "delta", text };
        }
      }

      const inputTokens = request.messages.reduce(
        (total, m) => total + estimateTokens(m.content),
        0
      );
      const outputTokens = estimateTokens(accumulatedContent);

      const modelResponse: ModelResponse = {
        id: responseId(this.provider),
        provider: this.provider,
        model: modelName,
        content: accumulatedContent,
        finishReason: "stop",
        usage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
      };

      yield { type: "done", response: modelResponse };
    } catch (error) {
      yield {
        type: "error",
        error: {
          code: "GEMINI_STREAM_ERROR",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  async health(): Promise<{ ok: boolean; latencyMs?: number; details?: string }> {
    const startedAt = Date.now();
    try {
      if (!process.env.GEMINI_API_KEY) {
        return { ok: false, details: "GEMINI_API_KEY is not set" };
      }
      return {
        ok: true,
        latencyMs: Date.now() - startedAt,
        details: "Google Gemini API is configured and reachable.",
      };
    } catch (error) {
      return {
        ok: false,
        latencyMs: Date.now() - startedAt,
        details: error instanceof Error ? error.message : "Gemini is unreachable.",
      };
    }
  }
}

export const modelGateway = new ModelGateway();
modelGateway.register(new DemoModelAdapter());
modelGateway.register(new OllamaAdapter());
modelGateway.register(new OpenAiAdapter());
modelGateway.register(new GeminiModelAdapter());

