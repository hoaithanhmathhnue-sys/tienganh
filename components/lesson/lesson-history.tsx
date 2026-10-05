'use client';

import { FileText, History, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { buttonClass } from '@/components/ui/button-class';
import { getSubject } from '@/lib/lesson-options';
import { lessonHistoryStore, MAX_SAVED_LESSONS, type SavedLessonPlan } from '@/lib/lesson-store';
import { useListStore } from '@/lib/stores';

export function LessonHistory({ onOpen }: { onOpen: (item: SavedLessonPlan) => void }) {
  const items = useListStore(lessonHistoryStore);
  if (items.length === 0) return null;

  const remove = (item: SavedLessonPlan) => {
    if (!window.confirm(`Xoá giáo án "${item.plan.title.vi || item.plan.title.en}" khỏi lịch sử?`)) return;
    lessonHistoryStore.remove(item.id);
    toast.success('Đã xoá giáo án khỏi lịch sử');
  };

  return (
    <section aria-labelledby="lesson-history-title" className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6 print:hidden">
      <h2 id="lesson-history-title" className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
        <History className="h-5 w-5 text-indigo-600" aria-hidden="true" /> Giáo án đã soạn gần đây
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Lưu {MAX_SAVED_LESSONS} giáo án gần nhất ngay trên trình duyệt này. Hãy tải file Word để lưu trữ lâu dài.
      </p>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3 rounded-2xl border border-border bg-background p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold text-foreground">{item.plan.title.vi || item.plan.title.en}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Lớp {item.settings.grade} · {getSubject(item.settings.subjectId).vi} · Mode {item.settings.mode} ·{' '}
                {new Date(item.createdAt).toLocaleDateString('vi-VN')}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button type="button" onClick={() => onOpen(item)} className={buttonClass('soft', 'min-h-10 text-xs')}>
                  Mở giáo án
                </button>
                <button
                  type="button"
                  onClick={() => remove(item)}
                  aria-label={`Xoá giáo án ${item.plan.title.vi}`}
                  className={buttonClass('danger', 'min-h-10 text-xs')}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Xoá
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
