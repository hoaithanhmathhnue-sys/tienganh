// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { getBadges, learningProgressStore, type LearningProgress } from '@/lib/learning-progress';

const emptyProgress = (): LearningProgress => ({
  learnedPhraseIds: [],
  completedDailyPhraseIds: [],
  pronunciationScores: {},
  xp: 0,
  currentStreak: 0,
  lastStudyDate: null,
});

beforeEach(() => localStorage.clear());

describe('learning progress', () => {
  it('chỉ cộng XP một lần cho mỗi mẫu câu tự học', () => {
    learningProgressStore.markPhraseLearned('math-add');
    learningProgressStore.markPhraseLearned('math-add');

    const progress = learningProgressStore.getSnapshot();
    expect(progress.learnedPhraseIds).toEqual(['math-add']);
    expect(progress.xp).toBe(10);
  });

  it('cập nhật điểm phát âm tốt nhất và ngày học liên tiếp', () => {
    learningProgressStore.recordPronunciation('math-add', 72, new Date(2026, 9, 6));
    learningProgressStore.recordPronunciation('math-add', 96, new Date(2026, 9, 6));

    const progress = learningProgressStore.getSnapshot();
    expect(progress.pronunciationScores['math-add']).toBe(96);
    expect(progress.currentStreak).toBe(1);
    expect(progress.xp).toBe(20);
  });

  it('mở khoá huy hiệu theo mốc tiến trình', () => {
    const progress = emptyProgress();
    progress.learnedPhraseIds = Array.from({ length: 10 }, (_, index) => 'phrase-' + index);
    progress.pronunciationScores = { 'phrase-1': 90 };
    progress.currentStreak = 3;

    expect(getBadges(progress).filter((badge) => badge.unlocked).map((badge) => badge.id)).toEqual([
      'first-steps',
      'classroom-voice',
      'daily-rhythm',
    ]);
  });
});
