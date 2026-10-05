import { getStorage } from '@/lib/storage';

export interface LocalListStore<T> {
  getSnapshot: () => T[];
  getServerSnapshot: () => T[];
  subscribe: (listener: () => void) => () => void;
  has: (id: string) => boolean;
  toggle: (item: T) => boolean;
  add: (items: T[]) => number;
  remove: (id: string) => void;
  clear: () => void;
}

const EMPTY: never[] = [];

/**
 * Danh sách lưu trong localStorage, tương thích `useSyncExternalStore`
 * (snapshot giữ nguyên tham chiếu khi dữ liệu không đổi). Dữ liệu hỏng bị bỏ qua thay vì làm crash app.
 */
export function createLocalListStore<T>(
  key: string,
  isValid: (value: unknown) => value is T,
  getId: (item: T) => string,
): LocalListStore<T> {
  const listeners = new Set<() => void>();
  let cacheRaw: string | null | undefined;
  let cache: T[] = EMPTY;

  const read = (): T[] => {
    let raw: string | null = null;
    try {
      raw = getStorage()?.getItem(key) ?? null;
    } catch {
      raw = null;
    }
    if (raw === cacheRaw) return cache;
    cacheRaw = raw;
    if (!raw) {
      cache = EMPTY;
      return cache;
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      cache = Array.isArray(parsed) ? parsed.filter(isValid) : EMPTY;
    } catch {
      cache = EMPTY;
    }
    return cache;
  };

  const write = (items: T[]) => {
    try {
      const storage = getStorage();
      if (items.length === 0) storage?.removeItem(key);
      else storage?.setItem(key, JSON.stringify(items));
    } catch {
      // Bộ nhớ đầy — giữ nguyên dữ liệu cũ.
    }
    listeners.forEach((l) => l());
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key === key) listeners.forEach((l) => l());
  };

  return {
    getSnapshot: read,
    getServerSnapshot: () => EMPTY,
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1 && typeof window !== 'undefined') window.addEventListener('storage', onStorage);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
      };
    },
    has: (id) => read().some((item) => getId(item) === id),
    toggle(item) {
      const id = getId(item);
      const current = read();
      const exists = current.some((i) => getId(i) === id);
      write(exists ? current.filter((i) => getId(i) !== id) : [item, ...current]);
      return !exists;
    },
    add(items) {
      const current = read();
      const ids = new Set(current.map(getId));
      const fresh: T[] = [];
      for (const item of items) {
        const id = getId(item);
        if (ids.has(id)) continue;
        ids.add(id);
        fresh.push(item);
      }
      if (fresh.length) write([...fresh, ...current]);
      return fresh.length;
    },
    remove(id) {
      write(read().filter((i) => getId(i) !== id));
    },
    clear() {
      write([]);
    },
  };
}
