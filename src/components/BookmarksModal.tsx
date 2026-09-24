import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Bookmark, Plus, Trash2, Clock, Play, X, ExternalLink, Tag } from 'lucide-react';

export const BookmarksModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    bookmarks,
    addBookmark,
    removeBookmark,
    jumpToBookmark,
    currentTime,
    duration,
    currentTrack,
    theme,
  } = usePlayer();

  const [customLabel, setCustomLabel] = useState<string>('');

  if (activeModal !== 'bookmarks') return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const s = Math.floor(seconds);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addBookmark(customLabel.trim() || undefined);
    setCustomLabel('');
  };

  // Filter bookmarks: either current media or show all
  const mediaBookmarks = currentTrack
    ? bookmarks.filter((b) => b.mediaId === currentTrack.id)
    : bookmarks;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className={`w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${
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
              <Bookmark className="w-4 h-4 fill-amber-400/40" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide">Media Bookmarks & Chapters</h2>
              <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-xs">
                {currentTrack?.title || 'No active media'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add new bookmark form */}
        <div className="p-4 border-b border-white/10 bg-white/[0.02]">
          <form onSubmit={handleAdd} className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder={`Bookmark at ${formatTime(currentTime)} (e.g. Favorite Solo, Chorus)`}
                className="w-full bg-zinc-950/80 border border-zinc-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={!currentTrack}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow transition"
            >
              <Plus className="w-4 h-4" /> Add Marker
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 px-1">
            <span>Current Playhead: <strong className="text-amber-400 font-mono">{formatTime(currentTime)}</strong></span>
            {duration > 0 && <span>Total: <strong className="font-mono">{formatTime(duration)}</strong></span>}
          </div>
        </div>

        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {mediaBookmarks.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No bookmarks set yet for this media.</p>
              <p className="mt-1 text-[11px]">Click &quot;Add Marker&quot; while playing to drop timestamps on the timeline!</p>
            </div>
          ) : (
            mediaBookmarks.map((bm) => (
              <div
                key={bm.id}
                className="group flex items-center justify-between p-2.5 rounded-lg bg-zinc-800/40 hover:bg-zinc-800/80 border border-white/5 transition"
              >
                <button
                  onClick={() => {
                    jumpToBookmark(bm.time);
                    setActiveModal(null);
                  }}
                  className="flex items-center gap-3 flex-1 text-left min-w-0"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 border border-amber-500/20 font-mono text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-zinc-200 group-hover:text-amber-400 transition truncate">
                      {bm.label}
                    </p>
                    <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                      {formatTime(bm.time)}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 mr-2 p-1 text-zinc-400 hover:text-white transition">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                </button>

                <button
                  onClick={() => removeBookmark(bm.id)}
                  title="Remove bookmark"
                  className="p-1.5 text-zinc-500 hover:text-red-400 rounded-md hover:bg-white/5 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 bg-white/[0.02]">
          <span>{mediaBookmarks.length} {mediaBookmarks.length === 1 ? 'bookmark' : 'bookmarks'} saved</span>
          <button
            onClick={() => setActiveModal(null)}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
