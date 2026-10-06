import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('bilingual lesson route', () => {
  it('exposes the /giao-an App Router page and its lesson controller', () => {
    expect(existsSync('app/giao-an/page.tsx')).toBe(true);
    expect(readFileSync('app/giao-an/page.tsx', 'utf8')).toContain("@/components/lesson/lesson-app");
    expect(existsSync('components/lesson/lesson-app.tsx')).toBe(true);
  });
});
