import { TTS_SAMPLE_RATE } from '@/lib/audio/pcm';
import { synthesizeSpeech } from '@/lib/ai/tts';
import { speechManager } from '@/lib/speech';
import { DEFAULT_SPEECH_RATE, type SpeechRate } from '@/lib/speech-rate';

const audioCache = new Map<string, Float32Array>();
let audioContext: AudioContext | null = null;

export type SpeechLang = 'en-US' | 'vi-VN';

const pickVoice = (lang: SpeechLang): SpeechSynthesisVoice | null => {
  const voices = window.speechSynthesis?.getVoices?.() ?? [];
  const prefix = lang.slice(0, 2);
  const preferred = lang === 'en-US' ? 'Google US English' : 'Google Tiếng Việt';
  return (
    voices.find((v) => v.name?.includes(preferred)) ??
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang?.replace('_', '-').startsWith(prefix)) ??
    null
  );
};

export const isBrowserSpeechSupported = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

export interface BrowserSpeakOptions {
  rate?: number;
  lang?: SpeechLang;
}

/** Đọc bằng giọng trình duyệt (miễn phí, không cần key). */
export function speakWithBrowser(id: string, text: string, options: BrowserSpeakOptions = {}): boolean {
  if (!isBrowserSpeechSupported()) return false;
  const lang = options.lang ?? 'en-US';
  const synth = window.speechSynthesis;
  speechManager.start(id, () => synth.cancel());
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = options.rate ?? DEFAULT_SPEECH_RATE;
  const voice = pickVoice(lang);
  if (voice) utterance.voice = voice;
  utterance.onend = () => speechManager.finish(id);
  utterance.onerror = () => speechManager.finish(id);
  synth.speak(utterance);
  return true;
}

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  audioContext ??= new Ctor();
  return audioContext;
};

/** Đọc bằng Gemini TTS (có cache theo câu + giọng). Lỗi được ném ra để nơi gọi quay về giọng trình duyệt. */
export async function speakWithGemini(
  id: string,
  text: string,
  apiKey: string,
  voiceName: string,
  rate: SpeechRate = DEFAULT_SPEECH_RATE,
): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx) throw new Error('Web Audio không được hỗ trợ');
  // Mở khoá âm thanh ngay trong thao tác bấm của người dùng.
  void ctx.resume();

  let cancelled = false;
  let source: AudioBufferSourceNode | null = null;
  speechManager.start(id, () => {
    cancelled = true;
    try {
      source?.stop();
    } catch {
      // đã dừng
    }
  });
  if (isBrowserSpeechSupported()) window.speechSynthesis.cancel();

  try {
    const cacheKey = `${voiceName}|${rate}|${text}`;
    let samples = audioCache.get(cacheKey);
    if (!samples) {
      samples = await synthesizeSpeech(text, apiKey, voiceName, rate);
      audioCache.set(cacheKey, samples);
    }
    if (cancelled) return;

    const buffer = ctx.createBuffer(1, samples.length, TTS_SAMPLE_RATE);
    buffer.getChannelData(0).set(samples);
    source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => speechManager.finish(id);
    source.start();
  } catch (error) {
    speechManager.finish(id);
    throw error;
  }
}
