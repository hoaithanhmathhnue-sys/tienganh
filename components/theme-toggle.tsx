'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

/** Nút đổi giao diện sáng/tối. Hiển thị icon bằng CSS để không lệch khi hydrate. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Đổi giao diện sáng / tối"
      title="Đổi giao diện sáng / tối"
      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25 ${className}`}
    >
      <Moon className="h-5 w-5 dark:hidden" />
      <Sun className="hidden h-5 w-5 dark:block" />
    </button>
  );
}
