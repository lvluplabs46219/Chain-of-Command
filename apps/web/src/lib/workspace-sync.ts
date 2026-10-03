/**
 * Chain of Command - Firestore & LocalStorage Synchronization Service
 * Handles persistence for active matters, timeline events, evidence, and agent settings.
 */

import { db, auth, OperationType, handleFirestoreError } from "./firebase";
import { collection, doc, getDocs, setDoc, query, where, orderBy, getDocFromServer } from "firebase/firestore";
import { Matter, TimelineRecord, INITIAL_TIMELINE_RECORDS, EvidenceRecord, INITIAL_EVIDENCE_RECORDS, SpecialistAgent, SPECIALIST_AGENTS_ROSTER } from "./workspace-data";
import api from "./api";

const LOCAL_STORAGE_KEY_PREFIX = "chain_of_command_";

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`);
    return item ? JSON.parse(item) : fallback;
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

function normalizeApiMatter(m: any): Matter {
  return {
    id: String(m.id),
    title: m.title || "Untitled matter",
    caseNumber: m.caseNumber || "",
    courtName: m.courtName || "",
    jurisdiction: m.jurisdiction || "",
    judge: m.judge || "",
    prosecutor: m.prosecutor || "",
    defenseStatus: m.defenseStatus || "Self-Represented (Pro Se)",
    charges: Array.isArray(m.charges) ? m.charges : [],
    status: (m.status as Matter["status"]) || "active",
    nextCourtDate: m.nextCourtDate || "",
    nextCourtType: m.nextCourtType || "",
    speedyTrialDeadline: m.speedyTrialDeadline || "",
    createdAt: m.createdAt
      ? String(m.createdAt).slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    summary: m.summary || m.description || "",
  };
}

export async function loadMatters(): Promise<Matter[]> {
  const localMatters = getLocal<Matter[]>("matters", [] as Matter[]);

  // Prefer Chain of Command API (Supabase-backed) when reachable
  try {
    const res = await api.matters.getAll();
    if (res?.success && Array.isArray(res.matters)) {
      const mapped = res.matters.map(normalizeApiMatter);
      setLocal("matters", mapped);
      return mapped;
    }
  } catch (err) {
    console.warn("API loadMatters failed, trying local/Firestore fallback:", err);
  }

  if (!auth.currentUser) {
    return localMatters;
  }

  try {
    const mattersRef = collection(db, "matters");
    const q = query(mattersRef, where("userId", "==", auth.currentUser.uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return localMatters;
    }

    const remoteMatters: Matter[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      remoteMatters.push({
        ...data,
        id: docSnap.id,
      } as Matter);
    });
    setLocal("matters", remoteMatters);
    return remoteMatters;
  } catch (error) {
    console.warn("Firestore loadMatters fallback to local cache:", error);
    return localMatters;
  }
}

export async function saveMatter(matter: Matter): Promise<Matter> {
  const current = getLocal<Matter[]>("matters", [] as Matter[]);
  const index = current.findIndex((m) => m.id === matter.id);
  if (index >= 0) {
    current[index] = matter;
  } else {
    current.push(matter);
  }
  setLocal("matters", current);

  // Prefer API persistence (real UUID ids). Client-generated matter-* ids → create.
  try {
    const isClientId = !matter.id || matter.id.startsWith("matter-");
    if (isClientId) {
      const res = await api.matters.create({
        title: matter.title,
        caseNumber: matter.caseNumber,
        courtName: matter.courtName,
        jurisdiction: matter.jurisdiction,
        summary: matter.summary,
        status: matter.status,
      });
      if (res?.success && res.matter) {
        const saved = normalizeApiMatter({ ...matter, ...res.matter });
        const withoutOld = current.filter((m) => m.id !== matter.id);
        withoutOld.push(saved);
        setLocal("matters", withoutOld);
        return saved;
      }
    } else {
      const res = await api.matters.update(matter.id, {
        title: matter.title,
        caseNumber: matter.caseNumber,
        courtName: matter.courtName,
        jurisdiction: matter.jurisdiction,
        summary: matter.summary,
        status: matter.status,
      });
      if (res?.success && res.matter) {
        const saved = normalizeApiMatter({ ...matter, ...res.matter });
        const idx = current.findIndex((m) => m.id === matter.id);
        if (idx >= 0) current[idx] = saved;
        else current.push(saved);
        setLocal("matters", current);
        return saved;
      }
    }
  } catch (err) {
    console.warn("API saveMatter failed, keeping local cache:", err);
  }

  if (!auth.currentUser) return matter;

  try {
    const docRef = doc(db, "matters", matter.id);
    await setDoc(
      docRef,
      {
        title: matter.title.slice(0, 200),
        userId: auth.currentUser.uid,
        status: matter.status,
        jurisdiction: (matter.jurisdiction || "").slice(0, 100),
        courtName: (matter.courtName || "").slice(0, 200),
        caseNumber: (matter.caseNumber || "").slice(0, 100),
        description: (matter.summary || "").slice(0, 2000),
        updatedAt: new Date().toISOString(),
        createdAt: matter.createdAt || new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn("Firestore saveMatter error, cached locally:", error);
  }
  return matter;
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
