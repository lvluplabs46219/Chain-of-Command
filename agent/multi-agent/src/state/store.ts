// State persistence: local SQLite cache, optional Supabase sync.
// No credentials in code — SUPABASE_URL / SUPABASE_SERVICE_KEY come from env.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { log } from "../protocol/types.js";

const dbPath = (): string => {
  const raw = process.env.STATE_DB ?? path.join(os.homedir(), ".local/state/coc/state.db");
  const p = raw.startsWith("~") ? path.join(os.homedir(), raw.slice(1)) : raw;
  fs.mkdirSync(path.dirname(p), { recursive: true });
  return p;
};

interface MemoryTask {
  id: string;
  kind: string;
  state: string;
  payload?: unknown;
  output?: unknown;
  error?: string;
  created_at: string;
  updated_at: string;
}

interface MemoryEvent {
  id: string;
  topic: string;
  data: string;
  created_at: string;
}

export class StateStore {
  private tasks = new Map<string, MemoryTask>();
  private events: MemoryEvent[] = [];
  private sqliteDb: any = null;

  constructor() {
    try {
      // Dynamic import to allow optional sqlite3 if installed
      const Database = (require as any)("better-sqlite3");
      this.sqliteDb = new Database(dbPath());
      this.sqliteDb.pragma("journal_mode = WAL");
      this.sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          kind TEXT NOT NULL,
          state TEXT NOT NULL,
          payload TEXT,
          output TEXT,
          error TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY,
          topic TEXT NOT NULL,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);
    } catch {
      // Memory fallback if native sqlite addon is not present
      this.sqliteDb = null;
    }
  }

  upsertTask(t: { id: string; kind: string; state: string; payload?: unknown }) {
    const now = new Date().toISOString();
    if (this.sqliteDb) {
      try {
        this.sqliteDb.prepare(`
          INSERT INTO tasks (id, kind, state, payload, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET state = excluded.state, updated_at = excluded.updated_at
        `).run(t.id, t.kind, t.state, JSON.stringify(t.payload ?? null), now, now);
      } catch (err) {
        log("warn", "michael", "sqlite_upsert_failed", { error: String(err) });
      }
    }
    this.tasks.set(t.id, {
      ...t,
      created_at: this.tasks.get(t.id)?.created_at ?? now,
      updated_at: now,
    });
    void this.syncSupabase("tasks", { ...t, updatedAt: now });
  }

  completeTask(id: string, state: string, output?: unknown, error?: string) {
    const now = new Date().toISOString();
    if (this.sqliteDb) {
      try {
        this.sqliteDb.prepare("UPDATE tasks SET state=?, output=?, error=?, updated_at=? WHERE id=?")
          .run(state, JSON.stringify(output ?? null), error ?? null, now, id);
      } catch (err) {
        log("warn", "michael", "sqlite_update_failed", { error: String(err) });
      }
    }
    const existing = this.tasks.get(id);
    if (existing) {
      existing.state = state;
      existing.output = output;
      existing.error = error;
      existing.updated_at = now;
    }
    void this.syncSupabase("tasks", { id, state, output, error, updatedAt: now });
  }

  appendEvent(topic: string, data: Record<string, unknown>) {
    const id = globalThis.crypto.randomUUID();
    const now = new Date().toISOString();
    const serialized = JSON.stringify(data);
    if (this.sqliteDb) {
      try {
        this.sqliteDb.prepare("INSERT INTO events (id, topic, data, created_at) VALUES (?,?,?,?)")
          .run(id, topic, serialized, now);
      } catch (err) {
        log("warn", "michael", "sqlite_event_failed", { error: String(err) });
      }
    }
    this.events.push({ id, topic, data: serialized, created_at: now });
    void this.syncSupabase("events", { id, topic, data, createdAt: now });
  }

  /** Fire-and-forget sync; failures never break the local path. */
  private async syncSupabase(table: string, row: Record<string, unknown>) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) return;
    try {
      await fetch(`${url}/rest/v1/${table}`, {
        method: "POST",
        headers: {
          "apikey": key,
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates",
        },
        body: JSON.stringify(row),
      });
    } catch (e) {
      log("warn", "michael", "supabase_sync_failed", { table, error: String(e) });
    }
  }
}
