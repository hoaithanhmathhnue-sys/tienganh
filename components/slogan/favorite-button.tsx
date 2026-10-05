'use client';

import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { favoritesStore, useListStore } from '@/lib/stores';
import { sloganId, type Slogan } from '@/lib/slogans';
import { cn } from '@/lib/utils';

export function FavoriteButton({ slogan, tone = 'default' }: { slogan: Slogan; tone?: 'default' | 'onDark' }) {
  const favorites = useListStore(favoritesStore);
  const id = sloganId(slogan);
  const active = favorites.some((f) => sloganId(f) === id);

  const toggle = () => {
    const { en, ipa, vi } = slogan;
    const added = favoritesStore.toggle({ en, ipa, vi });
    toast.success(added ? 'Đã thêm vào Yêu thích' : 'Đã bỏ khỏi Yêu thích');
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      aria-label={active ? `Bỏ yêu thích: ${slogan.en}` : `Thêm yêu thích: ${slogan.en}`}
      title={active ? 'Bỏ yêu thích' : 'Thêm vào Yêu thích'}
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-150 active:scale-90',
        tone === 'onDark'
          ? active
            ? 'bg-white text-rose-600'
            : 'text-white hover:bg-white/20'
          : active
            ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300'
            : 'text-muted-foreground hover:bg-muted hover:text-rose-600',
      )}
    >
      <Heart className={cn('h-5 w-5', active && 'fill-current')} aria-hidden="true" />
    </button>
  );
}
