import { useSyncExternalStore } from 'react';
import { isValidGoogleAiApiKey } from './api-key';
import { getActiveApiKey, loadAiSettings, saveAiSettings, type AiSettings } from './settings';

type Listener = () => void;

const listeners = new Set<Listener>();
let cache: AiSettings | null = null;
const SERVER_SNAPSHOT: AiSettings = loadAiSettings(null);

/** Store cấu hình AI dùng chung cho mọi component (tương thích SSR qua useSyncExternalStore). */
export const aiSettingsStore = {
  getSnapshot(): AiSettings {
    if (!cache) cache = loadAiSettings();
    return cache;
  },
  getServerSnapshot(): AiSettings {
    return SERVER_SNAPSHOT;
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  save(next: AiSettings): AiSettings {
    cache = saveAiSettings(next);
    listeners.forEach((l) => l());
    return cache;
  },
};

export function useAiSettings(): AiSettings {
  return useSyncExternalStore(aiSettingsStore.subscribe, aiSettingsStore.getSnapshot, aiSettingsStore.getServerSnapshot);
}

/** AI sẵn sàng khi provider đã được người dùng xác nhận và có key đúng định dạng. */
export const isAiReady = (settings: AiSettings): boolean =>
  settings.providerConfirmed && isValidGoogleAiApiKey(getActiveApiKey(settings));

/** Giọng đọc AI chỉ dùng với Gemini API. */
export const canUseAiVoice = (settings: AiSettings): boolean =>
  settings.useAiVoice && settings.provider === 'gemini' && isAiReady(settings);
