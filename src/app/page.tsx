"use client";

import AddUrl from '@/components/AddUrl';
import DownloadList from '@/components/DownloadList';
import SettingsModal from '@/components/SettingsModal';
import { Settings } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white text-black p-8 font-sans">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center relative">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="absolute right-0 top-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-6 h-6" />
          </button>
          <h1 className="text-4xl font-black tracking-tighter mb-2">YT-DLP DOWNLOADER</h1>
          <p className="text-gray-500 font-medium tracking-wide text-sm uppercase">
            Constructed with Tauri & Next.js
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
