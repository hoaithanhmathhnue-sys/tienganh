'use client';

import { Gauge } from 'lucide-react';
import { SPEECH_RATES, SPEECH_RATE_LABELS, speechRateStore, useSpeechRate } from '@/lib/speech-rate';
import { cn } from '@/lib/utils';

/** Nút chọn tốc độ đọc dùng chung (0.5x / 0.75x / 1x). */
export function SpeechRateControl({ className }: { className?: string }) {
  const rate = useSpeechRate();
  return (
    <div role="radiogroup" aria-label="Tốc độ đọc" className={cn('flex items-center gap-1.5', className)}>
      <span className="mr-1 hidden items-center gap-1 text-xs font-medium text-muted-foreground sm:inline-flex">
        <Gauge className="h-4 w-4" aria-hidden="true" /> Tốc độ đọc
      </span>
      <div className="inline-flex rounded-xl bg-muted/60 p-1">
        {SPEECH_RATES.map((r) => {
          const active = r === rate;
          return (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => speechRateStore.set(r)}
              title={`${SPEECH_RATE_LABELS[r]} (${r}x)`}
              className={cn(
                'min-h-9 rounded-lg px-2.5 text-xs font-semibold transition-all',
                active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {r}x<span className="ml-1 hidden font-normal md:inline">{SPEECH_RATE_LABELS[r]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
