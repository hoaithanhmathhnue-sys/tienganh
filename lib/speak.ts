import { TTS_SAMPLE_RATE } from '@/lib/audio/pcm';
import { synthesizeSpeech } from '@/lib/ai/tts';
import { speechManager } from '@/lib/speech';

const audioCache = new Map<string, Float32Array>();
let audioContext: AudioContext | null = null;

const pickVoice = (): SpeechSynthesisVoice | null => {
  const voices = window.speechSynthesis?.getVoices?.() ?? [];
  return (
    voices.find((v) => v.name?.includes('Google US English')) ??
    voices.find((v) => v.lang === 'en-US') ??
    voices.find((v) => v.lang?.startsWith('en')) ??
    null
  );
};

export const isBrowserSpeechSupported = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

/** Đọc bằng giọng trình duyệt (miễn phí, không cần key). */
export function speakWithBrowser(id: string, text: string): boolean {
  if (!isBrowserSpeechSupported()) return false;
  const synth = window.speechSynthesis;
  speechManager.start(id, () => synth.cancel());
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.85;
  const voice = pickVoice();
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
export async function speakWithGemini(id: string, text: string, apiKey: string, voiceName: string): Promise<void> {
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
    const cacheKey = `${voiceName}|${text}`;
    let samples = audioCache.get(cacheKey);
    if (!samples) {
      samples = await synthesizeSpeech(text, apiKey, voiceName);
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
