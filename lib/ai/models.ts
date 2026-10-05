export type AiProvider = 'gemini' | 'agent-platform';

export interface ModelOption {
  id: string;
  label: string;
  note: string;
}

/**
 * Chuỗi fallback Gemini API: ưu tiên Gemini 3.8 Flash (mới nhất theo tài liệu Google),
 * sau đó là chuỗi GA/stable của api.md. Kiểm tra lại trang Models trước mỗi đợt release lớn.
 */
export const GEMINI_FALLBACK_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
] as const;

export const GEMINI_MODELS: ModelOption[] = [
  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash', note: 'Mặc định — mới nhất, chất lượng cao' },
  { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash', note: 'Ổn định, cân bằng tốc độ và chất lượng' },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', note: 'Dự phòng chất lượng cao' },
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite', note: 'Nhanh, tiết kiệm' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite', note: 'Nhẹ nhất, tương thích ngược' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', note: 'Dự phòng cuối chuỗi' },
];

export const AGENT_PLATFORM_MODELS: ModelOption[] = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', note: 'Mặc định cho Agent Platform' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite', note: 'Nhanh, tiết kiệm' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', note: 'Suy luận mạnh' },
  { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro (Preview)', note: 'Cần quyền truy cập riêng' },
];

export const AGENT_PLATFORM_FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'] as const;

export const DEFAULT_MODEL: Record<AiProvider, string> = {
  gemini: GEMINI_FALLBACK_MODELS[0],
  'agent-platform': AGENT_PLATFORM_FALLBACK_MODELS[0],
};

/** Model đọc văn bản (TTS) — định tuyến riêng, chỉ dùng với Gemini API. */
export const TTS_MODEL = 'gemini-3.1-flash-tts-preview';

export const TTS_VOICES = [
  { id: 'Kore', label: 'Kore — nữ, rõ ràng' },
  { id: 'Puck', label: 'Puck — nam, vui tươi' },
  { id: 'Aoede', label: 'Aoede — nữ, nhẹ nhàng' },
  { id: 'Charon', label: 'Charon — nam, trầm ấm' },
  { id: 'Leda', label: 'Leda — nữ, trẻ trung' },
] as const;

export const DEFAULT_TTS_VOICE = TTS_VOICES[0].id;

export const getModelsForProvider = (provider: AiProvider): ModelOption[] =>
  provider === 'agent-platform' ? AGENT_PLATFORM_MODELS : GEMINI_MODELS;

/** Đưa model về giá trị hợp lệ cho provider; không tương thích → model mặc định. */
export const normalizeModel = (provider: AiProvider, model?: string | null): string => {
  const ids = getModelsForProvider(provider).map((m) => m.id);
  return model && ids.includes(model) ? model : DEFAULT_MODEL[provider];
};

/** Model người dùng chọn luôn được thử trước (kể cả ngoài chuỗi mặc định), sau đó là chuỗi fallback, đã loại trùng. */
export const getOrderedModels = (provider: AiProvider, selectedModel?: string): string[] => {
  const chain: readonly string[] = provider === 'agent-platform' ? AGENT_PLATFORM_FALLBACK_MODELS : GEMINI_FALLBACK_MODELS;
  if (!selectedModel) return [...chain];
  return [selectedModel, ...chain.filter((m) => m !== selectedModel)];
};

/** `thinkingConfig.thinkingLevel` chỉ dành cho Gemini 3.x; gửi cho 2.5 sẽ gây lỗi 400. */
export const supportsThinkingLevel = (model: string): boolean => /^gemini-3/.test(model);
