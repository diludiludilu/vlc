import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { X, Keyboard } from 'lucide-react';

const SHORTCUTS = [
  { key: 'Space', desc: 'Play / Pause toggle' },
  { key: 'S', desc: 'Stop playback' },
  { key: 'F', desc: 'Toggle Fullscreen mode' },
  { key: 'T', desc: 'Toggle Theater mode' },
  { key: 'B', desc: 'Add bookmark marker at playhead' },
  { key: 'M', desc: 'Mute / Unmute audio' },
  { key: '↑ / ↓', desc: 'Volume Up / Down by 5% (up to 200% boost)' },
  { key: '← / →', desc: 'Jump 10 seconds backward / forward' },
  { key: 'Ctrl + ← / →', desc: 'Jump 1 minute backward / forward' },
  { key: 'Shift + ← / →', desc: 'Jump 3 seconds backward / forward' },
  { key: '[ / ]', desc: 'Decrease / Increase playback speed by 0.25x' },
  { key: '=', desc: 'Reset playback speed to 1.0x normal' },
  { key: 'P / N', desc: 'Previous track / Next track in playlist' },
  { key: 'E', desc: 'Step one frame forward (frame-by-frame)' },
  { key: 'Shift + S', desc: 'Capture snapshot frame to gallery & download' },
  { key: 'Ctrl + E', desc: 'Open Studio Audio & Video Effects' },
  { key: 'Ctrl + L', desc: 'Toggle Playlist / Media Library sidebar' },
];

export const ShortcutsModal: React.FC = () => {
  const { activeModal, setActiveModal } = usePlayer();

  if (activeModal !== 'shortcuts') return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-xs select-none">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-xs text-zinc-200">
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-800 border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-emerald-400" />
            <h2 className="font-semibold text-sm text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 max-h-[65vh] overflow-y-auto space-y-2">
          <div className="grid grid-cols-1 divide-y divide-zinc-800">
            {SHORTCUTS.map((item) => (
              <div key={item.key} className="py-2 flex items-center justify-between">
                <span className="text-zinc-300 font-medium">{item.desc}</span>
                <kbd className="px-2 py-1 bg-zinc-950 border border-zinc-700 rounded font-mono text-[11px] text-orange-400 shadow-xs">
                  {item.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 py-2.5 bg-zinc-800/80 border-t border-zinc-700/80 flex justify-end">
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
