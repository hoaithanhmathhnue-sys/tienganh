/** Giải mã base64 thành bytes (chạy được cả trình duyệt và Node). */
export const base64ToBytes = (base64: string): Uint8Array => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

/** PCM 16-bit signed little-endian (đầu ra Gemini TTS) → Float32 trong khoảng [-1, 1] cho Web Audio. */
export const pcm16ToFloat32 = (bytes: Uint8Array): Float32Array => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const samples = Math.floor(bytes.byteLength / 2);
  const out = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const value = view.getInt16(i * 2, true);
    out[i] = value < 0 ? value / 0x8000 : value / 0x7fff;
  }
  return out;
};

export const TTS_SAMPLE_RATE = 24000;
