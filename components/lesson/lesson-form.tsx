'use client';

import { useRef, useState, type DragEvent } from 'react';
import { Check, FileUp, LoaderCircle, RotateCcw, Settings2, Sparkles, TriangleAlert, Upload, Wand2, X } from 'lucide-react';
import { toast } from 'sonner';
import { buttonClass } from '@/components/ui/button-class';
import { MAX_SOURCE_CHARS } from '@/lib/ai/lesson-plan';
import { ACCEPTED_LESSON_FILES, LessonFileError, readLessonFile } from '@/lib/lesson-file';
import {
  ENGLISH_LEVELS,
  GRADES,
  MAX_DURATION_LENGTH,
  OUTPUT_MODES,
  SUBJECTS,
  type EnglishLevel,
  type Grade,
  type LessonSettings,
  type OutputMode,
} from '@/lib/lesson-options';
import { LESSON_SAMPLES } from '@/lib/lesson-samples';
import { cn } from '@/lib/utils';

export const fieldClass =
  'min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30';

const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300';

export interface LessonFormError {
  message: string;
  canOpenSettings: boolean;
}

interface LessonFormProps {
  settings: LessonSettings;
  onSettingsChange: (settings: LessonSettings) => void;
  source: string;
  onSourceChange: (source: string) => void;
  error: LessonFormError | null;
  onDismissError: () => void;
  onOpenSettings: () => void;
  onSubmit: () => void;
}

export function LessonForm({
  settings,
  onSettingsChange,
  source,
  onSourceChange,
  error,
  onDismissError,
  onOpenSettings,
  onSubmit,
}: LessonFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const set = <K extends keyof LessonSettings>(key: K, value: LessonSettings[K]) => onSettingsChange({ ...settings, [key]: value });

  const tooLong = source.length > MAX_SOURCE_CHARS;

  const handleFile = async (file: File | undefined) => {
    if (!file || reading) return;
    setReading(true);
    try {
      const text = await readLessonFile(file);
      onSourceChange(text);
      setFileName(file.name);
      toast.success(`Đã đọc "${file.name}"`, { description: `${text.length.toLocaleString('vi-VN')} ký tự — kiểm tra lại nội dung bên dưới.` });
    } catch (err) {
      toast.error(err instanceof LessonFileError ? err.message : 'Không đọc được file. Thầy/Cô thử dán nội dung vào ô bên dưới.');
    } finally {
      setReading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void handleFile(event.dataTransfer.files?.[0]);
  };

  const applySample = (id: string) => {
    const sample = LESSON_SAMPLES.find((s) => s.id === id);
    if (!sample) return;
    onSettingsChange({ ...settings, ...sample.settings });
    onSourceChange(sample.content);
    setFileName(null);
    toast.success('Đã nạp giáo án mẫu', { description: sample.label });
  };

  return (
    <section aria-labelledby="lesson-step1-title" className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <h2 id="lesson-step1-title" className="font-display text-lg font-bold text-foreground sm:text-xl">
        Bước 1: Cấu hình thông số &amp; nhập nội dung giáo án gốc
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Chọn khối lớp, môn học, trình độ tiếng Anh của Thầy/Cô và dán/tải nội dung Kế hoạch bài dạy để AI chuyển đổi song ngữ.
      </p>

      {/* ─── Thông số ─── */}
      <div className="mt-5 grid gap-5 rounded-2xl border border-border bg-muted/40 p-4 md:grid-cols-2 sm:p-5">
        <div className="space-y-4">
          <div>
            <label htmlFor="lesson-grade" className={labelClass}>
              Khối lớp
            </label>
            <select id="lesson-grade" value={settings.grade} onChange={(e) => set('grade', e.target.value as Grade)} className={fieldClass}>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  Lớp {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="lesson-subject" className={labelClass}>
              Môn học
            </label>
            <select id="lesson-subject" value={settings.subjectId} onChange={(e) => set('subjectId', e.target.value)} className={fieldClass}>
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.vi} ({s.en})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="lesson-duration" className={labelClass}>
              Thời lượng tiết học
            </label>
            <input
              id="lesson-duration"
              value={settings.duration}
              maxLength={MAX_DURATION_LENGTH}
              onChange={(e) => set('duration', e.target.value)}
              placeholder="35 phút"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="space-y-4">
          <fieldset>
            <legend className={labelClass}>Trình độ tiếng Anh của giáo viên</legend>
            <div className="space-y-2" role="radiogroup">
              {ENGLISH_LEVELS.map((level) => {
                const active = settings.level === level.id;
                return (
                  <label
                    key={level.id}
                    className={cn(
                      'flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-all',
                      active
                        ? 'border-indigo-600 bg-indigo-50 shadow-sm ring-1 ring-indigo-600 dark:bg-indigo-500/15'
                        : 'border-border bg-background hover:border-indigo-300',
                    )}
                  >
                    <input
                      type="radio"
                      name="lesson-level"
                      value={level.id}
                      checked={active}
                      onChange={() => set('level', level.id as EnglishLevel)}
                      className="sr-only"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold uppercase tracking-wide text-foreground">{level.label}</span>
                      <span className="block text-xs text-muted-foreground">{level.description}</span>
                    </span>
                    <Check className={cn('mt-0.5 h-4 w-4 shrink-0 text-indigo-600', !active && 'invisible')} aria-hidden="true" />
                  </label>
                );
              })}
            </div>
          </fieldset>
          <div>
            <label htmlFor="lesson-mode" className={labelClass}>
              Chế độ đầu ra (Output mode)
            </label>
            <select id="lesson-mode" value={settings.mode} onChange={(e) => set('mode', e.target.value as OutputMode)} className={fieldClass}>
              {OUTPUT_MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} ({m.description})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ─── Giáo án mẫu ─── */}
      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
        <p className="text-xs font-bold uppercase tracking-wide text-amber-900 dark:text-amber-200">Thử nhanh với giáo án mẫu có sẵn:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {LESSON_SAMPLES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => applySample(sample.id)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-amber-300 bg-white px-3 text-left text-sm font-semibold text-amber-950 shadow-sm transition-colors hover:border-amber-400 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-slate-900 dark:text-amber-100 dark:hover:bg-amber-500/15"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Tải file ─── */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!dragging) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'mt-5 flex flex-col items-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors',
          dragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-border bg-background',
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
          {reading ? <LoaderCircle className="h-6 w-6 animate-spin" aria-hidden="true" /> : <Upload className="h-6 w-6" aria-hidden="true" />}
        </span>
        <p className="mt-3 text-sm font-semibold text-foreground">Kéo thả tệp Word (.docx), .txt hoặc .md vào đây</p>
        <p className="mt-1 text-xs text-muted-foreground">Đọc ngay trên trình duyệt, không tải file lên máy chủ · Dung lượng tối đa 10 MB</p>
        <input
          ref={fileInputRef}
          id="lesson-file"
          type="file"
          accept={`${ACCEPTED_LESSON_FILES},.doc`}
          className="sr-only"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={reading}
          className={buttonClass('secondary', 'mt-4 text-sm font-semibold uppercase tracking-wide')}
        >
          <FileUp className="h-4 w-4" aria-hidden="true" /> {reading ? 'Đang đọc file…' : 'Chọn tệp từ máy tính'}
        </button>
        {fileName && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200">
            <Check className="h-3.5 w-3.5" aria-hidden="true" /> Đã nạp: {fileName}
          </p>
        )}
      </div>

      <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground" aria-hidden="true">
        <span className="h-px flex-1 bg-border" /> hoặc dán văn bản <span className="h-px flex-1 bg-border" />
      </div>

      {/* ─── Dán nội dung ─── */}
      <div>
        <div className="flex items-end justify-between gap-2">
          <label htmlFor="lesson-source" className={labelClass}>
            Dán nội dung giáo án tiếng Việt tại đây
          </label>
          {source && (
            <button
              type="button"
              onClick={() => {
                onSourceChange('');
                setFileName(null);
              }}
              className={buttonClass('ghost', 'mb-1 min-h-9 text-xs')}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" /> Xoá nội dung
            </button>
          )}
        </div>
        <textarea
          id="lesson-source"
          value={source}
          onChange={(e) => onSourceChange(e.target.value)}
          rows={10}
          aria-describedby="lesson-source-count"
          placeholder={`VD: KẾ HOẠCH BÀI DẠY MÔN TOÁN LỚP 3 – PHÉP CỘNG CÁC SỐ TRONG PHẠM VI 10 000\nI. YÊU CẦU CẦN ĐẠT: Học sinh thực hiện được phép cộng…\nII. ĐỒ DÙNG DẠY HỌC: …\nIII. CÁC HOẠT ĐỘNG DẠY HỌC:\n  1. Khởi động: GV tổ chức trò chơi…\n  2. Khám phá: GV viết phép tính 4 523 + 2 314 lên bảng…`}
          className={cn(fieldClass, 'min-h-[220px] resize-y py-3 font-mono text-[13px] leading-relaxed')}
        />
        <p
          id="lesson-source-count"
          className={cn('mt-1 text-right text-xs', tooLong ? 'font-semibold text-amber-700 dark:text-amber-300' : 'text-muted-foreground')}
        >
          {source.length.toLocaleString('vi-VN')} / {MAX_SOURCE_CHARS.toLocaleString('vi-VN')} ký tự
          {tooLong && ' — phần vượt quá sẽ không được gửi cho AI, Thầy/Cô nên rút gọn hoặc tách bài.'}
        </p>
      </div>

      {error && (
        <div role="alert" className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="flex items-start gap-2 text-sm text-destructive">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="flex-1">{error.message}</span>
            <button type="button" onClick={onDismissError} aria-label="Ẩn thông báo lỗi" className="-m-1 rounded-lg p-1 hover:bg-destructive/10">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={onSubmit} className={buttonClass('secondary', 'text-sm')}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Thử lại
            </button>
            {error.canOpenSettings && (
              <button type="button" onClick={onOpenSettings} className={buttonClass('soft', 'text-sm')}>
                <Settings2 className="h-4 w-4" aria-hidden="true" /> Mở Cài đặt AI
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse items-stretch gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          AI giữ nguyên 100% mục tiêu và tiến trình bài dạy, chỉ bổ sung tiếng Anh “Đúng – Ngắn – Tự nhiên”.
        </p>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!source.trim() || reading}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#4338CA] px-6 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-indigo-900/20 transition-all hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Wand2 className="h-5 w-5" aria-hidden="true" /> Bắt đầu chuyển đổi bằng AI
        </button>
      </div>
    </section>
  );
}
