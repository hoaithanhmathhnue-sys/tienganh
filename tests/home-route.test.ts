import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('home & slogan routes', () => {
  it('trang chủ dùng HomePage với ảnh trường', () => {
    expect(readFileSync('app/page.tsx', 'utf8')).toContain('@/components/home/home-page');
    expect(readFileSync('components/home/home-page.tsx', 'utf8')).toContain('/truong.jpg');
    expect(existsSync('public/truong.jpg')).toBe(true);
  });

  it('thư viện slogan chuyển sang /slogan', () => {
    expect(readFileSync('app/slogan/page.tsx', 'utf8')).toContain('@/components/slogan-app');
  });
});
