'use client';

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  KeyRound,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  SendHorizontal,
  Settings2,
  Square,
  TriangleAlert,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { buttonClass } from '@/components/ui/button-class';
import { buildChatConfig, CHAT_MODES, CHAT_SUGGESTIONS, toChatContents, type ChatMessage } from '@/lib/ai/chat';
import {
  chatDraftStore,
  chatHistoryStore,
  chatModeStore,
  chatUiStore,
  createChatMessage,
  useChatDraft,
  useChatHistory,
  useChatMode,
  useChatUi,
} from '@/lib/ai/chat-store';
import { AiError, FALLBACK_NOTICE, getFriendlyErrorMessage, parseApiError, type AiErrorType } from '@/lib/ai/errors';
import { generateContentStreamWithFallback } from '@/lib/ai/generate';
import { getActiveApiKey, getActiveModel } from '@/lib/ai/settings';
import { isAiReady, useAiSettings } from '@/lib/ai/settings-store';
import { speechManager } from '@/lib/speech';
import { collectionStore, favoritesStore, useListStore } from '@/lib/stores';
import { cn } from '@/lib/utils';
import { AssistantBubble, formatChatTime, UserBubble } from './chat-message';

const MAX_INPUT_LENGTH = 4000;
const MAX_TEXTAREA_HEIGHT = 160;

const SETTINGS_ERRORS: AiErrorType[] = [
  'MISSING_API_KEY',
  'INVALID_KEY_FORMAT',
  'INVALID_API_KEY',
  'PERMISSION_DENIED',
  'NOT_FOUND',
  'INVALID_ARGUMENT',
];

interface PendingReply {
  user: ChatMessage;
  text: string;
  model?: string;
}

interface ChatFailure {
  type: AiErrorType;
  message: string;
  user: ChatMessage;
}

interface AiAssistantProps {
  onOpenSettings: () => void;
  /** Ẩn hoàn toàn (ví dụ khi đang trình chiếu toàn màn hình). */
  hidden?: boolean;
}

/**
 * Trợ lý AI nổi ở góc phải: bấm để mở khung chat, có thể phóng to thành thanh bên cố định (màn hình lớn)
 * hoặc toàn màn hình (điện thoại). Lịch sử chỉ lưu sau khi AI trả lời xong (theo api.md).
 */
export function AiAssistant({ onOpenSettings, hidden = false }: AiAssistantProps) {
  const ui = useChatUi();
  const history = useChatHistory();
  const mode = useChatMode();
  const settings = useAiSettings();
  const ready = isAiReady(settings);
  const favorites = useListStore(favoritesStore);
  const collection = useListStore(collectionStore);

  const input = useChatDraft();
  const setInput = chatDraftStore.set;
  const [pending, setPending] = useState<PendingReply | null>(null);
  const [failure, setFailure] = useState<ChatFailure | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const discardRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nearBottomRef = useRef(true);

  const busy = pending !== null;
  const visible = ui.open && !hidden;

  useEffect(() => () => abortRef.current?.abort(), []);

  // Chỉ tự focus trên máy có chuột để không bật bàn phím ảo trên điện thoại.
  useEffect(() => {
    if (!visible) return;
    if (window.matchMedia?.('(pointer: fine)').matches) textareaRef.current?.focus({ preventScroll: true });
  }, [visible]);

  // Nội dung có thể được điền sẵn từ trang khác (ví dụ Trợ lý giáo án) → giãn ô nhập cho vừa.
  useEffect(() => {
    const el = textareaRef.current;
    if (!visible || !el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [visible, input]);

  // Tự cuộn xuống khi có nội dung mới (nếu người dùng đang ở gần cuối).
  useEffect(() => {
    const el = listRef.current;
    if (el && visible && nearBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [visible, ui.expanded, history, pending?.text, failure]);

  const handleScroll = () => {
    const el = listRef.current;
    if (el) nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  };

  const run = async (user: ChatMessage, base: ChatMessage[]) => {
    const controller = new AbortController();
    abortRef.current = controller;
    nearBottomRef.current = true;
    setFailure(null);
    setPending({ user, text: '' });

    try {
      const result = await generateContentStreamWithFallback({
        provider: settings.provider,
        apiKey: getActiveApiKey(settings),
        selectedModel: getActiveModel(settings),
        contents: toChatContents([...base, user]),
        buildConfig: buildChatConfig(mode),
        signal: controller.signal,
        onChunk: (text, model) => setPending((p) => (p ? { ...p, text, model } : p)),
        onReset: () => setPending((p) => (p ? { ...p, text: '' } : p)),
        onFallback: ({ from, to }) => toast.info(FALLBACK_NOTICE, { description: `${from} → ${to}` }),
      });
      if (discardRef.current === controller) return;
      if (result.text.trim()) {
        const reply = createChatMessage('model', result.text, {
          model: result.model,
          ...(result.aborted ? { stopped: true } : {}),
        });
        chatHistoryStore.append([user, reply]);
      } else {
        // Dừng trước khi có chữ nào: trả lại câu hỏi để Thầy/Cô gửi lại nếu muốn.
        if (!chatDraftStore.getSnapshot()) setInput(user.text);
      }
    } catch (error) {
      if (discardRef.current === controller) return;
      const type = parseApiError(error);
      const message = error instanceof AiError ? error.message : getFriendlyErrorMessage(type, settings.provider);
      setFailure({ type, message, user });
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setPending(null);
    }
  };

  const send = (raw: string) => {
    const text = raw.trim().slice(0, MAX_INPUT_LENGTH);
    if (!text || busy) return;
    if (!ready) {
      toast.info('Cần cấu hình API key trước khi trò chuyện với Trợ lý AI.');
      onOpenSettings();
      return;
    }
    setInput('');
    requestAnimationFrame(resizeTextarea);
    void run(createChatMessage('user', text), history);
  };

  const retry = () => {
    if (failure && !busy) void run(failure.user, history);
  };

  const stop = () => abortRef.current?.abort();

  const reset = () => {
    if (history.length === 0 && !busy && !failure) return;
    if (!window.confirm('Bắt đầu cuộc trò chuyện mới? Toàn bộ tin nhắn hiện tại sẽ bị xoá.')) return;
    if (abortRef.current) {
      discardRef.current = abortRef.current;
      abortRef.current.abort();
    }
    speechManager.stop();
    chatHistoryStore.clear();
    setFailure(null);
    toast.success('Đã bắt đầu cuộc trò chuyện mới');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    send(input);
  };

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Không gửi khi đang gõ dấu tiếng Việt (IME composition).
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send(input);
    }
  };

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      chatUiStore.close();
    }
  };

  const welcome = `Xin chào Thầy/Cô! 👋

Em là **Trợ lý AI Sư phạm** của English Classroom Decoration. Em có thể giúp Thầy/Cô:

- Gợi ý **trò chơi khởi động** (warm-up) phù hợp từng khối lớp
- Soạn **câu lệnh giao tiếp lớp học** bằng tiếng Anh kèm phiên âm IPA
- Sáng tác **slogan & ý tưởng trang trí** lớp học theo chủ đề
- Tư vấn **hoạt động dạy học**, lời khen và lời dặn dò song ngữ

📌 Thầy/Cô đang có **${favorites.length}** slogan yêu thích và **${collection.length}** slogan trong Bộ sưu tập AI.

Hôm nay Thầy/Cô cần em hỗ trợ gì ạ?`;

  return (
    <>
      <AnimatePresence>
        {!visible && !hidden && (
          <motion.button
            key="ai-fab"
            type="button"
            onClick={() => chatUiStore.open()}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            aria-label={ready ? 'Mở Trợ lý AI' : 'Mở Trợ lý AI (chưa cấu hình API key)'}
            aria-haspopup="dialog"
            className="group fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#4338CA] text-white shadow-xl shadow-indigo-900/30 ring-4 ring-white/80 focus-visible:outline-none focus-visible:ring-amber-300 dark:ring-white/10 md:bottom-6 md:right-6"
          >
            <span
              className="absolute inset-0 animate-ping rounded-full bg-indigo-500/30 [animation-duration:2.6s] motion-reduce:hidden"
              aria-hidden="true"
            />
            <Bot className="relative h-7 w-7" aria-hidden="true" />
            {busy && <span className="sr-only">Trợ lý đang trả lời</span>}
            <span
              className={cn(
                'absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-slate-900',
                busy ? 'animate-pulse bg-sky-400' : ready ? 'bg-emerald-400' : 'bg-amber-400',
              )}
              aria-hidden="true"
            />
            <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 sm:block">
              Trợ lý AI Sư phạm
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visible && (
          <motion.section
            key="ai-panel"
            role="dialog"
            aria-modal="false"
            aria-labelledby="ai-assistant-title"
            onKeyDown={handlePanelKeyDown}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            style={{ transformOrigin: 'bottom right' }}
            className={cn(
              'fixed inset-0 z-50 flex flex-col overflow-hidden border-border bg-background shadow-2xl',
              ui.expanded
                ? 'lg:left-auto lg:w-[440px] lg:border-l'
                : 'sm:inset-auto sm:bottom-4 sm:right-4 sm:h-[min(640px,calc(100dvh-2rem))] sm:w-[420px] sm:rounded-2xl sm:border md:bottom-6 md:right-6',
            )}
          >
            {/* ─── Header ─── */}
            <header className="flex items-start gap-3 bg-gradient-to-r from-[#1E3A8A] via-[#312E81] to-[#1E1B4B] px-4 py-3 text-white">
              <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                <Bot className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 id="ai-assistant-title" className="font-display text-base font-bold">
                    Trợ lý AI
                  </h2>
                  <span className="rounded-full border border-amber-300/60 bg-amber-400/20 px-2 py-0.5 text-[11px] font-semibold text-amber-100">
                    Sư phạm
                  </span>
                </div>
                <div role="radiogroup" aria-label="Chế độ trả lời" className="mt-1.5 flex flex-wrap gap-1.5">
                  {CHAT_MODES.map((m) => {
                    const active = m.id === mode;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        title={m.description}
                        disabled={busy}
                        onClick={() => chatModeStore.set(m.id)}
                        className={cn(
                          'inline-flex min-h-8 items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                          active
                            ? 'border-amber-300 bg-amber-400 text-amber-950 shadow-sm'
                            : 'border-white/25 bg-white/10 text-white/90 hover:bg-white/20',
                        )}
                      >
                        <span aria-hidden="true">{m.icon}</span> {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="-mr-2 flex items-center">
                <HeaderButton
                  label={ui.expanded ? 'Thu nhỏ khung chat' : 'Phóng to khung chat'}
                  onClick={() => chatUiStore.toggleExpanded()}
                  className="hidden sm:inline-flex"
                >
                  {ui.expanded ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
                </HeaderButton>
                <HeaderButton label="Cuộc trò chuyện mới" onClick={reset}>
                  <RotateCcw className="h-5 w-5" />
                </HeaderButton>
                <HeaderButton label="Đóng Trợ lý AI" onClick={() => chatUiStore.close()}>
                  <X className="h-5 w-5" />
                </HeaderButton>
              </div>
            </header>

            {/* ─── Messages ─── */}
            <div
              ref={listRef}
              onScroll={handleScroll}
              className="flex-1 space-y-4 overflow-y-auto overscroll-contain bg-slate-50 px-3 py-4 dark:bg-slate-950/40 sm:px-4"
              aria-busy={busy}
            >
              <AssistantBubble text={welcome} />

              {!ready && (
                <div className="ml-10 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-100">
                  <p className="flex items-start gap-2">
                    <KeyRound className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    Cần một API key Google AI (miễn phí tại Google AI Studio) để trò chuyện. Key chỉ lưu trong trình duyệt của Thầy/Cô.
                  </p>
                  <button type="button" onClick={onOpenSettings} className={buttonClass('accent', 'mt-2 text-sm')}>
                    <Settings2 className="h-4 w-4" aria-hidden="true" /> Mở Cài đặt AI
                  </button>
                </div>
              )}

              {history.length === 0 && !busy && !failure && (
                <div className="ml-10 flex flex-wrap gap-2" aria-label="Câu hỏi gợi ý">
                  {CHAT_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="min-h-10 rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-left text-xs font-medium text-indigo-900 shadow-sm transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-indigo-500/30 dark:bg-slate-900 dark:text-indigo-200 dark:hover:bg-indigo-500/10"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {history.map((m) =>
                m.role === 'user' ? (
                  <UserBubble key={m.id} text={m.text} time={formatChatTime(m.createdAt)} />
                ) : (
                  <AssistantBubble key={m.id} text={m.text} time={formatChatTime(m.createdAt)} model={m.model} stopped={m.stopped} />
                ),
              )}

              {pending && (
                <>
                  <UserBubble text={pending.user.text} time={formatChatTime(pending.user.createdAt)} />
                  <AssistantBubble text={pending.text} model={pending.model} streaming />
                </>
              )}

              {failure && !pending && (
                <>
                  <UserBubble text={failure.user.text} time={formatChatTime(failure.user.createdAt)} />
                  <div role="alert" className="ml-10 rounded-2xl border border-destructive/30 bg-destructive/5 p-3">
                    <p className="flex items-start gap-2 text-sm text-destructive">
                      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      {failure.message}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button type="button" onClick={retry} className={buttonClass('secondary', 'text-sm')}>
                        <RotateCcw className="h-4 w-4" aria-hidden="true" /> Thử lại
                      </button>
                      {SETTINGS_ERRORS.includes(failure.type) && (
                        <button type="button" onClick={onOpenSettings} className={buttonClass('soft', 'text-sm')}>
                          <Settings2 className="h-4 w-4" aria-hidden="true" /> Mở Cài đặt
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <p className="sr-only" aria-live="polite">
              {busy ? 'Trợ lý đang soạn câu trả lời…' : ''}
            </p>

            {/* ─── Composer ─── */}
            <form onSubmit={handleSubmit} className="border-t border-border bg-card px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
              <div className="flex items-end gap-2">
                <label htmlFor="ai-chat-input" className="sr-only">
                  Nhập câu hỏi cho Trợ lý AI
                </label>
                <textarea
                  id="ai-chat-input"
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  maxLength={MAX_INPUT_LENGTH}
                  onChange={(e) => {
                    setInput(e.target.value);
                    resizeTextarea();
                  }}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder="Nhập câu hỏi hoặc yêu cầu cho Trợ lý AI (Shift + Enter xuống dòng)…"
                  className="max-h-40 min-h-11 flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                />
                {busy ? (
                  <button
                    type="button"
                    onClick={stop}
                    aria-label="Dừng trả lời"
                    title="Dừng"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm transition-colors hover:bg-rose-700"
                  >
                    <Square className="h-4 w-4 fill-current" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    aria-label="Gửi"
                    title="Gửi (Enter)"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <SendHorizontal className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
                AI có thể sai sót — Thầy/Cô vui lòng kiểm tra lại trước khi sử dụng.
              </p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}

function HeaderButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-xl text-white/85 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300',
        className,
      )}
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
