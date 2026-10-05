import { describe, it, expect } from 'vitest';
import { getPronunciationFeedback, normalizeWords, scorePronunciation, scoreBestAlternative } from '@/lib/pronunciation';

describe('normalizeWords', () => {
  it('chữ thường, bỏ dấu câu, giữ dấu nháy trong từ', () => {
    expect(normalizeWords("Let's Learn, Together!")).toEqual(["let's", 'learn', 'together']);
    expect(normalizeWords('  ')).toEqual([]);
  });

  it('chuẩn hoá nháy cong và số', () => {
    expect(normalizeWords('Don’t give up')).toEqual(["don't", 'give', 'up']);
  });
});

describe('scorePronunciation', () => {
  it('đọc đúng hoàn toàn → 100 và mọi từ đều khớp', () => {
    const r = scorePronunciation('Be Kind, Be Brave', 'be kind be brave');
    expect(r.score).toBe(100);
    expect(r.words.every((w) => w.matched)).toBe(true);
  });

  it('thiếu / sai từ → điểm theo tỉ lệ từ khớp, giữ thứ tự', () => {
    const r = scorePronunciation('Learn every day', 'learn day');
    expect(r.score).toBe(67);
    expect(r.words.map((w) => w.matched)).toEqual([true, false, true]);
  });

  it('nói thêm từ thừa không bị trừ quá mức nhưng không vượt 100', () => {
    expect(scorePronunciation('Good job', 'good good job yes').score).toBe(100);
  });

  it('không nhận được gì → 0', () => {
    expect(scorePronunciation('Hello', '').score).toBe(0);
  });
});

describe('scoreBestAlternative & feedback', () => {
  it('chọn phương án nhận diện có điểm cao nhất', () => {
    const r = scoreBestAlternative('Sit down please', ['sit town please', 'sit down please']);
    expect(r.score).toBe(100);
    expect(r.transcript).toBe('sit down please');
  });

  it('phản hồi theo ngưỡng điểm', () => {
    expect(getPronunciationFeedback(95).level).toBe('excellent');
    expect(getPronunciationFeedback(75).level).toBe('good');
    expect(getPronunciationFeedback(55).level).toBe('fair');
    expect(getPronunciationFeedback(20).level).toBe('retry');
  });
});
