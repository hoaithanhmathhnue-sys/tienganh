import { useSyncExternalStore } from 'react';
import { getStorage } from '@/lib/storage';
import { CHAT_MODES, DEFAULT_CHAT_MODE, isChatMessage, trimHistory, type ChatMessage, type ChatMode } from './chat';

const HISTORY_KEY = 'evd_ai_chat_history';
const MODE_KEY = 'evd_ai_chat_mode';
const EXPANDED_KEY = 'evd_ai_chat_expanded';

const EMPTY: ChatMessage[] = [];

const safeGet = (key: string): string | null => {
  try {
    return getStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const safeSet = (key: string, value: string | null) => {
  try {
    const storage = getStorage();
    if (value === null) storage?.removeItem(key);
    else storage?.setItem(key, value);
  } catch {
    // Bộ nhớ đầy hoặc bị chặn — bỏ qua, không làm crash app.
  }
};

const createEmitter = () => {
  const listeners = new Set<() => void>();
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    emit: () => listeners.forEach((l) => l()),
  };
};

/* ─── Lịch sử trò chuyện (chỉ lưu tin đã hoàn tất) ─── */
const historyEmitter = createEmitter();
let historyRaw: string | null | undefined;
let historyCache: ChatMessage[] = EMPTY;

const readHistory = (): ChatMessage[] => {
  const raw = safeGet(HISTORY_KEY);
  if (raw === historyRaw) return historyCache;
  historyRaw = raw;
  if (!raw) {
    historyCache = EMPTY;
    return historyCache;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    historyCache = Array.isArray(parsed) ? trimHistory(parsed.filter(isChatMessage)) : EMPTY;
  } catch {
    historyCache = EMPTY;
  }
  return historyCache;
};

export const chatHistoryStore = {
  getSnapshot: readHistory,
  getServerSnapshot: (): ChatMessage[] => EMPTY,
  subscribe: historyEmitter.subscribe,
  append(messages: ChatMessage[]) {
    if (messages.length === 0) return;
    const next = trimHistory([...readHistory(), ...messages]);
    safeSet(HISTORY_KEY, JSON.stringify(next));
    historyEmitter.emit();
  },
  clear() {
    safeSet(HISTORY_KEY, null);
    historyEmitter.emit();
  },
};

export const useChatHistory = () =>
  useSyncExternalStore(chatHistoryStore.subscribe, chatHistoryStore.getSnapshot, chatHistoryStore.getServerSnapshot);

/* ─── Chế độ trả lời ─── */
const modeEmitter = createEmitter();
const MODE_IDS = CHAT_MODES.map((m) => m.id);

export const chatModeStore = {
  getSnapshot(): ChatMode {
    const raw = safeGet(MODE_KEY);
    return raw && (MODE_IDS as string[]).includes(raw) ? (raw as ChatMode) : DEFAULT_CHAT_MODE;
  },
  getServerSnapshot: (): ChatMode => DEFAULT_CHAT_MODE,
  subscribe: modeEmitter.subscribe,
  set(mode: ChatMode) {
    safeSet(MODE_KEY, mode);
    modeEmitter.emit();
  },
};

export const useChatMode = () =>
  useSyncExternalStore(chatModeStore.subscribe, chatModeStore.getSnapshot, chatModeStore.getServerSnapshot);

/* ─── Trạng thái giao diện (mở / phóng to thành thanh bên) ─── */
export interface ChatUiState {
  open: boolean;
  expanded: boolean;
}

const uiEmitter = createEmitter();
const SERVER_UI: ChatUiState = { open: false, expanded: false };
let uiOpen = false;
let uiCache: ChatUiState = SERVER_UI;

const readUi = (): ChatUiState => {
  const expanded = safeGet(EXPANDED_KEY) === '1';
  if (uiCache.open !== uiOpen || uiCache.expanded !== expanded) uiCache = { open: uiOpen, expanded };
  return uiCache;
};

export const chatUiStore = {
  getSnapshot: readUi,
  getServerSnapshot: (): ChatUiState => SERVER_UI,
  subscribe: uiEmitter.subscribe,
  open() {
    uiOpen = true;
    uiEmitter.emit();
  },
  close() {
    uiOpen = false;
    uiEmitter.emit();
  },
  toggle() {
    uiOpen = !uiOpen;
    uiEmitter.emit();
  },
  setExpanded(expanded: boolean) {
    safeSet(EXPANDED_KEY, expanded ? '1' : null);
    uiEmitter.emit();
  },
  toggleExpanded() {
    chatUiStore.setExpanded(!readUi().expanded);
  },
};

export const useChatUi = () => useSyncExternalStore(chatUiStore.subscribe, chatUiStore.getSnapshot, chatUiStore.getServerSnapshot);

/* ─── Nội dung đang soạn trong ô nhập (chỉ trong bộ nhớ) ─── */
const draftEmitter = createEmitter();
let draft = '';

export const chatDraftStore = {
  getSnapshot: (): string => draft,
  getServerSnapshot: (): string => '',
  subscribe: draftEmitter.subscribe,
  set(value: string) {
    if (value === draft) return;
    draft = value;
    draftEmitter.emit();
  },
};

export const useChatDraft = () =>
  useSyncExternalStore(chatDraftStore.subscribe, chatDraftStore.getSnapshot, chatDraftStore.getServerSnapshot);

/** Mở Trợ lý AI với câu hỏi điền sẵn (Thầy/Cô có thể sửa trước khi gửi). */
export const askAssistant = (text: string) => {
  chatDraftStore.set(text);
  chatUiStore.open();
};

let counter = 0;
const newId = (): string => {
  counter += 1;
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${Date.now().toString(36)}-${counter}-${random}`;
};

export const createChatMessage = (
  role: ChatMessage['role'],
  text: string,
  extra: Partial<Pick<ChatMessage, 'model' | 'stopped'>> = {},
): ChatMessage => ({ id: newId(), role, text, createdAt: new Date().toISOString(), ...extra });
