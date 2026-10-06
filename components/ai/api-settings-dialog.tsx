'use client';

import { useState } from 'react';
import { CheckCircle2, ExternalLink, Eye, EyeOff, KeyRound, Settings2, ShieldCheck, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import { buttonClass } from '@/components/ui/button-class';
import { isValidGoogleAiApiKey, maskApiKey } from '@/lib/ai/api-key';
import { getModelsForProvider, TTS_VOICES, type AiProvider } from '@/lib/ai/models';
import { aiSettingsStore, useAiSettings } from '@/lib/ai/settings-store';
import type { AiSettings } from '@/lib/ai/settings';
import { cn } from '@/lib/utils';

const PROVIDERS: { id: AiProvider; title: string; description: string; keyUrl: string; keyLabel: string }[] = [
  {
    id: 'gemini',
    title: 'Gemini API',
    description: 'Miễn phí để bắt đầu, lấy key tại Google AI Studio. Hỗ trợ giọng đọc AI.',
    keyUrl: 'https://aistudio.google.com/apikey',
    keyLabel: 'Lấy key tại Google AI Studio',
  },
  {
    id: 'agent-platform',
    title: 'Agent Platform API',
    description: 'Dành cho dự án Google Cloud đã bật Agent Platform API và billing.',
    keyUrl: 'https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/start/api-keys',
    keyLabel: 'Hướng dẫn tạo key Agent Platform',
  },
];

interface ApiSettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ApiSettingsDialog({ open, onClose }: ApiSettingsDialogProps) {
  const settings = useAiSettings();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cài đặt Google AI"
      description="API key chỉ được lưu trong trình duyệt của bạn, không gửi về máy chủ của ứng dụng."
      icon={<Settings2 className="h-5 w-5" aria-hidden="true" />}
    >
      {/* key theo lần mở để bản nháp luôn khởi tạo lại từ cấu hình đã lưu */}
      {open && <SettingsForm initial={settings} onDone={onClose} />}
    </Modal>
  );
}

function SettingsForm({ initial, onDone }: { initial: AiSettings; onDone: () => void }) {
  const [draft, setDraft] = useState<AiSettings>(initial);
  const [showKey, setShowKey] = useState(false);

  const provider = draft.provider;
  const key = draft.apiKeys[provider];
  const trimmed = key.trim();
  const keyValid = isValidGoogleAiApiKey(trimmed);
  const showFormatError = trimmed.length > 0 && !keyValid;
  const models = getModelsForProvider(provider);
  const info = PROVIDERS.find((p) => p.id === provider) ?? PROVIDERS[0];
  const voiceAvailable = provider === 'gemini';

  const update = (patch: Partial<AiSettings>) => setDraft((d) => ({ ...d, ...patch }));
  const setKey = (value: string) => setDraft((d) => ({ ...d, apiKeys: { ...d.apiKeys, [d.provider]: value } }));
  const setModel = (value: string) => setDraft((d) => ({ ...d, models: { ...d.models, [d.provider]: value } }));

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!trimmed) {
      toast.error('Vui lòng nhập API key cho dịch vụ đã chọn.');
      return;
    }
    if (!keyValid) {
      toast.error('API key không đúng định dạng (phải bắt đầu bằng AIzaSy… hoặc AQ…).');
      return;
    }
    aiSettingsStore.save(draft);
    toast.success(`Đã lưu cấu hình ${info.title}.`);
    onDone();
  };

  const handleClearKey = () => {
    const next: AiSettings = { ...draft, apiKeys: { ...draft.apiKeys, [provider]: '' } };
    setDraft(next);
    aiSettingsStore.save(next);
    toast.success(`Đã xoá API key của ${info.title} khỏi trình duyệt.`);
  };

  return (
    <form onSubmit={handleSave} className="space-y-5" noValidate>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">1. Chọn dịch vụ</legend>
        <div role="radiogroup" aria-label="Dịch vụ Google AI" className="grid gap-2 sm:grid-cols-2">
          {PROVIDERS.map((p) => {
            const active = p.id === provider;
            const hasKey = isValidGoogleAiApiKey(draft.apiKeys[p.id].trim());
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => update({ provider: p.id })}
                className={cn(
                  'relative rounded-xl border-2 p-3 text-left transition-colors',
                  active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/50',
                )}
              >
                <span className="flex items-center gap-2 font-semibold">
                  {active ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/40" aria-hidden="true" />
                  )}
                  {p.title}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">{p.description}</span>
                {hasKey && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <KeyRound className="h-3 w-3" aria-hidden="true" /> Đã có key
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="ai-api-key" className="mb-2 block text-sm font-semibold">
          2. API key cho {info.title}
        </label>
        <div className="relative">
          <input
            id="ai-api-key"
            type={showKey ? 'text' : 'password'}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="AIzaSy… hoặc AQ…"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={showFormatError}
            aria-describedby="ai-api-key-hint"
            className={cn(
              'h-11 w-full rounded-xl border bg-background pl-3 pr-12 font-mono text-sm outline-none transition-colors focus:ring-2 focus:ring-ring/40',
              showFormatError ? 'border-destructive' : 'border-input focus:border-primary',
            )}
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            aria-label={showKey ? 'Ẩn API key' : 'Hiện API key'}
            className="absolute right-0 top-0 inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground"
          >
            {showKey ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
        <p id="ai-api-key-hint" className={cn('mt-1.5 text-xs', showFormatError ? 'text-destructive' : 'text-muted-foreground')}>
          {showFormatError
            ? 'Key phải bắt đầu bằng AIzaSy… hoặc AQ… — hãy kiểm tra lại.'
            : keyValid
              ? `Key hiện tại: ${maskApiKey(trimmed)}`
              : 'Key được lưu riêng cho từng dịch vụ. Hệ thống không tự đoán dịch vụ từ tiền tố key.'}
        </p>
        <a
          href={info.keyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {info.keyLabel} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      <div>
        <label htmlFor="ai-model" className="mb-2 block text-sm font-semibold">
          3. Mô hình
        </label>
        <select
          id="ai-model"
          value={draft.models[provider]}
          onChange={(e) => setModel(e.target.value)}
          className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label} — {m.note}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Khi model quá tải, app tự động thử model dự phòng và báo cho bạn biết.
        </p>
      </div>

      <fieldset className={cn('rounded-xl border border-border p-3', !voiceAvailable && 'opacity-60')}>
        <legend className="px-1 text-sm font-semibold">4. Giọng đọc AI (tuỳ chọn)</legend>
        <label className="flex min-h-11 cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={voiceAvailable && draft.useAiVoice}
            disabled={!voiceAvailable}
            onChange={(e) => update({ useAiVoice: e.target.checked })}
            className="h-5 w-5 accent-[hsl(var(--primary))]"
          />
          <span className="text-sm">
            <Volume2 className="mr-1 inline h-4 w-4 align-[-3px]" aria-hidden="true" />
            Dùng giọng Gemini thay cho giọng trình duyệt
          </span>
        </label>
        {voiceAvailable ? (
          <select
            aria-label="Chọn giọng đọc"
            value={draft.voiceName}
            disabled={!draft.useAiVoice}
            onChange={(e) => update({ voiceName: e.target.value })}
            className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary disabled:opacity-50"
          >
            {TTS_VOICES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-xs text-muted-foreground">Giọng đọc AI chỉ khả dụng với Gemini API.</p>
        )}
      </fieldset>

      <p className="flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        Không chia sẻ máy tính dùng chung khi đã lưu key. Bạn có thể xoá key bất cứ lúc nào.
      </p>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
        {key && (
          <button type="button" onClick={handleClearKey} className={buttonClass('danger', 'mr-auto')}>
            Xoá key
          </button>
        )}
        <button type="button" onClick={onDone} className={buttonClass('secondary')}>
          Huỷ
        </button>
        <button type="submit" className={buttonClass('primary')}>
          Lưu cấu hình
        </button>
      </div>
    </form>
  );
}
