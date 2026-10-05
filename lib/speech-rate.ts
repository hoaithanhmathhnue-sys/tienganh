import { useSyncExternalStore } from 'react';
import { getStorage } from '@/lib/storage';

export const SPEECH_RATES = [0.5, 0.75, 1] as const;
export type SpeechRate = (typeof SPEECH_RATES)[number];

export const DEFAULT_SPEECH_RATE: SpeechRate = 0.75;

export const SPEECH_RATE_LABELS: Record<SpeechRate, string> = {
  0.5: 'Chậm',
  0.75: 'Vừa',
  1: 'Chuẩn',
};

const KEY = 'evd_speech_rate';
const listeners = new Set<() => void>();

const parse = (raw: string | null): SpeechRate => {
  const value = Number(raw);
  return (SPEECH_RATES as readonly number[]).includes(value) ? (value as SpeechRate) : DEFAULT_SPEECH_RATE;
};

/** Tốc độ đọc dùng chung toàn app (lưu trong trình duyệt). */
export const speechRateStore = {
  getSnapshot(): SpeechRate {
    try {
      return parse(getStorage()?.getItem(KEY) ?? null);
    } catch {
      return DEFAULT_SPEECH_RATE;
    }
  },
  getServerSnapshot: (): SpeechRate => DEFAULT_SPEECH_RATE,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  set(rate: SpeechRate) {
    try {
      getStorage()?.setItem(KEY, String(rate));
    } catch {
      // bộ nhớ đầy hoặc bị chặn — bỏ qua
    }
    listeners.forEach((l) => l());
  },
};

export const useSpeechRate = (): SpeechRate =>
  useSyncExternalStore(speechRateStore.subscribe, speechRateStore.getSnapshot, speechRateStore.getServerSnapshot);

/** Chỉ dẫn nhịp đọc cho giọng Gemini TTS (đổi tốc độ bằng lời nhắc, không làm méo giọng). */
export const ttsPacePrompt = (rate: SpeechRate): string => {
  if (rate === 0.5) return 'Say very slowly and clearly, with a short pause between words, for young learners:';
  if (rate === 0.75) return 'Say clearly and cheerfully, at a slightly slow pace for young learners:';
  return 'Say clearly and naturally, at a normal speaking pace:';
};
