import { ThinkingLevel, type Content, type GenerateContentConfig } from '@google/genai';
import { supportsThinkingLevel } from './models';

export type ChatMode = 'fast' | 'normal' | 'thinking';

export interface ChatModeOption {
  id: ChatMode;
  label: string;
  icon: string;
  description: string;
}

export const CHAT_MODES: ChatModeOption[] = [
  { id: 'fast', label: 'Fast', icon: '⚡', description: 'Trả lời nhanh, ngắn gọn' },
  { id: 'normal', label: 'Normal', icon: '🚀', description: 'Cân bằng tốc độ và độ chi tiết' },
  { id: 'thinking', label: 'Thinking', icon: '🧠', description: 'Suy luận sâu, trả lời chi tiết (chậm hơn)' },
];

export const DEFAULT_CHAT_MODE: ChatMode = 'normal';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  createdAt: string;
  /** Model đã trả lời (chỉ với tin của AI). */
  model?: string;
  /** Người dùng đã bấm Dừng khi AI đang trả lời. */
  stopped?: boolean;
}

/** Số tin tối đa lưu trong trình duyệt. */
export const MAX_STORED_MESSAGES = 40;
/** Số tin gần nhất gửi kèm làm ngữ cảnh. */
export const CHAT_CONTEXT_LIMIT = 20;

export const CHAT_SYSTEM_INSTRUCTION = `Bạn là "Trợ lý AI Sư phạm" của ứng dụng English Classroom Decoration (Trường Tiểu học Bế Văn Đàn, Đà Nẵng).
Người dùng là giáo viên tiếng Anh tiểu học Việt Nam (học sinh lớp 1–5, trình độ Pre-A1 đến A2).
Nhiệm vụ: gợi ý slogan và ý tưởng trang trí lớp học, câu lệnh giao tiếp trong lớp (classroom English), trò chơi khởi động, hoạt động dạy học, lời khen – động viên, dặn dò, và tư vấn phương pháp dạy tiếng Anh tiểu học theo Chương trình GDPT 2018.
Quy tắc:
- Trả lời bằng tiếng Việt, xưng "em" và gọi người dùng là "Thầy/Cô"; thân thiện, ngắn gọn, đi thẳng vào việc.
- Mỗi câu tiếng Anh dùng cho học sinh: kèm phiên âm IPA (General American, đặt trong /…/) và nghĩa tiếng Việt.
- Dùng Markdown: tiêu đề ngắn, danh sách, in đậm ý chính; dùng bảng khi so sánh hoặc liệt kê nhiều cột.
- Từ vựng đơn giản, tích cực, phù hợp trẻ em; không đưa nội dung bạo lực, chính trị, tôn giáo hay không an toàn.
- Nếu yêu cầu nằm ngoài phạm vi giáo dục, lịch sự từ chối và gợi ý chủ đề phù hợp.
- Không bịa đặt văn bản pháp quy; nếu không chắc, nói rõ để Thầy/Cô kiểm tra lại.`;

const MODE_SETTINGS: Record<ChatMode, { level: ThinkingLevel; maxOutputTokens: number }> = {
  fast: { level: ThinkingLevel.LOW, maxOutputTokens: 2048 },
  normal: { level: ThinkingLevel.MEDIUM, maxOutputTokens: 4096 },
  thinking: { level: ThinkingLevel.HIGH, maxOutputTokens: 16384 },
};

/** Cấu hình theo chế độ; thinkingLevel chỉ cho Gemini 3.x; không gửi temperature/topP/topK. */
export const buildChatConfig =
  (mode: ChatMode) =>
  (model: string): GenerateContentConfig => {
    const { level, maxOutputTokens } = MODE_SETTINGS[mode] ?? MODE_SETTINGS[DEFAULT_CHAT_MODE];
    return {
      systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      maxOutputTokens,
      ...(supportsThinkingLevel(model) ? { thinkingConfig: { thinkingLevel: level } } : {}),
    };
  };

/** Lịch sử → Content[]: bỏ tin rỗng, chỉ lấy tin gần nhất, luôn bắt đầu bằng lượt của người dùng. */
export const toChatContents = (messages: ChatMessage[], limit = CHAT_CONTEXT_LIMIT): Content[] => {
  const recent = messages.filter((m) => m.text.trim()).slice(-limit);
  const firstUser = recent.findIndex((m) => m.role === 'user');
  if (firstUser < 0) return [];
  return recent.slice(firstUser).map((m) => ({ role: m.role, parts: [{ text: m.text }] }));
};

export const trimHistory = (messages: ChatMessage[]): ChatMessage[] =>
  messages.length > MAX_STORED_MESSAGES ? messages.slice(-MAX_STORED_MESSAGES) : messages;

export const isChatMessage = (value: unknown): value is ChatMessage => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    (v.role === 'user' || v.role === 'model') &&
    typeof v.text === 'string' &&
    typeof v.createdAt === 'string'
  );
};

export const CHAT_SUGGESTIONS = [
  '💡 3 trò chơi khởi động 5 phút cho lớp 3',
  '🗣️ 10 câu khen ngợi học sinh kèm phiên âm IPA',
  '🎨 Ý tưởng trang trí góc tiếng Anh cho lớp 2',
  '✨ 5 slogan tiếng Anh chủ đề Ngày Nhà giáo 20/11',
  '📝 Lời dặn dò cuối tiết học bằng tiếng Anh song ngữ',
  '🎯 Cách giới thiệu từ vựng chủ đề Đồ dùng học tập',
];
