import { useState, useCallback, useEffect, useRef } from "react";
import { BADGES, BADGE_BY_ID, masterBadgeId, makeMasterBadge, type Badge } from "../data/badges";
import { levelFromXp, XP_REWARDS } from "../data/levels";
import { labConfigs } from "../data/labs";
import type { Lang } from "./useLang";
import type { Localized } from "../data/badges";

interface AwardedEvents {
  lessons: Record<string, number[]>; // labKey -> lesson indices already awarded
  quizzes: Record<string, number[]>;
  tasks:   Record<string, number[]>;
  labs:    string[];                 // labKeys whose +500 bonus was already given
}

interface GamificationState {
  xp: number;
  badges: string[];
  streak: number;
  lastVisitDate: string;             // local YYYY-MM-DD
  langsUsed: Lang[];
  awarded: AwardedEvents;
}

export interface Reward {
  id: number;
  type: "xp" | "badge" | "levelup";
  amount?: number;
  badge?: Badge;
  level?: number;
}

interface ProfileEntry {
  name: string; avatar: string;
  xp: number; level: number; badges: number; streak: number;
}
interface AllProfiles { [email: string]: ProfileEntry; }

const STATE_KEY     = "robotech_gam_v2";
const PROFILES_KEY  = "robotech_gam_profiles_v2";
const SEED_KEY      = "robotech_gam_seeded_v2";

// ── Local-day helpers (timezone safe) ────────────────────────
function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function daysBetween(a: string, b: string): number {
  const pa = a.split("-").map(Number); const pb = b.split("-").map(Number);
  const ta = new Date(pa[0], pa[1] - 1, pa[2]).getTime();
  const tb = new Date(pb[0], pb[1] - 1, pb[2]).getTime();
  return Math.round((tb - ta) / 86400000);
}

// ── Persistence helpers ──────────────────────────────────────
function loadAllStates(): Record<string, GamificationState> {
  try { return JSON.parse(localStorage.getItem(STATE_KEY) ?? "{}"); } catch { return {}; }
}
function saveAllStates(s: Record<string, GamificationState>) {
  localStorage.setItem(STATE_KEY, JSON.stringify(s));
}
function loadProfiles(): AllProfiles {
  try { return JSON.parse(localStorage.getItem(PROFILES_KEY) ?? "{}"); } catch { return {}; }
}
function saveProfiles(p: AllProfiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(p));
}

function seedDemoProfiles() {
  if (localStorage.getItem(SEED_KEY)) return;
  const profiles = loadProfiles();
  const demos: AllProfiles = {
    "_demo_sara":  { name: "سارة",  avatar: "🦊", xp: 1850, level: 8,  badges: 5, streak: 4 },
    "_demo_omar":  { name: "عمر",   avatar: "🚀", xp: 920,  level: 4,  badges: 3, streak: 2 },
    "_demo_layla": { name: "ليلى",  avatar: "🌟", xp: 3200, level: 13, badges: 7, streak: 9 },
    "_demo_yusuf": { name: "يوسف", avatar: "🦁", xp: 540,  level: 3,  badges: 2, streak: 1 },
  };
  for (const k in demos) if (!profiles[k]) profiles[k] = demos[k];
  saveProfiles(profiles);
  localStorage.setItem(SEED_KEY, "1");
}

const EMPTY_AWARDED: AwardedEvents = { lessons: {}, quizzes: {}, tasks: {}, labs: [] };
const DEFAULT_STATE: GamificationState = {
  xp: 0, badges: [], streak: 0, lastVisitDate: "", langsUsed: [], awarded: EMPTY_AWARDED,
};

function loadStateFor(email: string | undefined): GamificationState {
  if (!email) return DEFAULT_STATE;
  const s = loadAllStates()[email] ?? DEFAULT_STATE;
  // Migrate any older state missing awarded field
  return { ...DEFAULT_STATE, ...s, awarded: { ...EMPTY_AWARDED, ...(s.awarded ?? {}) } };
}

// ── Hook ────────────────────────────────────────────────────
export function useGamification(userEmail: string | undefined, userName: string, userAvatar: string, lang: Lang) {
  const [state, setState] = useState<GamificationState>(() => loadStateFor(userEmail));
  const [rewards, setRewards] = useState<Reward[]>([]);
  const rewardSeq = useRef(0);
  const processedFor = useRef<string | undefined>(undefined);

  // Reset state + visit-processed flag whenever the active user changes
  useEffect(() => {
    setState(loadStateFor(userEmail));
    processedFor.current = undefined;
  }, [userEmail]);

  // Persist state + mirror to leaderboard profiles
  useEffect(() => {
    if (!userEmail) return;
    const all = loadAllStates();
    all[userEmail] = state;
    saveAllStates(all);
    const profiles = loadProfiles();
    profiles[userEmail] = {
      name: userName, avatar: userAvatar,
      xp: state.xp,
      level: levelFromXp(state.xp),
      badges: state.badges.length,
      streak: state.streak,
    };
    saveProfiles(profiles);
  }, [state, userEmail, userName, userAvatar]);

  // Record visit/streak ONCE per user per session
  useEffect(() => {
    if (!userEmail || processedFor.current === userEmail) return;
    processedFor.current = userEmail;
    seedDemoProfiles();

    setState(prev => {
      const today = todayLocal();
      if (prev.lastVisitDate === today) return touchLang(prev, lang);

      let nextStreak = 1;
      if (prev.lastVisitDate) {
        const diff = daysBetween(prev.lastVisitDate, today);
        if (diff === 1)      nextStreak = prev.streak + 1;
        else if (diff === 0) nextStreak = prev.streak;
        else                 nextStreak = 1;
      }
      const bonusXp = nextStreak > 1 ? Math.min(100, nextStreak * XP_REWARDS.dailyStreak) : 0;
      const oldLevel = levelFromXp(prev.xp);
      const next: GamificationState = {
        ...prev, streak: nextStreak, lastVisitDate: today, xp: prev.xp + bonusXp,
      };
      const finalState = recomputeAutoBadges(touchLang(next, lang));
      const newLevel = levelFromXp(finalState.xp);
      // Surface bonus & passive badges
      queueMicrotask(() => {
        if (bonusXp > 0) pushReward({ type: "xp", amount: bonusXp });
        for (const id of finalState.badges) {
          if (!prev.badges.includes(id)) {
            const b = BADGE_BY_ID[id]; if (b) pushReward({ type: "badge", badge: b });
          }
        }
        if (newLevel > oldLevel) pushReward({ type: "levelup", level: newLevel });
      });
      return finalState;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  // Track language usage
  useEffect(() => {
    if (!userEmail) return;
    setState(prev => recomputeAutoBadges(touchLang(prev, lang)));
  }, [lang, userEmail]);

  const pushReward = useCallback((r: Omit<Reward, "id">) => {
    rewardSeq.current += 1;
    setRewards(prev => [...prev, { ...r, id: rewardSeq.current }]);
  }, []);

  const dismissReward = useCallback((id: number) => {
    setRewards(prev => prev.filter(r => r.id !== id));
  }, []);

  // Internal: apply XP delta + badge ids, run passive check, emit toasts
  const applyAward = useCallback((mutate: (s: GamificationState) => GamificationState, xpDelta: number, newBadgeIds: string[], extraBadges: Badge[] = []) => {
    setState(prev => {
      const oldLevel = levelFromXp(prev.xp);
      const mutated = mutate(prev);
      const earned = new Set(mutated.badges);
      for (const id of newBadgeIds) if (BADGE_BY_ID[id]) earned.add(id);
      const next: GamificationState = { ...mutated, badges: Array.from(earned) };
      const finalState = recomputeAutoBadges(next);
      const newLevel = levelFromXp(finalState.xp);
      queueMicrotask(() => {
        if (xpDelta > 0) pushReward({ type: "xp", amount: xpDelta });
        for (const id of finalState.badges) {
          if (!prev.badges.includes(id)) {
            const b = BADGE_BY_ID[id]; if (b) pushReward({ type: "badge", badge: b });
          }
        }
        for (const b of extraBadges) pushReward({ type: "badge", badge: b });
        if (newLevel > oldLevel) pushReward({ type: "levelup", level: newLevel });
      });
      return finalState;
    });
  }, [pushReward]);

  // ── Idempotent action APIs (labKey + idx) ──────────────────
  const awardLesson = useCallback((labKey: string, lessonIdx: number) => {
    setState(prev => {
      const already = prev.awarded.lessons[labKey]?.includes(lessonIdx);
      if (already) return prev;
      return prev;        // no-op, real work happens below
    });
    // Use functional update once more to actually apply, guarded by check:
    applyAward(
      s => {
        if (s.awarded.lessons[labKey]?.includes(lessonIdx)) return s;
        const lessons = { ...s.awarded.lessons, [labKey]: [...(s.awarded.lessons[labKey] ?? []), lessonIdx] };
        return { ...s, xp: s.xp + XP_REWARDS.lesson, awarded: { ...s.awarded, lessons } };
      },
      XP_REWARDS.lesson,
      ["first_step"]
    );
  }, [applyAward]);

  const awardQuiz = useCallback((labKey: string, lessonIdx: number, percent: number) => {
    applyAward(
      s => {
        if (s.awarded.quizzes[labKey]?.includes(lessonIdx)) return s;
        const quizzes = { ...s.awarded.quizzes, [labKey]: [...(s.awarded.quizzes[labKey] ?? []), lessonIdx] };
        const xp = XP_REWARDS.quizPassBase + Math.max(0, percent - 70) * XP_REWARDS.quizPercentBonus;
        return { ...s, xp: s.xp + xp, awarded: { ...s.awarded, quizzes } };
      },
      XP_REWARDS.quizPassBase + Math.max(0, percent - 70) * XP_REWARDS.quizPercentBonus,
      percent >= 100 ? ["quiz_starter", "quiz_perfect"] : ["quiz_starter"]
    );
  }, [applyAward]);

  const awardTask = useCallback((labKey: string, taskIdx: number) => {
    applyAward(
      s => {
        if (s.awarded.tasks[labKey]?.includes(taskIdx)) return s;
        const tasks = { ...s.awarded.tasks, [labKey]: [...(s.awarded.tasks[labKey] ?? []), taskIdx] };
        return { ...s, xp: s.xp + XP_REWARDS.task, awarded: { ...s.awarded, tasks } };
      },
      XP_REWARDS.task, []
    );
  }, [applyAward]);

  const awardLabComplete = useCallback((labKey: string, labTitle: Localized<string>) => {
    setState(prev => {
      if (prev.awarded.labs.includes(labKey)) return prev;
      const oldLevel = levelFromXp(prev.xp);
      const masterId = masterBadgeId(labKey);
      const earned = new Set(prev.badges);
      earned.add(masterId);
      earned.add("lab_finisher");
      const totalLabs = Object.keys(labConfigs).length;
      const masteredCount = Array.from(earned).filter(b => b.startsWith("master_")).length;
      if (masteredCount >= totalLabs) earned.add("all_labs");
      const next: GamificationState = {
        ...prev,
        xp: prev.xp + XP_REWARDS.labComplete,
        badges: Array.from(earned),
        awarded: { ...prev.awarded, labs: [...prev.awarded.labs, labKey] },
      };
      const finalState = recomputeAutoBadges(next);
      const newLevel = levelFromXp(finalState.xp);
      queueMicrotask(() => {
        pushReward({ type: "xp", amount: XP_REWARDS.labComplete });
        if (!prev.badges.includes(masterId)) {
          pushReward({ type: "badge", badge: makeMasterBadge(labKey, labTitle) });
        }
        for (const id of finalState.badges) {
          if (!prev.badges.includes(id) && id !== masterId && BADGE_BY_ID[id]) {
            pushReward({ type: "badge", badge: BADGE_BY_ID[id] });
          }
        }
        if (newLevel > oldLevel) pushReward({ type: "levelup", level: newLevel });
      });
      return finalState;
    });
  }, [pushReward]);

  const resolveBadge = useCallback((id: string): Badge | undefined => {
    if (BADGE_BY_ID[id]) return BADGE_BY_ID[id];
    if (id.startsWith("master_")) {
      const labKey = id.replace("master_", "");
      const raw = labConfigs[labKey];
      if (raw) return makeMasterBadge(labKey, raw.title);
    }
    return undefined;
  }, []);

  return {
    xp: state.xp,
    level: levelFromXp(state.xp),
    badges: state.badges,
    streak: state.streak,
    rewards,
    dismissReward,
    awardLesson,
    awardQuiz,
    awardTask,
    awardLabComplete,
    resolveBadge,
  };
}

// ── Pure helpers ────────────────────────────────────────────
function touchLang(prev: GamificationState, lang: Lang): GamificationState {
  if (prev.langsUsed.includes(lang)) return prev;
  return { ...prev, langsUsed: [...prev.langsUsed, lang] };
}

function recomputeAutoBadges(s: GamificationState): GamificationState {
  const earned = new Set(s.badges);
  const hour = new Date().getHours();
  if (s.streak >= 3)  earned.add("streak_3");
  if (s.streak >= 7)  earned.add("streak_7");
  if (s.streak >= 30) earned.add("streak_30");
  if (s.xp >= 500)    earned.add("xp_500");
  if (s.xp >= 2000)   earned.add("xp_2000");
  if (s.xp >= 5000)   earned.add("xp_5000");
  if (s.langsUsed.length >= 3) earned.add("polyglot");
  if (hour < 8)  earned.add("early_bird");
  if (hour >= 21) earned.add("night_owl");
  return { ...s, badges: Array.from(earned) };
}

// ── Leaderboard data accessor (with cross-tab sync helper) ──
export function getLeaderboard(): Array<{ email: string } & ProfileEntry> {
  const profiles = loadProfiles();
  return Object.entries(profiles)
    .map(([email, p]) => ({ email, ...p }))
    .sort((a, b) => b.xp - a.xp);
}

export const LEADERBOARD_STORAGE_KEY = PROFILES_KEY;
export { BADGES };
