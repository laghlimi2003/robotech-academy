/**
 * Cloud sync layer (Phase 3).
 *
 * Write-through design: localStorage stays the synchronous source every
 * component reads from (so no React interfaces changed), while this module
 * mirrors data to Supabase in the background:
 *
 *  - PULL on startup: cloud content → localStorage caches, then notify.
 *  - PUSH on write: stores call `cloudPush(...)` after a local persist.
 *    Failed pushes are queued in localStorage and retried when back online.
 *  - MIGRATE on first run: when the cloud is empty and local data exists,
 *    the first authenticated admin session uploads the local content.
 */
import { supabase, isOnline } from "./supabaseClient";

// Same value as siteStore's SETTINGS_EVENT (kept literal to avoid a circular import).
const SETTINGS_EVENT = "robotech-settings-changed";

/** Fired on window after a cloud pull changed local data. */
export const CLOUD_EVENT = "robotech-cloud-updated";

const QUEUE_KEY = "robotech_sync_queue_v1";
const MIGRATED_KEY = "robotech_supabase_migrated_v1";

/* localStorage keys mirrored to the cloud */
const LABS_KEY = "robotech_cms_labs_v1";
const DELETED_KEYS = "robotech_cms_deleted_keys_v1";
const NEWS_KEY = "robotech_cms_news_v1";
const SETTINGS_KEY = "robotech_cms_settings_v1";
const XP_KEY = "robotech_cms_xp_v1";
const PROFILES_KEY = "robotech_gam_profiles_v2";
const GAM_KEY = "robotech_gam_v2";
const PROGRESS_BASE = "robotech_progress_v3";

type PushKind =
  | "labs"            // payload: full LabConfig[]
  | "deletedKey"      // payload: string
  | "news"            // payload: full NewsItem[]
  | "settings"        // payload: SiteSettings
  | "xp"              // payload: XpOverrides
  | "progress"        // payload: { email, data }
  | "gamState"        // payload: { email, data }
  | "gamProfile";     // payload: { email, entry }

interface QueueEntry { k: string; kind: PushKind; payload: unknown }

function readJson<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? "") as T; } catch { return fallback; }
}
function writeJson(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota — cloud copy still exists */ }
}

/* ── Queue ─────────────────────────────────────────────────── */

function loadQueue(): QueueEntry[] { return readJson<QueueEntry[]>(QUEUE_KEY, []); }
function saveQueue(q: QueueEntry[]) { writeJson(QUEUE_KEY, q); }

function enqueue(kind: PushKind, payload: unknown, dedupeKey?: string) {
  const k = dedupeKey ?? kind;
  const q = loadQueue().filter(e => e.k !== k);
  q.push({ k, kind, payload });
  saveQueue(q);
}

let flushing = false;
let flushAgain = false;
async function flushQueue() {
  if (!supabase || !isOnline()) return;
  if (flushing) { flushAgain = true; return; }
  flushing = true;
  try {
    for (;;) {
      const q = loadQueue();
      if (!q.length) break;
      const entry = q[0];
      const ok = await pushEntry(entry);
      if (!ok) break; // stay queued; retry on next flush
      // remove the processed entry (a newer write may have replaced it — match by key)
      const cur = loadQueue();
      const idx = cur.findIndex(e => e.k === entry.k && JSON.stringify(e.payload) === JSON.stringify(entry.payload));
      if (idx !== -1) { cur.splice(idx, 1); saveQueue(cur); }
      else if (cur.length && cur[0].k === entry.k) { flushAgain = true; break; } // replaced by a newer payload mid-flight
    }
  } finally {
    flushing = false;
    if (flushAgain) { flushAgain = false; void flushQueue(); }
  }
}

async function pushEntry(e: QueueEntry): Promise<boolean> {
  if (!supabase) return false;
  try {
    switch (e.kind) {
      case "labs": {
        const list = e.payload as Array<{ key: string; order?: number }>;
        const rows = list.map(l => ({ key: l.key, data: l, ord: l.order ?? 0, updated_at: new Date().toISOString() }));
        if (rows.length) {
          const { error } = await supabase.from("labs").upsert(rows);
          if (error) throw error;
        }
        const keys = list.map(l => l.key);
        const del = supabase.from("labs").delete();
        const { error: derr } = keys.length
          ? await del.not("key", "in", `(${keys.map(k => `"${k}"`).join(",")})`)
          : await del.neq("key", "");
        if (derr) throw derr;
        return true;
      }
      case "deletedKey": {
        const { error } = await supabase.from("deleted_lab_keys").upsert({ key: e.payload as string });
        if (error) throw error;
        return true;
      }
      case "news": {
        const list = e.payload as Array<{ id: string }>;
        if (list.length) {
          const rows = list.map(n => ({ id: n.id, data: n, updated_at: new Date().toISOString() }));
          const { error } = await supabase.from("news").upsert(rows);
          if (error) throw error;
        }
        const ids = list.map(n => n.id);
        const del = supabase.from("news").delete();
        const { error: derr } = ids.length
          ? await del.not("id", "in", `(${ids.map(i => `"${i}"`).join(",")})`)
          : await del.neq("id", "");
        if (derr) throw derr;
        return true;
      }
      case "settings": {
        const { error } = await supabase.from("site_kv").upsert({ key: "settings", data: e.payload, updated_at: new Date().toISOString() });
        if (error) throw error;
        return true;
      }
      case "xp": {
        const { error } = await supabase.from("site_kv").upsert({ key: "xp", data: e.payload, updated_at: new Date().toISOString() });
        if (error) throw error;
        return true;
      }
      case "progress": {
        const { email, data } = e.payload as { email: string; data: unknown };
        const { error } = await supabase.from("user_state").upsert({ email, key: "progress", data, updated_at: new Date().toISOString() });
        if (error) throw error;
        return true;
      }
      case "gamState": {
        const { email, data } = e.payload as { email: string; data: unknown };
        const { error } = await supabase.from("user_state").upsert({ email, key: "gam", data, updated_at: new Date().toISOString() });
        if (error) throw error;
        return true;
      }
      case "gamProfile": {
        const { email, entry } = e.payload as { email: string; entry: unknown };
        if (email.startsWith("_demo_")) return true; // demo rows stay local
        const { error } = await supabase.from("gam_profiles").upsert({ email, data: entry, updated_at: new Date().toISOString() });
        if (error) throw error;
        return true;
      }
    }
  } catch {
    return false; // offline or RLS-denied (not signed in yet) — retry later
  }
  return false;
}

/**
 * Public push entry point. Fire-and-forget: enqueues (latest wins per key)
 * and tries to flush immediately. Stores stay fully synchronous.
 */
export function cloudPush(kind: PushKind, payload: unknown, dedupeKey?: string) {
  if (!supabase) return;
  enqueue(kind, payload, dedupeKey);
  void flushQueue();
}

/* ── Pull ──────────────────────────────────────────────────── */

async function pullPublicContent(): Promise<boolean> {
  if (!supabase) return false;
  // Unpushed local edits win: never let a pull clobber content still in the queue.
  if (loadQueue().length) { void flushQueue(); return false; }
  let changed = false;
  const [labs, deleted, news, kv, profiles] = await Promise.all([
    supabase.from("labs").select("data").order("ord"),
    supabase.from("deleted_lab_keys").select("key"),
    supabase.from("news").select("data"),
    supabase.from("site_kv").select("key,data"),
    supabase.from("gam_profiles").select("email,data"),
  ]);

  if (!labs.error && labs.data && labs.data.length) {
    const next = labs.data.map(r => r.data);
    if (JSON.stringify(next) !== localStorage.getItem(LABS_KEY)) { writeJson(LABS_KEY, next); changed = true; }
  }
  if (!deleted.error && deleted.data && deleted.data.length) {
    const local = readJson<string[]>(DELETED_KEYS, []);
    const merged = [...new Set([...local, ...deleted.data.map(r => r.key)])];
    if (merged.length !== local.length) { writeJson(DELETED_KEYS, merged); changed = true; }
  }
  if (!news.error && news.data && news.data.length) {
    const next = news.data.map(r => r.data);
    if (JSON.stringify(next) !== localStorage.getItem(NEWS_KEY)) { writeJson(NEWS_KEY, next); changed = true; }
  }
  if (!kv.error && kv.data) {
    for (const row of kv.data) {
      const key = row.key === "settings" ? SETTINGS_KEY : row.key === "xp" ? XP_KEY : null;
      if (key && JSON.stringify(row.data) !== localStorage.getItem(key)) { writeJson(key, row.data); changed = true; }
    }
  }
  if (!profiles.error && profiles.data && profiles.data.length) {
    const local = readJson<Record<string, unknown>>(PROFILES_KEY, {});
    let touched = false;
    for (const row of profiles.data) {
      if (JSON.stringify(local[row.email]) !== JSON.stringify(row.data)) { local[row.email] = row.data; touched = true; }
    }
    if (touched) { writeJson(PROFILES_KEY, local); changed = true; }
  }
  return changed;
}

/** Pull the signed-in user's progress + gamification state from the cloud. */
export async function pullUserState(email: string): Promise<boolean> {
  if (!supabase || !email) return false;
  const norm = email.trim().toLowerCase();
  const { data, error } = await supabase.from("user_state").select("key,data").eq("email", norm);
  if (error || !data) return false;
  let changed = false;
  for (const row of data) {
    if (row.key === "progress") {
      const key = `${PROGRESS_BASE}:${norm}`;
      if (JSON.stringify(row.data) !== localStorage.getItem(key)) { writeJson(key, row.data); changed = true; }
    } else if (row.key === "gam") {
      const all = readJson<Record<string, unknown>>(GAM_KEY, {});
      if (JSON.stringify(all[norm]) !== JSON.stringify(row.data)) {
        all[norm] = row.data;
        writeJson(GAM_KEY, all);
        changed = true;
      }
    }
  }
  if (changed) window.dispatchEvent(new CustomEvent(CLOUD_EVENT));
  return changed;
}

/** Push the user's local progress + gam state (used right after login when cloud has none). */
export function pushUserState(email: string) {
  const norm = email.trim().toLowerCase();
  if (!norm) return;
  const progress = localStorage.getItem(`${PROGRESS_BASE}:${norm}`);
  if (progress) cloudPush("progress", { email: norm, data: JSON.parse(progress) }, `progress:${norm}`);
  const gam = readJson<Record<string, unknown>>(GAM_KEY, {})[norm];
  if (gam) cloudPush("gamState", { email: norm, data: gam }, `gam:${norm}`);
}

/* ── First-run migration (admin only — RLS requires it) ───── */

/**
 * Upload all local CMS content once, when the cloud is still empty.
 * Called after a successful ADMIN login (anonymous users cannot write
 * public content under RLS).
 */
export async function migrateLocalToCloud() {
  if (!supabase || localStorage.getItem(MIGRATED_KEY)) return;
  try {
    const { count, error } = await supabase.from("labs").select("key", { count: "exact", head: true });
    if (error) return;
    const localLabs = readJson<unknown[]>(LABS_KEY, []);
    if ((count ?? 0) === 0 && localLabs.length) cloudPush("labs", localLabs);
    const news = readJson<unknown[]>(NEWS_KEY, []);
    if (news.length) cloudPush("news", news);
    const settings = localStorage.getItem(SETTINGS_KEY);
    if (settings) cloudPush("settings", JSON.parse(settings));
    const xp = localStorage.getItem(XP_KEY);
    if (xp) cloudPush("xp", JSON.parse(xp));
    for (const key of readJson<string[]>(DELETED_KEYS, []))
      cloudPush("deletedKey", key, `del:${key}`);
    localStorage.setItem(MIGRATED_KEY, new Date().toISOString());
  } catch { /* retried on next admin login */ }
}

/* ── Init ──────────────────────────────────────────────────── */

let initialized = false;

/** Call once at app startup. Never throws; never blocks first render. */
export function initCloudSync() {
  if (initialized || !supabase) return;
  initialized = true;
  window.addEventListener("online", () => { void flushQueue(); });
  void (async () => {
    try {
      const changed = await pullPublicContent();
      if (changed) {
        window.dispatchEvent(new CustomEvent(SETTINGS_EVENT));
        window.dispatchEvent(new CustomEvent(CLOUD_EVENT));
      }
      // restore per-user state for a persisted session
      const { data } = await supabase.auth.getSession();
      const email = data.session?.user?.email;
      if (email) void pullUserState(email);
      void flushQueue();
    } catch { /* offline — localStorage carries the app */ }
  })();
}
