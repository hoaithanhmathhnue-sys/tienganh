'use client';

import { useSyncExternalStore } from 'react';
import { CalendarHeart, MonitorPlay, Printer } from 'lucide-react';
import { SpeakButton } from '@/components/slogan/speak-button';
import { CopyButton } from '@/components/slogan/copy-button';
import { FavoriteButton } from '@/components/slogan/favorite-button';
import { getDailyIndex } from '@/lib/daily';
import { categories, type Slogan } from '@/lib/slogans';

const ALL_SLOGANS: Slogan[] = categories.flatMap((c) => c.slogans);

const noopSubscribe = () => () => undefined;
/** Chỉ tính trên trình duyệt (trang được prerender tĩnh nên server trả về null để tránh lệch hydrate). */
const getClientIndex = () => getDailyIndex(new Date(), ALL_SLOGANS.length);
const getServerIndex = () => null;

interface DailySloganProps {
  onPoster: (slogan: Slogan) => void;
  onPresent: (slogan: Slogan) => void;
}

export function DailySlogan({ onPoster, onPresent }: DailySloganProps) {
  const index = useSyncExternalStore(noopSubscribe, getClientIndex, getServerIndex);
  const slogan = index === null ? null : ALL_SLOGANS[index];

  return (
    <section
      aria-labelledby="daily-slogan-title"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#00796B] to-[#004D40] p-6 text-white shadow-lg md:p-8"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl" aria-hidden="true" />
      <h2 id="daily-slogan-title" className="relative flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-amber-200">
        <CalendarHeart className="h-4 w-4" aria-hidden="true" /> Slogan của ngày hôm nay
      </h2>
      {slogan ? (
        <div className="relative mt-3">
          <p lang="en" className="font-display text-2xl font-extrabold leading-tight md:text-4xl">
            {slogan.en}
          </p>
          <p lang="en-fonipa" className="mt-2 font-mono text-sm text-teal-100 md:text-base">
            {slogan.ipa}
          </p>
          <p lang="vi" className="mt-1.5 text-base italic text-white/90 md:text-lg">
            {slogan.vi}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <SpeakButton text={slogan.en} variant="onDark" />
            <button
              type="button"
              onClick={() => onPresent(slogan)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/15 px-4 font-medium backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              <MonitorPlay className="h-4 w-4" aria-hidden="true" /> Chiếu lên bảng
            </button>
            <button
              type="button"
              onClick={() => onPoster(slogan)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/15 px-4 font-medium backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              <Printer className="h-4 w-4" aria-hidden="true" /> Poster
            </button>
            <div className="ml-auto flex items-center rounded-xl bg-white/10">
              <CopyButton text={`${slogan.en}\n${slogan.ipa}\n${slogan.vi}`} tone="onDark" />
              <FavoriteButton slogan={slogan} tone="onDark" />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative mt-3 animate-pulse space-y-3" aria-hidden="true">
          <div className="h-8 w-3/4 rounded bg-white/20" />
          <div className="h-4 w-1/2 rounded bg-white/15" />
          <div className="h-5 w-2/3 rounded bg-white/15" />
        </div>
      )}
    </section>
  );
}
