import { cva } from './cva';

/** Lớp CSS cho nút dùng chung — touch target tối thiểu 44px. */
export const buttonClass = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
  {
    primary: 'bg-primary px-4 text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md',
    secondary: 'border border-border bg-card px-4 text-foreground hover:bg-muted',
    ghost: 'px-3 text-muted-foreground hover:bg-muted hover:text-foreground',
    soft: 'bg-primary/10 px-3 text-primary hover:bg-primary/15 dark:bg-primary/15',
    danger: 'px-3 text-destructive hover:bg-destructive/10',
    accent: 'bg-amber-400 px-4 font-semibold text-amber-950 shadow-sm hover:bg-amber-300 hover:shadow-md',
  },
);
