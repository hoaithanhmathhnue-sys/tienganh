import { GoogleGenAI } from '@google/genai';
import type { AiProvider } from './models';

/**
 * Client factory DUY NHẤT của app — không tạo `new GoogleGenAI(...)` ở bất kỳ nơi nào khác.
 * `vertexai: true` chỉ là cờ định tuyến của Google Gen AI SDK tới Agent Platform API ở chế độ API key;
 * không dùng để suy đoán loại key.
 */
export const createGoogleAiClient = (apiKey: string, provider: AiProvider): GoogleGenAI => {
  if (provider === 'agent-platform') {
    return new GoogleGenAI({ vertexai: true, apiKey });
  }
  return new GoogleGenAI({ apiKey });
};
