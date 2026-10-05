import { describe, it, expect } from 'vitest';
import { classroomCategories } from '@/lib/classroom-english';
import { categories } from '@/lib/slogans';
import { isSlogan, sloganId } from '@/lib/slogans';

describe('Ngân hàng câu lệnh lớp học', () => {
  const all = classroomCategories.flatMap((c) => c.slogans);

  it('có 8 chủ đề, mỗi chủ đề ≥ 12 câu, tổng ≥ 100 câu', () => {
    expect(classroomCategories).toHaveLength(8);
    for (const c of classroomCategories) expect(c.slogans.length).toBeGreaterThanOrEqual(12);
    expect(all.length).toBeGreaterThanOrEqual(100);
  });

  it('mỗi câu đủ en / ipa (bọc trong /…/) / vi', () => {
    for (const s of all) {
      expect(isSlogan(s)).toBe(true);
      expect(s.ipa).toMatch(/^\/.+\/$/);
      expect(s.vi.trim()).not.toBe('');
    }
  });

  it('id chủ đề duy nhất, không trùng id danh mục slogan; không trùng câu', () => {
    const ids = classroomCategories.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(categories.some((c) => c.id === id)).toBe(false);
    const keys = all.map(sloganId);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
