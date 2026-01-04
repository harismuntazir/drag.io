import { useState } from 'react';
import { useDownloadStore } from '@/store/downloadStore';
import { fetchMetadata } from '@/lib/tauri';
import { Plus, Loader2 } from 'lucide-react';

export default function AddUrl() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const addDownload = useDownloadStore((state) => state.addDownload);
  const updateDownload = useDownloadStore((state) => state.updateDownload);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    const id = addDownload(url);
    setUrl(''); // Clear input immediately

    try {
      const metadata = await fetchMetadata(url);
      updateDownload(id, {
        status: 'quality_selection',
        title: metadata.title,
        thumbnail: metadata.thumbnail,
        formats: metadata.formats,
      });
    } catch (err) {
      updateDownload(id, {
        status: 'failed',
        error: String(err),
      });
    } finally {
      setLoading(false);
    }
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
