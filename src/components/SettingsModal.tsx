import { useSettingsStore } from '@/store/settingsStore';
import { open } from '@tauri-apps/plugin-dialog';
import { downloadDir } from '@tauri-apps/api/path';
import { Settings as SettingsIcon, X, Folder, Copy, Check } from 'lucide-react';
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
    setMaxConcurrentDownloads,
    maxActiveDownloads,
    setMaxActiveDownloads
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
      <div className="bg-white rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md max-h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b-2 border-black bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2 font-bold text-lg">
            <SettingsIcon className="w-5 h-5" />
            <span>Settings</span>
          </div>
          <button onClick={onClose} className="hover:bg-gray-200 p-1 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
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
                    {maxActiveDownloads}
                </span>
            </div>
            <input 
                type="range" 
                min="1" 
                max="5" 
                value={maxActiveDownloads}
                onChange={(e) => setMaxActiveDownloads(Number(e.target.value))}
                className="w-full accent-black h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>1 (Sequential)</span>
                <span>5 (Parallel)</span>
            </div>
          </div>

          {/* Browser Integration */}
          <div className="space-y-2">
            <label className="font-bold block">Browser Integration (Tampermonkey)</label>
            <p className="text-xs text-gray-500 mb-2">
                Copy this script to Tampermonkey to add a "Drag It!" button to your browser.
            </p>
            <div className="relative">
                <textarea 
                    readOnly
                    className="w-full h-32 p-3 text-xs font-mono bg-gray-50 border-2 border-black/20 rounded resize-none focus:outline-none"
                    value={`// ==UserScript==
// @name         Drag.io - Drag It!
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Add a "Drag It!" button to send page URL to Drag.io app
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const BTN_ID = 'drag-io-float-btn';
    if (document.getElementById(BTN_ID)) return;

    const button = document.createElement('button');
    button.id = BTN_ID;
    button.innerText = 'Drag It! 🐉';
    Object.assign(button.style, {
        position: 'fixed', bottom: '20px', right: '20px', zIndex: '999999',
        padding: '10px 20px', backgroundColor: '#000000', color: '#ffffff',
        border: '2px solid #ffffff', borderRadius: '8px', cursor: 'pointer',
        fontWeight: 'bold', fontFamily: 'system-ui, sans-serif',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'transform 0.1s ease',
        pointerEvents: 'auto'
    });
    button.onmouseover = () => button.style.transform = 'scale(1.05)';
    button.onmouseout = () => button.style.transform = 'scale(1)';
    button.onclick = (e) => {
        e.preventDefault(); e.stopPropagation();
        window.location.href = \`dragio://open?url=\${encodeURIComponent(window.location.href)}\`;
    };
    document.body.appendChild(button);
})();`}
                />
                <CopyButton text={`// ==UserScript==
// @name         Drag.io - Drag It!
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Add a "Drag It!" button to send page URL to Drag.io app
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const BTN_ID = 'drag-io-float-btn';
    if (document.getElementById(BTN_ID)) return;

    const button = document.createElement('button');
    button.id = BTN_ID;
    button.innerText = 'Drag It! 🐉';
    Object.assign(button.style, {
        position: 'fixed', bottom: '20px', right: '20px', zIndex: '999999',
        padding: '10px 20px', backgroundColor: '#000000', color: '#ffffff',
        border: '2px solid #ffffff', borderRadius: '8px', cursor: 'pointer',
        fontWeight: 'bold', fontFamily: 'system-ui, sans-serif',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'transform 0.1s ease',
        pointerEvents: 'auto'
    });
    button.onmouseover = () => button.style.transform = 'scale(1.05)';
    button.onmouseout = () => button.style.transform = 'scale(1)';
    button.onclick = (e) => {
        e.preventDefault(); e.stopPropagation();
        window.location.href = \`dragio://open?url=\${encodeURIComponent(window.location.href)}\`;
    };
    document.body.appendChild(button);
})();`} />
            </div>
            </div>
            </div>

            {/* About & Updates */}
            <div className="space-y-4 pt-4 border-t-2 border-dashed border-gray-300">
                <div>
                    <h3 className="font-bold text-lg mb-2">About Drag.io</h3>
                    <div className="text-sm space-y-1">
                        <p>
                            <span className="font-semibold">Developer:</span>{' '}
                            <a href="https://github.com/harismuntazir/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                Haris Muntazir
                            </a>
                        </p>
                        <p>
                            <span className="font-semibold">Source Code:</span>{' '}
                            <a href="https://github.com/harismuntazir/drag.io" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                github.com/harismuntazir/drag.io
                            </a>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Powered by Tauri v2, Next.js, and yt-dlp.
                        </p>
                    </div>
                </div>

                {/* Update Check Placeholder */}
                <div className="bg-blue-50 p-3 rounded border border-blue-200 text-xs text-blue-800">
                    <strong>Need new binaries?</strong>
                    <p className="mt-1">
                        To get the latest yt-dlp/ffmpeg, simply check for a new version of Drag.io on GitHub.
                    </p>
                    <a 
                        href="https://github.com/harismuntazir/drag.io/releases" 
                        target="_blank" 
                        rel="noreferrer"
                        className="block mt-2 font-bold hover:underline"
                    >
                        Check for Updates &rarr;
                    </a>
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
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <button 
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-black text-white rounded hover:bg-gray-800 transition-colors shadow-sm"
        title="Copy Script"
    >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}
