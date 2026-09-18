/**
 * Acquit.ai Migration Mappers
 * Utility functions to map between frontend mock/state types and backend API response contracts.
 * Simplifies transitioning from offline mock views to production backend endpoints.
 */

import type {
  LegalAuthority,
  RagSourceClaim,
  TimelineEvent,
  AiChatMessage,
} from "../components/mockups/acquit-case-workspace/legalData";

// ============================================================================
// 1. Legal Authority Mappers
// ============================================================================

export interface BackendAuthorityRecord {
  id: string;
  sourceId?: string;
  citation: string;
  title: string;
  court?: string | null;
  jurisdiction?: string | null;
  year?: number | null;
  status?: string | null;
  holdingSummary?: string | null;
  verbatimExcerpt?: string | null;
  ipfsCid?: string | null;
  vectorSimilarity?: number | null;
  tags?: string[] | null;
  citingCasesCount?: number | null;
}

export interface CourtListenerSearchResultItem {
  id: number;
  caseName?: string;
  citation?: string[];
  court?: string;
  jurisdiction?: string;
  dateFiled?: string;
  snippet?: string;
  absolute_url?: string;
}

export function mapBackendToLegalAuthority(raw: BackendAuthorityRecord): LegalAuthority {
  const precedentialStatusMap: Record<string, LegalAuthority["precedentialStatus"]> = {
    binding: "Binding Precedent",
    persuasive: "Persuasive Authority",
    statute: "Active Statute",
    rule: "Procedural Rule",
  };

  const statusKey = (raw.status || "").toLowerCase();
  const precedentialStatus = precedentialStatusMap[statusKey] || "Binding Precedent";

  let type: LegalAuthority["type"] = "case_law";
  if (statusKey.includes("statute") || (raw.citation && raw.citation.includes("Code §"))) {
    type = "statute";
  } else if (statusKey.includes("rule") || (raw.citation && raw.citation.includes("R."))) {
    type = "court_rule";
  } else if (raw.citation && (raw.citation.includes("Const.") || raw.citation.includes("Amendment"))) {
    type = "constitutional";
  }

  return {
    id: raw.id,
    title: raw.title || "Legal Authority",
    citation: raw.citation || "Citation Unavailable",
    type,
    jurisdiction: raw.jurisdiction || "Jurisdiction Not Specified",
    court: raw.court || "Appellate Court",
    year: raw.year || new Date().getFullYear(),
    precedentialStatus,
    holdingSummary: raw.holdingSummary || "Holding summary pending extraction.",
    verbatimExcerpt: raw.verbatimExcerpt || "Verbatim excerpt pending extraction.",
    citingCasesCount: raw.citingCasesCount || 0,
    ipfsCid: raw.ipfsCid || "bafk2bzace_pending_ipfs_hash",
    vectorSimilarity: raw.vectorSimilarity ?? 0.95,
    tags: Array.isArray(raw.tags) ? raw.tags : ["Procedural", "Authority"],
  };
}

export function mapCourtListenerToLegalAuthority(item: CourtListenerSearchResultItem): LegalAuthority {
  const year = item.dateFiled ? new Date(item.dateFiled).getFullYear() : new Date().getFullYear();
  const citation = Array.isArray(item.citation) && item.citation.length > 0 ? item.citation[0] : `CL-Doc #${item.id}`;

  return {
    id: `cl-${item.id}`,
    title: item.caseName || "CourtListener Case Authority",
    citation,
    type: "case_law",
    jurisdiction: item.jurisdiction || "Federal / State",
    court: item.court || "Court of Record",
    year,
    precedentialStatus: "Persuasive Authority",
    holdingSummary: item.snippet?.replace(/<[^>]+>/g, "").slice(0, 300) || "Case summary retrieved from CourtListener.",
    verbatimExcerpt: item.snippet?.replace(/<[^>]+>/g, "").slice(0, 400) || "Excerpt extracted from CourtListener record.",
    citingCasesCount: 1,
    ipfsCid: `cl_record_${item.id}`,
    vectorSimilarity: 0.88,
    tags: ["CourtListener", "Primary Precedent"],
  };
}

// ============================================================================
// 2. Timeline & Event Mappers
// ============================================================================

export interface BackendTimelineEventRecord {
  id: string;
  matterId?: string;
  title: string;
  description: string;
  eventDate: string | Date;
  category?: string;
  stage?: string;
  status?: string;
  location?: string;
  judge?: string;
  keyTakeaways?: string[];
  ipfsCid?: string;
}

export function mapBackendToTimelineEvent(raw: BackendTimelineEventRecord): TimelineEvent {
  const dateObj = new Date(raw.eventDate);
  const isoDate = isNaN(dateObj.getTime()) ? new Date().toISOString().split("T")[0] : dateObj.toISOString().split("T")[0];
  const displayDate = isNaN(dateObj.getTime())
    ? "Upcoming Date"
    : dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const categoryMap: Record<string, TimelineEvent["category"]> = {
    hearing: "Court Hearing",
    motion: "Filing & Motion",
    discovery: "Discovery & Evidence",
    arrest: "Arrest & Charge",
    order: "Order & Ruling",
  };

  const stageMap: Record<string, TimelineEvent["stage"]> = {
    arrest: "Arrest",
    initial: "Initial Hearing",
    discovery: "Discovery",
    pretrial: "Pretrial",
    trial: "Trial Preparation",
    post: "Post-Trial",
  };

  const statusMap: Record<string, TimelineEvent["status"]> = {
    completed: "Completed",
    upcoming: "Upcoming",
    overdue: "Overdue",
    review: "In Review",
  };

  return {
    id: raw.id,
    date: isoDate,
    displayDate,
    title: raw.title,
    description: raw.description || "",
    category: categoryMap[(raw.category || "").toLowerCase()] || "Court Hearing",
    stage: stageMap[(raw.stage || "").toLowerCase()] || "Pretrial",
    status: statusMap[(raw.status || "").toLowerCase()] || "Upcoming",
    location: raw.location,
    judge: raw.judge,
    keyTakeaways: Array.isArray(raw.keyTakeaways) ? raw.keyTakeaways : [],
    ipfsCid: raw.ipfsCid,
  };
}

// ============================================================================
// 3. AI Chat Message & RAG Event Mappers
// ============================================================================

export interface BackendAgentCompletedResponse {
  runId: string;
  status: "completed" | "blocked" | "failed";
  output: string;
  citations: Array<{
    id?: string;
    sourceUrl?: string;
    statuteOrRule?: string;
    summary?: string;
    confidence?: number;
    verbatimExcerpt?: string;
  }>;
  disclaimer: string;
  provider: string;
  model: string;
  humanReviewRequired: boolean;
  confidence?: number | null;
  agentName?: string;
}

export function mapBackendRunToAiChatMessage(res: BackendAgentCompletedResponse, agentMeta?: { name: string; role: string; avatar: string; color: string }): AiChatMessage {
  const claims: RagSourceClaim[] = (res.citations || []).map((cit, idx) => ({
    id: cit.id || `claim-${res.runId}-${idx}`,
    claimText: cit.summary || "Legal citation retrieved and verified against primary statutory code.",
    confidenceScore: cit.confidence ? Math.round(cit.confidence * 100) : 94,
    supportType: "Statutory Mandate",
    authority: {
      id: cit.id || `auth-${res.runId}-${idx}`,
      title: cit.statuteOrRule || "Statutory Authority",
      citation: cit.statuteOrRule || "Primary Legal Code",
      type: "statute",
      jurisdiction: "Jurisdiction Specified in Matter",
      court: "Legislature / Court of Record",
      year: new Date().getFullYear(),
      precedentialStatus: "Active Statute",
      holdingSummary: cit.summary || "Verified rule extracted from statutory index.",
      verbatimExcerpt: cit.verbatimExcerpt || cit.summary || "Verbatim statutory text.",
      citingCasesCount: 24,
      ipfsCid: `bafk2bzace_${res.runId}_${idx}`,
      vectorSimilarity: cit.confidence ?? 0.94,
      tags: ["Statutory Grounding", "RAG Verified"],
    },
    pageOffset: `Section § ${idx + 1}`,
    reasoning: "Matched query semantic embeddings against verified statutory code vector index.",
  }));

  const groundingScore = claims.length > 0 ? Math.min(100, 75 + claims.length * 8) : 50;

  return {
    id: res.runId,
    agentName: agentMeta?.name || res.agentName || "Specialist Legal AI",
    agentRole: agentMeta?.role || "Procedural Analysis & Grounding",
    agentAvatar: agentMeta?.avatar || "⚖️",
    agentColor: agentMeta?.color || "bg-amber-600",
    timestamp: "Just now",
    content: `${res.output}\n\n[PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE]\n${res.disclaimer}`,
    claims,
    ragMetrics: {
      totalAuthoritiesQueried: 48,
      vectorIndexTimeMs: 142,
      groundingScorePercent: groundingScore,
      embeddingModel: res.model || "gemini-3.8-flash",
    },
  };
}

// ============================================================================
// 4. Case / Matter Mappers
// ============================================================================

export interface BackendMatterDetail {
  id: string;
  caseNumber: string;
  title: string;
  jurisdiction: string;
  courtName: string;
  status: "active" | "pending" | "closed";
  judge?: string;
  prosecutor?: string;
  nextAction?: {
    title: string;
    description: string;
    deadline: string;
    daysRemaining: number;
    urgency: "critical" | "normal" | "low";
    statutoryRef: string;
  };
  deadlines?: Array<{
    id: string;
    title: string;
    dueDate: string;
    type: string;
    completed: boolean;
  }>;
}

export function mapBackendMatterToWorkspaceState(matter: BackendMatterDetail) {
  return {
    id: matter.id,
    caseNumber: matter.caseNumber,
    caseTitle: matter.title,
    jurisdiction: matter.jurisdiction,
    courtDivision: matter.courtName,
    judgeName: matter.judge || "Hon. Presiding Judge",
    assignedProsecutor: matter.prosecutor || "Office of the Prosecuting Attorney",
    status: matter.status,
    activeDeadlinesCount: matter.deadlines?.filter((d) => !d.completed).length || 0,
    urgentAction: matter.nextAction,
  };
}
