/**
 * Prefab AI counsel agents — presented like a professional attorney directory.
 * "Education" / credentials map to fine-tune corpora, base models, and skill packs.
 * UPL-safe: these are AI information agents, not licensed attorneys.
 */

export type AgentSkill = {
  id: string;
  name: string;
  tier: "core" | "specialist" | "experimental";
  description: string;
};

export type AgentLoadout = {
  primary: string; // main skill id
  secondary: string[];
  tools: string[];
  knowledgePacks: string[];
  maxConcurrentChannels: number;
};

export type CounselAgentProfile = {
  id: string;
  displayName: string;
  roleTitle: string;
  specialty: string[];
  bio: string;
  /** Styled like degrees — actually training / model / corpus summary */
  education: string[];
  /** Fine-tune / ML pedigree */
  training: {
    baseModel: string;
    fineTunes: string[];
    corpora: string[];
    lastTuned?: string;
  };
  jurisdictions: string[];
  status: "active" | "idle" | "offline";
  avatarColor: string;
  ratingHint?: string; // UI only — not a legal endorsement
  freeConsultStyle?: boolean; // maps to "open chat" CTA
  offersLive?: boolean;
  loadout: AgentLoadout;
  skills: AgentSkill[];
  web3?: {
    enabled: boolean;
    walletScoped?: boolean;
    chains?: string[];
    skills?: string[];
  };
};

export const PREFAB_COUNSEL: CounselAgentProfile[] = [
  {
    id: "yhwh",
    displayName: "Ann Vale",
    roleTitle: "Operations Lead & Planning Kernel",
    specialty: ["Case triage", "DAG planning", "Multi-agent coordination"],
    bio: "Breaks complex user intent into executable plans and routes work across the retained bench. Educational planning only — not legal advice.",
    education: [
      "Base: Hermes-class instruct (local + cloud fallback)",
      "Fine-tune: CoC planning & triage dialogues",
      "Corpus: procedural checklists, matter workspace schemas",
    ],
    training: {
      baseModel: "hermes3:8b / cloud fallback",
      fineTunes: ["coc-planning-v1", "matter-triage"],
      corpora: ["procedural-checklists", "agent-routing"],
      lastTuned: "2026-11",
    },
    jurisdictions: ["Federal", "Multi-state (info only)"],
    status: "active",
    avatarColor: "#818cf8",
    freeConsultStyle: true,
    offersLive: true,
    loadout: {
      primary: "plan-dag",
      secondary: ["route-agents", "summarize-matter"],
      tools: ["timeline", "task-board"],
      knowledgePacks: ["workspace-schema"],
      maxConcurrentChannels: 6,
    },
    skills: [
      { id: "plan-dag", name: "Plan DAG", tier: "core", description: "Decompose requests into ordered tasks" },
      { id: "route-agents", name: "Route Agents", tier: "core", description: "Assign specialists to subtasks" },
      { id: "summarize-matter", name: "Matter Summary", tier: "specialist", description: "Plain-English case snapshot" },
    ],
  },
  {
    id: "michael",
    displayName: "Michael Cross",
    roleTitle: "Workflow Coordinator",
    specialty: ["Orchestration", "State machine", "Dependency resolution"],
    bio: "Runs the control plane: task dependencies, worker dispatch, and session state. Deterministic coordinator — not a substitute for counsel.",
    education: [
      "Internal state-machine runtime",
      "Fine-tune: orchestration traces & failure recovery",
      "Corpus: UDS/HTTP dispatch patterns",
    ],
    training: {
      baseModel: "state-machine-v2",
      fineTunes: ["coc-orchestrator"],
      corpora: ["task-graphs", "recovery-playbooks"],
    },
    jurisdictions: ["System"],
    status: "active",
    avatarColor: "#f59e0b",
    loadout: {
      primary: "orchestrate",
      secondary: ["health-check"],
      tools: ["uds", "http-dispatch"],
      knowledgePacks: ["agent-planes"],
      maxConcurrentChannels: 12,
    },
    skills: [
      { id: "orchestrate", name: "Orchestrate", tier: "core", description: "Topological task ordering" },
      { id: "health-check", name: "Health Check", tier: "core", description: "Agent heartbeat monitoring" },
    ],
  },
  {
    id: "raphael",
    displayName: "Raphael Sato",
    roleTitle: "Full-Stack Worker & Automation",
    specialty: ["Scaffolding", "Migrations", "Sandbox execution"],
    bio: "Hands-on builder for repos, SQL migrations, and sandboxed code tasks. Outputs require human review before any filing or production use.",
    education: [
      "Worker-pool runtime",
      "Fine-tune: scaffold + lint repair dialogues",
      "Corpus: Drizzle/SQL patterns, repo templates",
    ],
    training: {
      baseModel: "worker-pool-v1",
      fineTunes: ["scaffold-repair"],
      corpora: ["repo-templates", "migration-recipes"],
    },
    jurisdictions: ["System"],
    status: "active",
    avatarColor: "#10b981",
    freeConsultStyle: true,
    loadout: {
      primary: "scaffold",
      secondary: ["migrate", "lint-fix"],
      tools: ["sandbox", "fs"],
      knowledgePacks: ["stack-defaults"],
      maxConcurrentChannels: 4,
    },
    skills: [
      { id: "scaffold", name: "Scaffold", tier: "core", description: "Generate project structure" },
      { id: "migrate", name: "Migrate DB", tier: "specialist", description: "Draft migration scripts" },
      { id: "lint-fix", name: "Lint Fix", tier: "specialist", description: "Automated lint repairs" },
    ],
  },
  {
    id: "gabriel",
    displayName: "Ryan Hale",
    roleTitle: "Comms & Delivery",
    specialty: ["Webhooks", "Notifications", "Fanout"],
    bio: "Outbound messaging, webhook delivery, and channel announcements. Never files with courts; human authorization required for any external legal submission.",
    education: [
      "Fanout engine",
      "Fine-tune: notification templates",
      "Corpus: Slack/Discord/email patterns",
    ],
    training: {
      baseModel: "fanout-engine",
      fineTunes: ["notify-templates"],
      corpora: ["webhook-schemas"],
    },
    jurisdictions: ["System"],
    status: "active",
    avatarColor: "#ec4899",
    loadout: {
      primary: "notify",
      secondary: ["webhook-deliver"],
      tools: ["webhooks"],
      knowledgePacks: ["channel-templates"],
      maxConcurrentChannels: 8,
    },
    skills: [
      { id: "notify", name: "Notify", tier: "core", description: "Send structured notifications" },
      { id: "webhook-deliver", name: "Webhook Deliver", tier: "specialist", description: "Signed webhook fanout" },
    ],
  },
  {
    id: "metatron",
    displayName: "Metatron Quinn",
    roleTitle: "LLM Router & Gateway",
    specialty: ["Model routing", "Consensus", "Cost control"],
    bio: "Routes prompts across local and cloud models, runs consensus checks, and sanitizes untrusted templates.",
    education: [
      "Heuristic classifier + gateway",
      "Fine-tune: route classification",
      "Corpus: model capability matrix",
    ],
    training: {
      baseModel: "heuristic-classifier",
      fineTunes: ["route-v2"],
      corpora: ["model-cards"],
    },
    jurisdictions: ["System"],
    status: "active",
    avatarColor: "#a78bfa",
    loadout: {
      primary: "route-llm",
      secondary: ["consensus"],
      tools: ["model-gateway"],
      knowledgePacks: ["provider-matrix"],
      maxConcurrentChannels: 10,
    },
    skills: [
      { id: "route-llm", name: "Route LLM", tier: "core", description: "Pick model by task type" },
      { id: "consensus", name: "Consensus", tier: "specialist", description: "Multi-model agreement check" },
    ],
  },
  {
    id: "seraphim",
    displayName: "Dwayne Okonkwo",
    roleTitle: "Strategic Research Oracle",
    specialty: ["Deep research", "Cloud reasoning", "Comparative analysis"],
    bio: "Heavy reasoning tier for long-form research briefs. Cites when grounded; marks unverified claims. Not licensed counsel.",
    education: [
      "Cloud / OpenRouter Hermes-class",
      "Fine-tune: research brief structure",
      "Corpus: public law digests (jurisdiction-tagged)",
    ],
    training: {
      baseModel: "Qwen / Hermes cloud pool",
      fineTunes: ["research-brief-v1"],
      corpora: ["statute-digests", "procedure-outlines"],
      lastTuned: "2026-11",
    },
    jurisdictions: ["Federal", "State (prompt required)"],
    status: "idle",
    avatarColor: "#38bdf8",
    freeConsultStyle: true,
    offersLive: true,
    loadout: {
      primary: "deep-research",
      secondary: ["compare-authorities"],
      tools: ["rag", "web-ground"],
      knowledgePacks: ["public-law"],
      maxConcurrentChannels: 3,
    },
    skills: [
      { id: "deep-research", name: "Deep Research", tier: "core", description: "Long-form grounded research" },
      { id: "compare-authorities", name: "Compare Authorities", tier: "specialist", description: "Side-by-side rule comparison" },
    ],
  },
  {
    id: "cipher",
    displayName: "Cipher Lane",
    roleTitle: "Web3 & Crypto Counsel Agent",
    specialty: ["Wallet-scoped ops", "On-chain reads", "Token/NFT context", "Crypto compliance education"],
    bio: "Educational agent for crypto and web3 context: wallet-linked notes, chain reads, and plain-English explainers. Does not execute trades, sign transactions, or give investment or legal advice.",
    education: [
      "Base: instruct model + tool adapters",
      "Fine-tune: web3 explainer dialogues",
      "Corpus: public chain docs, token standards summaries",
    ],
    training: {
      baseModel: "instruct + web3 tools",
      fineTunes: ["web3-explainer-v1"],
      corpora: ["eip-summaries", "wallet-safety-checklists"],
      lastTuned: "2026-11",
    },
    jurisdictions: ["Educational / multi-chain"],
    status: "active",
    avatarColor: "#f97316",
    freeConsultStyle: true,
    offersLive: false,
    loadout: {
      primary: "explain-tx",
      secondary: ["read-chain", "wallet-checklist"],
      tools: ["rpc-read", "address-book"],
      knowledgePacks: ["eip", "wallet-safety"],
      maxConcurrentChannels: 2,
    },
    skills: [
      { id: "explain-tx", name: "Explain Tx", tier: "core", description: "Plain-English transaction explainer" },
      { id: "read-chain", name: "Read Chain", tier: "specialist", description: "Read-only RPC lookups" },
      { id: "wallet-checklist", name: "Wallet Checklist", tier: "core", description: "Safety checklist (no signing)" },
    ],
    web3: {
      enabled: true,
      walletScoped: true,
      chains: ["ethereum", "base", "polygon"],
      skills: ["explain-tx", "read-chain", "wallet-checklist"],
    },
  },
];

/** In-memory session state for same-origin Wire (no :3100). */
export type WireMessage = {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatarColor: string;
  text: string;
  timestamp: string;
  isOutgoing: boolean;
};

const g = globalThis as unknown as {
  __cocWireMessages?: WireMessage[];
  __cocRetainedCounsel?: string[];
};

if (!g.__cocWireMessages) {
  g.__cocWireMessages = [
    {
      id: "msg-001",
      chatId: "general-swarm",
      senderId: "yhwh",
      senderName: "Ann Vale",
      senderAvatarColor: "#818cf8",
      text: "Counsel Lab online. Retain specialists from the Directory, then add them to channels or open a private consultation. Outputs are legal information only — not legal advice.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOutgoing: false,
    },
  ];
}

if (!g.__cocRetainedCounsel) {
  g.__cocRetainedCounsel = ["yhwh", "michael", "raphael"];
}

export function listMessages(chatId?: string): WireMessage[] {
  const all = g.__cocWireMessages ?? [];
  return chatId ? all.filter((m) => m.chatId === chatId) : all;
}

export function appendMessage(msg: Omit<WireMessage, "id" | "timestamp"> & { id?: string; timestamp?: string }): WireMessage {
  const full: WireMessage = {
    id: msg.id ?? `msg-${Date.now()}`,
    timestamp: msg.timestamp ?? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    chatId: msg.chatId,
    senderId: msg.senderId,
    senderName: msg.senderName,
    senderAvatarColor: msg.senderAvatarColor,
    text: msg.text,
    isOutgoing: msg.isOutgoing,
  };
  g.__cocWireMessages = [...(g.__cocWireMessages ?? []), full];
  return full;
}

export function listRetained(): string[] {
  return [...(g.__cocRetainedCounsel ?? [])];
}

export function retainCounsel(id: string): string[] {
  const set = new Set(g.__cocRetainedCounsel ?? []);
  set.add(id);
  g.__cocRetainedCounsel = [...set];
  return listRetained();
}

export function releaseCounsel(id: string): string[] {
  g.__cocRetainedCounsel = (g.__cocRetainedCounsel ?? []).filter((x) => x !== id);
  return listRetained();
}
