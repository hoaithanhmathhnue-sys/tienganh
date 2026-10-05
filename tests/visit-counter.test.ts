// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { recordVisit, VISIT_NAMESPACE, BASE_VISIT_OFFSET } from '@/lib/visit-counter';

const ok = (count: number) => Promise.resolve({ ok: true, json: () => Promise.resolve({ count }) } as Response);

beforeEach(() => localStorage.clear());

describe('recordVisit', () => {
  it('lần đầu trong ngày: gọi /up và cộng BASE_OFFSET', async () => {
    const fetchFn = vi.fn(() => ok(50));
    const r = await recordVisit({ fetchFn, now: new Date(2026, 9, 5, 8) });
    expect(fetchFn).toHaveBeenCalledWith(`https://api.counterapi.dev/v1/${VISIT_NAMESPACE}/visits/up`);
    expect(r.total).toBe(BASE_VISIT_OFFSET + 50);
    expect(r.mine).toBe(1);
    expect(r.today).toBe(1);
  });

  it('lần hai cùng ngày: KHÔNG gọi /up (chỉ đọc), lượt cá nhân vẫn tăng', async () => {
    await recordVisit({ fetchFn: vi.fn(() => ok(50)), now: new Date(2026, 9, 5, 8) });
    const fetchFn = vi.fn(() => ok(51));
    const r = await recordVisit({ fetchFn, now: new Date(2026, 9, 5, 15) });
    expect(fetchFn).toHaveBeenCalledWith(`https://api.counterapi.dev/v1/${VISIT_NAMESPACE}/visits`);
    expect(r.total).toBe(BASE_VISIT_OFFSET + 51);
    expect(r.mine).toBe(2);
    expect(r.today).toBe(2);
  });

  it('sang ngày mới: lượt hôm nay đặt lại và gọi /up lần nữa', async () => {
    await recordVisit({ fetchFn: vi.fn(() => ok(50)), now: new Date(2026, 9, 5, 8) });
    const fetchFn = vi.fn(() => ok(60));
    const r = await recordVisit({ fetchFn, now: new Date(2026, 9, 6, 8) });
    expect(fetchFn).toHaveBeenCalledWith(expect.stringMatching(/\/visits\/up$/));
    expect(r.today).toBe(1);
  });

  it('mất mạng: dùng giá trị đã lưu gần nhất, không bịa số', async () => {
    await recordVisit({ fetchFn: vi.fn(() => ok(70)), now: new Date(2026, 9, 5, 8) });
    const r = await recordVisit({ fetchFn: vi.fn(() => Promise.reject(new Error('offline'))), now: new Date(2026, 9, 5, 9) });
    expect(r.total).toBe(BASE_VISIT_OFFSET + 70);
  });

  it('mất mạng và chưa có dữ liệu: total = null', async () => {
    const r = await recordVisit({ fetchFn: vi.fn(() => Promise.reject(new Error('offline'))), now: new Date(2026, 9, 5, 9) });
    expect(r.total).toBeNull();
  });
});
