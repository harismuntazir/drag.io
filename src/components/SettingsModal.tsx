import { useSettingsStore } from '@/store/settingsStore';
import { open } from '@tauri-apps/plugin-dialog';
import { downloadDir } from '@tauri-apps/api/path';
import { X, Folder, Settings as SettingsIcon } from 'lucide-react';
import { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { 
    defaultDownloadPath, 
    setDefaultDownloadPath, 
    maxConcurrentDownloads, 
    setMaxConcurrentDownloads 
  } = useSettingsStore();

  const handleSelectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        defaultPath: defaultDownloadPath || await downloadDir(),
      });
      
      if (selected && typeof selected === 'string') {
        setDefaultDownloadPath(selected);
      }
    } catch (err) {
      console.error('Failed to select folder:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b-2 border-black bg-gray-50">
          <div className="flex items-center gap-2 font-bold text-lg">
            <SettingsIcon className="w-5 h-5" />
            <span>Settings</span>
          </div>
          <button onClick={onClose} className="hover:bg-gray-200 p-1 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Default Download Folder */}
          <div className="space-y-2">
            <label className="font-bold block">Default Download Folder</label>
            <div className="flex gap-2">
              <div className="flex-1 p-2 border-2 border-black/20 rounded bg-gray-50 text-sm truncate font-mono">
                {defaultDownloadPath || <span className="text-gray-400 italic">Not set (Always ask)</span>}
              </div>
              <button 
                onClick={handleSelectFolder}
                className="px-3 py-2 bg-black text-white rounded font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Folder className="w-4 h-4" />
                Change
              </button>
            </div>
            <p className="text-xs text-gray-500">
              If set, downloads will automatically save here. Clear to ask every time.
            </p>
            {defaultDownloadPath && (
                 <button 
                    onClick={() => setDefaultDownloadPath(null)}
                    className="text-xs text-red-500 hover:underline"
                 >
                    Clear default path
                 </button>
            )}
          </div>

          {/* Max Concurrent Downloads (Speed) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="font-bold block">Download Speed (Max Peers)</label>
                <span className="font-mono bg-black text-white px-2 py-0.5 rounded text-sm">
                    N={maxConcurrentDownloads}
                </span>
            </div>
            <input 
                type="range" 
                min="1" 
                max="32" 
                value={maxConcurrentDownloads}
                onChange={(e) => setMaxConcurrentDownloads(Number(e.target.value))}
                className="w-full accent-black h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>1 (Slow / Stable)</span>
                <span>32 (Fastest / Aggressive)</span>
            </div>
          </div>

          {/* Max Active Downloads (Queue) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="font-bold block">Max Simultaneous Downloads</label>
                <span className="font-mono bg-black text-white px-2 py-0.5 rounded text-sm">
                    {useSettingsStore(s => s.maxActiveDownloads)}
                </span>
            </div>
            <input 
                type="range" 
                min="1" 
                max="5" 
                value={useSettingsStore(s => s.maxActiveDownloads)}
                onChange={(e) => useSettingsStore.getState().setMaxActiveDownloads(Number(e.target.value))}
                className="w-full accent-black h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>1 (Sequential)</span>
                <span>5 (Parallel)</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t-2 border-black bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
