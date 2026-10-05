import { describe, it, expect } from 'vitest';
import { ThinkingLevel } from '@google/genai';
import {
  buildChatConfig,
  CHAT_CONTEXT_LIMIT,
  CHAT_MODES,
  isChatMessage,
  MAX_STORED_MESSAGES,
  toChatContents,
  trimHistory,
  type ChatMessage,
} from '@/lib/ai/chat';

const msg = (role: ChatMessage['role'], text: string, i = 0): ChatMessage => ({
  id: `${role}-${i}`,
  role,
  text,
  createdAt: new Date(2026, 9, 5, 10, i).toISOString(),
});

describe('buildChatConfig', () => {
  it('Gemini 3.x: thinkingLevel theo chế độ, không có temperature/topP/topK', () => {
    expect(buildChatConfig('fast')('gemini-3.8-flash')).toMatchObject({ thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } });
    expect(buildChatConfig('normal')('gemini-3.6-flash')).toMatchObject({ thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM } });
    const thinking = buildChatConfig('thinking')('gemini-3.5-flash');
    expect(thinking).toMatchObject({ thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } });
    for (const key of ['temperature', 'topP', 'topK']) expect(thinking).not.toHaveProperty(key);
  });

  it('Gemini 2.5: không gửi thinkingConfig (tránh lỗi 400)', () => {
    expect(buildChatConfig('thinking')('gemini-2.5-flash')).not.toHaveProperty('thinkingConfig');
  });

  it('có systemInstruction và maxOutputTokens tăng dần theo chế độ', () => {
    const tokens = (['fast', 'normal', 'thinking'] as const).map((m) => buildChatConfig(m)('gemini-3.8-flash').maxOutputTokens ?? 0);
    expect(tokens[0]).toBeLessThan(tokens[1]);
    expect(tokens[1]).toBeLessThan(tokens[2]);
    expect(buildChatConfig('fast')('gemini-3.8-flash').systemInstruction).toBeTruthy();
    expect(CHAT_MODES.map((m) => m.id)).toEqual(['fast', 'normal', 'thinking']);
  });
});

describe('toChatContents', () => {
  it('chuyển sang Content[] và bỏ tin model ở đầu (luôn bắt đầu bằng user)', () => {
    const contents = toChatContents([msg('model', 'chào', 0), msg('user', 'hỏi', 1), msg('model', 'đáp', 2), msg('user', 'hỏi tiếp', 3)]);
    expect(contents.map((c) => c.role)).toEqual(['user', 'model', 'user']);
    expect(contents[2].parts?.[0]?.text).toBe('hỏi tiếp');
  });

  it('chỉ lấy tối đa CHAT_CONTEXT_LIMIT tin gần nhất', () => {
    const history = Array.from({ length: 50 }, (_, i) => msg(i % 2 === 0 ? 'user' : 'model', `t${i}`, i));
    history.push(msg('user', 'cuối', 99));
    const contents = toChatContents(history);
    expect(contents.length).toBeLessThanOrEqual(CHAT_CONTEXT_LIMIT);
    expect(contents[0].role).toBe('user');
    expect(contents.at(-1)?.parts?.[0]?.text).toBe('cuối');
  });

  it('bỏ tin rỗng', () => {
    expect(toChatContents([msg('user', '  ', 0), msg('user', 'a', 1)])).toHaveLength(1);
  });
});

describe('trimHistory & isChatMessage', () => {
  it('giữ tối đa MAX_STORED_MESSAGES tin mới nhất', () => {
    const history = Array.from({ length: MAX_STORED_MESSAGES + 7 }, (_, i) => msg('user', `t${i}`, i));
    const trimmed = trimHistory(history);
    expect(trimmed).toHaveLength(MAX_STORED_MESSAGES);
    expect(trimmed.at(-1)?.text).toBe(`t${MAX_STORED_MESSAGES + 6}`);
  });

  it('kiểm định dữ liệu lưu trữ', () => {
    expect(isChatMessage(msg('user', 'a'))).toBe(true);
    expect(isChatMessage({ id: '1', role: 'system', text: 'x', createdAt: '' })).toBe(false);
    expect(isChatMessage(null)).toBe(false);
  });
});
