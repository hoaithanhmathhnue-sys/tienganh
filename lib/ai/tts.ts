import { Modality } from '@google/genai';
import { base64ToBytes, pcm16ToFloat32 } from '@/lib/audio/pcm';
import { AiError, getFriendlyErrorMessage } from './errors';
import { generateContentWithFallback } from './generate';
import { TTS_MODEL } from './models';

/**
 * Đọc câu tiếng Anh bằng Gemini TTS. Định tuyến riêng (chỉ model TTS, chỉ Gemini API)
 * nhưng vẫn đi qua hàm fallback chung để xử lý lỗi thống nhất.
 */
export async function synthesizeSpeech(text: string, apiKey: string, voiceName: string): Promise<Float32Array> {
  const { response } = await generateContentWithFallback({
    provider: 'gemini',
    apiKey,
    models: [TTS_MODEL],
    contents: [{ role: 'user', parts: [{ text: `Say clearly and cheerfully, at a slightly slow pace for young learners: ${text}` }] }],
    buildConfig: () => ({
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
    }),
  });

  const data = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData?.data;
  if (!data) throw new AiError('INVALID_RESPONSE', getFriendlyErrorMessage('INVALID_RESPONSE', 'gemini'));
  return pcm16ToFloat32(base64ToBytes(data));
}
