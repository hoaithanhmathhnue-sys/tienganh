// @vitest-environment jsdom
import { beforeEach, describe, it, expect } from 'vitest';
import { DEFAULT_SPEECH_RATE, SPEECH_RATES, speechRateStore, ttsPacePrompt } from '@/lib/speech-rate';

describe('speechRateStore', () => {
  beforeEach(() => localStorage.clear());

  it('mặc định là DEFAULT_SPEECH_RATE khi chưa lưu', () => {
    expect(speechRateStore.getSnapshot()).toBe(DEFAULT_SPEECH_RATE);
    expect(SPEECH_RATES).toContain(DEFAULT_SPEECH_RATE);
  });

  it('lưu và đọc lại tốc độ hợp lệ; giá trị lạ bị bỏ qua', () => {
    speechRateStore.set(0.5);
    expect(speechRateStore.getSnapshot()).toBe(0.5);
    expect(localStorage.getItem('evd_speech_rate')).toBe('0.5');
    localStorage.setItem('evd_speech_rate', '7');
    expect(speechRateStore.getSnapshot()).toBe(DEFAULT_SPEECH_RATE);
  });
});

describe('ttsPacePrompt', () => {
  it('mỗi tốc độ có chỉ dẫn nhịp đọc riêng cho giọng AI', () => {
    const prompts = SPEECH_RATES.map(ttsPacePrompt);
    expect(new Set(prompts).size).toBe(SPEECH_RATES.length);
    expect(ttsPacePrompt(0.5).toLowerCase()).toContain('slowly');
  });
});
