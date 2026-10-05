import type { GenerateContentConfig, GenerateContentParameters, GenerateContentResponse } from '@google/genai';
import { isValidGoogleAiApiKey } from './api-key';
import { createGoogleAiClient } from './client';
import { AiError, getFriendlyErrorMessage, parseApiError, shouldFallback, type AiErrorType } from './errors';
import { getOrderedModels, type AiProvider } from './models';

export interface ClientLike {
  models: { generateContent: (params: GenerateContentParameters) => Promise<GenerateContentResponse> };
}

export interface FallbackInfo {
  from: string;
  to: string;
  reason: AiErrorType;
}

export interface GenerateWithFallbackOptions {
  provider: AiProvider;
  apiKey: string;
  contents: GenerateContentParameters['contents'];
  /** Model người dùng chọn — luôn thử đầu tiên. */
  selectedModel?: string;
  /** Thay thế toàn bộ chuỗi model (ví dụ TTS có định tuyến riêng). */
  models?: string[];
  /** Cấu hình theo từng model (ví dụ chỉ gửi thinkingLevel cho Gemini 3.x). */
  buildConfig?: (model: string) => GenerateContentConfig | undefined;
  onFallback?: (info: FallbackInfo) => void;
  /** Chỉ dùng cho kiểm thử; mặc định là `createGoogleAiClient`. */
  clientFactory?: (apiKey: string, provider: AiProvider) => ClientLike;
}

export interface GenerateResult {
  response: GenerateContentResponse;
  model: string;
}

/**
 * Hàm fallback DUY NHẤT cho mọi lệnh `generateContent` trong app.
 * - Chuyển model khi 500/503/504/NOT_FOUND (Agent Platform: thêm 403).
 * - Dừng ngay khi 401/429/400/lỗi không xác định để không phát sinh request ngoài ý muốn.
 */
export async function generateContentWithFallback(options: GenerateWithFallbackOptions): Promise<GenerateResult> {
  const { provider, contents, selectedModel, buildConfig, onFallback } = options;
  const apiKey = (options.apiKey ?? '').trim();

  if (!apiKey) {
    throw new AiError('MISSING_API_KEY', getFriendlyErrorMessage('MISSING_API_KEY', provider));
  }
  if (!isValidGoogleAiApiKey(apiKey)) {
    throw new AiError('INVALID_KEY_FORMAT', getFriendlyErrorMessage('INVALID_KEY_FORMAT', provider));
  }

  const factory = options.clientFactory ?? createGoogleAiClient;
  const client = factory(apiKey, provider);
  const models = options.models?.length ? [...new Set(options.models)] : getOrderedModels(provider, selectedModel);

  let lastType: AiErrorType = 'UNKNOWN';
  let lastError: unknown = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const config = buildConfig?.(model);
      const response = await client.models.generateContent({ model, contents, ...(config ? { config } : {}) });
      return { response, model };
    } catch (error) {
      lastError = error;
      lastType = parseApiError(error);
      const next = models[i + 1];
      if (!shouldFallback(lastType, provider) || !next) break;
      onFallback?.({ from: model, to: next, reason: lastType });
    }
  }

  throw new AiError(lastType, getFriendlyErrorMessage(lastType, provider), { cause: lastError });
}
