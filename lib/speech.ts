type Listener = () => void;

export interface SpeechManager {
  getActiveId: () => string | null;
  subscribe: (listener: Listener) => () => void;
  /** Bắt đầu phát `id`; câu đang phát (nếu có) bị dừng trước. */
  start: (id: string, stop: () => void) => void;
  /** Kết thúc `id` — bỏ qua nếu một câu khác đã chiếm quyền phát. */
  finish: (id: string) => void;
  stop: () => void;
}

/** Quản lý phát âm dùng chung: tại một thời điểm chỉ một nút ở trạng thái "Đang phát". */
export function createSpeechManager(): SpeechManager {
  let activeId: string | null = null;
  let stopActive: (() => void) | null = null;
  const listeners = new Set<Listener>();
  const notify = () => listeners.forEach((l) => l());

  return {
    getActiveId: () => activeId,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    start(id, stop) {
      const previousStop = stopActive;
      activeId = id;
      stopActive = stop;
      try {
        previousStop?.();
      } catch {
        // bỏ qua lỗi khi dừng
      }
      notify();
    },
    finish(id) {
      if (activeId !== id) return;
      activeId = null;
      stopActive = null;
      notify();
    },
    stop() {
      const s = stopActive;
      activeId = null;
      stopActive = null;
      try {
        s?.();
      } catch {
        // bỏ qua
      }
      notify();
    },
  };
}

export const speechManager = createSpeechManager();
