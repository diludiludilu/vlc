import React, { useState, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  StepForward,
  Volume2,
  Volume1,
  VolumeX,
  Volume,
  Sliders,
  Maximize,
  Minimize,
  Tv,
  Camera,
  ListMusic,
  Repeat,
  Gauge,
  Bookmark,
  Moon,
  Clock,
  Check,
  Smartphone,
} from 'lucide-react';

export const Controls: React.FC = () => {
  const {
    isPlaying,
    togglePlay,
    stop,
    nextTrack,
    prevTrack,
    seekTo,
    seekRelative,
    stepFrame,
    currentTime,
    duration,
    buffered,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    playbackRate,
    setPlaybackRate,
    abPointA,
    abPointB,
    isAbActive,
    setAbPointA,
    setAbPointB,
    clearAbRepeat,
    captureSnapshot,
    snapshots,
    bookmarks,
    jumpToBookmark,
    sleepTimerRemaining,
    sleepTimerMinutes,
    currentTrack,
    toggleFullscreen,
    isFullscreen,
    togglePiP,
    setActiveModal,
    isPlaylistOpen,
    togglePlaylist,
    theme,
    setIsMobileView,
  } = usePlayer();

  const [showRemainingTime, setShowRemainingTime] = useState<boolean>(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Time format helper: returns hh:mm:ss or mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const s = Math.floor(seconds);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const handleProgressBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration === 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(pos * duration);
    setHoverX(e.clientX - rect.left);
  };

  const handleProgressBarMouseLeave = () => {
    setHoverTime(null);
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration === 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(pos * duration);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Volume icon selector
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-4 h-4 text-red-400" />;
    if (volume < 0.4) return <Volume className="w-4 h-4" />;
    if (volume < 0.9) return <Volume1 className="w-4 h-4" />;
    return <Volume2 className={`w-4 h-4 ${volume > 1.0 ? 'text-amber-400' : ''}`} />;
  };

  // A-B Loop cycle button handler
  const handleAbCycle = () => {
    if (abPointA === null) {
      setAbPointA();
    } else if (abPointB === null) {
      setAbPointB();
    } else {
      clearAbRepeat();
    }
  };

  const currentMediaBookmarks = currentTrack
    ? bookmarks.filter((b) => b.mediaId === currentTrack.id)
    : [];

  const formatTimerBadge = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`border-t select-none transition-colors duration-150 py-2 px-4 z-30 shadow-2xl backdrop-blur-xl ${
        theme === 'vlc-classic'
          ? 'bg-zinc-900 border-zinc-700/80 text-zinc-100'
          : theme === 'dark-slate'
          ? 'bg-slate-900 border-slate-800 text-slate-100'
          : 'bg-zinc-950/95 border-zinc-800 text-white'
      }`}
    >
      {/* 1. Seek Progress Bar */}
      <div className="relative group/seeker py-1.5 cursor-pointer">
        <div
          ref={progressBarRef}
          onClick={handleSeekClick}
          onMouseMove={handleProgressBarMouseMove}
          onMouseLeave={handleProgressBarMouseLeave}
          className="relative h-2 w-full bg-zinc-800/80 rounded-full overflow-visible transition-all group-hover/seeker:h-3"
        >
          {/* Buffered Progress */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-white/20 rounded-full transition-all duration-300 pointer-events-none"
            style={{ width: `${Math.min(100, buffered)}%` }}
          />

          {/* Current Played Progress */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-[0_0_12px_rgba(255,136,0,0.5)] pointer-events-none"
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />

          {/* Scrubber Knob */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md border-2 border-amber-500 opacity-0 group-hover/seeker:opacity-100 transition-opacity pointer-events-none"
            style={{ left: `calc(${progressPercent}% - 7px)` }}
          />

          {/* A-B Markers */}
          {duration > 0 && abPointA !== null && (
            <div
              className="absolute top-0 bottom-0 w-1 bg-yellow-300 z-10 shadow pointer-events-none"
              style={{ left: `${(abPointA / duration) * 100}%` }}
              title={`Point A: ${formatTime(abPointA)}`}
            />
          )}
          {duration > 0 && abPointB !== null && (
            <div
              className="absolute top-0 bottom-0 w-1 bg-orange-400 z-10 shadow pointer-events-none"
              style={{ left: `${(abPointB / duration) * 100}%` }}
              title={`Point B: ${formatTime(abPointB)}`}
            />
          )}

          {/* Interactive Bookmark Markers */}
          {duration > 0 &&
            currentMediaBookmarks.map((bm) => {
              const leftPercent = (bm.time / duration) * 100;
              return (
                <div
                  key={bm.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    jumpToBookmark(bm.time);
                  }}
                  title={`Bookmark: ${bm.label} (${formatTime(bm.time)})`}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-amber-400 rotate-45 z-20 shadow-md hover:scale-150 hover:bg-white transition-transform cursor-pointer"
                  style={{ left: `${leftPercent}%` }}
                />
              );
            })}
        </div>

        {/* Hover Time Tooltip */}
        {hoverTime !== null && (
          <div
            className="absolute -top-7 px-2 py-0.5 bg-zinc-900 border border-white/20 text-amber-400 text-[11px] font-mono rounded-md shadow-xl pointer-events-none transform -translate-x-1/2"
            style={{ left: `${hoverX}px` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>

      {/* 2. Main Controls Bar */}
      <div className="flex items-center justify-between gap-3 mt-1 text-xs">
        {/* Left: Time counter */}
        <div className="flex items-center gap-1 font-mono text-xs text-zinc-300 min-w-[130px]">
          <span className="font-semibold text-white">{formatTime(currentTime)}</span>
          <span className="text-zinc-600">/</span>
          <button
            onClick={() => setShowRemainingTime(!showRemainingTime)}
            title="Click to toggle Remaining vs Total Duration"
            className="hover:text-amber-400 transition"
          >
            {showRemainingTime ? `-${formatTime(Math.max(0, duration - currentTime))}` : formatTime(duration)}
          </button>
        </div>

        {/* Center: Playback Transport Buttons */}
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          <button
            onClick={() => prevTrack()}
            title="Previous Track (P)"
            className="p-2 rounded-lg hover:bg-white/10 hover:text-white text-zinc-300 transition active:scale-95"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => seekRelative(-10)}
            title="Jump -10s (←)"
            className="p-2 rounded-lg hover:bg-white/10 hover:text-white text-zinc-300 transition active:scale-95 hidden sm:inline-flex"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Big Play/Pause Button */}
          <button
            onClick={() => togglePlay()}
            title="Play/Pause (Space)"
            className="p-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold shadow-lg shadow-orange-500/20 transition transform active:scale-90"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={() => stop()}
            title="Stop (S)"
            className="p-2 rounded-lg hover:bg-white/10 hover:text-white text-zinc-300 transition active:scale-95"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={() => seekRelative(10)}
            title="Jump +10s (→)"
            className="p-2 rounded-lg hover:bg-white/10 hover:text-white text-zinc-300 transition active:scale-95 hidden sm:inline-flex"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => nextTrack()}
            title="Next Track (N)"
            className="p-2 rounded-lg hover:bg-white/10 hover:text-white text-zinc-300 transition active:scale-95"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => stepFrame(true)}
            title="Step One Frame Forward (E)"
            className="p-2 rounded-lg hover:bg-white/10 hover:text-white text-zinc-300 transition active:scale-95 hidden sm:inline-flex"
          >
            <StepForward className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Quick Features & Volume */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Speed Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              title="Playback Speed"
              className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-200 font-mono text-xs flex items-center gap-1 border border-white/10"
            >
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span>{playbackRate.toFixed(2)}x</span>
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-9 right-0 bg-zinc-900 border border-white/15 rounded-lg p-1.5 shadow-2xl z-50 flex flex-col gap-0.5 min-w-[100px]">
                {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      setPlaybackRate(rate);
                      setShowSpeedMenu(false);
                    }}
                    className={`px-2.5 py-1 text-xs text-left rounded font-mono flex items-center justify-between ${
                      playbackRate === rate
                        ? 'bg-amber-500 text-zinc-950 font-bold'
                        : 'text-zinc-200 hover:bg-white/10'
                    }`}
                  >
                    <span>{rate}x</span>
                    {playbackRate === rate && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 group/volume">
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 transition"
            >
              {getVolumeIcon()}
            </button>
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              title={`Volume: ${Math.round(volume * 100)}% (up to 200% overdrive)`}
              className="w-16 sm:w-20 h-1.5 accent-amber-500 cursor-pointer rounded bg-zinc-700"
            />
            <span
              className={`font-mono text-[11px] w-9 text-right ${
                volume > 1.0 ? 'text-amber-400 font-bold' : 'text-zinc-400'
              }`}
            >
              {Math.round(volume * 100)}%
            </span>
          </div>

          <div className="h-4 w-[1px] bg-white/10 mx-0.5 hidden sm:block" />

          {/* A-B Loop Button */}
          <button
            onClick={handleAbCycle}
            title={
              abPointA === null
                ? 'Set A-B Loop Point A'
                : abPointB === null
                ? 'Set A-B Loop Point B'
                : 'Clear A-B Loop'
            }
            className={`p-1.5 rounded-lg transition relative ${
              isAbActive
                ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                : abPointA !== null
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'hover:bg-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <Repeat className="w-4 h-4" />
          </button>

          {/* Bookmarks Modal Button */}
          <button
            onClick={() => setActiveModal('bookmarks')}
            title="Media Bookmarks & Chapters (B)"
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-amber-400 transition relative"
          >
            <Bookmark className="w-4 h-4" />
            {currentMediaBookmarks.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-zinc-950 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {currentMediaBookmarks.length}
              </span>
            )}
          </button>

          {/* Snapshots Gallery Button */}
          <button
            onClick={() => setActiveModal('snapshots')}
            title="Snapshot Gallery (Shift+S)"
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-amber-400 transition relative hidden sm:inline-flex"
          >
            <Camera className="w-4 h-4" />
            {snapshots.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-zinc-950 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {snapshots.length}
              </span>
            )}
          </button>

          {/* Sleep Timer Button */}
          <button
            onClick={() => setActiveModal('sleep-timer')}
            title="Sleep Timer"
            className={`p-1.5 rounded-lg transition relative hidden md:inline-flex ${
              sleepTimerRemaining !== null
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-mono text-[11px]'
                : 'hover:bg-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4" />
            {sleepTimerRemaining !== null && (
              <span className="absolute -top-1.5 -right-2 bg-indigo-500 text-white text-[9px] font-mono font-bold rounded-full px-1">
                {formatTimerBadge(sleepTimerRemaining)}
              </span>
            )}
          </button>

          {/* Equalizer & Video Effects Modal Button */}
          <button
            onClick={() => setActiveModal('effects')}
            title="Audio & Video Adjustments / Equalizer"
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-amber-400 transition"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Playlist Sidebar Toggle */}
          <button
            onClick={() => togglePlaylist()}
            title={isPlaylistOpen ? 'Hide Playlist' : 'Show Playlist'}
            className={`p-1.5 rounded-lg transition ${
              isPlaylistOpen
                ? 'bg-amber-500 text-zinc-950 shadow font-bold'
                : 'hover:bg-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* PiP */}
          <button
            onClick={togglePiP}
            title="Picture in Picture"
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition hidden sm:inline-flex"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen (F)"
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Switch to Mobile UI */}
          <button
            onClick={() => setIsMobileView(true)}
            title="Switch to Mobile UI"
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-amber-400 transition"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
