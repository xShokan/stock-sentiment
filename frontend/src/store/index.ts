/* Zustand 全局状态 */
import { create } from 'zustand';

interface AppState {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeMarket: string;
  setActiveMarket: (m: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  activeMarket: 'a',
  setActiveMarket: (m) => set({ activeMarket: m }),
}));
