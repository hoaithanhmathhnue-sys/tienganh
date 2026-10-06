'use client';

import { useRef, useState } from 'react';
import { KeyRound, LoaderCircle, RotateCcw, Settings2, Sparkles, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { buttonClass } from '@/components/ui/button-class';
import { AiError, FALLBACK_NOTICE, getFriendlyErrorMessage, parseApiError, type AiErrorType } from '@/lib/ai/errors';
import { getActiveApiKey, getActiveModel } from '@/lib/ai/settings';
import { isAiReady, useAiSettings } from '@/lib/ai/settings-store';
import {
  generateSlogans,
  MAX_TOPIC_LENGTH,
  type SloganGrade,
  type SloganLength,
  type SloganRequest,
} from '@/lib/ai/slogan-generator';
import { collectionStore, useListStore } from '@/lib/stores';
import { cn } from '@/lib/utils';

const QUICK_TOPICS = [
  'Tết Nguyên Đán',
  'An toàn giao thông',
  'Ngày Nhà giáo 20/11',
  'Bảo vệ môi trường',
  'Giờ ra chơi',
  'Gia đình',
  'Thể thao',
  'Mùa hè',
];

const COUNTS = [5, 8, 10] as const;
const GRADES: { id: SloganGrade; label: string }[] = [
  { id: 'all', label: 'Mọi khối' },
  { id: '1', label: 'Lớp 1' },
  { id: '2', label: 'Lớp 2' },
  { id: '3', label: 'Lớp 3' },
  { id: '4', label: 'Lớp 4' },
  { id: '5', label: 'Lớp 5' },
];

const SETTINGS_ERRORS: AiErrorType[] = [
  'MISSING_API_KEY',
  'INVALID_KEY_FORMAT',
  'INVALID_API_KEY',
  'PERMISSION_DENIED',
  'NOT_FOUND',
  'INVALID_ARGUMENT',
];

interface AiGeneratorPanelProps {
  onOpenSettings: () => void;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; added: number; model: string }
  | { kind: 'error'; type: AiErrorType; message: string };

export function AiGeneratorPanel({ onOpenSettings }: AiGeneratorPanelProps) {
  const settings = useAiSettings();
  const collection = useListStore(collectionStore);
  const ready = isAiReady(settings);

  const [topic, setTopic] = useState('');
  const [count, setCount] = useState<number>(5);
  const [length, setLength] = useState<SloganLength>('short');
  const [grade, setGrade] = useState<SloganGrade>('all');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const inFlight = useRef(false);

  const loading = status.kind === 'loading';

  const run = async () => {
    const cleanTopic = topic.trim();
    if (!cleanTopic) {
      toast.error('Hãy nhập hoặc chọn một chủ đề trước.');
      return;
    }
    if (!ready) {
      onOpenSettings();
      return;
    }
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus({ kind: 'loading' });

    const request: SloganRequest = { topic: cleanTopic, count, length, grade };
    try {
      const { slogans, model } = await generateSlogans(request, {
        provider: settings.provider,
        apiKey: getActiveApiKey(settings),
        selectedModel: getActiveModel(settings),
        existing: collection,
        onFallback: ({ from, to }) => toast.info(FALLBACK_NOTICE, { description: `${from} → ${to}` }),
      });
      const createdAt = new Date().toISOString();
      const added = collectionStore.add(slogans.map((s) => ({ ...s, topic: cleanTopic, createdAt })));
      setStatus({ kind: 'success', added, model });
      toast.success(`Đã thêm ${added} slogan mới vào bộ sưu tập.`);
    } catch (error) {
      const type = parseApiError(error);
      const message = error instanceof AiError ? error.message : getFriendlyErrorMessage(type, settings.provider);
      setStatus({ kind: 'error', type, message });
    } finally {
      inFlight.current = false;
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void run();
  };

  return (
    <section
      aria-labelledby="ai-generator-title"
      className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-amber-100/60 p-5 shadow-sm dark:to-amber-900/10 md:p-7"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" aria-hidden="true" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="ai-generator-title" className="flex items-center gap-2 font-display text-xl font-bold md:text-2xl">
              <Sparkles className="h-6 w-6 text-amber-500" aria-hidden="true" />
              Trợ lý AI tạo slogan
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Nhập chủ đề (tiếng Việt hoặc tiếng Anh), AI sẽ gợi ý slogan kèm phiên âm IPA và nghĩa tiếng Việt.
            </p>
          </div>
          <button type="button" onClick={onOpenSettings} className={buttonClass('secondary', 'text-sm')}>
            <Settings2 className="h-4 w-4" aria-hidden="true" />
            {ready ? 'Cài đặt AI' : 'Cấu hình API key'}
          </button>
        </div>

        {!ready && (
          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-100 sm:flex-row sm:items-center">
            <KeyRound className="h-6 w-6 shrink-0" aria-hidden="true" />
            <p className="flex-1 text-sm">
              Cần một API key Google AI (miễn phí tại Google AI Studio) để dùng trợ lý. Key chỉ lưu trong trình duyệt của bạn.
            </p>
            <button type="button" onClick={onOpenSettings} className={buttonClass('accent', 'text-sm')}>
              Mở cài đặt
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="ai-topic" className="mb-1.5 block text-sm font-semibold">
              Chủ đề
            </label>
            <input
              id="ai-topic"
              type="text"
              value={topic}
              maxLength={MAX_TOPIC_LENGTH}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="VD: Ngày hội đọc sách, Trung thu, Animals…"
              className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/40"
            />
            <div className="mt-2 flex flex-wrap gap-2" aria-label="Chủ đề gợi ý">
              {QUICK_TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(t)}
                  aria-pressed={topic === t}
                  className={cn(
                    'min-h-11 rounded-full border px-4 text-sm transition-colors',
                    topic === t
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <OptionGroup label="Số lượng">
              {COUNTS.map((c) => (
                <Segment key={c} active={count === c} onClick={() => setCount(c)}>
                  {c}
                </Segment>
              ))}
            </OptionGroup>
            <OptionGroup label="Độ dài">
              <Segment active={length === 'short'} onClick={() => setLength('short')}>
                Ngắn
              </Segment>
              <Segment active={length === 'medium'} onClick={() => setLength('medium')}>
                Vừa
              </Segment>
            </OptionGroup>
            <div>
              <label htmlFor="ai-grade" className="mb-1.5 block text-sm font-semibold">
                Khối lớp
              </label>
              <select
                id="ai-grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value as SloganGrade)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
              >
                {GRADES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className={buttonClass('primary', 'w-full text-base sm:w-auto sm:px-6')}>
            {loading ? (
              <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            )}
            {loading ? 'AI đang sáng tác…' : 'Tạo slogan'}
          </button>
        </form>

        <div aria-live="polite" className="mt-4">
          {loading && <GeneratorSkeleton count={Math.min(count, 4)} />}
          {status.kind === 'success' && (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
              {status.added > 0
                ? `Đã thêm ${status.added} slogan mới vào bộ sưu tập bên dưới.`
                : 'AI chỉ trả về các slogan đã có trong bộ sưu tập. Hãy thử chủ đề khác.'}{' '}
              <span className="opacity-75">Mô hình: {status.model}</span>
            </p>
          )}
          {status.kind === 'error' && (
            <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="flex items-start gap-2 text-sm text-destructive">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {status.message}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => void run()} className={buttonClass('secondary', 'text-sm')}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" /> Thử lại
                </button>
                {SETTINGS_ERRORS.includes(status.type) && (
                  <button type="button" onClick={onOpenSettings} className={buttonClass('soft', 'text-sm')}>
                    <Settings2 className="h-4 w-4" aria-hidden="true" /> Mở cài đặt
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function OptionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label}>
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      <div className="flex rounded-xl border border-input bg-background p-1">{children}</div>
    </div>
  );
}

function Segment({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'min-h-10 flex-1 rounded-lg text-sm font-medium transition-colors',
        active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

function GeneratorSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-3 md:grid-cols-2" aria-label="Đang tạo slogan">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-5">
          <div className="h-5 w-3/4 rounded bg-muted" />
          <div className="mt-3 h-3 w-1/2 rounded bg-muted" />
          <div className="mt-3 h-4 w-2/3 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
