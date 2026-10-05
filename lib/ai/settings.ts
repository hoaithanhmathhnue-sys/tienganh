import { getStorage, readString, writeString } from '@/lib/storage';
import { DEFAULT_TTS_VOICE, normalizeModel, type AiProvider } from './models';

export const STORAGE_KEYS = {
  geminiKey: 'gemini_api_key',
  agentKey: 'agent_platform_api_key',
  provider: 'google_ai_provider',
  providerSource: 'google_ai_provider_selection_source',
  model: (provider: AiProvider) => `google_ai_model_${provider}`,
  useAiVoice: 'google_ai_use_tts',
  voiceName: 'google_ai_tts_voice',
} as const;

export interface AiSettings {
  provider: AiProvider;
  /** Người dùng đã tự chọn provider (không suy đoán từ tiền tố key). */
  providerConfirmed: boolean;
  apiKeys: Record<AiProvider, string>;
  models: Record<AiProvider, string>;
  useAiVoice: boolean;
  voiceName: string;
}

export const loadAiSettings = (storage: Storage | null = getStorage()): AiSettings => {
  const rawProvider = readString(STORAGE_KEYS.provider, storage);
  const source = readString(STORAGE_KEYS.providerSource, storage);
  // Giá trị cũ "vertex" hoặc không rõ → về Gemini và yêu cầu xác nhận lại (không tự đổi sang Agent Platform).
  const provider: AiProvider = rawProvider === 'agent-platform' ? 'agent-platform' : 'gemini';
  const providerConfirmed = source === 'manual' && (rawProvider === 'gemini' || rawProvider === 'agent-platform');

  return {
    provider,
    providerConfirmed,
    apiKeys: {
      gemini: readString(STORAGE_KEYS.geminiKey, storage) ?? '',
      'agent-platform': readString(STORAGE_KEYS.agentKey, storage) ?? '',
    },
    models: {
      gemini: normalizeModel('gemini', readString(STORAGE_KEYS.model('gemini'), storage)),
      'agent-platform': normalizeModel('agent-platform', readString(STORAGE_KEYS.model('agent-platform'), storage)),
    },
    useAiVoice: readString(STORAGE_KEYS.useAiVoice, storage) === 'true',
    voiceName: readString(STORAGE_KEYS.voiceName, storage) || DEFAULT_TTS_VOICE,
  };
};

/** Lưu cấu hình: key mỗi dịch vụ ở vùng riêng, provider đánh dấu là chọn thủ công. */
export const saveAiSettings = (settings: AiSettings, storage: Storage | null = getStorage()): AiSettings => {
  const normalized: AiSettings = {
    ...settings,
    providerConfirmed: true,
    apiKeys: {
      gemini: settings.apiKeys.gemini.trim(),
      'agent-platform': settings.apiKeys['agent-platform'].trim(),
    },
    models: {
      gemini: normalizeModel('gemini', settings.models.gemini),
      'agent-platform': normalizeModel('agent-platform', settings.models['agent-platform']),
    },
  };

  writeString(STORAGE_KEYS.geminiKey, normalized.apiKeys.gemini, storage);
  writeString(STORAGE_KEYS.agentKey, normalized.apiKeys['agent-platform'], storage);
  writeString(STORAGE_KEYS.provider, normalized.provider, storage);
  writeString(STORAGE_KEYS.providerSource, 'manual', storage);
  writeString(STORAGE_KEYS.model('gemini'), normalized.models.gemini, storage);
  writeString(STORAGE_KEYS.model('agent-platform'), normalized.models['agent-platform'], storage);
  writeString(STORAGE_KEYS.useAiVoice, String(normalized.useAiVoice), storage);
  writeString(STORAGE_KEYS.voiceName, normalized.voiceName, storage);
  return normalized;
};

export const getActiveApiKey = (settings: AiSettings): string => settings.apiKeys[settings.provider] ?? '';

export const getActiveModel = (settings: AiSettings): string => settings.models[settings.provider];
