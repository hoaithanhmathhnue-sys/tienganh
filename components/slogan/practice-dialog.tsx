'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, RotateCcw, Square } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { buttonClass } from '@/components/ui/button-class';
import { getPronunciationFeedback, scoreBestAlternative, type PronunciationResult } from '@/lib/pronunciation';
import { sloganId, type Slogan } from '@/lib/slogans';
import { speechManager } from '@/lib/speech';
import {
  getRecognitionErrorMessage,
  recognizeOnce,
  SpeechRecognitionFailure,
  useSpeechRecognitionSupported,
  type RecognitionErrorCode,
} from '@/lib/speech-recognition';
import { cn } from '@/lib/utils';
import { SpeakButton } from './speak-button';
import { SpeechRateControl } from './speech-rate-control';

const LISTEN_LIMIT_MS = 10_000;

type PracticeState =
  | { status: 'idle' }
  | { status: 'listening' }
  | { status: 'result'; result: PronunciationResult }
  | { status: 'error'; code: RecognitionErrorCode };

interface PracticeDialogProps {
  slogan: Slogan | null;
  onClose: () => void;
}

/** Luyện nói: nghe mẫu → nói vào micro → chấm điểm theo từng từ (chạy hoàn toàn trên trình duyệt). */
export function PracticeDialog({ slogan, onClose }: PracticeDialogProps) {
  return (
    <Modal
      open={slogan !== null}
      onClose={onClose}
      title="Luyện nói"
      description="Nghe mẫu, sau đó bấm micro và đọc to câu bên dưới."
      icon={<Mic className="h-5 w-5" aria-hidden="true" />}
    >
      {slogan && <PracticeBody key={sloganId(slogan)} slogan={slogan} />}
    </Modal>
  );
}

function PracticeBody({ slogan }: { slogan: Slogan }) {
  const supported = useSpeechRecognitionSupported();
  const [state, setState] = useState<PracticeState>({ status: 'idle' });
  const [best, setBest] = useState<number | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const start = async () => {
    speechManager.stop();
    const controller = new AbortController();
    controllerRef.current = controller;
    const timer = window.setTimeout(() => controller.abort(), LISTEN_LIMIT_MS);
    setState({ status: 'listening' });
    try {
      const alternatives = await recognizeOnce({ lang: 'en-US', maxAlternatives: 3, signal: controller.signal });
      const result = scoreBestAlternative(slogan.en, alternatives);
      setState({ status: 'result', result });
      setBest((prev) => (prev === null ? result.score : Math.max(prev, result.score)));
    } catch (error) {
      const code = error instanceof SpeechRecognitionFailure ? error.code : 'unknown';
      setState(code === 'aborted' ? { status: 'idle' } : { status: 'error', code });
    } finally {
      window.clearTimeout(timer);
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  };

  const stop = () => controllerRef.current?.abort();

  const listening = state.status === 'listening';

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-primary/5 p-4 text-center dark:bg-primary/10">
        <p lang="en" className="font-display text-xl font-bold leading-snug md:text-2xl">
          {state.status === 'result'
            ? state.result.words.map((w, i) => (
                <span
                  key={`${w.word}-${i}`}
                  className={cn(
                    'mx-0.5 inline-block rounded px-0.5',
                    w.matched
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-700 underline decoration-wavy dark:bg-rose-500/20 dark:text-rose-300',
                  )}
                >
                  {w.word}
                </span>
              ))
            : slogan.en}
        </p>
        {slogan.ipa && (
          <p lang="en-fonipa" className="mt-1.5 font-mono text-sm text-teal-700 dark:text-teal-300">
            {slogan.ipa}
          </p>
        )}
        <p lang="vi" className="mt-1 text-sm italic text-muted-foreground">
          {slogan.vi}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <SpeakButton text={slogan.en} />
          <SpeechRateControl />
        </div>
      </div>

      {!supported ? (
        <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          {getRecognitionErrorMessage('unsupported')}
        </p>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {listening && (
              <>
                <span className="absolute inset-0 animate-ping rounded-full bg-rose-400/40" aria-hidden="true" />
                <span className="absolute -inset-2 animate-pulse rounded-full bg-rose-400/20" aria-hidden="true" />
              </>
            )}
            <button
              type="button"
              onClick={listening ? stop : start}
              aria-label={listening ? 'Dừng ghi âm' : 'Bắt đầu nói'}
              className={cn(
                'relative inline-flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50',
                listening ? 'bg-rose-600' : 'bg-gradient-to-br from-[#00897B] to-[#00695C]',
              )}
            >
              {listening ? <Square className="h-8 w-8 fill-current" aria-hidden="true" /> : <Mic className="h-9 w-9" aria-hidden="true" />}
            </button>
          </div>
          <p className="text-sm font-medium text-muted-foreground" aria-live="polite">
            {listening ? 'Đang nghe… hãy đọc to câu ở trên' : state.status === 'result' ? 'Bấm micro để thử lại' : 'Bấm micro rồi đọc to'}
          </p>
        </div>
      )}

      {state.status === 'error' && (
        <p role="alert" className="rounded-xl bg-rose-50 p-3 text-center text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-200">
          {getRecognitionErrorMessage(state.code)}
        </p>
      )}

      {state.status === 'result' && <ResultCard result={state.result} best={best} onRetry={start} />}
    </div>
  );
}

function ResultCard({ result, best, onRetry }: { result: PronunciationResult; best: number | null; onRetry: () => void }) {
  const feedback = getPronunciationFeedback(result.score);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const color =
    feedback.level === 'excellent' ? '#059669' : feedback.level === 'good' ? '#0d9488' : feedback.level === 'fair' ? '#d97706' : '#e11d48';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4 rounded-2xl border border-border p-4 sm:flex-row"
      aria-live="polite"
    >
      <div className="relative h-24 w-24 shrink-0">
        <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90" aria-hidden="true">
          <circle cx="40" cy="40" r={radius} fill="none" strokeWidth="8" className="stroke-muted" />
          <motion.circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            stroke={color}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - result.score / 100) }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold" style={{ color }}>
            {result.score}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">điểm</span>
        </div>
      </div>
      <div className="min-w-0 flex-1 text-center sm:text-left">
        <p className="font-display text-lg font-bold">
          <span aria-hidden="true">{feedback.emoji}</span> {feedback.title}
        </p>
        <p className="text-sm text-muted-foreground">{feedback.message}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Máy nghe được: <q lang="en" className="font-medium text-foreground">{result.transcript}</q>
          {best !== null && <span className="ml-2">· Cao nhất: <strong className="text-foreground">{best}</strong></span>}
        </p>
        <button type="button" onClick={onRetry} className={buttonClass('secondary', 'mt-3 text-sm')}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Thử lại
        </button>
      </div>
    </motion.div>
  );
}
