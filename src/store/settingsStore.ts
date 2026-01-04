import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  defaultDownloadPath: string | null;
  maxConcurrentDownloads: number;
  setDefaultDownloadPath: (path: string | null) => void;
  setMaxConcurrentDownloads: (count: number) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      defaultDownloadPath: null,
      maxConcurrentDownloads: 8,
      setDefaultDownloadPath: (path) => set({ defaultDownloadPath: path }),
      setMaxConcurrentDownloads: (count) => set({ maxConcurrentDownloads: count }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
