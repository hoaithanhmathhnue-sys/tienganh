import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('learning route', () => {
  it('exposes the /hoc-tap page and learning app', () => {
    expect(existsSync('app/hoc-tap/page.tsx')).toBe(true);
    expect(readFileSync('app/hoc-tap/page.tsx', 'utf8')).toContain("@/components/learning/learning-app");
    expect(existsSync('components/learning/learning-app.tsx')).toBe(true);
  });
});
