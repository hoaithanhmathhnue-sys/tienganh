// @vitest-environment jsdom
import { beforeEach, describe, it, expect } from 'vitest';
import { DEFAULT_LESSON_SETTINGS } from '@/lib/lesson-options';
import { createSavedLesson, lessonHistoryStore, MAX_SAVED_LESSONS, saveLessonPlan } from '@/lib/lesson-store';
import { samplePlan } from './fixtures/lesson-plan';

beforeEach(() => localStorage.clear());

describe('lessonHistoryStore', () => {
  it('lưu giáo án mới lên đầu danh sách', () => {
    const a = createSavedLesson(samplePlan, DEFAULT_LESSON_SETTINGS, 'gemini-3.8-flash');
    const b = createSavedLesson({ ...samplePlan, title: { vi: 'Bài 2', en: 'Lesson 2' } }, DEFAULT_LESSON_SETTINGS, 'gemini-3.8-flash');
    saveLessonPlan(a);
    saveLessonPlan(b);
    expect(lessonHistoryStore.getSnapshot().map((x) => x.id)).toEqual([b.id, a.id]);
    expect(a.id).not.toBe(b.id);
  });

  it(`chỉ giữ ${MAX_SAVED_LESSONS} giáo án gần nhất`, () => {
    const ids: string[] = [];
    for (let i = 0; i < MAX_SAVED_LESSONS + 3; i++) {
      const item = createSavedLesson(samplePlan, DEFAULT_LESSON_SETTINGS, 'm');
      ids.push(item.id);
      saveLessonPlan(item);
    }
    const list = lessonHistoryStore.getSnapshot();
    expect(list).toHaveLength(MAX_SAVED_LESSONS);
    expect(list[0].id).toBe(ids.at(-1));
  });

  it('dữ liệu hỏng / sai cấu trúc bị bỏ qua', () => {
    localStorage.setItem('evd_lesson_plans', '{oops');
    expect(lessonHistoryStore.getSnapshot()).toEqual([]);
    const good = createSavedLesson(samplePlan, DEFAULT_LESSON_SETTINGS, 'm');
    localStorage.setItem('evd_lesson_plans', JSON.stringify([good, { id: 'x' }, null]));
    expect(lessonHistoryStore.getSnapshot().map((x) => x.id)).toEqual([good.id]);
  });

  it('xoá một giáo án', () => {
    const a = createSavedLesson(samplePlan, DEFAULT_LESSON_SETTINGS, 'm');
    saveLessonPlan(a);
    lessonHistoryStore.remove(a.id);
    expect(lessonHistoryStore.getSnapshot()).toEqual([]);
  });
});
