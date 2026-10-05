'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Mic, Printer, Sparkles, Trash2 } from 'lucide-react';
import type { Slogan } from '@/lib/slogans';
import { useSpeechRecognitionSupported } from '@/lib/speech-recognition';
import { buttonClass } from '@/components/ui/button-class';
import { SpeakButton } from './speak-button';
import { CopyButton } from './copy-button';
import { FavoriteButton } from './favorite-button';

interface SloganCardProps {
  slogan: Slogan;
  index: number;
  topic?: string;
  onPoster: (slogan: Slogan) => void;
  onRemove?: (slogan: Slogan) => void;
  onPractice?: (slogan: Slogan) => void;
}

function SloganCardBase({ slogan, index, topic, onPoster, onRemove, onPractice }: SloganCardProps) {
  const canPractice = useSpeechRecognitionSupported() && onPractice;
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-md"
    >
      {topic && (
        <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
          <Sparkles className="h-3 w-3" aria-hidden="true" /> {topic}
        </span>
      )}
      <p lang="en" className="font-display text-lg font-bold leading-snug text-foreground md:text-xl">
        {slogan.en}
      </p>
      {slogan.ipa && (
        <p lang="en-fonipa" className="mt-1.5 font-mono text-sm text-teal-700 dark:text-teal-300">
          {slogan.ipa}
        </p>
      )}
      <p lang="vi" className="mt-1.5 text-base italic text-muted-foreground">
        {slogan.vi}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-1 pt-4">
        <SpeakButton text={slogan.en} />
        {canPractice && (
          <button
            type="button"
            onClick={() => onPractice(slogan)}
            aria-label={`Luyện nói: ${slogan.en}`}
            title="Luyện nói & chấm điểm phát âm"
            className={buttonClass('ghost', 'text-sm')}
          >
            <Mic className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Luyện nói</span>
          </button>
        )}
        <CopyButton text={`${slogan.en}\n${slogan.ipa}\n${slogan.vi}`} />
        <button
          type="button"
          onClick={() => onPoster(slogan)}
          aria-label={`Tạo poster: ${slogan.en}`}
          title="Xuất poster PNG / In A4"
          className={buttonClass('ghost', 'text-sm')}
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Poster</span>
        </button>
        <div className="ml-auto flex items-center">
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(slogan)}
              aria-label={`Xoá khỏi bộ sưu tập: ${slogan.en}`}
              title="Xoá khỏi Bộ sưu tập AI"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <FavoriteButton slogan={slogan} />
        </div>
      </div>
    </motion.article>
  );
}

export const SloganCard = memo(SloganCardBase);
