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
  const apiKey = assertApiKey(options.apiKey, provider);

  const factory = options.clientFactory ?? createGoogleAiClient;
  const client = factory(apiKey, provider);
  const models = resolveModels(provider, selectedModel, options.models);

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

/* ─────────────── Streaming (chat) ─────────────── */

export interface StreamClientLike {
  models: {
    generateContentStream: (params: GenerateContentParameters) => Promise<AsyncGenerator<GenerateContentResponse>>;
  };
}

export interface StreamWithFallbackOptions extends Omit<GenerateWithFallbackOptions, 'clientFactory'> {
  /** Nhận toàn bộ văn bản đã ghép đến thời điểm hiện tại. */
  onChunk: (text: string, model: string) => void;
  /** Phần trả lời dở bị huỷ vì model lỗi giữa chừng — UI cần xoá trước khi model kế tiếp trả lời. */
  onReset?: () => void;
  /** Người dùng bấm "Dừng". */
  signal?: AbortSignal;
  /** Chỉ dùng cho kiểm thử; mặc định là `createGoogleAiClient`. */
  clientFactory?: (apiKey: string, provider: AiProvider) => StreamClientLike;
}

export interface StreamResult {
  text: string;
  model: string;
  aborted: boolean;
}

/**
 * Phiên bản streaming của hàm fallback chung (cùng thứ tự model, cùng quy tắc chuyển/dừng).
 * Nếu stream lỗi sau khi đã có chunk, phần dở bị xoá (onReset) rồi mới thử model kế tiếp.
 */
export async function generateContentStreamWithFallback(options: StreamWithFallbackOptions): Promise<StreamResult> {
  const { provider, contents, selectedModel, buildConfig, onFallback, onChunk, onReset, signal } = options;
  const apiKey = assertApiKey(options.apiKey, provider);

  const factory = options.clientFactory ?? createGoogleAiClient;
  const client = factory(apiKey, provider);
  const models = resolveModels(provider, selectedModel, options.models);

  let lastType: AiErrorType = 'UNKNOWN';
  let lastError: unknown = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    let text = '';
    try {
      const config: GenerateContentConfig = { ...(buildConfig?.(model) ?? {}), ...(signal ? { abortSignal: signal } : {}) };
      const stream = await client.models.generateContentStream({ model, contents, config });
      for await (const chunk of stream) {
        if (signal?.aborted) break;
        const piece = chunk.text ?? '';
        if (!piece) continue;
        text += piece;
        onChunk(text, model);
      }
      if (signal?.aborted) return { text, model, aborted: true };
      if (!text.trim()) throw new AiError('INVALID_RESPONSE', getFriendlyErrorMessage('INVALID_RESPONSE', provider));
      return { text, model, aborted: false };
    } catch (error) {
      if (signal?.aborted) return { text, model, aborted: true };
      lastError = error;
      lastType = parseApiError(error);
      const next = models[i + 1];
      if (!shouldFallback(lastType, provider) || !next) break;
      if (text) onReset?.();
      onFallback?.({ from: model, to: next, reason: lastType });
    }
  }

  throw new AiError(lastType, getFriendlyErrorMessage(lastType, provider), { cause: lastError });
}

/* ─────────────── Dùng chung ─────────────── */

function assertApiKey(rawKey: string, provider: AiProvider): string {
  const apiKey = (rawKey ?? '').trim();
  if (!apiKey) throw new AiError('MISSING_API_KEY', getFriendlyErrorMessage('MISSING_API_KEY', provider));
  if (!isValidGoogleAiApiKey(apiKey)) {
    throw new AiError('INVALID_KEY_FORMAT', getFriendlyErrorMessage('INVALID_KEY_FORMAT', provider));
  }
  return apiKey;
}

function resolveModels(provider: AiProvider, selectedModel?: string, override?: string[]): string[] {
  return override?.length ? [...new Set(override)] : getOrderedModels(provider, selectedModel);
}
