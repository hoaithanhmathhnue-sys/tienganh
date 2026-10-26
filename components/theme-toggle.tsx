'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

const TONES = {
  onDark: 'bg-white/15 text-white backdrop-blur-sm hover:bg-white/25',
  onLight: 'border border-border bg-card text-foreground hover:bg-muted',
} as const;

/** Nút đổi giao diện sáng/tối. Hiển thị icon bằng CSS để không lệch khi hydrate. */
export function ThemeToggle({ className = '', tone = 'onDark' }: { className?: string; tone?: keyof typeof TONES }) {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Đổi giao diện sáng / tối"
      title="Đổi giao diện sáng / tối"
      className={cn('inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors', TONES[tone], className)}
    >
      <Moon className="h-5 w-5 dark:hidden" />
      <Sun className="hidden h-5 w-5 dark:block" />
    </button>
  );
}
