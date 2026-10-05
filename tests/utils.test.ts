import { describe, it, expect } from 'vitest';
import { getDailyIndex } from '@/lib/daily';
import { cycleIndex } from '@/lib/presentation';
import { wrapText, fitText } from '@/lib/poster';
import { pcm16ToFloat32, base64ToBytes } from '@/lib/audio/pcm';

describe('getDailyIndex', () => {
  it('cùng ngày → cùng chỉ số (kể cả khác giờ)', () => {
    expect(getDailyIndex(new Date(2026, 9, 5, 7), 97)).toBe(getDailyIndex(new Date(2026, 9, 5, 22), 97));
  });

  it('hai ngày liên tiếp → khác chỉ số', () => {
    for (let d = 1; d <= 30; d++) {
      expect(getDailyIndex(new Date(2026, 9, d), 97)).not.toBe(getDailyIndex(new Date(2026, 9, d + 1), 97));
    }
  });

  it('luôn nằm trong khoảng hợp lệ', () => {
    const i = getDailyIndex(new Date(2030, 0, 1), 10);
    expect(i).toBeGreaterThanOrEqual(0);
    expect(i).toBeLessThan(10);
    expect(getDailyIndex(new Date(), 0)).toBe(0);
  });
});

describe('cycleIndex', () => {
  it('đi vòng tròn ở đầu và cuối', () => {
    expect(cycleIndex(4, 1, 5)).toBe(0);
    expect(cycleIndex(0, -1, 5)).toBe(4);
    expect(cycleIndex(2, 1, 5)).toBe(3);
    expect(cycleIndex(0, 1, 0)).toBe(0);
  });
});

describe('wrapText', () => {
  const measure = (s: string) => s.length * 10;

  it('xuống dòng theo từ, không vượt độ rộng', () => {
    const lines = wrapText('Today a Reader Tomorrow a Leader', 150, measure);
    expect(lines.length).toBeGreaterThan(1);
    for (const l of lines) expect(measure(l)).toBeLessThanOrEqual(150);
    expect(lines.join(' ')).toBe('Today a Reader Tomorrow a Leader');
  });

  it('từ quá dài vẫn được giữ trên một dòng riêng', () => {
    expect(wrapText('Supercalifragilistic is long', 100, measure)[0]).toBe('Supercalifragilistic');
  });
});

describe('fitText', () => {
  it('giảm cỡ chữ đến khi vừa số dòng tối đa', () => {
    const measureAt = (size: number, s: string) => s.length * size * 0.5;
    const r = fitText('Integrity Is Doing the Right Thing When No One Is Watching', 600, 3, 120, 40, measureAt);
    expect(r.lines.length).toBeLessThanOrEqual(3);
    expect(r.fontSize).toBeLessThan(120);
    expect(r.fontSize).toBeGreaterThanOrEqual(40);
  });

  it('câu ngắn giữ cỡ chữ lớn nhất', () => {
    const r = fitText('Be Kind', 1000, 2, 120, 40, (size, s) => s.length * size * 0.5);
    expect(r.fontSize).toBe(120);
    expect(r.lines).toEqual(['Be Kind']);
  });
});

describe('pcm16ToFloat32', () => {
  it('chuyển PCM 16-bit little-endian sang [-1, 1]', () => {
    const bytes = new Uint8Array([0x00, 0x00, 0xff, 0x7f, 0x00, 0x80]);
    const out = pcm16ToFloat32(bytes);
    expect(out).toHaveLength(3);
    expect(out[0]).toBe(0);
    expect(out[1]).toBeCloseTo(1, 3);
    expect(out[2]).toBe(-1);
  });

  it('giải mã base64', () => {
    expect(Array.from(base64ToBytes('AAD/fw=='))).toEqual([0, 0, 255, 127]);
  });
});
