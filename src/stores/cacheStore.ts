import { create } from "zustand";

interface CacheState {
  [key: string]: any;
  setCache: (key: string, data: any) => void;
  getCache: (key: string) => any;
  clearCache: (key: string) => void;
}

export const useCacheStore = create<CacheState>((set, get) => ({
  setCache: (key, data) => set({ [key]: { data, timestamp: Date.now() } }),
  getCache: (key) => get()[key]?.data,
  clearCache: (key) => set({ [key]: undefined }),
}));
