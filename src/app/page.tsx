"use client";

import AddUrl from '@/components/AddUrl';
import DownloadList from '@/components/DownloadList';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
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
