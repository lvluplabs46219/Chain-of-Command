/**
 * Acquit.ai Production API Service Layer
 * Centralized client for communicating with the Acquit.ai backend API.
 * Automatically injects authentication tokens, manages environment URLs,
 * and standardizes error handling.
 */

export class ApiError extends Error {
  public status: number;
  public data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Resolves the appropriate API base URL based on host environment.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    // When running in Canva preview or external embed, target Cloud Run
    if (origin.includes("canva.site") || origin.includes("canva-hosted-embed")) {
      return "https://ais-dev-qjsfgzlagan6blqltrhwng-205627821036.us-east1.run.app/api";
    }
  }
  return "/api";
}

/**
 * Retrieves the active bearer token from storage or defaults to a valid live token.
 */
export function getAuthToken(): string {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("acquit_auth_token");
    if (stored) return stored;
  }
  return "canva-live-token";
}

/**
 * Sets or removes the persistent auth token.
 */
export function setAuthToken(token: string | null): void {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("acquit_auth_token", token);
    } else {
      localStorage.removeItem("acquit_auth_token");
    }
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  let url = `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  if (options.params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get("content-type");
    let data: any = null;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const message =
        (data && (data.message || data.error)) ||
        `API request failed with status ${response.status}: ${response.statusText}`;
      throw new ApiError(message, response.status, data);
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || "Network connection error", 0, err);
  }
}

// -------------------------------------------------------------------------
// Specialized API Services
// -------------------------------------------------------------------------

export interface ClerkChatRequest {
  message: string;
  jurisdiction?: string;
  context?: {
    matter?: string;
    caseNumber?: string;
    stage?: string;
    [key: string]: any;
  };
}

export interface ClerkChatResponse {
  success: boolean;
  text: string;
  timestamp: string;
  disclaimer: string;
}

export interface EvidenceAnalysisRequest {
  title: string;
  category: string;
  description: string;
  tags?: string[] | string;
  charges?: string;
}

export interface EvidenceAnalysisResponse {
  success: boolean;
  analysis: string;
  analyzedAt: string;
}

export interface DraftMotionRequest {
  motionType: string;
  courtName?: string;
  caseNumber?: string;
  defendantName?: string;
  grounds: string;
  requestedRelief: string;
}

export interface DraftMotionResponse {
  success: boolean;
  draft: string;
  generatedAt: string;
}

export interface PleaAssistantRequest {
  charges?: string;
  pleaOffer?: string;
  trialRisks?: string;
  collateralConsequences?: string;
}

export interface PleaAssistantResponse {
  success: boolean;
  decisionStructure: string;
  timestamp: string;
}

export interface AgentRunResponse {
  runId: string;
  status: string;
  streamUrl: string;
  disclaimer: string;
  humanReviewRequired: boolean;
  agentName?: string;
}

export const api = {
  // AI Services
  ai: {
    askLawyer: (payload: { message: string; jurisdiction?: string; context?: any; agentRole?: string }) =>
      request<{ success: boolean; text: string; agentRole: string; disclaimer: string; timestamp: string }>("/ai/lawyer", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    askClerk: (payload: ClerkChatRequest) =>
      request<ClerkChatResponse>("/gemini/clerk-chat", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    analyzeEvidence: (payload: EvidenceAnalysisRequest) =>
      request<EvidenceAnalysisResponse>("/gemini/analyze-evidence", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    draftMotion: (payload: DraftMotionRequest) =>
      request<DraftMotionResponse>("/gemini/draft-motion", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    pleaAssistant: (payload: PleaAssistantRequest) =>
      request<PleaAssistantResponse>("/gemini/plea-assistant", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    chat: (prompt: string, options?: { systemInstruction?: string; modelName?: string; useSearch?: boolean; useHighThinking?: boolean }) =>
      request<{ text: string }>("/gemini/chat", {
        method: "POST",
        body: JSON.stringify({ prompt, ...options }),
      }),

    getSpecialistAgents: () =>
      request<{ agents: Array<{ id: string; name: string; description: string; disclaimerRequired: boolean; mustCiteMaterialClaims: boolean }> }>(
        "/ai/agents"
      ),

    runAgent: (agentId: string, input: string, options?: { provider?: string; model?: string; sources?: any[]; matterId?: string }) =>
      request<AgentRunResponse>(`/ai/agents/${agentId}/runs`, {
        method: "POST",
        body: JSON.stringify({ input, ...options }),
      }),

    getAgentStreamUrl: (runId: string) => {
      const baseUrl = getApiBaseUrl();
      return `${baseUrl}/ai/runs/${runId}/stream`;
    },
  },

  // Case & Matters
  matters: {
    getAll: () => request<{ success: boolean; matters: any[] }>("/matters"),
    getById: (matterId: string) => request<{ success: boolean; matter: any }>(`/matters/${matterId}`),
  },

  // Documents
  documents: {
    getAll: (matterId?: string) =>
      request<{ success: boolean; documents: any[] }>("/documents", {
        params: matterId ? { matterId } : undefined,
      }),
  },

  // CourtListener Legal Research
  courtlistener: {
    search: (q: string, court?: string, type = "o", page = 1) =>
      request<{ count: number; results: any[] }>("/courtlistener/search", {
        params: { q, court, type, page },
      }),
  },

  // Health
  health: () => request<{ status: string }>("/health"),
};

export default api;
