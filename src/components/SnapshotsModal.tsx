import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Camera, Download, Copy, Trash2, X, Play, Check, Eye } from 'lucide-react';

export const SnapshotsModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    snapshots,
    removeSnapshot,
    clearSnapshots,
    seekTo,
    captureSnapshot,
    currentTrack,
    theme,
    showOsd,
  } = usePlayer();

  const [previewItem, setPreviewItem] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (activeModal !== 'snapshots') return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const s = Math.floor(seconds);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const handleCopy = async (dataUrl: string, id: string) => {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopiedId(id);
      showOsd('Snapshot copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showOsd('Copy not supported by browser; right-click to copy');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div
        className={`w-full max-w-3xl rounded-xl border shadow-2xl overflow-hidden flex flex-col max-h-[88vh] ${
          theme === 'vlc-classic'
            ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
            : theme === 'dark-slate'
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-zinc-950 border-zinc-800 text-white'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide">Snapshot Gallery</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Captured frames from active video playback
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentTrack?.type === 'video' && (
              <button
                onClick={() => captureSnapshot()}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow transition"
              >
                <Camera className="w-3.5 h-3.5" /> Capture Now
              </button>
            )}
            <button
              onClick={() => setActiveModal(null)}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {snapshots.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-xs">
              <Camera className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium text-zinc-400">No snapshots captured yet</p>
              <p className="mt-1 text-[11px] max-w-sm mx-auto">
                While watching any video, click the camera icon or press Shift+S to capture full-resolution pristine frames!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="group relative rounded-lg overflow-hidden border border-white/10 bg-zinc-950/80 shadow hover:border-amber-500/50 transition flex flex-col"
                >
                  <div
                    onClick={() => setPreviewItem(snap.dataUrl)}
                    className="relative aspect-video w-full bg-black cursor-pointer overflow-hidden"
                  >
                    <img
                      src={snap.dataUrl}
                      alt={snap.mediaTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <div className="p-2 rounded-full bg-zinc-900/80 text-white hover:bg-zinc-800 transition">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-mono text-zinc-300 font-semibold">
                      {formatTime(snap.time)}
                    </div>
                  </div>

                  <div className="p-2.5 flex items-center justify-between gap-1 border-t border-white/5 bg-zinc-900/50">
                    <span className="text-[11px] text-zinc-300 truncate max-w-[120px]" title={snap.mediaTitle}>
                      {snap.mediaTitle}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          seekTo(snap.time);
                          setActiveModal(null);
                        }}
                        title="Jump to time in video"
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        onClick={() => handleCopy(snap.dataUrl, snap.id)}
                        title="Copy image"
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition"
                      >
                        {copiedId === snap.id ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={snap.dataUrl}
                        download={`vlc_snapshot_${snap.time}s.png`}
                        title="Download PNG"
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => removeSnapshot(snap.id)}
                        title="Delete snapshot"
                        className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-white/10 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 bg-white/[0.02]">
          <span>{snapshots.length} {snapshots.length === 1 ? 'frame' : 'frames'} in gallery</span>
          <div className="flex items-center gap-2">
            {snapshots.length > 0 && (
              <button
                onClick={() => clearSnapshots()}
                className="px-3 py-1.5 text-red-400 hover:bg-red-500/10 rounded-md font-medium transition"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setActiveModal(null)}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Full Preview Modal */}
      {previewItem && (
        <div
          onClick={() => setPreviewItem(null)}
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={previewItem}
            alt="Preview"
            className="max-w-full max-h-full rounded-lg shadow-2xl border border-white/20 object-contain"
          />
        </div>
      )}
    </div>
  );
};
