import { describe, it, expect, vi } from 'vitest';
import type { GenerateContentResponse } from '@google/genai';
import { generateContentStreamWithFallback, type StreamClientLike } from '@/lib/ai/generate';
import type { AiProvider } from '@/lib/ai/models';

const err = (status: number, message: string) => Object.assign(new Error(message), { status });

type Step = string | Error;

/** Client giả: mỗi model trả về một kịch bản chunk; Error trong kịch bản = lỗi giữa chừng. */
function fakeStreamClient(script: Record<string, Step[] | Error>) {
  const calls: { model: string; config?: unknown }[] = [];
  const client: StreamClientLike = {
    models: {
      generateContentStream: vi.fn(async (params: { model: string; config?: unknown }) => {
        calls.push({ model: params.model, config: params.config });
        const plan = script[params.model];
        if (!plan) throw err(503, 'UNAVAILABLE');
        if (plan instanceof Error) throw plan;
        async function* gen() {
          for (const step of plan as Step[]) {
            if (step instanceof Error) throw step;
            yield { text: step } as unknown as GenerateContentResponse;
          }
        }
        return gen();
      }),
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return { calls, factory: vi.fn((_k: string, _p: AiProvider) => client) };
}

const base = { provider: 'gemini' as const, apiKey: 'AIzaSyTestKey123456', contents: 'hi' };

describe('generateContentStreamWithFallback', () => {
  it('ghép các chunk và báo onChunk với văn bản tích luỹ', async () => {
    const { factory } = fakeStreamClient({ 'gemini-3.8-flash': ['Xin ', 'chào', '!'] });
    const onChunk = vi.fn();
    const res = await generateContentStreamWithFallback({ ...base, clientFactory: factory, onChunk });
    expect(res).toMatchObject({ text: 'Xin chào!', model: 'gemini-3.8-flash', aborted: false });
    expect(onChunk).toHaveBeenLastCalledWith('Xin chào!', 'gemini-3.8-flash');
  });

  it('thiếu key → MISSING_API_KEY, không gọi API', async () => {
    const { factory } = fakeStreamClient({});
    await expect(
      generateContentStreamWithFallback({ ...base, apiKey: '', clientFactory: factory, onChunk: vi.fn() }),
    ).rejects.toMatchObject({ type: 'MISSING_API_KEY' });
    expect(factory).not.toHaveBeenCalled();
  });

  it('503 trước chunk đầu → chuyển model, báo onFallback', async () => {
    const { factory, calls } = fakeStreamClient({ 'gemini-3.6-flash': ['ok'] });
    const onFallback = vi.fn();
    const res = await generateContentStreamWithFallback({ ...base, clientFactory: factory, onChunk: vi.fn(), onFallback });
    expect(res.model).toBe('gemini-3.6-flash');
    expect(calls.map((c) => c.model)).toEqual(['gemini-3.8-flash', 'gemini-3.6-flash']);
    expect(onFallback).toHaveBeenCalledWith({ from: 'gemini-3.8-flash', to: 'gemini-3.6-flash', reason: 'MODEL_OVERLOADED' });
  });

  it('lỗi quá tải giữa chừng → xoá phần dở (onReset) rồi thử model kế tiếp', async () => {
    const { factory } = fakeStreamClient({
      'gemini-3.8-flash': ['Phần ', err(503, 'high demand')],
      'gemini-3.6-flash': ['Hoàn chỉnh'],
    });
    const onReset = vi.fn();
    const onChunk = vi.fn();
    const res = await generateContentStreamWithFallback({ ...base, clientFactory: factory, onChunk, onReset });
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(res.text).toBe('Hoàn chỉnh');
    expect(onChunk).toHaveBeenLastCalledWith('Hoàn chỉnh', 'gemini-3.6-flash');
  });

  it('401 → dừng ngay, không thử model khác', async () => {
    const { factory, calls } = fakeStreamClient({ 'gemini-3.8-flash': err(401, 'API_KEY_INVALID') });
    await expect(
      generateContentStreamWithFallback({ ...base, clientFactory: factory, onChunk: vi.fn() }),
    ).rejects.toMatchObject({ type: 'INVALID_API_KEY' });
    expect(calls).toHaveLength(1);
  });

  it('429 → dừng ngay (không coi là lỗi key)', async () => {
    const { factory, calls } = fakeStreamClient({ 'gemini-3.8-flash': err(429, 'RESOURCE_EXHAUSTED') });
    await expect(
      generateContentStreamWithFallback({ ...base, clientFactory: factory, onChunk: vi.fn() }),
    ).rejects.toMatchObject({ type: 'QUOTA_EXCEEDED' });
    expect(calls).toHaveLength(1);
  });

  it('dừng bởi người dùng → trả phần đã nhận, aborted = true, không thử model khác', async () => {
    const controller = new AbortController();
    const { factory, calls } = fakeStreamClient({ 'gemini-3.8-flash': ['Một ', 'hai ', 'ba'] });
    const onChunk = vi.fn((text: string) => {
      if (text === 'Một hai ') controller.abort();
    });
    const res = await generateContentStreamWithFallback({ ...base, clientFactory: factory, onChunk, signal: controller.signal });
    expect(res).toMatchObject({ text: 'Một hai ', aborted: true });
    expect(calls).toHaveLength(1);
  });

  it('truyền abortSignal và cấu hình theo từng model', async () => {
    const controller = new AbortController();
    const { factory, calls } = fakeStreamClient({ 'gemini-2.5-flash': ['ok'] });
    await generateContentStreamWithFallback({
      ...base,
      clientFactory: factory,
      onChunk: vi.fn(),
      models: ['gemini-2.5-flash'],
      signal: controller.signal,
      buildConfig: (model) => ({ labels: { m: model } }),
    });
    expect(calls[0].config).toMatchObject({ labels: { m: 'gemini-2.5-flash' }, abortSignal: controller.signal });
  });

  it('stream trả về rỗng → INVALID_RESPONSE', async () => {
    const { factory } = fakeStreamClient({ 'gemini-3.8-flash': [] });
    await expect(
      generateContentStreamWithFallback({ ...base, clientFactory: factory, onChunk: vi.fn() }),
    ).rejects.toMatchObject({ type: 'INVALID_RESPONSE' });
  });
});
