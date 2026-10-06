import { useSyncExternalStore } from 'react';
import { getStorage } from '@/lib/storage';

export interface LearningProgress {
  learnedPhraseIds: string[];
  completedDailyPhraseIds: string[];
  pronunciationScores: Record<string, number>;
  xp: number;
  currentStreak: number;
  lastStudyDate: string | null;
}

export interface LearningBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

export const LEARNING_STORAGE_KEY = 'evd_learning_progress';

const EMPTY_PROGRESS: LearningProgress = {
  learnedPhraseIds: [],
  completedDailyPhraseIds: [],
  pronunciationScores: {},
  xp: 0,
  currentStreak: 0,
  lastStudyDate: null,
};

const getDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
};

const dateDifference = (from: string, to: string): number => {
  const fromDate = new Date(from + 'T00:00:00');
  const toDate = new Date(to + 'T00:00:00');
  return Math.round((toDate.getTime() - fromDate.getTime()) / 86_400_000);
};

const isValidProgress = (value: unknown): value is LearningProgress => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    Array.isArray(item.learnedPhraseIds) && item.learnedPhraseIds.every((id) => typeof id === 'string') &&
    Array.isArray(item.completedDailyPhraseIds) && item.completedDailyPhraseIds.every((id) => typeof id === 'string') &&
    typeof item.pronunciationScores === 'object' && item.pronunciationScores !== null &&
    typeof item.xp === 'number' && Number.isFinite(item.xp) &&
    typeof item.currentStreak === 'number' && Number.isFinite(item.currentStreak) &&
    (item.lastStudyDate === null || typeof item.lastStudyDate === 'string')
  );
};

const readProgress = (): LearningProgress => {
  try {
    const raw = getStorage()?.getItem(LEARNING_STORAGE_KEY);
    if (!raw) return EMPTY_PROGRESS;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidProgress(parsed)) return EMPTY_PROGRESS;
    return {
      learnedPhraseIds: [...new Set(parsed.learnedPhraseIds)],
      completedDailyPhraseIds: [...new Set(parsed.completedDailyPhraseIds)],
      pronunciationScores: { ...parsed.pronunciationScores },
      xp: Math.max(0, Math.round(parsed.xp)),
      currentStreak: Math.max(0, Math.round(parsed.currentStreak)),
      lastStudyDate: parsed.lastStudyDate,
    };
  } catch {
    return EMPTY_PROGRESS;
  }
};

const updateStreak = (progress: LearningProgress, date: Date): LearningProgress => {
  const today = getDateKey(date);
  if (progress.lastStudyDate === today) return progress;
  const gap = progress.lastStudyDate ? dateDifference(progress.lastStudyDate, today) : 0;
  return {
    ...progress,
    currentStreak: !progress.lastStudyDate || gap > 1 ? 1 : progress.currentStreak + 1,
    lastStudyDate: today,
  };
};

const listeners = new Set<() => void>();
let cache: LearningProgress | null = null;
let cacheRaw: string | null | undefined;

const write = (next: LearningProgress) => {
  cache = next;
  try {
    const raw = JSON.stringify(next);
    getStorage()?.setItem(LEARNING_STORAGE_KEY, raw);
    cacheRaw = raw;
  } catch {
    // Bộ nhớ đầy hoặc bị chặn, giao diện vẫn dùng được trong phiên hiện tại.
  }
  listeners.forEach((listener) => listener());
};

export const learningProgressStore = {
  getSnapshot(): LearningProgress {
    let raw: string | null = null;
    try {
      raw = getStorage()?.getItem(LEARNING_STORAGE_KEY) ?? null;
    } catch {
      raw = null;
    }
    if (!cache || raw !== cacheRaw) {
      cache = readProgress();
      cacheRaw = raw;
    }
    return cache;
  },
  getServerSnapshot: (): LearningProgress => EMPTY_PROGRESS,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  markPhraseLearned(id: string, date = new Date()) {
    const current = learningProgressStore.getSnapshot();
    if (current.learnedPhraseIds.includes(id)) return;
    const next = updateStreak(current, date);
    write({ ...next, learnedPhraseIds: [id, ...next.learnedPhraseIds], xp: next.xp + 10 });
  },
  markDailyCompleted(id: string, date = new Date()) {
    const current = learningProgressStore.getSnapshot();
    if (current.completedDailyPhraseIds.includes(id)) return;
    const next = updateStreak(current, date);
    write({ ...next, completedDailyPhraseIds: [id, ...next.completedDailyPhraseIds], xp: next.xp + 15 });
  },
  recordPronunciation(id: string, score: number, date = new Date()) {
    const current = learningProgressStore.getSnapshot();
    const boundedScore = Math.max(0, Math.min(100, Math.round(score)));
    const previousScore = current.pronunciationScores[id] ?? 0;
    const next = updateStreak(current, date);
    write({
      ...next,
      pronunciationScores: { ...next.pronunciationScores, [id]: Math.max(previousScore, boundedScore) },
      xp: next.xp + (id in current.pronunciationScores ? 0 : 20),
    });
  },
  reset() {
    write({ ...EMPTY_PROGRESS, learnedPhraseIds: [], completedDailyPhraseIds: [], pronunciationScores: {} });
  },
};

export const useLearningProgress = () =>
  useSyncExternalStore(learningProgressStore.subscribe, learningProgressStore.getSnapshot, learningProgressStore.getServerSnapshot);

export const getBadges = (progress: LearningProgress): LearningBadge[] => {
  const pronunciationCount = Object.values(progress.pronunciationScores).filter((score) => score >= 85).length;
  return [
    { id: 'first-steps', title: 'Bước đầu hào hứng', description: 'Hoàn thành mẫu câu đầu tiên', icon: '🏅', progress: Math.min(progress.learnedPhraseIds.length, 1), target: 1 },
    { id: 'classroom-voice', title: 'Giọng giáo viên tự tin', description: 'Đạt từ 85 điểm ở một bài phát âm', icon: '🎙️', progress: Math.min(pronunciationCount, 1), target: 1 },
    { id: 'daily-rhythm', title: 'Thói quen mỗi ngày', description: 'Học liên tiếp trong 3 ngày', icon: '🔥', progress: Math.min(progress.currentStreak, 3), target: 3 },
    { id: 'phrase-master', title: 'Giáo viên tích cực', description: 'Học 20 mẫu câu theo môn học', icon: '📚', progress: Math.min(progress.learnedPhraseIds.length, 20), target: 20 },
    { id: 'school-english', title: 'Giao tiếp học đường', description: 'Hoàn thành 5 mẫu Daily School English', icon: '🏫', progress: Math.min(progress.completedDailyPhraseIds.length, 5), target: 5 },
  ].map((badge) => ({ ...badge, unlocked: badge.progress >= badge.target }));
};
