/** Truy cập localStorage an toàn (SSR, chế độ ẩn danh, bộ nhớ đầy). */
export const getStorage = (): Storage | null => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
};

export const readString = (key: string, storage: Storage | null = getStorage()): string | null => {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

export const writeString = (key: string, value: string | null, storage: Storage | null = getStorage()): void => {
  try {
    if (!storage) return;
    if (value === null || value === '') storage.removeItem(key);
    else storage.setItem(key, value);
  } catch {
    // Bộ nhớ đầy hoặc bị chặn — bỏ qua, app vẫn chạy được.
  }
};
