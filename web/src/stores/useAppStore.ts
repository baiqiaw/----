import { create } from 'zustand';

interface AppState {
  user: unknown | null;
  setUser: (user: unknown) => void;
}

/**
 * 应用状态管理
 */
export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

