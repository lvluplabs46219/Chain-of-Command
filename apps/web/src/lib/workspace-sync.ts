/**
 * Chain of Command - Firestore & LocalStorage Synchronization Service
 * Handles persistence for active matters, timeline events, evidence, and agent settings.
 */

import { db, auth, OperationType, handleFirestoreError } from "./firebase";
import { collection, doc, getDocs, setDoc, query, where, orderBy, getDocFromServer } from "firebase/firestore";
import { Matter, INITIAL_MATTERS, TimelineRecord, INITIAL_TIMELINE_RECORDS, EvidenceRecord, INITIAL_EVIDENCE_RECORDS, SpecialistAgent, SPECIALIST_AGENTS_ROSTER } from "./workspace-data";

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

export async function loadMatters(): Promise<Matter[]> {
  const localMatters = getLocal<Matter[]>("matters", INITIAL_MATTERS);
  
  if (!auth.currentUser) {
    return localMatters;
  }

  try {
    const mattersRef = collection(db, "matters");
    const q = query(mattersRef, where("userId", "==", auth.currentUser.uid));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Seed initial matter to Firestore for the user
      for (const m of localMatters) {
        await saveMatter(m);
      }
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

export async function saveMatter(matter: Matter): Promise<void> {
  const current = getLocal<Matter[]>("matters", INITIAL_MATTERS);
  const index = current.findIndex((m) => m.id === matter.id);
  if (index >= 0) {
    current[index] = matter;
  } else {
    current.push(matter);
  }
  setLocal("matters", current);

  if (!auth.currentUser) return;

  try {
    const docRef = doc(db, "matters", matter.id);
    await setDoc(docRef, {
      title: matter.title.slice(0, 200),
      userId: auth.currentUser.uid,
      status: matter.status,
      jurisdiction: matter.jurisdiction.slice(0, 100),
      courtName: matter.courtName.slice(0, 200),
      caseNumber: matter.caseNumber.slice(0, 100),
      description: matter.summary.slice(0, 2000),
      updatedAt: new Date().toISOString(),
      createdAt: matter.createdAt || new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.warn("Firestore saveMatter error, cached locally:", error);
  }
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
