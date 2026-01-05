"use client";

import AddUrl from '@/components/AddUrl';
import DownloadList from '@/components/DownloadList';
import SettingsModal from '@/components/SettingsModal';
import { Settings, Folder, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { open } from '@tauri-apps/plugin-shell';
import { downloadDir } from '@tauri-apps/api/path';
import { onOpenUrl } from '@tauri-apps/plugin-deep-link';
import { useDownloadLogic } from '@/hooks/useDownloadLogic';
import { useEffect } from 'react';

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { defaultDownloadPath } = useSettingsStore();
  const { startDownloadProcess } = useDownloadLogic();
  const [debugMsg, setDebugMsg] = useState<string | null>(null);

  useEffect(() => {
    let unlisten: (() => void) | null = null;

    const initDeepLink = async () => {
      try {
        unlisten = await onOpenUrl((urls) => {
          console.log('Deep link received:', urls);
          // setDebugMsg(`Received: ${urls.join(', ')}`); // Debug feedback

          for (const url of urls) {
             try {
                // Check if it's the custom scheme
                const parsed = new URL(url);
                const target = parsed.searchParams.get('url');
                
                if (target) {
                    setDebugMsg(`Processing: ${target}`);
                    startDownloadProcess(target);
                    // Clear message after 3s
                    setTimeout(() => setDebugMsg(null), 3000);
                } else {
                    setDebugMsg(`No URL param found in: ${url}`);
                }
             } catch (e) {
                console.error('Failed to parse deep link:', e);
                setDebugMsg(`Parse Error: ${String(e)}`);
             }
          }
        });
      } catch (e) {
        console.error('Failed to init deep link listener:', e);
      }
    };
    
    initDeepLink();

    return () => {
        if (unlisten) unlisten();
    };
  }, [startDownloadProcess]);

  const handleOpenDownloads = async () => {
    try {
        const path = defaultDownloadPath || await downloadDir();
        await open(path);
    } catch (e) {
        console.error('Failed to open downloads folder:', e);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black p-8 font-sans">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center relative flex justify-center items-center">
          <div className="absolute right-0 top-0 flex gap-2">
            <button 
                onClick={handleOpenDownloads}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                title="Open Downloads Folder"
            >
                <FolderOpen className="w-6 h-6" />
            </button>
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                title="Settings"
            >
                <Settings className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-4xl font-black tracking-tighter mb-2">Drag.io</h1>
            <p className="text-gray-500 font-medium tracking-wide text-sm uppercase">
              Your Offline Media Store
            </p>
          </div>
        </header>

        {debugMsg && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4 animate-in fade-in slide-in-from-top-2">
                <strong className="font-bold">Deep Link: </strong>
                <span className="block sm:inline truncate">{debugMsg}</span>
            </div>
        )}

        <AddUrl />
        
        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                QUEUE
                <div className="h-1 flex-1 bg-black/5 rounded"></div>
            </h2>
            <DownloadList />
        </div>
      </div>
    </main>
  );
}
