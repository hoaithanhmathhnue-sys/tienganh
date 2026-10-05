import { useSyncExternalStore } from 'react';
import { createLocalListStore, type LocalListStore } from '@/lib/local-list-store';
import { isSlogan, sloganId, type Slogan } from '@/lib/slogans';

export interface CollectionItem extends Slogan {
  topic: string;
  createdAt: string;
}

const isCollectionItem = (value: unknown): value is CollectionItem =>
  isSlogan(value) &&
  typeof (value as Partial<CollectionItem>).topic === 'string' &&
  typeof (value as Partial<CollectionItem>).createdAt === 'string';

/** Slogan yêu thích (gồm cả slogan có sẵn và slogan AI). */
export const favoritesStore = createLocalListStore<Slogan>('evd_favorites', isSlogan, sloganId);

/** Slogan do AI tạo — "Bộ sưu tập AI". */
export const collectionStore = createLocalListStore<CollectionItem>('evd_ai_collection', isCollectionItem, sloganId);

export function useListStore<T>(store: LocalListStore<T>): T[] {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
