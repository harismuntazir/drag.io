import { useDownloadStore, DownloadItem as DownloadItemType } from '@/store/downloadStore';
import { downloadVideo } from '@/lib/tauri';
import { Loader2, AlertCircle, CheckCircle, Folder } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { useState } from 'react';

export default function DownloadItem({ item }: { item: DownloadItemType }) {
  const updateDownload = useDownloadStore((state) => state.updateDownload);

  const handleDownload = async (formatId: string) => {
    try {
        // Open folder picker
        const selected = await open({
            directory: true,
            multiple: false,
            defaultPath: await import('@tauri-apps/api/path').then(p => p.downloadDir()),
        });

        if (selected === null) {
            // User cancelled
            return;
        }
        
        const path = selected as string;

        updateDownload(item.id, { status: 'queued', selectedFormatId: formatId, savePath: path });
        
        await downloadVideo(item.id, item.url, formatId, path);
    } catch (e) {
        updateDownload(item.id, { status: 'failed', error: String(e) });
    }
  };

  const renderStatus = () => {
    switch (item.status) {
      case 'fetching_metadata':
        return (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="animate-spin w-4 h-4" />
            <span>Fetching metadata...</span>
          </div>
        );
      case 'failed':
        return (
          <div className="text-red-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{item.error || 'Failed'}</span>
          </div>
        );
      case 'quality_selection':
        return (
          <div className="space-y-4">
             <h3 className="font-bold text-lg">{item.title}</h3>
             <div className="flex flex-wrap gap-2">
                {Array.from(new Set(item.formats?.map(f => f.height).filter(Boolean))).sort((a,b) => (b||0) - (a||0)).map(height => {
                    const fmt = item.formats?.find(f => f.height === height && f.ext === 'mp4'); 
                    const safeFmt = fmt || item.formats?.find(f => f.height === height);
                    if (!safeFmt) return null;
                    return (
                        <button
                            key={safeFmt.format_id}
                            onClick={() => handleDownload(safeFmt.format_id)}
                            className="px-3 py-1 border border-black hover:bg-black hover:text-white rounded transition-colors text-sm"
                        >
                            {height}p
                        </button>
                    )
                })}
             </div>
          </div>
        );
      case 'queued': 
      case 'downloading':
        return (
          <div className="space-y-2 w-full">
            <div className="flex justify-between text-sm font-medium">
                <span>{item.title}</span>
                <span>{item.progress.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden border border-black/10">
                <div 
                    className="h-full bg-black transition-all duration-300" 
                    style={{ width: `${item.progress}%` }}
                />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
                <span>{item.status === 'queued' ? 'Queued' : 'Downloading...'}</span>
                <span>{item.speed} • ETA {item.eta}</span>
            </div>
          </div>
        );
      case 'completed':
        return (
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-500 w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                </div>
                <button className="text-sm border border-gray-300 px-3 py-1 rounded hover:bg-gray-50 flex items-center gap-1">
                    <Folder className="w-3 h-3" />
                    Open Folder
                </button>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="border border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white transition-all">
      <div className="flex gap-4">
        {item.thumbnail && (
          <img src={item.thumbnail} alt="Thumbnail" className="w-32 h-20 object-cover rounded bg-gray-100" />
        )}
        <div className="flex-1 flex flex-col justify-center">
             {renderStatus()}
        </div>
      </div>
    </div>
  );
}
