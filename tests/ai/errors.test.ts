import { describe, it, expect } from 'vitest';
import { parseApiError, shouldFallback, getFriendlyErrorMessage } from '@/lib/ai/errors';

const apiError = (status: number, message: string) => Object.assign(new Error(message), { status });

describe('parseApiError', () => {
  it('401 / API_KEY_INVALID → INVALID_API_KEY', () => {
    expect(parseApiError(apiError(401, 'Unauthorized'))).toBe('INVALID_API_KEY');
    expect(parseApiError(apiError(400, 'API key not valid. Please pass a valid API key. [API_KEY_INVALID]'))).toBe('INVALID_API_KEY');
  });

  it('403 → PERMISSION_DENIED', () => {
    expect(parseApiError(apiError(403, 'PERMISSION_DENIED'))).toBe('PERMISSION_DENIED');
  });

  it('429 / RESOURCE_EXHAUSTED → QUOTA_EXCEEDED', () => {
    expect(parseApiError(apiError(429, 'Too many requests'))).toBe('QUOTA_EXCEEDED');
    expect(parseApiError(new Error('RESOURCE_EXHAUSTED: quota exceeded'))).toBe('QUOTA_EXCEEDED');
  });

  it('500/503/504 và "high demand" → MODEL_OVERLOADED (không phải lỗi key)', () => {
    expect(parseApiError(apiError(503, 'UNAVAILABLE'))).toBe('MODEL_OVERLOADED');
    expect(parseApiError(apiError(500, 'INTERNAL'))).toBe('MODEL_OVERLOADED');
    expect(parseApiError(apiError(504, 'DEADLINE_EXCEEDED'))).toBe('MODEL_OVERLOADED');
    expect(parseApiError(new Error('This model is currently experiencing high demand. Try again later.'))).toBe('MODEL_OVERLOADED');
  });

  it('404 → NOT_FOUND', () => {
    expect(parseApiError(apiError(404, 'models/gemini-x is not found'))).toBe('NOT_FOUND');
  });

  it('400 khác → INVALID_ARGUMENT', () => {
    expect(parseApiError(apiError(400, 'INVALID_ARGUMENT: bad field'))).toBe('INVALID_ARGUMENT');
  });

  it('lỗi mạng → NETWORK_ERROR', () => {
    expect(parseApiError(new TypeError('Failed to fetch'))).toBe('NETWORK_ERROR');
  });

  it('không xác định → UNKNOWN', () => {
    expect(parseApiError(new Error('weird'))).toBe('UNKNOWN');
    expect(parseApiError(undefined)).toBe('UNKNOWN');
  });

  it('đọc được mã lỗi trong JSON message của SDK', () => {
    const err = new Error('{"error":{"code":503,"message":"The model is overloaded.","status":"UNAVAILABLE"}}');
    expect(parseApiError(err)).toBe('MODEL_OVERLOADED');
  });
});

describe('shouldFallback', () => {
  it('chỉ chuyển model khi quá tải hoặc model không tồn tại', () => {
    expect(shouldFallback('MODEL_OVERLOADED', 'gemini')).toBe(true);
    expect(shouldFallback('NOT_FOUND', 'gemini')).toBe(true);
    expect(shouldFallback('INVALID_API_KEY', 'gemini')).toBe(false);
    expect(shouldFallback('QUOTA_EXCEEDED', 'gemini')).toBe(false);
    expect(shouldFallback('INVALID_ARGUMENT', 'gemini')).toBe(false);
    expect(shouldFallback('UNKNOWN', 'gemini')).toBe(false);
  });

  it('Agent Platform được thử model tiếp theo khi 403', () => {
    expect(shouldFallback('PERMISSION_DENIED', 'agent-platform')).toBe(true);
    expect(shouldFallback('PERMISSION_DENIED', 'gemini')).toBe(false);
  });
});

describe('getFriendlyErrorMessage', () => {
  it('dùng đúng thông báo trong api.md', () => {
    expect(getFriendlyErrorMessage('MISSING_API_KEY', 'gemini')).toBe('Vui lòng cấu hình API Key trước khi sử dụng tính năng này.');
    expect(getFriendlyErrorMessage('INVALID_API_KEY', 'gemini')).toBe('API key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại trong cài đặt.');
    expect(getFriendlyErrorMessage('PERMISSION_DENIED', 'gemini')).toBe('API key không có quyền truy cập Gemini API.');
    expect(getFriendlyErrorMessage('QUOTA_EXCEEDED', 'gemini')).toBe('Đã hết quota hoặc vượt giới hạn tốc độ API. Vui lòng đợi rồi thử lại.');
  });

  it('503 không bao giờ bị báo là lỗi key', () => {
    expect(getFriendlyErrorMessage('MODEL_OVERLOADED', 'gemini')).not.toMatch(/không hợp lệ/i);
  });

  it('403 Agent Platform: nêu rõ key đã được nhận nhưng chưa có quyền', () => {
    const msg = getFriendlyErrorMessage('PERMISSION_DENIED', 'agent-platform');
    expect(msg).toMatch(/Agent Platform/);
    expect(msg).not.toMatch(/không hợp lệ/i);
  });
});
