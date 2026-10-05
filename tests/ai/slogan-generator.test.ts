import { describe, it, expect } from 'vitest';
import { parseSloganResponse, buildSloganPrompt, buildSloganConfig } from '@/lib/ai/slogan-generator';

describe('parseSloganResponse', () => {
  it('đọc mảng JSON hợp lệ', () => {
    const text = JSON.stringify([{ en: 'Happy New Year', ipa: '/ˈhæpi nuː jɪr/', vi: 'Chúc mừng năm mới' }]);
    expect(parseSloganResponse(text)).toEqual([{ en: 'Happy New Year', ipa: '/ˈhæpi nuː jɪr/', vi: 'Chúc mừng năm mới' }]);
  });

  it('chấp nhận dạng { slogans: [...] } và bỏ rào ```json', () => {
    const text = '```json\n{"slogans":[{"en":"Be Safe","ipa":"/biː seɪf/","vi":"Hãy an toàn"}]}\n```';
    expect(parseSloganResponse(text)).toHaveLength(1);
  });

  it('bỏ câu thiếu trường, cắt khoảng trắng, thêm dấu / cho IPA', () => {
    const text = JSON.stringify([
      { en: '  Stay Safe  ', ipa: 'steɪ seɪf', vi: ' An toàn nhé ' },
      { en: 'No IPA', vi: 'Thiếu IPA' },
      { en: '', ipa: '/x/', vi: 'rỗng' },
      'string item',
    ]);
    expect(parseSloganResponse(text)).toEqual([{ en: 'Stay Safe', ipa: '/steɪ seɪf/', vi: 'An toàn nhé' }]);
  });

  it('loại trùng (không phân biệt hoa thường) kể cả với danh sách đã có', () => {
    const text = JSON.stringify([
      { en: 'Read More', ipa: '/riːd mɔːr/', vi: 'Đọc nhiều' },
      { en: 'read more', ipa: '/riːd mɔːr/', vi: 'Đọc nhiều' },
      { en: 'Learn More', ipa: '/lɜːrn mɔːr/', vi: 'Học nhiều' },
    ]);
    const result = parseSloganResponse(text, [{ en: 'Learn more', ipa: '', vi: '' }]);
    expect(result.map((s) => s.en)).toEqual(['Read More']);
  });

  it('JSON hỏng hoặc rỗng → AiError INVALID_RESPONSE', () => {
    expect(() => parseSloganResponse('not json')).toThrow(expect.objectContaining({ type: 'INVALID_RESPONSE' }));
    expect(() => parseSloganResponse('[]')).toThrow(expect.objectContaining({ type: 'INVALID_RESPONSE' }));
  });
});

describe('buildSloganPrompt', () => {
  it('chứa chủ đề, số câu và khối lớp', () => {
    const p = buildSloganPrompt({ topic: 'Tết Nguyên Đán', count: 5, length: 'short', grade: '3' });
    expect(p).toContain('Tết Nguyên Đán');
    expect(p).toContain('5');
    expect(p).toMatch(/grade 3/i);
  });
});

describe('buildSloganConfig', () => {
  it('JSON + schema, không có temperature/topP/topK', () => {
    const c = buildSloganConfig('gemini-3.8-flash') as Record<string, unknown>;
    expect(c.responseMimeType).toBe('application/json');
    expect(c.responseSchema).toBeTruthy();
    expect(c).not.toHaveProperty('temperature');
    expect(c).not.toHaveProperty('topP');
    expect(c).not.toHaveProperty('topK');
  });

  it('thinkingLevel chỉ gửi cho Gemini 3.x', () => {
    expect(buildSloganConfig('gemini-3.8-flash')).toHaveProperty('thinkingConfig');
    expect(buildSloganConfig('gemini-2.5-flash')).not.toHaveProperty('thinkingConfig');
  });
});
