import { useSyncExternalStore } from 'react';

/** Trạng thái giao diện dùng chung giữa các trang: hộp thoại Cài đặt AI và chế độ trình chiếu. */
export interface AppUiState {
  settingsOpen: boolean;
  presenting: boolean;
}

const SERVER_STATE: AppUiState = { settingsOpen: false, presenting: false };
let state: AppUiState = SERVER_STATE;
const listeners = new Set<() => void>();

const update = (patch: Partial<AppUiState>) => {
  const next = { ...state, ...patch };
  if (next.settingsOpen === state.settingsOpen && next.presenting === state.presenting) return;
  state = next;
  listeners.forEach((l) => l());
};

export const appUiStore = {
  getSnapshot: (): AppUiState => state,
  getServerSnapshot: (): AppUiState => SERVER_STATE,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  openSettings: () => update({ settingsOpen: true }),
  closeSettings: () => update({ settingsOpen: false }),
  setPresenting: (presenting: boolean) => update({ presenting }),
};

export const useAppUi = () => useSyncExternalStore(appUiStore.subscribe, appUiStore.getSnapshot, appUiStore.getServerSnapshot);
