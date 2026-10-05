import { describe, it, expect, vi } from 'vitest';
import type { GenerateContentResponse } from '@google/genai';
import { generateContentWithFallback, type ClientLike } from '@/lib/ai/generate';
import { AiError } from '@/lib/ai/errors';
import type { AiProvider } from '@/lib/ai/models';

const err = (status: number, message: string) => Object.assign(new Error(message), { status });

function fakeClient(behaviour: Record<string, () => unknown>) {
  const calls: { model: string; config?: unknown }[] = [];
  const client: ClientLike = {
    models: {
      generateContent: vi.fn(async (params: { model: string; config?: unknown }) => {
        calls.push({ model: params.model, config: params.config });
        const fn = behaviour[params.model];
        if (!fn) throw err(503, 'UNAVAILABLE');
        return fn() as GenerateContentResponse;
      }),
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return { client, calls, factory: vi.fn((_apiKey: string, _provider: AiProvider) => client) };
}

const base = { provider: 'gemini' as const, apiKey: 'AIzaSyTestKey123456', contents: 'hi' };

describe('generateContentWithFallback', () => {
  it('thiếu key → MISSING_API_KEY, không gọi API', async () => {
    const { factory } = fakeClient({});
    await expect(generateContentWithFallback({ ...base, apiKey: '', clientFactory: factory })).rejects.toMatchObject({ type: 'MISSING_API_KEY' });
    expect(factory).not.toHaveBeenCalled();
  });

  it('key sai định dạng → INVALID_KEY_FORMAT, không gọi API', async () => {
    const { factory } = fakeClient({});
    await expect(generateContentWithFallback({ ...base, apiKey: 'sk-abc', clientFactory: factory })).rejects.toMatchObject({ type: 'INVALID_KEY_FORMAT' });
    expect(factory).not.toHaveBeenCalled();
  });

  it('503 ở model đầu → chuyển model kế tiếp và báo onFallback', async () => {
    const { factory, calls } = fakeClient({ 'gemini-3.6-flash': () => ({ text: 'ok' }) });
    const onFallback = vi.fn();
    const res = await generateContentWithFallback({ ...base, clientFactory: factory, onFallback });
    expect(res.model).toBe('gemini-3.6-flash');
    expect(calls.map((c) => c.model)).toEqual(['gemini-3.8-flash', 'gemini-3.6-flash']);
    expect(onFallback).toHaveBeenCalledWith({ from: 'gemini-3.8-flash', to: 'gemini-3.6-flash', reason: 'MODEL_OVERLOADED' });
  });

  it('401 → dừng ngay, không thử model khác', async () => {
    const { factory, calls } = fakeClient({ 'gemini-3.8-flash': () => { throw err(401, 'API_KEY_INVALID'); } });
    await expect(generateContentWithFallback({ ...base, clientFactory: factory })).rejects.toMatchObject({ type: 'INVALID_API_KEY' });
    expect(calls).toHaveLength(1);
  });

  it('429 → dừng ngay, không thử model khác', async () => {
    const { factory, calls } = fakeClient({ 'gemini-3.8-flash': () => { throw err(429, 'RESOURCE_EXHAUSTED'); } });
    await expect(generateContentWithFallback({ ...base, clientFactory: factory })).rejects.toMatchObject({ type: 'QUOTA_EXCEEDED' });
    expect(calls).toHaveLength(1);
  });

  it('tất cả model quá tải → AiError MODEL_OVERLOADED sau khi thử hết chuỗi', async () => {
    const { factory, calls } = fakeClient({});
    const p = generateContentWithFallback({ ...base, clientFactory: factory });
    await expect(p).rejects.toBeInstanceOf(AiError);
    await expect(p).rejects.toMatchObject({ type: 'MODEL_OVERLOADED' });
    expect(calls).toHaveLength(6);
  });

  it('Agent Platform: 403 → thử model tương thích tiếp theo', async () => {
    const { factory, calls } = fakeClient({
      'gemini-2.5-flash': () => { throw err(403, 'PERMISSION_DENIED'); },
      'gemini-2.5-flash-lite': () => ({ text: 'ok' }),
    });
    const res = await generateContentWithFallback({ ...base, provider: 'agent-platform', apiKey: 'AQ.agentkey12345', clientFactory: factory });
    expect(res.model).toBe('gemini-2.5-flash-lite');
    expect(calls.map((c) => c.model)).toEqual(['gemini-2.5-flash', 'gemini-2.5-flash-lite']);
    expect(factory).toHaveBeenCalledWith('AQ.agentkey12345', 'agent-platform');
  });

  it('buildConfig được gọi theo từng model', async () => {
    const { factory, calls } = fakeClient({ 'gemini-2.5-flash': () => ({ text: 'ok' }) });
    await generateContentWithFallback({
      ...base,
      clientFactory: factory,
      models: ['gemini-2.5-flash'],
      buildConfig: (model) => ({ labels: { tag: model } }),
    });
    expect(calls[0].config).toEqual({ labels: { tag: 'gemini-2.5-flash' } });
  });

  it('danh sách models tuỳ chỉnh (ví dụ TTS) thay thế chuỗi mặc định', async () => {
    const { factory, calls } = fakeClient({});
    await expect(generateContentWithFallback({ ...base, clientFactory: factory, models: ['tts-model'] })).rejects.toMatchObject({ type: 'MODEL_OVERLOADED' });
    expect(calls.map((c) => c.model)).toEqual(['tts-model']);
  });
});
