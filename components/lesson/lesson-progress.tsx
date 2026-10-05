'use client';

import { Check, LoaderCircle, Square } from 'lucide-react';
import { buttonClass } from '@/components/ui/button-class';
import { LESSON_STAGES, type LessonStage } from '@/lib/ai/lesson-plan';
import { cn } from '@/lib/utils';

interface LessonProgressProps {
  stage: LessonStage;
  receivedChars: number;
  onCancel: () => void;
}

/** Bước 2: tiến độ THẬT dựa trên phần JSON AI đã trả về (không phải thanh chạy giả). */
export function LessonProgress({ stage, receivedChars, onCancel }: LessonProgressProps) {
  const current = LESSON_STAGES.findIndex((s) => s.id === stage);
  const percent = Math.round(((current + 0.5) / LESSON_STAGES.length) * 100);

  return (
    <section
      aria-labelledby="lesson-step2-title"
      aria-busy="true"
      className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8"
    >
      <div className="flex flex-col items-center text-center">
        <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#4338CA] text-white shadow-lg shadow-indigo-900/30">
          <LoaderCircle className="h-8 w-8 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        </span>
        <h2 id="lesson-step2-title" className="mt-4 font-display text-xl font-bold text-foreground">
          Bước 2: AI đang soạn giáo án song ngữ…
        </h2>
        <p className="mt-1 max-w-lg text-sm text-muted-foreground">
          Thường mất 30 giây – 2 phút tuỳ độ dài giáo án. Thầy/Cô vui lòng giữ nguyên trang này cho đến khi hoàn tất.
        </p>
      </div>

      <div className="mx-auto mt-6 max-w-lg">
        <div
          className="h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Tiến độ soạn giáo án"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-500" style={{ width: `${percent}%` }} />
        </div>

        <ol className="mt-5 space-y-2">
          {LESSON_STAGES.map((s, index) => {
            const done = index < current;
            const active = index === current;
            return (
              <li
                key={s.id}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
                  active && 'bg-indigo-50 font-semibold text-indigo-900 dark:bg-indigo-500/15 dark:text-indigo-100',
                  done && 'text-emerald-700 dark:text-emerald-300',
                  !done && !active && 'text-muted-foreground',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    done ? 'bg-emerald-500 text-white' : active ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground',
                  )}
                  aria-hidden="true"
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : active ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : index + 1}
                </span>
                {s.label}
                {done && <span className="sr-only">(xong)</span>}
                {active && <span className="sr-only">(đang thực hiện)</span>}
              </li>
            );
          })}
        </ol>

        <p className="mt-4 text-center text-xs text-muted-foreground" aria-live="polite">
          {receivedChars > 0 ? `Đã nhận ${receivedChars.toLocaleString('vi-VN')} ký tự từ AI` : 'Đang gửi giáo án cho AI…'}
        </p>

        <div className="mt-5 flex justify-center">
          <button type="button" onClick={onCancel} className={buttonClass('secondary', 'text-sm')}>
            <Square className="h-4 w-4 fill-current text-rose-600" aria-hidden="true" /> Huỷ
          </button>
        </div>
      </div>
    </section>
  );
}
