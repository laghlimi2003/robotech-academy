import { useState, useCallback } from "react";

interface LabProgress {
  doneTasks: number[];
  completedLessons: number[];
  totalTasks: number;
  totalLessons: number;
}

interface ProgressState {
  [labKey: string]: LabProgress;
}

const STORAGE_KEY = "robotech_progress_v2";

function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(state: ProgressState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useProgress(labKey: string, totalTasks: number, totalLessons: number) {
  const [progress, setProgress] = useState<ProgressState>(loadProgress);

  const getLabProgress = useCallback((): LabProgress => {
    return progress[labKey] ?? {
      doneTasks: [],
      completedLessons: [],
      totalTasks,
      totalLessons,
    };
  }, [progress, labKey, totalTasks, totalLessons]);

  const toggleTask = useCallback((idx: number) => {
    setProgress((prev) => {
      const lab = prev[labKey] ?? { doneTasks: [], completedLessons: [], totalTasks, totalLessons };
      const done = lab.doneTasks.includes(idx)
        ? lab.doneTasks.filter((i) => i !== idx)
        : [...lab.doneTasks, idx];
      const next = { ...prev, [labKey]: { ...lab, doneTasks: done } };
      saveProgress(next);
      return next;
    });
  }, [labKey, totalTasks, totalLessons]);

  const markLesson = useCallback((idx: number) => {
    setProgress((prev) => {
      const lab = prev[labKey] ?? { doneTasks: [], completedLessons: [], totalTasks, totalLessons };
      const lessons = lab.completedLessons.includes(idx)
        ? lab.completedLessons
        : [...lab.completedLessons, idx];
      const next = { ...prev, [labKey]: { ...lab, completedLessons: lessons } };
      saveProgress(next);
      return next;
    });
  }, [labKey, totalTasks, totalLessons]);

  const resetLab = useCallback(() => {
    setProgress((prev) => {
      const next = { ...prev };
      delete next[labKey];
      saveProgress(next);
      return next;
    });
  }, [labKey]);

  const lab = getLabProgress();
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

export function getLabOverallProgress(labKey: string, totalTasks: number, totalLessons: number): number {
  try {
    const state = loadProgress();
    const lab = state[labKey];
    if (!lab) return 0;
    const t = totalTasks > 0 ? (lab.doneTasks.length / totalTasks) * 100 : 0;
    const l = totalLessons > 0 ? (lab.completedLessons.length / totalLessons) * 100 : 0;
    return Math.round((t + l) / 2);
  } catch { return 0; }
}
