// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createLocalListStore } from '@/lib/local-list-store';
import { sloganId, isSlogan } from '@/lib/slogans';
import type { Slogan } from '@/lib/slogans';

const KEY = 'test_favorites';
const a: Slogan = { en: 'Never Give Up', ipa: '/ˈnɛvər ɡɪv ʌp/', vi: 'Không bỏ cuộc' };
const b: Slogan = { en: 'Dare to Dream', ipa: '/dɛr tuː driːm/', vi: 'Dám ước mơ' };

const makeStore = () => createLocalListStore<Slogan>(KEY, isSlogan, sloganId);

beforeEach(() => localStorage.clear());

describe('sloganId', () => {
  it('không phân biệt hoa thường và khoảng trắng', () => {
    expect(sloganId({ ...a, en: '  NEVER give up ' })).toBe(sloganId(a));
  });
});

describe('createLocalListStore', () => {
  it('toggle thêm rồi bỏ', () => {
    const store = makeStore();
    store.toggle(a);
    expect(store.has(sloganId(a))).toBe(true);
    store.toggle(a);
    expect(store.has(sloganId(a))).toBe(false);
  });

  it('dữ liệu còn sau khi tạo store mới (giả lập reload)', () => {
    makeStore().toggle(a);
    expect(makeStore().getSnapshot()).toEqual([a]);
  });

  it('add bỏ qua phần tử trùng, mục mới lên đầu', () => {
    const store = makeStore();
    store.add([a]);
    store.add([b, a]);
    expect(store.getSnapshot().map((s) => s.en)).toEqual(['Dare to Dream', 'Never Give Up']);
  });

  it('remove và clear', () => {
    const store = makeStore();
    store.add([a, b]);
    store.remove(sloganId(a));
    expect(store.getSnapshot()).toEqual([b]);
    store.clear();
    expect(store.getSnapshot()).toEqual([]);
  });

  it('dữ liệu hỏng không làm crash và bị lọc', () => {
    localStorage.setItem(KEY, '{not json');
    expect(makeStore().getSnapshot()).toEqual([]);
    localStorage.setItem(KEY, JSON.stringify([a, { foo: 1 }, null]));
    expect(makeStore().getSnapshot()).toEqual([a]);
  });

  it('snapshot giữ nguyên tham chiếu khi dữ liệu không đổi (cho useSyncExternalStore)', () => {
    const store = makeStore();
    store.add([a]);
    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });

  it('báo cho listener khi thay đổi', () => {
    const store = makeStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.toggle(a);
    expect(listener).toHaveBeenCalled();
    unsubscribe();
    listener.mockClear();
    store.toggle(a);
    expect(listener).not.toHaveBeenCalled();
  });
});
