'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Languages, Palette, Pause, Play, Type, X } from 'lucide-react';
import { SpeakButton } from '@/components/slogan/speak-button';
import { POSTER_THEMES } from '@/lib/poster';
import { AUTOPLAY_INTERVAL_MS, cycleIndex } from '@/lib/presentation';
import type { Slogan } from '@/lib/slogans';
import { speechManager } from '@/lib/speech';
import { cn } from '@/lib/utils';

/** Gọi trực tiếp trong trình xử lý click (yêu cầu của trình duyệt). */
export const enterFullscreen = () => {
  const el = document.documentElement;
  if (!document.fullscreenElement && el.requestFullscreen) {
    el.requestFullscreen().catch(() => undefined);
  }
};

const exitFullscreen = () => {
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => undefined);
  }
};

interface PresentationModeProps {
  slogans: Slogan[];
  startIndex?: number;
  onClose: () => void;
}

export function PresentationMode({ slogans, startIndex = 0, onClose }: PresentationModeProps) {
  const total = slogans.length;
  const [index, setIndex] = useState(() => Math.min(Math.max(startIndex, 0), Math.max(total - 1, 0)));
  const [direction, setDirection] = useState(1);
  const [autoplay, setAutoplay] = useState(false);
  const [showIpa, setShowIpa] = useState(true);
  const [showVi, setShowVi] = useState(true);
  const [themeIndex, setThemeIndex] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  const theme = POSTER_THEMES[themeIndex];
  const slogan = slogans[index];

  const go = (delta: number) => {
    setDirection(delta);
    setIndex((i) => cycleIndex(i, delta, total));
  };

  const close = () => {
    speechManager.stop();
    exitFullscreen();
    onClose();
  };

  // Khoá cuộn trang nền và đưa focus vào lớp trình chiếu.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
      speechManager.stop();
    };
  }, []);

  // Phím tắt: ← → Space (chuyển), Esc (thoát), I (IPA), V (nghĩa Việt), T (màu nền), P (tự chạy).
  const handlersRef = useRef({ go, close });
  useEffect(() => {
    handlersRef.current = { go, close };
  });
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      const onButton = target?.tagName === 'BUTTON';
      switch (event.key) {
        case 'ArrowRight':
        case 'PageDown':
          event.preventDefault();
          handlersRef.current.go(1);
          break;
        case ' ':
          if (onButton) return;
          event.preventDefault();
          handlersRef.current.go(1);
          break;
        case 'ArrowLeft':
        case 'PageUp':
          event.preventDefault();
          handlersRef.current.go(-1);
          break;
        case 'Escape':
          event.preventDefault();
          handlersRef.current.close();
          break;
        case 'i':
        case 'I':
          setShowIpa((v) => !v);
          break;
        case 'v':
        case 'V':
          setShowVi((v) => !v);
          break;
        case 't':
        case 'T':
          setThemeIndex((t) => cycleIndex(t, 1, POSTER_THEMES.length));
          break;
        case 'p':
        case 'P':
          setAutoplay((a) => !a);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!autoplay || total < 2) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setIndex((i) => cycleIndex(i, 1, total));
    }, AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [autoplay, total]);

  if (!slogan) return null;

  const controlClass =
    'inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-xl bg-black/15 px-3 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-black/25 aria-pressed:bg-black/30';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chế độ trình chiếu slogan"
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`, color: theme.text }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 md:p-4">
        <span className="rounded-xl bg-black/15 px-3 py-2 text-sm font-semibold tabular-nums backdrop-blur-sm" aria-live="polite">
          {index + 1} / {total}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setShowIpa((v) => !v)} aria-pressed={showIpa} className={controlClass} title="Bật/tắt IPA (phím I)">
            <Type className="h-4 w-4" aria-hidden="true" /> <span className="hidden sm:inline">IPA</span>
          </button>
          <button type="button" onClick={() => setShowVi((v) => !v)} aria-pressed={showVi} className={controlClass} title="Bật/tắt nghĩa tiếng Việt (phím V)">
            <Languages className="h-4 w-4" aria-hidden="true" /> <span className="hidden sm:inline">Tiếng Việt</span>
          </button>
          <button
            type="button"
            onClick={() => setThemeIndex((t) => cycleIndex(t, 1, POSTER_THEMES.length))}
            className={controlClass}
            title={`Đổi màu nền — ${theme.name} (phím T)`}
            aria-label={`Đổi màu nền, hiện tại: ${theme.name}`}
          >
            <Palette className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setAutoplay((a) => !a)}
            aria-pressed={autoplay}
            className={controlClass}
            title="Tự động chuyển sau 8 giây (phím P)"
            disabled={total < 2}
          >
            {autoplay ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            <span className="hidden sm:inline">{autoplay ? 'Tạm dừng' : 'Tự chạy'}</span>
          </button>
          <button ref={closeRef} type="button" onClick={close} className={controlClass} aria-label="Thoát trình chiếu (Esc)" title="Thoát (Esc)">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 md:px-24">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="max-w-6xl text-center"
          >
            <p lang="en" className="font-display text-[clamp(2.25rem,7vw,6.5rem)] font-extrabold leading-[1.1] tracking-tight [text-wrap:balance]">
              {slogan.en}
            </p>
            {showIpa && slogan.ipa && (
              <p lang="en-fonipa" className="mt-6 font-mono text-[clamp(1.1rem,2.6vw,2.25rem)] opacity-85">
                {slogan.ipa}
              </p>
            )}
            {showVi && slogan.vi && (
              <p lang="vi" className="mt-4 text-[clamp(1.25rem,3vw,2.75rem)] font-medium italic">
                {slogan.vi}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Slogan trước (←)"
              className="absolute left-2 top-1/2 inline-flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-black/15 backdrop-blur-sm transition-colors hover:bg-black/25 md:left-6"
            >
              <ChevronLeft className="h-7 w-7" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Slogan tiếp theo (→)"
              className="absolute right-2 top-1/2 inline-flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-black/15 backdrop-blur-sm transition-colors hover:bg-black/25 md:right-6"
            >
              <ChevronRight className="h-7 w-7" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col items-center gap-3 p-4 md:p-6">
        <SpeakButton key={index} text={slogan.en} variant="onDark" className="min-h-12 px-6 text-base" />
        <p className={cn('hidden text-xs opacity-70 md:block')}>
          ← → hoặc Space: chuyển · I: IPA · V: tiếng Việt · T: màu nền · P: tự chạy · Esc: thoát
        </p>
        {autoplay && total > 1 && (
          <div className="h-1 w-full max-w-md overflow-hidden rounded-full bg-black/15" aria-hidden="true">
            <motion.div
              key={`progress-${index}`}
              className="h-full rounded-full"
              style={{ background: theme.accent }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: AUTOPLAY_INTERVAL_MS / 1000, ease: 'linear' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
