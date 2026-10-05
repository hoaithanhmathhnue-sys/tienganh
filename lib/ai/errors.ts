import type { AiProvider } from './models';

export type AiErrorType =
  | 'MISSING_API_KEY'
  | 'INVALID_KEY_FORMAT'
  | 'INVALID_API_KEY'
  | 'PERMISSION_DENIED'
  | 'QUOTA_EXCEEDED'
  | 'MODEL_OVERLOADED'
  | 'NOT_FOUND'
  | 'INVALID_ARGUMENT'
  | 'INVALID_RESPONSE'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export class AiError extends Error {
  readonly type: AiErrorType;
  readonly model?: string;
  readonly cause?: unknown;

  constructor(type: AiErrorType, message: string, options?: { cause?: unknown; model?: string }) {
    super(message);
    this.name = 'AiError';
    this.type = type;
    this.model = options?.model;
    if (options?.cause !== undefined) this.cause = options.cause;
  }
}

const getStatus = (error: unknown, text: string): number | undefined => {
  const status = (error as { status?: unknown; code?: unknown } | null)?.status ?? (error as { code?: unknown } | null)?.code;
  if (typeof status === 'number') return status;
  const match = text.match(/"code"\s*:\s*(\d{3})/) ?? text.match(/\b(400|401|403|404|429|500|503|504)\b/);
  return match ? Number(match[1]) : undefined;
};

/** Phân loại lỗi Gemini/Agent Platform. 503 / quá tải KHÔNG bao giờ bị coi là lỗi key. */
export const parseApiError = (error: unknown): AiErrorType => {
  if (error instanceof AiError) return error.type;
  if (!error) return 'UNKNOWN';

  const message = error instanceof Error ? error.message : String(error);
  let serialized = '';
  try {
    serialized = JSON.stringify(error) ?? '';
  } catch {
    serialized = '';
  }
  const text = `${message} ${serialized}`;
  const lower = text.toLowerCase();

  // Key sai: Gemini trả 400 + API_KEY_INVALID, nên kiểm tra trước mã 400.
  if (text.includes('API_KEY_INVALID') || lower.includes('api key not valid') || lower.includes('api key expired')) {
    return 'INVALID_API_KEY';
  }

  const status = getStatus(error, text);
  if (status === 401 || text.includes('UNAUTHENTICATED')) return 'INVALID_API_KEY';
  if (status === 403 || text.includes('PERMISSION_DENIED')) return 'PERMISSION_DENIED';
  if (status === 429 || text.includes('RESOURCE_EXHAUSTED') || lower.includes('quota')) return 'QUOTA_EXCEEDED';
  if (
    status === 500 || status === 503 || status === 504 ||
    text.includes('UNAVAILABLE') || text.includes('INTERNAL') || text.includes('DEADLINE_EXCEEDED') ||
    lower.includes('overloaded') || lower.includes('high demand') ||
    lower.includes('try again later') || lower.includes('temporarily unavailable')
  ) {
    return 'MODEL_OVERLOADED';
  }
  if (status === 404 || text.includes('NOT_FOUND')) return 'NOT_FOUND';
  if (status === 400 || text.includes('INVALID_ARGUMENT')) return 'INVALID_ARGUMENT';
  if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('network request failed')) {
    return 'NETWORK_ERROR';
  }
  return 'UNKNOWN';
};

/** Chỉ chuyển model khi lỗi do model/dịch vụ; lỗi key, quota, tham số → dừng ngay. */
export const shouldFallback = (type: AiErrorType, provider: AiProvider): boolean => {
  if (type === 'MODEL_OVERLOADED' || type === 'NOT_FOUND') return true;
  return provider === 'agent-platform' && type === 'PERMISSION_DENIED';
};

export const FALLBACK_NOTICE = 'Model đang quá tải; app đang tự động thử model dự phòng.';

export const getFriendlyErrorMessage = (type: AiErrorType, provider: AiProvider): string => {
  switch (type) {
    case 'MISSING_API_KEY':
      return 'Vui lòng cấu hình API Key trước khi sử dụng tính năng này.';
    case 'INVALID_KEY_FORMAT':
      return 'API Key không đúng định dạng (phải bắt đầu bằng AIzaSy… hoặc AQ…). Vui lòng kiểm tra lại trong Cài đặt.';
    case 'INVALID_API_KEY':
      return 'API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại trong Cài đặt.';
    case 'PERMISSION_DENIED':
      return provider === 'agent-platform'
        ? 'Google đã nhận key nhưng dự án/key chưa được cấp quyền gọi Agent Platform API hoặc model này. Hãy kiểm tra: đã bật Agent Platform API, billing, giới hạn API của key và quyền sử dụng model.'
        : 'API key không có quyền truy cập Gemini API.';
    case 'QUOTA_EXCEEDED':
      return 'Đã hết quota hoặc vượt giới hạn tốc độ API. Vui lòng đợi rồi thử lại.';
    case 'MODEL_OVERLOADED':
      return 'Các model đang quá tải hoặc tạm thời không khả dụng. Vui lòng thử lại sau ít phút.';
    case 'NOT_FOUND':
      return 'Model không còn khả dụng. Hãy chọn model khác trong Cài đặt.';
    case 'INVALID_ARGUMENT':
      return 'Yêu cầu không hợp lệ với model đã chọn. Hãy thử chọn model khác trong Cài đặt.';
    case 'INVALID_RESPONSE':
      return 'AI trả về dữ liệu không hợp lệ. Vui lòng thử lại.';
    case 'NETWORK_ERROR':
      return 'Không kết nối được tới máy chủ Google. Vui lòng kiểm tra kết nối mạng.';
    default:
      return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
  }
};
