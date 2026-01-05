import { useState } from 'react';
import { useDownloadStore } from '@/store/downloadStore';
import { fetchMetadata } from '@/lib/tauri';

export function useDownloadLogic() {
  const [loading, setLoading] = useState(false);
  const addDownloadStore = useDownloadStore((state) => state.addDownload);
  const updateDownloadStore = useDownloadStore((state) => state.updateDownload);

  const startDownloadProcess = async (url: string) => {
    if (!url.trim()) return;
    
    setLoading(true);
    const id = addDownloadStore(url);

    try {
      const metadata = await fetchMetadata(url);
      updateDownloadStore(id, {
        status: 'quality_selection',
        title: metadata.title,
        thumbnail: metadata.thumbnail,
        formats: metadata.formats,
      });
    } catch (err) {
      updateDownloadStore(id, {
        status: 'failed',
        error: String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, startDownloadProcess };
}
