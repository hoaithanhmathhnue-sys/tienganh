'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { buttonClass } from '@/components/ui/button-class';

interface CopyButtonProps {
  text: string;
  label?: string;
  tone?: 'default' | 'onDark';
}

export function CopyButton({ text, label = 'Sao chép', tone = 'default' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Đã sao chép!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép. Hãy chọn và sao chép thủ công.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Sao chép: ${text}`}
      title="Sao chép slogan, IPA và nghĩa"
      className={
        tone === 'onDark'
          ? 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-white transition-colors hover:bg-white/20'
          : buttonClass('ghost', copied ? 'text-sm text-emerald-700 dark:text-emerald-400' : 'text-sm')
      }
    >
      {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      <span className="hidden sm:inline">{copied ? 'Đã chép' : label}</span>
    </button>
  );
}
