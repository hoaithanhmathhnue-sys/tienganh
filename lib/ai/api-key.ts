/**
 * Xác thực định dạng Google AI / Gemini API key.
 * Chấp nhận cả key cũ `AIzaSy...` và key mới `AQ...` (theo api.md).
 * Chỉ kiểm tra định dạng — lỗi 401/403 thật từ Google được xử lý ở `errors.ts`.
 */
export const GOOGLE_AI_API_KEY_PATTERN = /^(?:AIzaSy|AQ)\S{8,}$/;

export const isValidGoogleAiApiKey = (key: string): boolean => {
  return GOOGLE_AI_API_KEY_PATTERN.test((key ?? '').trim());
};

/** Che key khi hiển thị: tiền tố + 4 ký tự cuối. Không bao giờ log key đầy đủ. */
export const maskApiKey = (key: string): string => {
  const k = (key ?? '').trim();
  if (!k) return '';
  if (k.length <= 12) return '••••';
  const prefix = k.startsWith('AIzaSy') ? 'AIzaSy' : k.slice(0, 3);
  return `${prefix}••••${k.slice(-4)}`;
};
