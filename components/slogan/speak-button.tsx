'use client';

import { useId, useState, useSyncExternalStore } from 'react';
import { LoaderCircle, Square, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { canUseAiVoice, useAiSettings } from '@/lib/ai/settings-store';
import { getActiveApiKey } from '@/lib/ai/settings';
import { parseApiError, getFriendlyErrorMessage } from '@/lib/ai/errors';
import { speakWithBrowser, speakWithGemini } from '@/lib/speak';
import { speechManager } from '@/lib/speech';
import { buttonClass } from '@/components/ui/button-class';
import { cn } from '@/lib/utils';

interface SpeakButtonProps {
  text: string;
  variant?: 'soft' | 'onDark';
  showLabel?: boolean;
  className?: string;
}

export function SpeakButton({ text, variant = 'soft', showLabel = true, className }: SpeakButtonProps) {
  const id = useId();
  const settings = useAiSettings();
  const [loading, setLoading] = useState(false);
  const playing = useSyncExternalStore(
    speechManager.subscribe,
    () => speechManager.getActiveId() === id,
    () => false,
  );

  const handleClick = async () => {
    if (playing) {
      speechManager.stop();
      return;
    }
    if (canUseAiVoice(settings)) {
      setLoading(true);
      try {
        await speakWithGemini(id, text, getActiveApiKey(settings), settings.voiceName);
        return;
      } catch (error) {
        const type = parseApiError(error);
        toast.warning(`${getFriendlyErrorMessage(type, 'gemini')} Đã chuyển sang giọng đọc của trình duyệt.`);
      } finally {
        setLoading(false);
      }
    }
    if (!speakWithBrowser(id, text)) {
      toast.error('Trình duyệt này không hỗ trợ đọc văn bản. Hãy thử Chrome hoặc Edge.');
    }
  };

  const label = loading ? 'Đang tạo giọng…' : playing ? 'Dừng' : 'Nghe';
  const Icon = loading ? LoaderCircle : playing ? Square : Volume2;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`${playing ? 'Dừng đọc' : 'Nghe phát âm'}: ${text}`}
      aria-pressed={playing}
      title={playing ? 'Dừng' : 'Nghe phát âm'}
      className={cn(
        variant === 'soft'
          ? buttonClass(playing ? 'primary' : 'soft', 'text-sm')
          : 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/15 px-4 font-medium text-current backdrop-blur-sm transition-colors hover:bg-white/25',
        className,
      )}
    >
      <Icon className={cn('h-4 w-4', loading && 'animate-spin', playing && 'fill-current')} aria-hidden="true" />
      {showLabel && <span>{label}</span>}
    </button>
  );
}
