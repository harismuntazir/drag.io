import { useEffect, useRef } from 'react';
import { useDownloadStore } from '@/store/downloadStore';
import DownloadItem from './DownloadItem';
import { listen } from '@tauri-apps/api/event';

export default function DownloadList() {
  const downloads = useDownloadStore((state) => state.downloads);
  const updateDownload = useDownloadStore((state) => state.updateDownload);
  const unlistenRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Set up listener
    const setupListener = async () => {
        if (unlistenRef.current) return;
        
        const unlisten = await listen('download-progress', (event: any) => {
            const payload = event.payload; 
            // payload: { id, status, progress, speed, eta }
            updateDownload(payload.id, {
                status: payload.status,
                progress: payload.progress,
                speed: payload.speed,
                eta: payload.eta
            });
        });
        unlistenRef.current = unlisten;
    };

    setupListener();

    return () => {
        if (unlistenRef.current) {
            unlistenRef.current();
            unlistenRef.current = null;
        }
    };
  }, [updateDownload]);

  if (downloads.length === 0) {
      return (
          <div className="text-center text-gray-400 py-12 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="font-medium">No downloads yet.</p>
              <p className="text-sm">Paste a URL above to start.</p>
          </div>
      )
  }

  return (
    <div className="space-y-4 pb-12">
      {downloads.map((item) => (
        <DownloadItem key={item.id} item={item} />
      ))}
    </div>
  );
}
