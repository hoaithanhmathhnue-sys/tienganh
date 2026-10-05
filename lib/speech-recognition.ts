import { useSyncExternalStore } from 'react';

/* Kiểu tối giản cho Web Speech API (chưa có sẵn trong lib.dom của TypeScript). */
interface RecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface RecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  [index: number]: RecognitionAlternative;
}
interface RecognitionResultEvent {
  results: ArrayLike<RecognitionResult>;
}
interface RecognitionErrorEvent {
  error: string;
}
export interface SpeechRecognitionLike {
  lang: string;
  maxAlternatives: number;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
export type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

export type RecognitionErrorCode =
  | 'unsupported'
  | 'not-allowed'
  | 'no-speech'
  | 'audio-capture'
  | 'network'
  | 'aborted'
  | 'unknown';

export class SpeechRecognitionFailure extends Error {
  readonly code: RecognitionErrorCode;
  constructor(code: RecognitionErrorCode) {
    super(getRecognitionErrorMessage(code));
    this.name = 'SpeechRecognitionFailure';
    this.code = code;
  }
}

const KNOWN_CODES: RecognitionErrorCode[] = ['not-allowed', 'no-speech', 'audio-capture', 'network', 'aborted'];

const toCode = (error: string): RecognitionErrorCode => {
  if (error === 'service-not-allowed') return 'not-allowed';
  return (KNOWN_CODES as string[]).includes(error) ? (error as RecognitionErrorCode) : 'unknown';
};

export function getRecognitionErrorMessage(code: RecognitionErrorCode): string {
  switch (code) {
    case 'unsupported':
      return 'Trình duyệt này chưa hỗ trợ nhận dạng giọng nói. Thầy/Cô hãy dùng Chrome hoặc Edge trên máy tính / Android.';
    case 'not-allowed':
      return 'Chưa được cấp quyền dùng micro. Hãy bấm biểu tượng ổ khoá trên thanh địa chỉ và cho phép Micro.';
    case 'no-speech':
      return 'Chưa nghe thấy giọng nói. Hãy nói to, rõ hơn và thử lại nhé!';
    case 'audio-capture':
      return 'Không tìm thấy micro. Hãy kiểm tra micro đã cắm / bật chưa.';
    case 'network':
      return 'Nhận dạng giọng nói cần kết nối mạng. Hãy kiểm tra Internet và thử lại.';
    case 'aborted':
      return 'Đã dừng ghi âm.';
    default:
      return 'Có lỗi khi nhận dạng giọng nói. Hãy thử lại.';
  }
}

export function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface RecognizeOptions {
  lang?: string;
  maxAlternatives?: number;
  signal?: AbortSignal;
}

/** Nghe một lượt nói và trả về các phương án nhận dạng (tốt nhất trước). */
export function recognizeOnce({ lang = 'en-US', maxAlternatives = 3, signal }: RecognizeOptions = {}): Promise<string[]> {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) return Promise.reject(new SpeechRecognitionFailure('unsupported'));
  if (signal?.aborted) return Promise.reject(new SpeechRecognitionFailure('aborted'));

  return new Promise<string[]>((resolve, reject) => {
    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.maxAlternatives = maxAlternatives;
    recognition.interimResults = false;
    recognition.continuous = false;

    let settled = false;
    let alternatives: string[] | null = null;
    let failure: RecognitionErrorCode | null = null;

    const onAbort = () => {
      failure = 'aborted';
      try {
        recognition.abort();
      } catch {
        finish();
      }
    };

    const finish = () => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', onAbort);
      if (failure) reject(new SpeechRecognitionFailure(failure));
      else if (alternatives && alternatives.length > 0) resolve(alternatives);
      else reject(new SpeechRecognitionFailure('no-speech'));
    };

    recognition.onresult = (event) => {
      const result = event.results[0];
      if (!result) return;
      const list: string[] = [];
      for (let i = 0; i < result.length; i++) {
        const text = result[i]?.transcript?.trim();
        if (text) list.push(text);
      }
      alternatives = list;
    };
    recognition.onerror = (event) => {
      failure ??= toCode(event.error);
    };
    recognition.onend = finish;

    signal?.addEventListener('abort', onAbort, { once: true });
    try {
      recognition.start();
    } catch {
      failure = 'unknown';
      finish();
    }
  });
}

const noopSubscribe = () => () => {};

/** Kiểm tra hỗ trợ chỉ ở phía trình duyệt (server luôn false → không lệch hydration). */
export const useSpeechRecognitionSupported = (): boolean =>
  useSyncExternalStore(
    noopSubscribe,
    () => getSpeechRecognitionCtor() !== null,
    () => false,
  );
