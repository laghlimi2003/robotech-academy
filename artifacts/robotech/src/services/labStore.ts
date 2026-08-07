/**
 * Lab content service (Phase 2B-1).
 *
 * Single source of truth for all CMS-managed learning content:
 * labs, lessons, videos, simulators, quizzes, and hero tasks.
 *
 * Storage backend: localStorage (seeded from the static defaults in
 * src/data/labs.ts on first run). Every read/write goes through this
 * module, so Phase 3 only has to replace `loadAll`/`persist` with API
 * calls — no UI changes needed.
 */
import type { LabConfig, Lesson, QuizQuestion, Localized } from "../data/labs";
import { cloudPush } from "./cloudSync";

const KEY = "robotech_cms_labs_v1";

let seedConfigs: Record<string, LabConfig> = {};
let cache: LabConfig[] | null = null;

/* ── backend (swap in Phase 3) ─────────────────────────────── */

function loadAll(): LabConfig[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LabConfig[];
      if (Array.isArray(parsed) && parsed.length) { cache = parsed; return parsed; }
    }
  } catch { /* corrupted → fall back to seed */ }
  cache = Object.values(seedConfigs).map((l, i) => ({ ...l, order: i, hidden: false, simEnabled: true }));
  return cache;
}

/** Returns false (and leaves the previous cache intact) when the write fails. */
function persist(list: LabConfig[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    cache = list;
    cloudPush("labs", list); // background mirror to Supabase (Phase 3)
    return true;
  } catch {
    return false; // storage full/unavailable — do NOT pretend it saved
  }
}

/** Phase 3: drop the in-memory cache after a cloud pull rewrote localStorage. */
export function invalidateLabCache() {
  cache = null;
}

const STORAGE_ERR = "تعذّر الحفظ: مساحة التخزين ممتلئة أو غير متاحة";

/* Keys of deleted labs — reuse is blocked because student progress/XP records
 * are keyed by lab key and would attach to the new lab. */
const DELETED_KEYS = "robotech_cms_deleted_keys_v1";
function getDeletedKeys(): string[] {
  try { return JSON.parse(localStorage.getItem(DELETED_KEYS) ?? "[]"); } catch { return []; }
}
function markDeleted(key: string) {
  try {
    const list = getDeletedKeys();
    if (!list.includes(key)) localStorage.setItem(DELETED_KEYS, JSON.stringify([...list, key]));
    cloudPush("deletedKey", key, `del:${key}`);
  } catch { /* best effort */ }
}

/* ── init & student-facing reads ───────────────────────────── */

export function initLabStore(defaults: Record<string, LabConfig>) {
  seedConfigs = defaults;
}

/** All labs (admin view — includes hidden), sorted by display order. */
export function getAllLabs(): LabConfig[] {
  return [...loadAll()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** Effective content for the STUDENT app: hidden labs/lessons removed, disabled simulators blanked. */
export function getEffectiveConfigs(): Record<string, LabConfig> {
  const out: Record<string, LabConfig> = {};
  for (const lab of getAllLabs()) {
    if (lab.hidden) continue;
    out[lab.key] = {
      ...lab,
      simulatorUrl: lab.simEnabled === false ? "" : lab.simulatorUrl,
      lessons: lab.lessons.filter(l => !l.hidden),
    };
  }
  return out;
}

export function getLab(key: string): LabConfig | undefined {
  return loadAll().find(l => l.key === key);
}

/* ── Labs CRUD ─────────────────────────────────────────────── */

export type SaveResult = { ok: true } | { ok: false; error: string };

export function createLab(lab: LabConfig): SaveResult {
  const list = loadAll();
  const key = lab.key.trim().toLowerCase();
  if (!key) return { ok: false, error: "المعرّف (key) مطلوب" };
  if (!/^[a-z0-9-]+$/.test(key)) return { ok: false, error: "المعرّف يجب أن يكون حروفاً إنجليزية صغيرة وأرقاماً وشرطات فقط" };
  if (list.some(l => l.key === key)) return { ok: false, error: "يوجد مختبر بنفس المعرّف مسبقاً" };
  if (getDeletedKeys().includes(key)) return { ok: false, error: "هذا المعرّف استُخدم لمختبر محذوف ولا يمكن إعادة استخدامه (سجلات تقدم الطلاب مرتبطة به)" };
  if (!lab.title.ar.trim()) return { ok: false, error: "العنوان العربي مطلوب" };
  const simEnabled = lab.simEnabled ?? Boolean(lab.simulatorUrl.trim());
  if (!persist([...list, { ...lab, key, order: list.length, hidden: lab.hidden ?? false, simEnabled }]))
    return { ok: false, error: STORAGE_ERR };
  return { ok: true };
}

export function updateLab(key: string, patch: Partial<LabConfig>): SaveResult {
  const list = loadAll();
  const idx = list.findIndex(l => l.key === key);
  if (idx === -1) return { ok: false, error: "المختبر غير موجود" };
  if (patch.title && !patch.title.ar.trim()) return { ok: false, error: "العنوان العربي مطلوب" };
  const next = [...list];
  next[idx] = { ...next[idx], ...patch, key }; // key immutable (progress data is keyed by it)
  if (!persist(next)) return { ok: false, error: STORAGE_ERR };
  return { ok: true };
}

export function deleteLab(key: string): SaveResult {
  const list = loadAll().filter(l => l.key !== key);
  list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).forEach((l, i) => { l.order = i; });
  if (!persist(list)) return { ok: false, error: STORAGE_ERR };
  markDeleted(key);
  return { ok: true };
}

export function moveLab(key: string, dir: -1 | 1): void {
  const list = getAllLabs();
  const idx = list.findIndex(l => l.key === key);
  const swap = idx + dir;
  if (idx === -1 || swap < 0 || swap >= list.length) return;
  [list[idx], list[swap]] = [list[swap], list[idx]];
  list.forEach((l, i) => { l.order = i; });
  persist(list);
}

/* ── Lessons CRUD ──────────────────────────────────────────── */

function withLab(key: string, fn: (lab: LabConfig) => LabConfig | string): SaveResult {
  const list = loadAll();
  const idx = list.findIndex(l => l.key === key);
  if (idx === -1) return { ok: false, error: "المختبر غير موجود" };
  const res = fn({ ...list[idx] });
  if (typeof res === "string") return { ok: false, error: res };
  const next = [...list];
  next[idx] = res;
  if (!persist(next)) return { ok: false, error: STORAGE_ERR };
  return { ok: true };
}

export function addLesson(labKey: string, lesson: Lesson): SaveResult {
  if (!lesson.title.ar.trim()) return { ok: false, error: "عنوان الدرس العربي مطلوب" };
  return withLab(labKey, lab => {
    if (lab.lessons.some(l => l.title.ar.trim() === lesson.title.ar.trim()))
      return "يوجد درس بنفس العنوان في هذا المختبر";
    return { ...lab, lessons: [...lab.lessons, lesson] };
  });
}

export function updateLesson(labKey: string, lessonIdx: number, patch: Partial<Lesson>): SaveResult {
  if (patch.title && !patch.title.ar.trim()) return { ok: false, error: "عنوان الدرس العربي مطلوب" };
  return withLab(labKey, lab => {
    if (!lab.lessons[lessonIdx]) return "الدرس غير موجود";
    const lessons = [...lab.lessons];
    lessons[lessonIdx] = { ...lessons[lessonIdx], ...patch };
    return { ...lab, lessons };
  });
}

export function deleteLesson(labKey: string, lessonIdx: number): SaveResult {
  return withLab(labKey, lab => {
    if (!lab.lessons[lessonIdx]) return "الدرس غير موجود";
    return { ...lab, lessons: lab.lessons.filter((_, i) => i !== lessonIdx) };
  });
}

export function moveLesson(labKey: string, lessonIdx: number, dir: -1 | 1): SaveResult {
  return withLab(labKey, lab => {
    const swap = lessonIdx + dir;
    if (!lab.lessons[lessonIdx] || swap < 0 || swap >= lab.lessons.length) return lab;
    const lessons = [...lab.lessons];
    [lessons[lessonIdx], lessons[swap]] = [lessons[swap], lessons[lessonIdx]];
    return { ...lab, lessons };
  });
}

/* ── Quiz CRUD (per lesson) ────────────────────────────────── */

export function setQuiz(labKey: string, lessonIdx: number, quiz: QuizQuestion[]): SaveResult {
  for (const q of quiz) {
    if (!q.q.ar.trim()) return { ok: false, error: "نص السؤال العربي مطلوب" };
    if (q.options.ar.length < 2) return { ok: false, error: "كل سؤال يحتاج خيارين على الأقل" };
    if (q.correct < 0 || q.correct >= q.options.ar.length) return { ok: false, error: "رقم الإجابة الصحيحة خارج نطاق الخيارات" };
  }
  return updateLesson(labKey, lessonIdx, { quiz });
}

/* ── Hero tasks CRUD (localized parallel arrays) ───────────── */

export function addTask(labKey: string, task: Localized<string>): SaveResult {
  if (!task.ar.trim()) return { ok: false, error: "نص المهمة العربي مطلوب" };
  return withLab(labKey, lab => {
    if (lab.heroTasks.ar.some(t => t.trim() === task.ar.trim())) return "توجد مهمة بنفس النص";
    return { ...lab, heroTasks: {
      ar: [...lab.heroTasks.ar, task.ar],
      en: [...lab.heroTasks.en, task.en || task.ar],
      fr: [...lab.heroTasks.fr, task.fr || task.ar],
    } };
  });
}

export function updateTask(labKey: string, idx: number, task: Localized<string>): SaveResult {
  if (!task.ar.trim()) return { ok: false, error: "نص المهمة العربي مطلوب" };
  return withLab(labKey, lab => {
    if (lab.heroTasks.ar[idx] === undefined) return "المهمة غير موجودة";
    const heroTasks = { ar: [...lab.heroTasks.ar], en: [...lab.heroTasks.en], fr: [...lab.heroTasks.fr] };
    heroTasks.ar[idx] = task.ar; heroTasks.en[idx] = task.en || task.ar; heroTasks.fr[idx] = task.fr || task.ar;
    return { ...lab, heroTasks };
  });
}

export function deleteTask(labKey: string, idx: number): SaveResult {
  return withLab(labKey, lab => {
    if (lab.heroTasks.ar[idx] === undefined) return "المهمة غير موجودة";
    return { ...lab, heroTasks: {
      ar: lab.heroTasks.ar.filter((_, i) => i !== idx),
      en: lab.heroTasks.en.filter((_, i) => i !== idx),
      fr: lab.heroTasks.fr.filter((_, i) => i !== idx),
    } };
  });
}

export function moveTask(labKey: string, idx: number, dir: -1 | 1): SaveResult {
  return withLab(labKey, lab => {
    const swap = idx + dir;
    if (lab.heroTasks.ar[idx] === undefined || swap < 0 || swap >= lab.heroTasks.ar.length) return lab;
    const heroTasks = { ar: [...lab.heroTasks.ar], en: [...lab.heroTasks.en], fr: [...lab.heroTasks.fr] };
    for (const lang of ["ar", "en", "fr"] as const)
      [heroTasks[lang][idx], heroTasks[lang][swap]] = [heroTasks[lang][swap], heroTasks[lang][idx]];
    return { ...lab, heroTasks };
  });
}

/* ── Video URL helper: normalize YouTube/Vimeo links to embeddable URLs ── */

export function normalizeVideoSrc(src: string): { src: string; type: "video" | "embed" } {
  const s = src.trim();
  const yt = s.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/);
  if (yt) return { src: `https://www.youtube.com/embed/${yt[1]}`, type: "embed" };
  const vm = s.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { src: `https://player.vimeo.com/video/${vm[1]}`, type: "embed" };
  return { src: s, type: "video" };
}
