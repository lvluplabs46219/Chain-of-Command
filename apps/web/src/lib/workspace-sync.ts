/**
 * Chain of Command — local workspace persistence (ADR-001).
 * Firebase/Firestore removed: matters/timeline/evidence stay in localStorage
 * until the Supabase matter API is the sole remote store.
 */

import {
  Matter,
  INITIAL_MATTERS,
  TimelineRecord,
  INITIAL_TIMELINE_RECORDS,
  EvidenceRecord,
  INITIAL_EVIDENCE_RECORDS,
  SpecialistAgent,
  SPECIALIST_AGENTS_ROSTER,
} from "./workspace-data";

const LOCAL_STORAGE_KEY_PREFIX = "chain_of_command_";

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`, JSON.stringify(value));
  } catch (err) {
    console.warn("Local storage write failed:", err);
  }
}

export async function loadMatters(): Promise<Matter[]> {
  return getLocal<Matter[]>("matters", INITIAL_MATTERS);
}

export async function saveMatter(matter: Matter): Promise<void> {
  const current = getLocal<Matter[]>("matters", INITIAL_MATTERS);
  const index = current.findIndex((m) => m.id === matter.id);
  if (index >= 0) {
    current[index] = matter;
  } else {
    current.push(matter);
  }
  setLocal("matters", current);
}

export function loadAgents(): SpecialistAgent[] {
  return getLocal<SpecialistAgent[]>("agents", SPECIALIST_AGENTS_ROSTER);
}

export function saveAgents(agents: SpecialistAgent[]): void {
  setLocal("agents", agents);
}

export function loadTimeline(matterId: string): TimelineRecord[] {
  const all = getLocal<TimelineRecord[]>("timeline", INITIAL_TIMELINE_RECORDS);
  return all.filter((r) => r.matterId === matterId || !r.matterId);
}

export function saveTimelineRecord(record: TimelineRecord): void {
  const all = getLocal<TimelineRecord[]>("timeline", INITIAL_TIMELINE_RECORDS);
  const idx = all.findIndex((r) => r.id === record.id);
  if (idx >= 0) {
    all[idx] = record;
  } else {
    all.push(record);
  }
  setLocal("timeline", all);
}

export function loadEvidence(matterId: string): EvidenceRecord[] {
  const all = getLocal<EvidenceRecord[]>("evidence", INITIAL_EVIDENCE_RECORDS);
  return all.filter((e) => e.matterId === matterId || !e.matterId);
}

export function saveEvidenceRecord(record: EvidenceRecord): void {
  const all = getLocal<EvidenceRecord[]>("evidence", INITIAL_EVIDENCE_RECORDS);
  const idx = all.findIndex((e) => e.id === record.id);
  if (idx >= 0) {
    all[idx] = record;
  } else {
    all.push(record);
  }
  setLocal("evidence", all);
}
