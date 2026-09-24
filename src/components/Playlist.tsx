import React, { useState, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  ListMusic,
  Plus,
  Trash2,
  Shuffle,
  Repeat,
  Repeat1,
  Film,
  Music,
  Search,
  Globe,
  GripVertical,
  Heart,
  Clock,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { DEFAULT_PLAYLIST } from '../data/defaultTracks';

export const Playlist: React.FC = () => {
  const {
    playlist,
    currentIndex,
    playTrack,
    addTrack,
    removeTrack,
    clearPlaylist,
    reorderPlaylist,
    isPlaying,
    loopMode,
    toggleLoopMode,
    isShuffle,
    toggleShuffle,
    addLocalFiles,
    toggleFavorite,
    setActiveModal,
    isPlaylistOpen,
    togglePlaylist,
    theme,
  } = usePlayer();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'audio' | 'favorite'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  if (!isPlaylistOpen) return null;

  const filteredPlaylist = playlist.filter((item) => {
    const matchesSearch = `${item.title} ${item.artist || ''} ${item.album || ''}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'video') return item.type === 'video';
    if (filterType === 'audio') return item.type === 'audio';
    if (filterType === 'favorite') return !!item.isFavorite;
    return true;
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    reorderPlaylist(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Calculate total runtime of current playlist
  const totalRuntimeSeconds = playlist.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const formatTotalRuntime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const h = Math.floor(m / 60);
    const remM = m % 60;
    if (h > 0) return `${h}h ${remM}m`;
    return `${m}m`;
  };

  return (
    <div
      className={`w-80 md:w-96 flex flex-col border-l select-none transition-all duration-200 z-20 shadow-2xl backdrop-blur-xl ${
        theme === 'vlc-classic'
          ? 'bg-zinc-900 border-zinc-700/80 text-zinc-100'
          : theme === 'dark-slate'
          ? 'bg-slate-900 border-slate-800 text-slate-100'
          : 'bg-zinc-950/95 border-zinc-800 text-white'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*,audio/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addLocalFiles(e.target.files);
        }}
      />

      {/* Playlist Header */}
      <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ListMusic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-xs tracking-wider uppercase">Media Library</h3>
            <span className="text-[10px] text-zinc-400">
              {playlist.length} {playlist.length === 1 ? 'item' : 'items'} &bull; {formatTotalRuntime(totalRuntimeSeconds)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Loop Mode Cycle Button */}
          <button
            onClick={toggleLoopMode}
            title={`Loop Mode: ${loopMode}`}
            className={`p-1.5 rounded-lg transition ${
              loopMode !== 'off'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {loopMode === 'track' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>

          {/* Shuffle Button */}
          <button
            onClick={toggleShuffle}
            title={isShuffle ? 'Shuffle: On' : 'Shuffle: Off'}
            className={`p-1.5 rounded-lg transition ${
              isShuffle
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Close Sidebar Button */}
          <button
            onClick={() => togglePlaylist()}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-white/10 px-3 py-1.5 gap-1 bg-white/[0.02] text-[11px]">
        {(['all', 'video', 'audio', 'favorite'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`px-2.5 py-1 rounded-md font-medium capitalize transition ${
              filterType === tab
                ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab === 'all'
              ? 'All'
              : tab === 'video'
              ? 'Videos'
              : tab === 'audio'
              ? 'Music'
              : 'Favorites'}
          </button>
        ))}
      </div>

      {/* Search Input Bar */}
      <div className="p-2.5 border-b border-white/10 bg-white/[0.01]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tracks, artists, albums..."
            className="w-full bg-zinc-900/90 border border-white/10 rounded-lg pl-8 pr-7 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Track Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
        {filteredPlaylist.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 flex flex-col items-center justify-center">
            <ListMusic className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-xs">No media files found</p>
            {playlist.length === 0 ? (
              <button
                onClick={() => DEFAULT_PLAYLIST.forEach((t) => addTrack(t))}
                className="mt-3 px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Load Sample Media Library
              </button>
            ) : (
              <p className="text-[11px] text-zinc-600 mt-1">Try changing filter or search terms</p>
            )}
          </div>
        ) : (
          filteredPlaylist.map((track, idx) => {
            const originalIndex = playlist.findIndex((t) => t.id === track.id);
            const isCurrent = originalIndex === currentIndex;

            return (
              <div
                key={track.id}
                draggable
                onDragStart={() => handleDragStart(originalIndex)}
                onDragOver={(e) => handleDragOver(e, originalIndex)}
                onDragEnd={handleDragEnd}
                onClick={() => playTrack(originalIndex)}
                className={`group flex items-center gap-2 p-2.5 cursor-pointer transition ${
                  isCurrent
                    ? 'bg-amber-500/15 border-l-2 border-amber-500 text-white'
                    : 'hover:bg-white/[0.04] text-zinc-300'
                }`}
              >
                {/* Drag Handle */}
                <div
                  className="opacity-0 group-hover:opacity-60 cursor-grab text-zinc-400 hover:text-white transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="w-3.5 h-3.5" />
                </div>

                {/* Track Number / Media Type Icon */}
                <div className="w-6 text-center text-[11px] font-mono text-zinc-500">
                  {isCurrent && isPlaying ? (
                    <div className="flex items-end justify-center gap-0.5 h-3.5">
                      <div className="w-0.5 h-3 bg-amber-400 animate-pulse" />
                      <div className="w-0.5 h-2 bg-amber-400 animate-pulse" style={{ animationDelay: '150ms' }} />
                      <div className="w-0.5 h-3.5 bg-amber-400 animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    track.type === 'video' ? (
                      <Film className="w-3.5 h-3.5 mx-auto text-zinc-400 group-hover:text-amber-400" />
                    ) : (
                      <Music className="w-3.5 h-3.5 mx-auto text-zinc-400 group-hover:text-amber-400" />
                    )
                  )}
                </div>

                {/* Track Details */}
                <div className="flex-1 min-w-0 pr-1">
                  <p
                    className={`text-xs font-medium truncate ${
                      isCurrent ? 'text-amber-400 font-semibold' : 'text-zinc-200'
                    }`}
                  >
                    {track.title}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate">
                    {track.artist || (track.type === 'video' ? 'Video File' : 'Audio Track')}
                    {track.album ? ` &bull; ${track.album}` : ''}
                  </p>
                </div>

                {/* Duration */}
                <span className="text-[11px] font-mono text-zinc-400">
                  {formatDuration(track.duration)}
                </span>

                {/* Favorite Heart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(track.id);
                  }}
                  title={track.isFavorite ? 'Remove favorite' : 'Add favorite'}
                  className={`p-1 rounded text-zinc-500 hover:text-red-400 transition ${
                    track.isFavorite ? 'text-red-400' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${track.isFavorite ? 'fill-current' : ''}`} />
                </button>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTrack(track.id);
                  }}
                  title="Remove from playlist"
                  className="p-1 rounded text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Playlist Footer Toolbar */}
      <div className="p-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-lg text-xs flex items-center gap-1 shadow transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Files
          </button>
          <button
            onClick={() => setActiveModal('network')}
            className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 rounded-lg text-xs flex items-center gap-1 transition"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" /> URL
          </button>
        </div>

        {playlist.length > 0 && (
          <button
            onClick={clearPlaylist}
            title="Clear entire playlist"
            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
