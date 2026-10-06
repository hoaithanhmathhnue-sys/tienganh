'use client';

import { useState } from 'react';
import { Bot, ClipboardCopy, Cpu, FileDown, FilePlus2, LoaderCircle, MessageCircleMore, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { SpeakButton } from '@/components/slogan/speak-button';
import { buttonClass } from '@/components/ui/button-class';
import { askAssistant } from '@/lib/ai/chat-store';
import type { BiText, BilingualLessonPlan, LessonActivity } from '@/lib/ai/lesson-plan';
import { lessonFileName, lessonPlanChatPrompt, lessonPlanToMarkdown } from '@/lib/lesson-export';
import { OUTPUT_MODES, type OutputMode } from '@/lib/lesson-options';
import type { SavedLessonPlan } from '@/lib/lesson-store';
import { cn } from '@/lib/utils';

const CHAT_PROMPT_LIMIT = 3600;

/** Một cặp Việt–Anh: ngôn ngữ chính in thường, ngôn ngữ phụ in nghiêng nhạt bên dưới. */
function Bi({ value, mode, className }: { value: BiText; mode: OutputMode; className?: string }) {
  const vi = value.vi.trim();
  const en = value.en.trim();
  const primary = mode === 'C' ? en || vi : vi || en;
  const secondary = mode === 'A' ? '' : mode === 'C' ? (en ? vi : '') : vi ? en : '';
  if (!primary) return null;
  return (
    <span className={cn('block', className)}>
      <span className="block">{primary}</span>
      {secondary && (
        <span lang={mode === 'C' ? 'vi' : 'en'} className="mt-0.5 block text-[0.92em] italic text-muted-foreground">
          {secondary}
        </span>
      )}
    </span>
  );
}

function BiList({ items, mode }: { items: BiText[]; mode: OutputMode }) {
  if (!items.length) return <p className="text-sm italic text-muted-foreground">(Không có)</p>;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm leading-relaxed">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-hidden="true" />
          <Bi value={item} mode={mode} className="min-w-0 flex-1" />
        </li>
      ))}
    </ul>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 mt-8 border-b-2 border-indigo-600/20 pb-1.5 font-display text-base font-bold uppercase tracking-wide text-[#1E3A8A] dark:text-indigo-300">{children}</h3>;
}

function ActivityCard({ activity, index, mode }: { activity: LessonActivity; index: number; mode: OutputMode }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-background break-inside-avoid print:rounded-none">
      <header className="flex flex-wrap items-start gap-2 border-b border-border bg-muted/50 px-4 py-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1E3A8A] text-sm font-bold text-white" aria-hidden="true">
          {index + 1}
        </span>
        <h4 className="min-w-0 flex-1 font-semibold text-foreground">
          <Bi value={activity.title} mode={mode} />
        </h4>
        {activity.duration && (
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200">
            ⏱ {activity.duration}
          </span>
        )}
      </header>

      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3 text-sm leading-relaxed">
          {(activity.objective.vi || activity.objective.en) && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">🎯 Mục tiêu</p>
              <Bi value={activity.objective} mode={mode} />
            </div>
          )}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">👩‍🏫 Hoạt động của GV</p>
            <Bi value={activity.teacher} mode={mode} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">🧒 Hoạt động của HS</p>
            <Bi value={activity.students} mode={mode} />
          </div>
          {activity.note && (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
              💡 <span className="font-semibold">Lưu ý:</span> {activity.note}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 dark:border-indigo-500/30 dark:bg-indigo-500/10">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-indigo-800 dark:text-indigo-200">
            <MessageCircleMore className="h-4 w-4" aria-hidden="true" /> Teacher Talk
          </p>
          {activity.teacherTalk.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">(Hoạt động này không cần câu tiếng Anh)</p>
          ) : (
            <ul className="space-y-2.5">
              {activity.teacherTalk.map((talk, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p lang="en" className="font-semibold text-indigo-950 dark:text-indigo-50">
                      “{talk.en}”
                    </p>
                    {talk.ipa && <p className="font-mono text-xs text-muted-foreground">{talk.ipa}</p>}
                    <p className="text-sm text-foreground/85">
                      {talk.vi}
                      {talk.purpose && (
                        <span className="ml-1.5 inline-block rounded-md bg-white px-1.5 py-0.5 text-[11px] font-medium text-indigo-700 ring-1 ring-indigo-200 dark:bg-slate-900 dark:text-indigo-200 dark:ring-indigo-500/30">
                          {talk.purpose}
                        </span>
                      )}
                    </p>
                  </div>
                  <SpeakButton text={talk.en} showLabel={false} className="shrink-0 print:hidden" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}

interface LessonResultProps {
  saved: SavedLessonPlan;
  onRestart: () => void;
}

export function LessonResult({ saved, onRestart }: LessonResultProps) {
  const plan: BilingualLessonPlan = saved.plan;
  const [mode, setMode] = useState<OutputMode>(saved.settings.mode);
  const [exporting, setExporting] = useState(false);

  const downloadWord = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      // Thư viện docx chỉ tải khi cần để trang mở nhanh.
      const { lessonPlanToDocxBlob } = await import('@/lib/lesson-docx');
      const blob = await lessonPlanToDocxBlob(plan, mode);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = lessonFileName(plan);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast.success('Đã tải file Word', { description: link.download });
    } catch {
      toast.error('Không tạo được file Word. Thầy/Cô thử lại hoặc dùng In / PDF.');
    } finally {
      setExporting(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(lessonPlanToMarkdown(plan, mode));
      toast.success('Đã sao chép giáo án', { description: 'Dán vào Word, Google Docs hoặc Zalo.' });
    } catch {
      toast.error('Trình duyệt chặn sao chép. Thầy/Cô hãy dùng nút Tải Word.');
    }
  };

  const info = [plan.grade, plan.subject, plan.duration].filter(Boolean);

  return (
    <section aria-labelledby="lesson-result-title" className="space-y-4">
      {/* ─── Thanh công cụ ─── */}
      <div className="sticky top-2 z-20 flex flex-col gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-md backdrop-blur-md print:hidden lg:flex-row lg:items-center lg:justify-between">
        <div role="radiogroup" aria-label="Kiểu hiển thị song ngữ" className="flex flex-wrap gap-1.5">
          {OUTPUT_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={mode === m.id}
              title={m.description}
              onClick={() => setMode(m.id)}
              className={cn(
                'min-h-10 rounded-lg border px-3 text-xs font-semibold transition-colors',
                mode === m.id
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                  : 'border-border bg-background text-foreground hover:border-indigo-300',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={downloadWord} disabled={exporting} className={buttonClass('primary', 'text-sm')}>
            {exporting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FileDown className="h-4 w-4" aria-hidden="true" />}
            Tải Word
          </button>
          <button type="button" onClick={() => window.print()} className={buttonClass('secondary', 'text-sm')}>
            <Printer className="h-4 w-4" aria-hidden="true" /> In / PDF
          </button>
          <button type="button" onClick={copy} className={buttonClass('secondary', 'text-sm')}>
            <ClipboardCopy className="h-4 w-4" aria-hidden="true" /> Sao chép
          </button>
          <button type="button" onClick={() => askAssistant(lessonPlanChatPrompt(plan, CHAT_PROMPT_LIMIT))} className={buttonClass('soft', 'text-sm')}>
            <Bot className="h-4 w-4" aria-hidden="true" /> Hỏi trợ lý AI
          </button>
          <button type="button" onClick={onRestart} className={buttonClass('accent', 'text-sm')}>
            <FilePlus2 className="h-4 w-4" aria-hidden="true" /> Soạn giáo án khác
          </button>
        </div>
      </div>

      {/* ─── Giáo án ─── */}
      <article className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-8 print:border-0 print:p-0 print:shadow-none">
        <header className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Kế hoạch bài dạy song ngữ</p>
          <h2 id="lesson-result-title" className="mt-2 font-display text-2xl font-extrabold text-foreground sm:text-3xl">
            {plan.title.vi || plan.title.en}
          </h2>
          {plan.title.vi && plan.title.en && mode !== 'A' && (
            <p lang="en" className="mt-1 text-lg italic text-indigo-700 dark:text-indigo-300">
              {plan.title.en}
            </p>
          )}
          {info.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {info.map((x) => (
                <span key={x} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                  {x}
                </span>
              ))}
            </div>
          )}
          <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground print:hidden">
            <Cpu className="h-3.5 w-3.5" aria-hidden="true" /> Soạn bởi {saved.model} · {new Date(saved.createdAt).toLocaleString('vi-VN')}
          </p>
        </header>

        <SectionTitle>I. Yêu cầu cần đạt</SectionTitle>
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <p className="mb-2 text-sm font-bold text-foreground">1. Kiến thức, kĩ năng</p>
            <BiList items={plan.objectives} mode={mode} />
          </div>
          <div>
            <p className="mb-2 text-sm font-bold text-foreground">2. Năng lực</p>
            <BiList items={plan.competencies} mode={mode} />
          </div>
          <div>
            <p className="mb-2 text-sm font-bold text-foreground">3. Phẩm chất</p>
            <BiList items={plan.qualities} mode={mode} />
          </div>
        </div>

        <SectionTitle>II. Đồ dùng dạy học</SectionTitle>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-bold text-foreground">1. Giáo viên</p>
            <BiList items={plan.teacherMaterials} mode={mode} />
          </div>
          <div>
            <p className="mb-2 text-sm font-bold text-foreground">2. Học sinh</p>
            <BiList items={plan.studentMaterials} mode={mode} />
          </div>
        </div>

        <SectionTitle>III. Các hoạt động dạy học chủ yếu</SectionTitle>
        <div className="space-y-4">
          {plan.activities.map((activity, index) => (
            <ActivityCard key={index} activity={activity} index={index} mode={mode} />
          ))}
        </div>

        {plan.vocabulary.length > 0 && (
          <>
            <SectionTitle>IV. Từ vựng chuyên môn</SectionTitle>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full min-w-[560px] text-left text-sm">
                <caption className="sr-only">Từ vựng tiếng Anh chuyên môn của bài</caption>
                <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-3 py-2.5">Từ / cụm từ</th>
                    <th scope="col" className="px-3 py-2.5">Phiên âm</th>
                    <th scope="col" className="px-3 py-2.5">Nghĩa</th>
                    <th scope="col" className="px-3 py-2.5">Ví dụ</th>
                    <th scope="col" className="px-3 py-2.5 print:hidden">
                      <span className="sr-only">Nghe</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {plan.vocabulary.map((v, i) => (
                    <tr key={i} className="align-top">
                      <td lang="en" className="px-3 py-2.5 font-semibold text-indigo-900 dark:text-indigo-100">{v.word}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{v.ipa}</td>
                      <td className="px-3 py-2.5">{v.vi}</td>
                      <td lang="en" className="px-3 py-2.5 italic text-foreground/85">{v.example}</td>
                      <td className="px-2 py-1.5 text-right print:hidden">
                        <SpeakButton text={v.example ? `${v.word}. ${v.example}` : v.word} showLabel={false} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {plan.tips.length > 0 && (
          <>
            <SectionTitle>V. Lưu ý sư phạm</SectionTitle>
            <ul className="space-y-2 text-sm leading-relaxed">
              {plan.tips.map((tip, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden="true">✅</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <p className="mt-8 rounded-xl bg-muted/60 px-4 py-3 text-center text-xs text-muted-foreground print:hidden">
          Giáo án do AI hỗ trợ soạn — thầy/cô vui lòng rà soát nội dung, phiên âm trước khi sử dụng chính thức.
        </p>
      </article>
    </section>
  );
}
