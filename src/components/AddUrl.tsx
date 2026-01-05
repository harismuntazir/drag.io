import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useDownloadLogic } from '@/hooks/useDownloadLogic';

export default function AddUrl() {
  const [url, setUrl] = useState('');
  const { loading, startDownloadProcess } = useDownloadLogic();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    await startDownloadProcess(url);
    setUrl('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste YouTube URL here..."
        className="flex-1 px-4 py-3 text-lg border-2 border-black rounded-lg focus:outline-none focus:ring-0 focus:border-black/60 transition-colors"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-6 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin" /> : <Plus />}
        Add
      </button>
    </form>
  );
}
