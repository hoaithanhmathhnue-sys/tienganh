import { cn } from '@/lib/utils';

/** Bộ chọn biến thể tối giản (thay cho class-variance-authority). */
export function cva<V extends string>(base: string, variants: Record<V, string>) {
  return (variant: V, className?: string) => cn(base, variants[variant], className);
}
