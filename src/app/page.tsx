"use client";

import AddUrl from '@/components/AddUrl';
import DownloadList from '@/components/DownloadList';
import SettingsModal from '@/components/SettingsModal';
import { Settings, Folder, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { open } from '@tauri-apps/plugin-shell';
import { downloadDir } from '@tauri-apps/api/path';

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { defaultDownloadPath } = useSettingsStore();

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
          <h1 className="text-4xl font-black tracking-tighter mb-2">Drag.io</h1>
          <p className="text-gray-500 font-medium tracking-wide text-sm uppercase block">
            Your Offline Media Store
          </p>
        </header>

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
