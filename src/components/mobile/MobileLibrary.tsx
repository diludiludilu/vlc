import React, { useState, useRef } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import {
  Search,
  Play,
  Pause,
  Video,
  Music,
  Heart,
  Trash2,
  FolderOpen,
  Globe,
  Sparkles,
  Clock,
  HardDrive,
} from 'lucide-react';
import { DEFAULT_PLAYLIST } from '../../data/defaultTracks';

export const MobileLibrary: React.FC = () => {
  const {
    playlist,
    currentIndex,
    isPlaying,
    playTrack,
    addTrack,
    removeTrack,
    clearPlaylist,
    addLocalFiles,
    toggleFavorite,
    setActiveModal,
    setActiveMobileTab,
    theme,
  } = usePlayer();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'audio' | 'favorites'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPlaylist = playlist.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (track.artist && track.artist.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (track.album && track.album.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'video') return track.type === 'video';
    if (filterType === 'audio') return track.type === 'audio';
    if (filterType === 'favorites') return track.isFavorite;
    return true;
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDurationSecs = playlist.reduce((acc, t) => acc + (t.duration || 0), 0);
  const totalHours = Math.floor(totalDurationSecs / 3600);
  const totalMins = Math.floor((totalDurationSecs % 3600) / 60);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addLocalFiles(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div
      className={`flex-1 flex flex-col h-full overflow-hidden select-none ${
        theme === 'vlc-classic'
          ? 'bg-zinc-900 text-zinc-100'
          : theme === 'dark-slate'
          ? 'bg-slate-900 text-slate-100'
          : 'bg-zinc-950 text-white'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*,audio/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Top Header & Search */}
      <div className="p-4 border-b border-white/10 shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Media Library</h2>
            <p className="text-[11px] text-zinc-400">
              {playlist.length} items &bull;{' '}
              {totalHours > 0 ? `${totalHours}h ${totalMins}m` : `${totalMins} mins total`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[40px] px-3 bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
            <button
              onClick={() => setActiveModal('network')}
              className="min-h-[40px] px-3 bg-white/5 border border-white/10 text-zinc-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 active:scale-95 transition"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Stream</span>
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search titles, artists, albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {(
            [
              { id: 'all', label: 'All Media' },
              { id: 'video', label: 'Videos' },
              { id: 'audio', label: 'Music' },
              { id: 'favorites', label: 'Favorites' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterType === tab.id
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'bg-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Playlist Scrollable Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2">
        {filteredPlaylist.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <HardDrive className="w-10 h-10 text-zinc-600 mb-3" />
            <p className="text-sm font-semibold text-zinc-300">No media found</p>
            <p className="text-xs text-zinc-500 mt-1 mb-4">
              Add your local files or load the bundled sample media library.
            </p>
            {playlist.length === 0 && (
              <button
                onClick={() => DEFAULT_PLAYLIST.forEach((t) => addTrack(t))}
                className="px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Load Sample Media Library
              </button>
            )}
          </div>
        ) : (
          filteredPlaylist.map((track) => {
            const originalIndex = playlist.findIndex((t) => t.id === track.id);
            const isCurrent = originalIndex === currentIndex;

            return (
              <div
                key={track.id}
                onClick={() => {
                  playTrack(originalIndex);
                  setActiveMobileTab('player');
                }}
                className={`p-3 rounded-2xl flex items-center gap-3 transition cursor-pointer active:scale-[0.99] ${
                  isCurrent
                    ? 'bg-amber-500/15 border border-amber-500/30 shadow-md'
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Media Thumbnail or Type Icon */}
                <div className="relative w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                  {track.poster ? (
                    <img
                      src={track.poster}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : track.type === 'video' ? (
                    <Video className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Music className="w-5 h-5 text-orange-400" />
                  )}

                  {/* Playing Animation Indicator */}
                  {isCurrent && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      {isPlaying ? (
                        <div className="flex items-end gap-0.5 h-4">
                          <span className="w-1 bg-amber-400 animate-pulse h-2" />
                          <span className="w-1 bg-amber-400 animate-pulse h-4" />
                          <span className="w-1 bg-amber-400 animate-pulse h-3" />
                        </div>
                      ) : (
                        <Play className="w-4 h-4 fill-amber-400 text-amber-400 ml-0.5" />
                      )}
                    </div>
                  )}
                </div>

                {/* Title & Metadata */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold truncate ${
                        isCurrent ? 'text-amber-400' : 'text-white'
                      }`}
                    >
                      {track.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                    {track.artist || (track.type === 'video' ? 'Video File' : 'Audio Track')}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                    <span>{formatDuration(track.duration)}</span>
                    {track.resolution && (
                      <>
                        <span>&bull;</span>
                        <span>{track.resolution}</span>
                      </>
                    )}
                    {track.audioCodec && (
                      <>
                        <span>&bull;</span>
                        <span>{track.audioCodec}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleFavorite(track.id)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-white"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        track.isFavorite ? 'fill-red-500 text-red-500' : ''
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => removeTrack(track.id)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Clear Library Footer */}
      {playlist.length > 0 && (
        <div className="p-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
          <span>{playlist.length} total tracks</span>
          <button
            onClick={() => clearPlaylist()}
            className="text-red-400 hover:text-red-300 font-medium active:scale-95 transition"
          >
            Clear Library
          </button>
        </div>
      )}
    </div>
  );
};
