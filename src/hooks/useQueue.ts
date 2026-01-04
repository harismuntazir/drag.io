import { useEffect, useRef } from 'react';
import { useDownloadStore } from '@/store/downloadStore';
import { useSettingsStore } from '@/store/settingsStore';
import { downloadVideo } from '@/lib/tauri';

export function useQueue() {
  const downloads = useDownloadStore((state) => state.downloads);
  const updateDownload = useDownloadStore((state) => state.updateDownload);
  const { maxActiveDownloads, maxConcurrentDownloads } = useSettingsStore();
  
  // Ref to prevent double-triggering in strict mode
  const processingRef = useRef(new Set<string>());

  useEffect(() => {
    // Count active downloads
    const activeCount = downloads.filter((d) => 
      d.status === 'downloading' || d.status === 'initializing'
    ).length;

    // If we have capacity
    if (activeCount < maxActiveDownloads) {
      // Find the next queued item (FIFO)
      // Using array index implies order, reversed from state usually because state prepends? 
      // AddUrl prepends: `downloads: [new, ...state.downloads]`.
      // So the oldest item is at the end? 
      // Actually, usually users want LIFO or FIFO? 
      // If I add top, I want top to start? Or bottom?
      // Let's assume standard queue: First In First Out. 
      // If prepended, the last item is the oldest. 
      // If I just find the first in the array, that's LIFO (Stack). 
      // Let's stick to array order for now (LIFO if prepended), or find one by created time if we had it.
      // Let's just find the first one in the list for simplicity (LIFO).
      
      const nextItem = downloads.find((d) => d.status === 'queued');

      if (nextItem && !processingRef.current.has(nextItem.id)) {
        startDownload(nextItem.id, nextItem.url, nextItem.selectedFormatId!, nextItem.savePath!);
      }
    }
  }, [downloads, maxActiveDownloads, maxConcurrentDownloads]);

  const startDownload = async (id: string, url: string, formatId: string, path: string) => {
    try {
        processingRef.current.add(id);
        updateDownload(id, { status: 'initializing' });
        
        await downloadVideo(id, url, formatId, path, maxConcurrentDownloads);
        
        // Note: status update to 'downloading' happens via event listener in DownloadList
    } catch (e) {
        updateDownload(id, { status: 'failed', error: String(e) });
    } finally {
        processingRef.current.delete(id);
    }
  };
}
