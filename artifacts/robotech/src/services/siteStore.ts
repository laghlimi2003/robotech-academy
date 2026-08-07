/**
 * Site content service (Phase 2B-1): News + Site Settings + XP reward config.
 * localStorage-backed; swap the load/persist internals for API calls in Phase 3.
 */

/* ── News ──────────────────────────────────────────────────── */

export interface NewsItem {
  id: string;
  title: string;
  body: string;
  published: boolean;
  createdAt: string; // ISO date
}

const NEWS_KEY = "robotech_cms_news_v1";

function loadNews(): NewsItem[] {
  try { return JSON.parse(localStorage.getItem(NEWS_KEY) ?? "[]"); } catch { return []; }
}
const STORAGE_ERR = "تعذّر الحفظ: مساحة التخزين ممتلئة أو غير متاحة";

function persistNews(list: NewsItem[]): boolean {
  try { localStorage.setItem(NEWS_KEY, JSON.stringify(list)); return true; } catch { return false; }
}

export type SaveResult = { ok: true } | { ok: false; error: string };

export function getNews(): NewsItem[] {
  return loadNews().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createNews(title: string, body: string, published: boolean): SaveResult {
  if (!title.trim()) return { ok: false, error: "العنوان مطلوب" };
  const list = loadNews();
  if (list.some(n => n.title.trim() === title.trim())) return { ok: false, error: "يوجد خبر بنفس العنوان" };
  list.push({
    id: `news_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: title.trim(), body: body.trim(), published,
    createdAt: new Date().toISOString(),
  });
  if (!persistNews(list)) return { ok: false, error: STORAGE_ERR };
  return { ok: true };
}

export function updateNews(id: string, patch: Partial<Omit<NewsItem, "id">>): SaveResult {
  if (patch.title !== undefined && !patch.title.trim()) return { ok: false, error: "العنوان مطلوب" };
  const list = loadNews();
  const idx = list.findIndex(n => n.id === id);
  if (idx === -1) return { ok: false, error: "الخبر غير موجود" };
  list[idx] = { ...list[idx], ...patch };
  if (!persistNews(list)) return { ok: false, error: STORAGE_ERR };
  return { ok: true };
}

export function deleteNews(id: string): SaveResult {
  if (!persistNews(loadNews().filter(n => n.id !== id))) return { ok: false, error: STORAGE_ERR };
  return { ok: true };
}

/* ── Site settings ─────────────────────────────────────────── */

export interface SiteSettings {
  siteName: string;
  logo: string;          // emoji or image URL
  primaryColor: string;
  accentColor: string;
  bannerText: string;    // homepage hero banner override ("" = default)
}

const SETTINGS_KEY = "robotech_cms_settings_v1";

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "RoboTech",
  logo: "🤖",
  primaryColor: "#667eea",
  accentColor: "#764ba2",
  bannerText: "",
};

export function getSettings(): SiteSettings {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}") };
  } catch { return { ...DEFAULT_SETTINGS }; }
}

export function saveSettings(patch: Partial<SiteSettings>): SaveResult {
  const next = { ...getSettings(), ...patch };
  if (!next.siteName.trim()) return { ok: false, error: "اسم الموقع مطلوب" };
  if (!/^#[0-9a-fA-F]{6}$/.test(next.primaryColor) || !/^#[0-9a-fA-F]{6}$/.test(next.accentColor))
    return { ok: false, error: "صيغة اللون يجب أن تكون HEX مثل ‎#667eea" };
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch { return { ok: false, error: STORAGE_ERR }; }
  return { ok: true };
}

/* ── XP reward overrides (quiz points / task rewards) ──────── */

export interface XpOverrides {
  lesson?: number;
  quizPassBase?: number;
  quizPercentBonus?: number;
  task?: number;
  labComplete?: number;
}

const XP_KEY = "robotech_cms_xp_v1";

export function getXpOverrides(): XpOverrides {
  try { return JSON.parse(localStorage.getItem(XP_KEY) ?? "{}"); } catch { return {}; }
}

export function saveXpOverrides(patch: XpOverrides): SaveResult {
  const next = { ...getXpOverrides(), ...patch };
  for (const [k, v] of Object.entries(next)) {
    if (v !== undefined && (!Number.isFinite(v) || v < 0 || v > 10000))
      return { ok: false, error: `قيمة ${k} يجب أن تكون رقماً بين 0 و 10000` };
  }
  try { localStorage.setItem(XP_KEY, JSON.stringify(next)); } catch { return { ok: false, error: STORAGE_ERR }; }
  return { ok: true };
}
