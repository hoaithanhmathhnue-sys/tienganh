import { describe, expect, it } from 'vitest';
import { categories, isSlogan, sloganId } from '@/lib/slogans';

describe('Thư viện slogan', () => {
  const all = categories.flatMap((c) => c.slogans);

  it('mỗi slogan đủ en / ipa (bọc trong /…/) / vi', () => {
    for (const s of all) {
      expect(isSlogan(s)).toBe(true);
      expect(s.ipa).toMatch(/^\/.+\/$/);
    }
  });

  it('không trùng slogan giữa các danh mục (khoá yêu thích và trình chiếu dùng sloganId)', () => {
    const keys = all.map(sloganId);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('đã bổ sung slogan mới theo tài liệu cho các danh mục', () => {
    expect(all.length).toBeGreaterThanOrEqual(180);
    expect(all.some((s) => s.en === 'One Class – One Family')).toBe(true);
    expect(all.some((s) => s.en === 'Our Earth, Our Home!')).toBe(true);
  });
});
