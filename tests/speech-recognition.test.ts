// @vitest-environment jsdom
import { afterEach, describe, it, expect } from 'vitest';
import {
  getSpeechRecognitionCtor,
  recognizeOnce,
  SpeechRecognitionFailure,
  getRecognitionErrorMessage,
} from '@/lib/speech-recognition';

type Handler = ((event: unknown) => void) | null;

/** Giả lập SpeechRecognition tối giản để kiểm thử luồng sự kiện. */
class FakeRecognition {
  static last: FakeRecognition | null = null;
  lang = '';
  maxAlternatives = 1;
  interimResults = true;
  continuous = true;
  onresult: Handler = null;
  onerror: Handler = null;
  onend: Handler = null;
  started = false;
  aborted = false;
  constructor() {
    FakeRecognition.last = this;
  }
  start() {
    this.started = true;
  }
  stop() {
    this.onend?.({});
  }
  abort() {
    this.aborted = true;
    this.onerror?.({ error: 'aborted' });
    this.onend?.({});
  }
  emitResult(alternatives: string[]) {
    const result = Object.assign(
      alternatives.map((transcript) => ({ transcript, confidence: 0.9 })),
      { isFinal: true },
    );
    this.onresult?.({ results: [result] });
    this.onend?.({});
  }
  emitError(error: string) {
    this.onerror?.({ error });
    this.onend?.({});
  }
}

const w = window as unknown as Record<string, unknown>;

afterEach(() => {
  delete w.SpeechRecognition;
  delete w.webkitSpeechRecognition;
  FakeRecognition.last = null;
});

describe('getSpeechRecognitionCtor', () => {
  it('trả về null khi trình duyệt không hỗ trợ', () => {
    expect(getSpeechRecognitionCtor()).toBeNull();
  });

  it('nhận cả bản có tiền tố webkit', () => {
    w.webkitSpeechRecognition = FakeRecognition;
    expect(getSpeechRecognitionCtor()).toBe(FakeRecognition);
  });
});

describe('recognizeOnce', () => {
  it('cấu hình đúng và trả về các phương án nhận dạng', async () => {
    w.SpeechRecognition = FakeRecognition;
    const promise = recognizeOnce({ lang: 'en-US', maxAlternatives: 3 });
    const rec = FakeRecognition.last!;
    expect(rec.started).toBe(true);
    expect(rec.lang).toBe('en-US');
    expect(rec.maxAlternatives).toBe(3);
    expect(rec.interimResults).toBe(false);
    expect(rec.continuous).toBe(false);
    rec.emitResult(['good morning class', 'good morning glass']);
    await expect(promise).resolves.toEqual(['good morning class', 'good morning glass']);
  });

  it('báo lỗi quyền micro bằng mã riêng', async () => {
    w.SpeechRecognition = FakeRecognition;
    const promise = recognizeOnce();
    FakeRecognition.last!.emitError('not-allowed');
    await expect(promise).rejects.toMatchObject({ code: 'not-allowed' });
  });

  it('không nghe thấy gì → lỗi no-speech', async () => {
    w.SpeechRecognition = FakeRecognition;
    const promise = recognizeOnce();
    FakeRecognition.last!.stop();
    await expect(promise).rejects.toMatchObject({ code: 'no-speech' });
  });

  it('huỷ bằng AbortSignal → lỗi aborted', async () => {
    w.SpeechRecognition = FakeRecognition;
    const controller = new AbortController();
    const promise = recognizeOnce({ signal: controller.signal });
    controller.abort();
    await expect(promise).rejects.toMatchObject({ code: 'aborted' });
    expect(FakeRecognition.last!.aborted).toBe(true);
  });

  it('không hỗ trợ → lỗi unsupported', async () => {
    await expect(recognizeOnce()).rejects.toBeInstanceOf(SpeechRecognitionFailure);
    await expect(recognizeOnce()).rejects.toMatchObject({ code: 'unsupported' });
  });
});

describe('getRecognitionErrorMessage', () => {
  it('thông báo tiếng Việt cho các lỗi thường gặp', () => {
    expect(getRecognitionErrorMessage('not-allowed')).toMatch(/micro/i);
    expect(getRecognitionErrorMessage('unsupported')).toMatch(/Chrome|Edge/);
    expect(getRecognitionErrorMessage('no-speech')).toBeTruthy();
    expect(getRecognitionErrorMessage('network')).toBeTruthy();
  });
});
