import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  defaultDownloadPath: string | null;
  maxConcurrentDownloads: number;
  maxActiveDownloads: number;
  setDefaultDownloadPath: (path: string | null) => void;
  setMaxConcurrentDownloads: (count: number) => void;
  setMaxActiveDownloads: (count: number) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      defaultDownloadPath: null,
      maxConcurrentDownloads: 8,
      maxActiveDownloads: 3,
      setDefaultDownloadPath: (path) => set({ defaultDownloadPath: path }),
      setMaxConcurrentDownloads: (count) => set({ maxConcurrentDownloads: count }),
      setMaxActiveDownloads: (count) => set({ maxActiveDownloads: count }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
