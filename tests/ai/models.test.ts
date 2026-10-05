import { describe, it, expect } from 'vitest';
import {
  GEMINI_FALLBACK_MODELS,
  AGENT_PLATFORM_FALLBACK_MODELS,
  DEFAULT_MODEL,
  getOrderedModels,
  normalizeModel,
  supportsThinkingLevel,
  getModelsForProvider,
} from '@/lib/ai/models';

describe('chuỗi model', () => {
  it('Gemini: ưu tiên 3.8 Flash rồi đến chuỗi của api.md', () => {
    expect([...GEMINI_FALLBACK_MODELS]).toEqual([
      'gemini-3.8-flash',
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-2.5-flash',
    ]);
    expect(DEFAULT_MODEL.gemini).toBe('gemini-3.8-flash');
  });

  it('Agent Platform: mặc định gemini-2.5-flash', () => {
    expect(DEFAULT_MODEL['agent-platform']).toBe('gemini-2.5-flash');
    expect([...AGENT_PLATFORM_FALLBACK_MODELS]).toEqual(['gemini-2.5-flash', 'gemini-2.5-flash-lite']);
  });

  it('không chứa model đã shutdown / preview trong fallback Gemini', () => {
    for (const m of GEMINI_FALLBACK_MODELS) {
      expect(m).not.toMatch(/preview|2\.0/);
    }
  });
});

describe('getOrderedModels', () => {
  it('model người dùng chọn đứng đầu và không bị trùng', () => {
    const list = getOrderedModels('gemini', 'gemini-3.5-flash');
    expect(list[0]).toBe('gemini-3.5-flash');
    expect(list.filter((m) => m === 'gemini-3.5-flash')).toHaveLength(1);
    expect(list).toHaveLength(GEMINI_FALLBACK_MODELS.length);
  });

  it('model ngoài chuỗi mặc định vẫn được thử trước', () => {
    const list = getOrderedModels('gemini', 'gemini-3.1-pro-preview');
    expect(list[0]).toBe('gemini-3.1-pro-preview');
    expect(list).toHaveLength(GEMINI_FALLBACK_MODELS.length + 1);
  });

  it('không có model chọn → dùng chuỗi mặc định', () => {
    expect(getOrderedModels('gemini')).toEqual([...GEMINI_FALLBACK_MODELS]);
    expect(getOrderedModels('agent-platform')).toEqual([...AGENT_PLATFORM_FALLBACK_MODELS]);
  });
});

describe('normalizeModel', () => {
  it('giữ model hợp lệ của provider', () => {
    expect(normalizeModel('gemini', 'gemini-3.6-flash')).toBe('gemini-3.6-flash');
  });

  it('model không tương thích Agent Platform → về gemini-2.5-flash', () => {
    expect(normalizeModel('agent-platform', 'gemini-3.8-flash')).toBe('gemini-2.5-flash');
  });

  it('giá trị rỗng → model mặc định', () => {
    expect(normalizeModel('gemini', '')).toBe('gemini-3.8-flash');
    expect(normalizeModel('gemini', undefined)).toBe('gemini-3.8-flash');
  });

  it('mỗi provider có danh sách model riêng', () => {
    expect(getModelsForProvider('gemini').map((m) => m.id)).toContain('gemini-3.8-flash');
    expect(getModelsForProvider('agent-platform').map((m) => m.id)).not.toContain('gemini-3.8-flash');
  });
});

describe('supportsThinkingLevel', () => {
  it('chỉ model Gemini 3.x nhận thinkingLevel', () => {
    expect(supportsThinkingLevel('gemini-3.8-flash')).toBe(true);
    expect(supportsThinkingLevel('gemini-3.1-flash-lite')).toBe(true);
    expect(supportsThinkingLevel('gemini-2.5-flash')).toBe(false);
  });
});
