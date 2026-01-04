import { create } from 'zustand';

export type DownloadStatus = 'fetching_metadata' | 'quality_selection' | 'queued' | 'initializing' | 'downloading' | 'completed' | 'failed';

export interface VideoFormat {
  format_id: string;
  height: number | null;
  ext: string;
  filesize: number | null;
}

export interface DownloadItem {
  id: string;
  url: string;
  status: DownloadStatus;
  progress: number;
  speed: string;
  eta: string;
  title?: string;
  thumbnail?: string;
  formats?: VideoFormat[];
  selectedFormatId?: string;
  savePath?: string;
  error?: string;
}

interface DownloadStore {
  downloads: DownloadItem[];
  addDownload: (url: string) => string;
  updateDownload: (id: string, updates: Partial<DownloadItem>) => void;
  removeDownload: (id: string) => void;
}

export const useDownloadStore = create<DownloadStore>((set) => ({
  downloads: [],
  addDownload: (url: string) => {
    const id = crypto.randomUUID();
    set((state) => ({
      downloads: [
        {
          id,
          url,
          status: 'fetching_metadata',
          progress: 0,
          speed: '-',
          eta: '-',
        },
        ...state.downloads,
      ],
    }));
    return id;
  },
  updateDownload: (id, updates) =>
    set((state) => ({
      downloads: state.downloads.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),
  removeDownload: (id) =>
    set((state) => ({
      downloads: state.downloads.filter((d) => d.id !== id),
    })),
}));
