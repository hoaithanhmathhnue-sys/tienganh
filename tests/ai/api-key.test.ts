import { describe, it, expect } from 'vitest';
import { GOOGLE_AI_API_KEY_PATTERN, isValidGoogleAiApiKey, maskApiKey } from '@/lib/ai/api-key';

describe('isValidGoogleAiApiKey', () => {
  it('chấp nhận key cũ AIzaSy...', () => {
    expect(isValidGoogleAiApiKey('AIzaSyA1b2C3d4E5f6G7h8')).toBe(true);
  });

  it('chấp nhận key mới AQ...', () => {
    expect(isValidGoogleAiApiKey('AQ.Ab8RN6Lx_example-key')).toBe(true);
  });

  it('tự cắt khoảng trắng hai đầu', () => {
    expect(isValidGoogleAiApiKey('  AIzaSyA1b2C3d4E5f6G7h8  ')).toBe(true);
  });

  it('từ chối chuỗi rỗng, sai tiền tố, quá ngắn hoặc chứa khoảng trắng', () => {
    expect(isValidGoogleAiApiKey('')).toBe(false);
    expect(isValidGoogleAiApiKey('sk-1234567890abcdef')).toBe(false);
    expect(isValidGoogleAiApiKey('AIzaXX1234567890')).toBe(false);
    expect(isValidGoogleAiApiKey('AQ1234')).toBe(false);
    expect(isValidGoogleAiApiKey('AIzaSy 1234 5678 90')).toBe(false);
  });

  it('dùng đúng regex quy định trong api.md', () => {
    expect(GOOGLE_AI_API_KEY_PATTERN.source).toBe('^(?:AIzaSy|AQ)\\S{8,}$');
  });
});

describe('maskApiKey', () => {
  it('chỉ hiện tiền tố và 4 ký tự cuối', () => {
    const masked = maskApiKey('AIzaSyA1b2C3d4E5f6G7h8');
    expect(masked.startsWith('AIzaSy')).toBe(true);
    expect(masked.endsWith('G7h8')).toBe(true);
    expect(masked).not.toContain('C3d4');
  });

  it('không để lộ key ngắn', () => {
    expect(maskApiKey('AQ12345')).toBe('••••');
    expect(maskApiKey('')).toBe('');
  });
});
