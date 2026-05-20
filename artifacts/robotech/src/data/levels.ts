import type { Lang } from "../hooks/useLang";

// Level XP requirement is cumulative & linear: total XP to REACH level N = (N-1) * 250
// → Level 1 = 0, Level 2 = 250, Level 10 = 2250, Level 50 = 12,250
export const XP_PER_LEVEL = 250;
export const MAX_LEVEL = 50;

export function xpToReachLevel(level: number): number {
  return Math.max(0, level - 1) * XP_PER_LEVEL;
}

export function levelFromXp(xp: number): number {
  const lvl = Math.floor(xp / XP_PER_LEVEL) + 1;
  return Math.min(MAX_LEVEL, Math.max(1, lvl));
}

export function progressInLevel(xp: number): { current: number; needed: number; percent: number } {
  const lvl = levelFromXp(xp);
  if (lvl >= MAX_LEVEL) return { current: XP_PER_LEVEL, needed: XP_PER_LEVEL, percent: 100 };
  const base = xpToReachLevel(lvl);
  const next = xpToReachLevel(lvl + 1);
  const current = xp - base;
  const needed = next - base;
  return { current, needed, percent: Math.round((current / needed) * 100) };
}

interface LevelTitle {
  ar: string; en: string; fr: string;
}

const LEVEL_TITLES: Array<{ from: number; title: LevelTitle }> = [
  { from: 1,  title: { ar: "مبتدئ",                en: "Beginner",          fr: "Débutant" } },
  { from: 3,  title: { ar: "متعلّم",               en: "Learner",           fr: "Apprenant" } },
  { from: 6,  title: { ar: "مهندس صغير",          en: "Junior Engineer",   fr: "Petit Ingénieur" } },
  { from: 10, title: { ar: "مخترع",                en: "Inventor",          fr: "Inventeur" } },
  { from: 15, title: { ar: "مبرمج ماهر",          en: "Skilled Coder",     fr: "Codeur Habile" } },
  { from: 20, title: { ar: "خبير الروبوتات",      en: "Robotics Expert",   fr: "Expert Robotique" } },
  { from: 25, title: { ar: "عالم الذكاء",         en: "AI Scientist",      fr: "Scientifique IA" } },
  { from: 30, title: { ar: "أستاذ الروبوتيك",     en: "Robotics Master",   fr: "Maître Robotique" } },
  { from: 35, title: { ar: "عبقري",                en: "Genius",            fr: "Génie" } },
  { from: 40, title: { ar: "ماستر",                en: "Grandmaster",       fr: "Grand Maître" } },
  { from: 45, title: { ar: "بطل الأبطال",         en: "Champion of Champions", fr: "Champion des Champions" } },
  { from: 50, title: { ar: "أسطورة الروبوتيك",    en: "Robotics Legend",   fr: "Légende Robotique" } },
];

export function titleForLevel(level: number, lang: Lang): string {
  let chosen = LEVEL_TITLES[0].title;
  for (const t of LEVEL_TITLES) if (level >= t.from) chosen = t.title;
  return chosen[lang];
}

// XP rewards
export const XP_REWARDS = {
  lesson:         50,
  quizPassBase:   100,
  quizPercentBonus: 5,   // per percentage point above 70%
  task:           30,
  labComplete:    500,
  dailyStreak:    20,
} as const;

export function quizXpFor(percent: number): number {
  const bonus = Math.max(0, percent - 70) * XP_REWARDS.quizPercentBonus;
  return XP_REWARDS.quizPassBase + bonus;
}
