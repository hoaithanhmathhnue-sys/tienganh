import { describe, it, expect, vi } from 'vitest';
import { createSpeechManager } from '@/lib/speech';

describe('speech manager', () => {
  it('phát câu B thì câu A dừng và chỉ B đang phát', () => {
    const m = createSpeechManager();
    const stopA = vi.fn();
    m.start('a', stopA);
    m.start('b', vi.fn());
    expect(stopA).toHaveBeenCalledTimes(1);
    expect(m.getActiveId()).toBe('b');
  });

  it('sự kiện kết thúc muộn của A không xoá trạng thái của B', () => {
    const m = createSpeechManager();
    m.start('a', vi.fn());
    m.start('b', vi.fn());
    m.finish('a');
    expect(m.getActiveId()).toBe('b');
    m.finish('b');
    expect(m.getActiveId()).toBeNull();
  });

  it('stop() dừng câu đang phát và báo listener', () => {
    const m = createSpeechManager();
    const stop = vi.fn();
    const listener = vi.fn();
    m.subscribe(listener);
    m.start('a', stop);
    m.stop();
    expect(stop).toHaveBeenCalled();
    expect(m.getActiveId()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
