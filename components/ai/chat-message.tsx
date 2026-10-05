'use client';

import { memo, useState } from 'react';
import { Bot, Check, Copy, LoaderCircle, Square, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSpeak } from '@/components/slogan/speak-button';
import { detectSpeechLang, markdownToPlainText, textForSpeech } from '@/lib/text';
import { cn } from '@/lib/utils';
import { Markdown } from './markdown';

const MAX_SPEECH_CHARS = 1500;

export const formatChatTime = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

export function AssistantAvatar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#4338CA] text-white shadow-sm',
        className,
      )}
      aria-hidden="true"
    >
      <Bot className="h-[18px] w-[18px]" />
    </div>
  );
}

interface AssistantBubbleProps {
  text: string;
  time?: string;
  model?: string;
  stopped?: boolean;
  streaming?: boolean;
}

/** Tin nhắn của Trợ lý: Markdown + thời gian + model + Nghe / Sao chép. */
export const AssistantBubble = memo(function AssistantBubble({ text, time, model, stopped, streaming }: AssistantBubbleProps) {
  return (
    <div className="flex items-start gap-2.5">
      <AssistantAvatar className="mt-0.5" />
      <div className="min-w-0 max-w-[88%] rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3 text-card-foreground shadow-sm">
        {text ? (
          <Markdown text={text} />
        ) : (
          <TypingDots />
        )}
        {streaming && text && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-primary/70 align-middle" aria-hidden="true" />}
        {stopped && <p className="mt-2 text-xs italic text-muted-foreground">⏹ Đã dừng theo yêu cầu.</p>}
        {!streaming && text && (
          <div className="mt-2.5 flex items-center gap-1 border-t border-border/70 pt-2">
            <span className="mr-auto min-w-0 truncate text-[11px] text-muted-foreground">
              {time}
              {model && <span className="ml-1.5 opacity-80">· {model}</span>}
            </span>
            <MessageSpeakButton text={text} />
            <MessageCopyButton text={text} />
          </div>
        )}
      </div>
    </div>
  );
});

export const UserBubble = memo(function UserBubble({ text, time }: { text: string; time?: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-gradient-to-br from-[#1E3A8A] to-[#312E81] px-4 py-2.5 text-white shadow-sm">
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{text}</p>
        {time && <p className="mt-1 text-right text-[11px] text-white/70">{time}</p>}
      </div>
    </div>
  );
});

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1.5" role="status" aria-label="Trợ lý đang soạn câu trả lời">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
          style={{ animationDelay: `${delay}ms` }}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

const iconButton =
  'inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50';

function MessageSpeakButton({ text }: { text: string }) {
  const speech = textForSpeech(text).slice(0, MAX_SPEECH_CHARS);
  const { playing, loading, toggle } = useSpeak(speech, detectSpeechLang(speech));
  const Icon = loading ? LoaderCircle : playing ? Square : Volume2;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? 'Dừng đọc' : 'Nghe câu trả lời'}
      title={playing ? 'Dừng đọc' : 'Nghe câu trả lời'}
      className={cn(iconButton, playing && 'text-primary')}
    >
      <Icon className={cn('h-4 w-4', loading && 'animate-spin', playing && 'fill-current')} aria-hidden="true" />
    </button>
  );
}

function MessageCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdownToPlainText(text));
      setCopied(true);
      toast.success('Đã sao chép câu trả lời!');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép. Hãy chọn và sao chép thủ công.');
    }
  };
  return (
    <button type="button" onClick={copy} aria-label="Sao chép câu trả lời" title="Sao chép" className={cn(iconButton, copied && 'text-emerald-600')}>
      {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}
