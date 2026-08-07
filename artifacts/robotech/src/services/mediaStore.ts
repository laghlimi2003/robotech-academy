/**
 * Media Library service (Phase 2B-2).
 *
 * Storage provider abstraction: today files live in IndexedDB (browser-local,
 * supports large blobs unlike localStorage). Every consumer references files
 * through stable `media://<id>` URLs and the async API below, so Phase 3 only
 * has to swap the `idb*` internals for Supabase Storage calls — the rest of
 * the app is unaffected.
 */

export type MediaCategory =
  | "image" | "video" | "pdf" | "document" | "logo" | "banner"   // Phase 2B-2 originals (kept for stored records)
  | "word" | "powerpoint" | "zip" | "audio" | "other";           // Phase 2B-3 additions

export interface MediaItem {
  id: string;
  name: string;
  category: MediaCategory;
  mime: string;
  size: number;       // bytes
  createdAt: string;  // ISO
}

interface MediaRecord extends MediaItem { blob: Blob }

const DB_NAME = "robotech_media_v1";
const STORE = "files";

/* ── IndexedDB provider (replace with Supabase Storage in Phase 3) ── */

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: "id" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => { dbPromise = null; reject(req.error); };       // allow retry on next call
      req.onblocked = () => { dbPromise = null; reject(new Error("IndexedDB open blocked")); };
    });
  }
  return dbPromise;
}

/**
 * Read ops resolve on request success; write ops resolve only on transaction
 * COMPLETION (a transaction can still abort after the request succeeds).
 */
function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(db => new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = run(t.objectStore(STORE));
    let result: T;
    let done = false;
    const fail = (err: unknown) => { if (!done) { done = true; reject(err); } };
    req.onsuccess = () => {
      result = req.result;
      if (mode === "readonly" && !done) { done = true; resolve(result); }
    };
    req.onerror = () => fail(req.error);
    t.oncomplete = () => { if (mode === "readwrite" && !done) { done = true; resolve(result); } };
    t.onabort = () => fail(t.error ?? new Error("transaction aborted"));
    t.onerror = () => fail(t.error);
  }));
}

/* ── Category inference ────────────────────────────────────── */

export function inferCategory(mime: string, name: string): MediaCategory {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/") || /\.(mp3|wav|ogg|m4a)$/i.test(name)) return "audio";
  if (mime === "application/pdf" || /\.pdf$/i.test(name)) return "pdf";
  if (/\.(docx?|odt)$/i.test(name) || mime.includes("wordprocessingml") || mime === "application/msword") return "word";
  if (/\.(pptx?|odp)$/i.test(name) || mime.includes("presentationml") || mime === "application/vnd.ms-powerpoint") return "powerpoint";
  if (/\.(zip|rar|7z)$/i.test(name) || mime === "application/zip" || mime === "application/x-zip-compressed") return "zip";
  return "other";
}

export const CATEGORY_LABELS: Record<MediaCategory, string> = {
  image: "صورة", video: "فيديو", pdf: "PDF", document: "مستند", logo: "شعار", banner: "بانر",
  word: "Word", powerpoint: "PowerPoint", zip: "ZIP", audio: "صوت", other: "أخرى",
};

/** Categories usable as downloadable lesson attachments. */
export const ATTACHMENT_CATEGORIES: MediaCategory[] = ["pdf", "word", "powerpoint", "zip", "document"];

/* ── Public API ────────────────────────────────────────────── */

export type MediaResult<T> = { ok: true; data: T } | { ok: false; error: string };

// Generous ceiling — IndexedDB handles large blobs; the real limit is the
// browser's storage quota, which is reported explicitly on failure.
export const MAX_SIZE = 1024 * 1024 * 1024; // 1GB per file

export async function listMedia(): Promise<MediaItem[]> {
  try {
    const all = await tx<MediaRecord[]>("readonly", s => s.getAll() as IDBRequest<MediaRecord[]>);
    return all
      .map(({ blob: _b, ...item }) => item)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch { return []; }
}

/** Category → acceptable file check. `accept` attributes are advisory only, so enforce here. */
function categoryAccepts(category: MediaCategory, mime: string, name: string): boolean {
  switch (category) {
    case "image": case "logo": case "banner":
      return mime.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/i.test(name);
    case "video":
      return mime.startsWith("video/") || /\.(mp4|webm)$/i.test(name);
    case "pdf":
      return mime === "application/pdf" || /\.pdf$/i.test(name);
    case "audio":
      return mime.startsWith("audio/") || /\.(mp3|wav|ogg|m4a)$/i.test(name);
    case "word":
      return /\.(docx?|odt)$/i.test(name) || mime.includes("wordprocessingml") || mime === "application/msword";
    case "powerpoint":
      return /\.(pptx?|odp)$/i.test(name) || mime.includes("presentationml") || mime === "application/vnd.ms-powerpoint";
    case "zip":
      return /\.(zip|rar|7z)$/i.test(name) || mime === "application/zip" || mime === "application/x-zip-compressed";
    case "document": case "other":
      return true;
  }
}

/** Read a file into memory, reporting progress 0-100. */
function readWithProgress(file: File, onProgress?: (pct: number) => void): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = e => { if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 90)); };
    reader.onload = () => resolve(new Blob([reader.result as ArrayBuffer], { type: file.type || "application/octet-stream" }));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

export async function uploadMedia(
  file: File,
  category?: MediaCategory,
  onProgress?: (pct: number) => void,
): Promise<MediaResult<MediaItem>> {
  if (file.size > MAX_SIZE) return { ok: false, error: "حجم الملف يتجاوز الحد الأقصى (1GB)" };
  if (file.size === 0) return { ok: false, error: "الملف فارغ" };
  if (category && !categoryAccepts(category, file.type, file.name))
    return { ok: false, error: `نوع الملف "${file.name}" لا يطابق التصنيف "${CATEGORY_LABELS[category]}"` };
  const item: MediaItem = {
    id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    category: category ?? inferCategory(file.type, file.name),
    mime: file.type || "application/octet-stream",
    size: file.size,
    createdAt: new Date().toISOString(),
  };
  try {
    onProgress?.(0);
    const blob = await readWithProgress(file, onProgress);
    onProgress?.(95);
    await tx("readwrite", s => s.put({ ...item, blob } satisfies MediaRecord));
    onProgress?.(100);
    return { ok: true, data: item };
  } catch (err) {
    const quota = err instanceof DOMException && (err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED");
    return {
      ok: false,
      error: quota
        ? `الملف "${file.name}" (${formatSize(file.size)}) يتجاوز مساحة التخزين المتاحة في المتصفح — احذف ملفات قديمة أو استخدم ملفاً أصغر`
        : "فشل حفظ الملف — أعد المحاولة",
    };
  }
}

export async function renameMedia(id: string, name: string): Promise<MediaResult<null>> {
  if (!name.trim()) return { ok: false, error: "اسم الملف مطلوب" };
  try {
    const rec = await tx<MediaRecord | undefined>("readonly", s => s.get(id) as IDBRequest<MediaRecord | undefined>);
    if (!rec) return { ok: false, error: "الملف غير موجود" };
    await tx("readwrite", s => s.put({ ...rec, name: name.trim() }));
    return { ok: true, data: null };
  } catch { return { ok: false, error: "فشل إعادة التسمية" }; }
}

export async function deleteMedia(id: string): Promise<MediaResult<null>> {
  try {
    await tx("readwrite", s => s.delete(id));
    evictUrl(id);
    return { ok: true, data: null };
  } catch { return { ok: false, error: "فشل حذف الملف" }; }
}

/* ── media:// URL resolution ───────────────────────────────── */

export const MEDIA_SCHEME = "media://";

export function mediaUrl(id: string): string { return `${MEDIA_SCHEME}${id}`; }
export function isMediaUrl(src: string | undefined | null): boolean { return !!src && src.startsWith(MEDIA_SCHEME); }

/*
 * Object-URL cache with bounded LRU eviction: each cached entry owns exactly
 * one object URL, revoked on eviction or file deletion. In-flight resolves
 * are deduplicated so concurrent callers never create duplicate URLs.
 */
const URL_CACHE_MAX = 30;
const urlCache = new Map<string, string>();            // id -> object URL (insertion order = LRU)
const inFlight = new Map<string, Promise<string>>();    // id -> pending resolve

function evictUrl(id: string) {
  const url = urlCache.get(id);
  if (url) { URL.revokeObjectURL(url); urlCache.delete(id); }
}

function cacheUrl(id: string, url: string) {
  urlCache.set(id, url);
  while (urlCache.size > URL_CACHE_MAX) {
    const oldest = urlCache.keys().next().value as string;
    evictUrl(oldest);
  }
}

/** Resolve a `media://<id>` (or pass through regular URLs). Returns "" when the file is missing. */
export function resolveMediaUrl(src: string): Promise<string> {
  if (!isMediaUrl(src)) return Promise.resolve(src);
  const id = src.slice(MEDIA_SCHEME.length);
  const cached = urlCache.get(id);
  if (cached) {
    // refresh LRU position
    urlCache.delete(id); urlCache.set(id, cached);
    return Promise.resolve(cached);
  }
  const pending = inFlight.get(id);
  if (pending) return pending;
  const p = (async () => {
    try {
      const rec = await tx<MediaRecord | undefined>("readonly", s => s.get(id) as IDBRequest<MediaRecord | undefined>);
      if (!rec) return "";
      const url = URL.createObjectURL(rec.blob);
      cacheUrl(id, url);
      return url;
    } catch { return ""; } finally { inFlight.delete(id); }
  })();
  inFlight.set(id, p);
  return p;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
