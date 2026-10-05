// @vitest-environment jsdom
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { DEFAULT_CHAT_MODE, MAX_STORED_MESSAGES, type ChatMessage } from '@/lib/ai/chat';
import { chatHistoryStore, chatModeStore, chatUiStore, createChatMessage } from '@/lib/ai/chat-store';

const msg = (i: number, role: ChatMessage['role'] = 'user'): ChatMessage => ({
  id: `m${i}`,
  role,
  text: `tin ${i}`,
  createdAt: new Date(2026, 0, 1, 0, i).toISOString(),
});

beforeEach(() => {
  localStorage.clear();
  chatUiStore.close();
  chatUiStore.setExpanded(false);
});

describe('chatHistoryStore', () => {
  it('rỗng khi chưa có dữ liệu; snapshot giữ nguyên tham chiếu', () => {
    expect(chatHistoryStore.getSnapshot()).toEqual([]);
    expect(chatHistoryStore.getSnapshot()).toBe(chatHistoryStore.getSnapshot());
    expect(chatHistoryStore.getServerSnapshot()).toEqual([]);
  });

  it('append lưu theo thứ tự và báo cho listener', () => {
    const listener = vi.fn();
    const unsubscribe = chatHistoryStore.subscribe(listener);
    chatHistoryStore.append([msg(1), msg(2, 'model')]);
    chatHistoryStore.append([msg(3)]);
    expect(chatHistoryStore.getSnapshot().map((m) => m.id)).toEqual(['m1', 'm2', 'm3']);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it(`chỉ giữ ${MAX_STORED_MESSAGES} tin gần nhất`, () => {
    chatHistoryStore.append(Array.from({ length: MAX_STORED_MESSAGES + 5 }, (_, i) => msg(i)));
    const items = chatHistoryStore.getSnapshot();
    expect(items).toHaveLength(MAX_STORED_MESSAGES);
    expect(items[0].id).toBe('m5');
  });

  it('dữ liệu hỏng hoặc sai cấu trúc không làm crash', () => {
    localStorage.setItem('evd_ai_chat_history', '{not json');
    expect(chatHistoryStore.getSnapshot()).toEqual([]);
    localStorage.setItem('evd_ai_chat_history', JSON.stringify([msg(1), { id: 2 }, null, 'x']));
    expect(chatHistoryStore.getSnapshot().map((m) => m.id)).toEqual(['m1']);
  });

  it('clear xoá toàn bộ lịch sử', () => {
    chatHistoryStore.append([msg(1)]);
    chatHistoryStore.clear();
    expect(chatHistoryStore.getSnapshot()).toEqual([]);
    expect(localStorage.getItem('evd_ai_chat_history')).toBeNull();
  });
});

describe('chatModeStore', () => {
  it('mặc định Normal, lưu lựa chọn, bỏ qua giá trị lạ', () => {
    expect(chatModeStore.getSnapshot()).toBe(DEFAULT_CHAT_MODE);
    chatModeStore.set('thinking');
    expect(chatModeStore.getSnapshot()).toBe('thinking');
    localStorage.setItem('evd_ai_chat_mode', 'turbo');
    expect(chatModeStore.getSnapshot()).toBe(DEFAULT_CHAT_MODE);
  });
});

describe('chatUiStore', () => {
  it('mở / đóng / phóng to; snapshot ổn định khi không đổi', () => {
    const first = chatUiStore.getSnapshot();
    expect(first).toEqual({ open: false, expanded: false });
    expect(chatUiStore.getSnapshot()).toBe(first);
    chatUiStore.open();
    expect(chatUiStore.getSnapshot()).toEqual({ open: true, expanded: false });
    chatUiStore.toggleExpanded();
    expect(chatUiStore.getSnapshot().expanded).toBe(true);
    chatUiStore.close();
    expect(chatUiStore.getSnapshot().open).toBe(false);
    expect(chatUiStore.getServerSnapshot()).toEqual({ open: false, expanded: false });
  });

  it('nhớ lựa chọn phóng to giữa các lần mở', () => {
    chatUiStore.setExpanded(true);
    expect(localStorage.getItem('evd_ai_chat_expanded')).toBe('1');
  });
});

describe('createChatMessage', () => {
  it('tạo tin có id duy nhất và thời gian ISO', () => {
    const a = createChatMessage('user', 'Xin chào');
    const b = createChatMessage('model', 'Chào Thầy/Cô', { model: 'gemini-3.8-flash' });
    expect(a.id).not.toBe(b.id);
    expect(a.role).toBe('user');
    expect(new Date(a.createdAt).toISOString()).toBe(a.createdAt);
    expect(b.model).toBe('gemini-3.8-flash');
  });
});
