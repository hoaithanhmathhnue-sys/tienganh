import { isBilingualLessonPlan, type BilingualLessonPlan } from '@/lib/ai/lesson-plan';
import { createLocalListStore } from '@/lib/local-list-store';
import { isLessonSettings, type LessonSettings } from '@/lib/lesson-options';

export interface SavedLessonPlan {
  id: string;
  createdAt: number;
  settings: LessonSettings;
  plan: BilingualLessonPlan;
  model: string;
}

/** Giới hạn để không làm đầy localStorage (mỗi giáo án ≈ 10–30 KB). */
export const MAX_SAVED_LESSONS = 10;

const isSavedLesson = (value: unknown): value is SavedLessonPlan => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.createdAt === 'number' &&
    typeof v.model === 'string' &&
    isLessonSettings(v.settings) &&
    isBilingualLessonPlan(v.plan)
  );
};

export const lessonHistoryStore = createLocalListStore<SavedLessonPlan>('evd_lesson_plans', isSavedLesson, (x) => x.id);

let counter = 0;
const newId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `lesson-${Date.now().toString(36)}-${(counter++).toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const createSavedLesson = (plan: BilingualLessonPlan, settings: LessonSettings, model: string): SavedLessonPlan => ({
  id: newId(),
  createdAt: Date.now(),
  settings,
  plan,
  model,
});

/** Lưu lên đầu danh sách và chỉ giữ MAX_SAVED_LESSONS giáo án gần nhất. */
export const saveLessonPlan = (item: SavedLessonPlan) => {
  lessonHistoryStore.add([item]);
  const list = lessonHistoryStore.getSnapshot();
  for (const old of list.slice(MAX_SAVED_LESSONS)) lessonHistoryStore.remove(old.id);
};
