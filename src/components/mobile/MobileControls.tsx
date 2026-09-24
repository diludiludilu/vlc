import React, { useState, useRef } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Repeat,
  Repeat1,
  Shuffle,
  Gauge,
  Sliders,
  Moon,
  Subtitles,
  Check,
  Bookmark,
} from 'lucide-react';

export const MobileControls: React.FC = () => {
  const {
    isPlaying,
    togglePlay,
    prevTrack,
    nextTrack,
    seekTo,
    seekRelative,
    currentTime,
    duration,
    buffered,
    playbackRate,
    setPlaybackRate,
    loopMode,
    toggleLoopMode,
    isShuffle,
    toggleShuffle,
    abPointA,
    abPointB,
    isAbActive,
    setAbPointA,
    setAbPointB,
    clearAbRepeat,
    currentTrack,
    bookmarks,
    jumpToBookmark,
    sleepTimerRemaining,
    setActiveModal,
    setActiveMobileTab,
    currentSubtitleTrackId,
    setSubtitleTrackId,
    theme,
  } = usePlayer();

  const [showSpeedSheet, setShowSpeedSheet] = useState<boolean>(false);
  const [showSubtitleSheet, setShowSubtitleSheet] = useState<boolean>(false);
  const [showRemainingTime, setShowRemainingTime] = useState<boolean>(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

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

  const handleSeekTouch = (e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration === 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    seekTo(pos * duration);
  };

  const handleAbCycle = () => {
    if (abPointA === null) {
      setAbPointA();
    } else if (abPointB === null) {
      setAbPointB();
    } else {
      clearAbRepeat();
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentMediaBookmarks = currentTrack
    ? bookmarks.filter((b) => b.mediaId === currentTrack.id)
    : [];

  return (
    <div
      className={`mt-auto shrink-0 w-full flex flex-col justify-end px-4 pt-2.5 pb-2 border-t select-none transition-colors z-20 backdrop-blur-xl ${
        theme === 'vlc-classic'
          ? 'bg-zinc-900/95 border-zinc-700/80 text-zinc-100'
          : theme === 'dark-slate'
          ? 'bg-slate-900/95 border-slate-800 text-slate-100'
          : 'bg-zinc-950/95 border-zinc-800 text-white'
      }`}
    >
      {/* 1. Touch Progress Bar */}
      <div className="relative py-2">
        <div
          ref={progressBarRef}
          onClick={handleSeekTouch}
          onTouchStart={handleSeekTouch}
          onTouchMove={handleSeekTouch}
          className="relative h-2.5 w-full bg-zinc-800 rounded-full overflow-visible cursor-pointer"
        >
          {/* Buffered Progress */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-white/20 rounded-full pointer-events-none"
            style={{ width: `${Math.min(100, buffered)}%` }}
          />

          {/* Current Played Progress */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-[0_0_8px_rgba(255,136,0,0.5)] pointer-events-none"
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />

          {/* Scrubber Knob */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-amber-500 pointer-events-none transition-transform"
            style={{ left: `calc(${progressPercent}% - 8px)` }}
          />

          {/* A-B Markers */}
          {duration > 0 && abPointA !== null && (
            <div
              className="absolute top-0 bottom-0 w-1 bg-yellow-300 z-10 pointer-events-none"
              style={{ left: `${(abPointA / duration) * 100}%` }}
            />
          )}
          {duration > 0 && abPointB !== null && (
            <div
              className="absolute top-0 bottom-0 w-1 bg-orange-400 z-10 pointer-events-none"
              style={{ left: `${(abPointB / duration) * 100}%` }}
            />
          )}

          {/* Bookmarks */}
          {duration > 0 &&
            currentMediaBookmarks.map((bm) => (
              <div
                key={bm.id}
                onClick={(e) => {
                  e.stopPropagation();
                  jumpToBookmark(bm.time);
                }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-amber-400 rotate-45 z-20 shadow cursor-pointer"
                style={{ left: `${(bm.time / duration) * 100}%` }}
              />
            ))}
        </div>

        {/* Time Indicators */}
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-1.5 px-0.5">
          <span>{formatTime(currentTime)}</span>
          <button
            onClick={() => setShowRemainingTime(!showRemainingTime)}
            className="hover:text-amber-400 transition"
          >
            {showRemainingTime ? `-${formatTime(Math.max(0, duration - currentTime))}` : formatTime(duration)}
          </button>
        </div>
      </div>

      {/* 2. Main Transport Controls */}
      <div className="flex items-center justify-between gap-1 mt-1">
        {/* Shuffle */}
        <button
          onClick={toggleShuffle}
          title={`Shuffle: ${isShuffle ? 'On' : 'Off'}`}
          className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition ${
            isShuffle
              ? 'text-amber-400 bg-amber-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Shuffle className="w-4 h-4" />
        </button>

        {/* Previous Track */}
        <button
          onClick={() => prevTrack()}
          title="Previous Track"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-200 active:scale-95 transition"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        {/* Jump -10s */}
        <button
          onClick={() => seekRelative(-10)}
          title="Jump -10s"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-200 active:scale-95 transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Big Play / Pause Button */}
        <button
          onClick={() => togglePlay()}
          title={isPlaying ? 'Pause' : 'Play'}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 active:scale-90 text-zinc-950 font-bold shadow-lg shadow-orange-500/25 flex items-center justify-center transition transform"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>

        {/* Jump +10s */}
        <button
          onClick={() => seekRelative(10)}
          title="Jump +10s"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-200 active:scale-95 transition"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Next Track */}
        <button
          onClick={() => nextTrack()}
          title="Next Track"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-200 active:scale-95 transition"
        >
          <SkipForward className="w-5 h-5" />
        </button>

        {/* Loop / Repeat */}
        <button
          onClick={toggleLoopMode}
          title={`Loop: ${loopMode}`}
          className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition ${
            loopMode !== 'off'
              ? 'text-amber-400 bg-amber-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          {loopMode === 'track' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
        </button>
      </div>

      {/* 3. Secondary Mobile Utility Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2 text-xs">
        {/* Playback Speed Pill */}
        <button
          onClick={() => setShowSpeedSheet(true)}
          className="min-h-[40px] px-2.5 flex items-center gap-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 font-mono text-[11px]"
        >
          <Gauge className="w-3.5 h-3.5 text-amber-400" />
          <span>{playbackRate.toFixed(2)}x</span>
        </button>

        {/* Subtitles Button (if video) */}
        {currentTrack?.type === 'video' && (
          <button
            onClick={() => setShowSubtitleSheet(true)}
            className={`min-h-[40px] px-2 flex items-center gap-1 rounded-lg border transition ${
              currentSubtitleTrackId
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
            }`}
          >
            <Subtitles className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono">CC</span>
          </button>
        )}

        {/* A-B Loop Repeat */}
        <button
          onClick={handleAbCycle}
          title="A-B Repeat"
          className={`min-h-[40px] px-2.5 flex items-center gap-1 rounded-lg border transition text-[11px] font-mono ${
            isAbActive
              ? 'bg-amber-500 text-zinc-950 font-bold border-amber-500'
              : abPointA !== null
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
          }`}
        >
          <span>A-B</span>
          {abPointA !== null && <span className="text-[9px]">A</span>}
          {abPointB !== null && <span className="text-[9px]">B</span>}
        </button>

        {/* Bookmarks Modal Shortcut */}
        <button
          onClick={() => setActiveModal('bookmarks')}
          title="Bookmarks & Chapters"
          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-amber-400 relative"
        >
          <Bookmark className="w-3.5 h-3.5" />
          {currentMediaBookmarks.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-zinc-950 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {currentMediaBookmarks.length}
            </span>
          )}
        </button>

        {/* Quick Audio Equalizer Tab Switcher */}
        <button
          onClick={() => setActiveMobileTab('equalizer')}
          title="Equalizer & Audio DSP"
          className="min-h-[40px] px-2.5 flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-200 hover:text-amber-400 text-[11px]"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xs:inline">EQ</span>
        </button>
      </div>

      {/* Speed Selector Bottom Sheet */}
      {showSpeedSheet && (
        <div
          onClick={() => setShowSpeedSheet(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-5 pb-8 shadow-2xl animate-in slide-in-from-bottom"
          >
            <div className="w-10 h-1.5 bg-zinc-700 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Playback Speed</h3>
              <span className="text-xs font-mono text-amber-400 font-semibold">{playbackRate.toFixed(2)}x</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((rate) => (
                <button
                  key={rate}
                  onClick={() => {
                    setPlaybackRate(rate);
                    setShowSpeedSheet(false);
                  }}
                  className={`min-h-[44px] flex items-center justify-center rounded-xl font-mono text-xs font-semibold transition ${
                    playbackRate === rate
                      ? 'bg-amber-500 text-zinc-950 shadow-md'
                      : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subtitles Bottom Sheet */}
      {showSubtitleSheet && (
        <div
          onClick={() => setShowSubtitleSheet(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-5 pb-8 shadow-2xl animate-in slide-in-from-bottom"
          >
            <div className="w-10 h-1.5 bg-zinc-700 rounded-full mx-auto mb-4" />
            <h3 className="text-sm font-bold text-white mb-3">Subtitles</h3>
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  setSubtitleTrackId(null);
                  setShowSubtitleSheet(false);
                }}
                className={`w-full min-h-[44px] px-3.5 rounded-xl text-left text-xs font-medium flex items-center justify-between ${
                  currentSubtitleTrackId === null
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'bg-zinc-800/80 text-zinc-200 hover:bg-zinc-700'
                }`}
              >
                <span>Disabled (Off)</span>
                {currentSubtitleTrackId === null && <Check className="w-4 h-4" />}
              </button>
              {(currentTrack?.subtitles || []).map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setSubtitleTrackId(sub.id);
                    setShowSubtitleSheet(false);
                  }}
                  className={`w-full min-h-[44px] px-3.5 rounded-xl text-left text-xs font-medium flex items-center justify-between ${
                    currentSubtitleTrackId === sub.id
                      ? 'bg-amber-500 text-zinc-950 font-bold'
                      : 'bg-zinc-800/80 text-zinc-200 hover:bg-zinc-700'
                  }`}
                >
                  <span>
                    {sub.label} ({sub.lang})
                  </span>
                  {currentSubtitleTrackId === sub.id && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
