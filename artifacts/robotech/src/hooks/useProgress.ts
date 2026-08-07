import { useState, useCallback, useEffect } from "react";
import { cloudPush, CLOUD_EVENT } from "../services/cloudSync";

interface LabProgress {
  doneTasks: number[];
  completedLessons: number[];
  totalTasks: number;
  totalLessons: number;
}

interface ProgressState {
  [labKey: string]: LabProgress;
}

const LEGACY_KEY = "robotech_progress_v2";
const BASE_KEY = "robotech_progress_v3";
const MIGRATED_KEY = "robotech_progress_v3_migrated";

function normalizeEmail(email?: string): string {
  return email?.trim().toLowerCase() ?? "";
}

/** Per-user storage key. Falls back to the legacy shared key when no email is known. */
function storageKey(email?: string): string {
  const e = normalizeEmail(email);
  return e ? `${BASE_KEY}:${e}` : LEGACY_KEY;
}

/**
 * One-time migration: the legacy shared key has no owner, so it is claimed
 * exactly once — by the first signed-in user who reads progress after this
 * update. All later accounts start fresh (prevents cross-user data leakage).
 */
function migrateLegacyIfNeeded(email?: string) {
  const e = normalizeEmail(email);
  if (!e) return;
  try {
    if (localStorage.getItem(MIGRATED_KEY) !== null) return;
    const userKey = storageKey(e);
    if (localStorage.getItem(userKey) === null) {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) localStorage.setItem(userKey, legacy);
    }
    localStorage.setItem(MIGRATED_KEY, e);
  } catch {
    /* storage unavailable — ignore */
  }
}

function loadProgress(email?: string): ProgressState {
  try {
    migrateLegacyIfNeeded(email);
    const raw = localStorage.getItem(storageKey(email));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(state: ProgressState, email?: string) {
  try {
    localStorage.setItem(storageKey(email), JSON.stringify(state));
    const e = normalizeEmail(email);
    if (e) cloudPush("progress", { email: e, data: state }, `progress:${e}`);
  } catch {
    /* storage unavailable — ignore */
  }
}

export function useProgress(labKey: string, totalTasks: number, totalLessons: number, email?: string) {
  const normEmail = normalizeEmail(email);
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress(normEmail));

  // Reload from storage whenever the active user changes so one account's
  // in-memory progress can never bleed into (or be saved under) another account.
  useEffect(() => {
    setProgress(loadProgress(normEmail));
  }, [normEmail]);

  // Phase 3: re-read after a cloud pull rewrote local progress (login on a new device)
  useEffect(() => {
    const onCloud = () => setProgress(loadProgress(normEmail));
    window.addEventListener(CLOUD_EVENT, onCloud);
    return () => window.removeEventListener(CLOUD_EVENT, onCloud);
  }, [normEmail]);

  const toggleTask = useCallback((idx: number) => {
    setProgress((prev) => {
      const lab = prev[labKey] ?? { doneTasks: [], completedLessons: [], totalTasks, totalLessons };
      const done = lab.doneTasks.includes(idx)
        ? lab.doneTasks.filter((i) => i !== idx)
        : [...lab.doneTasks, idx];
      const next = { ...prev, [labKey]: { ...lab, doneTasks: done } };
      saveProgress(next, email);
      return next;
    });
  }, [labKey, totalTasks, totalLessons, email]);

  const markLesson = useCallback((idx: number) => {
    setProgress((prev) => {
      const lab = prev[labKey] ?? { doneTasks: [], completedLessons: [], totalTasks, totalLessons };
      const lessons = lab.completedLessons.includes(idx)
        ? lab.completedLessons
        : [...lab.completedLessons, idx];
      const next = { ...prev, [labKey]: { ...lab, completedLessons: lessons } };
      saveProgress(next, email);
      return next;
    });
  }, [labKey, totalTasks, totalLessons, email]);

  const resetLab = useCallback(() => {
    setProgress((prev) => {
      const next = { ...prev };
      delete next[labKey];
      saveProgress(next, email);
      return next;
    });
  }, [labKey, email]);

  const lab = progress[labKey] ?? { doneTasks: [], completedLessons: [], totalTasks, totalLessons };
  const taskPercent = totalTasks > 0 ? Math.round((lab.doneTasks.length / totalTasks) * 100) : 0;
  const lessonPercent = totalLessons > 0 ? Math.round((lab.completedLessons.length / totalLessons) * 100) : 0;
  const overallPercent = Math.round((taskPercent + lessonPercent) / 2);

  return {
    doneTasks: lab.doneTasks,
    completedLessons: lab.completedLessons,
    taskPercent,
    lessonPercent,
    overallPercent,
    isAllTasksDone: lab.doneTasks.length >= totalTasks && totalTasks > 0,
    toggleTask,
    markLesson,
    resetLab,
    allLabsProgress: progress,
  };
}

/** Read-only snapshot of a user's raw progress (used by Dashboard). */
export function loadRawProgress(email?: string): ProgressState {
  return loadProgress(email);
}

export function getLabOverallProgress(labKey: string, totalTasks: number, totalLessons: number, email?: string): number {
  try {
    const state = loadProgress(email);
    const lab = state[labKey];
    if (!lab) return 0;
    const t = totalTasks > 0 ? (lab.doneTasks.length / totalTasks) * 100 : 0;
    const l = totalLessons > 0 ? (lab.completedLessons.length / totalLessons) * 100 : 0;
    return Math.round((t + l) / 2);
  } catch { return 0; }
}
