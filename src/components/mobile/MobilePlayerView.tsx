import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { AudioVisualizer } from '../AudioVisualizer';
import {
  Play,
  Pause,
  Sun,
  Volume2,
  VolumeX,
  Volume1,
  RotateCcw,
  RotateCw,
  Lock,
  Unlock,
  Maximize,
  Minimize,
  Camera,
  Bookmark,
  Music,
  Heart,
  Layers,
  Sparkles,
  FolderOpen,
  Globe,
  Loader2,
} from 'lucide-react';

export const MobilePlayerView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    togglePlay,
    seekRelative,
    seekTo,
    currentTime,
    duration,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    videoRef,
    videoSettings,
    updateVideoSetting,
    activeSubtitleText,
    syncSettings,
    isScreenLocked,
    toggleScreenLock,
    captureSnapshot,
    addBookmark,
    toggleFavorite,
    isFullscreen,
    toggleFullscreen,
    ambientSettings,
    updateAmbientSettings,
    addLocalFiles,
    setActiveModal,
  } = usePlayer();

  // Gesture state
  const touchAreaRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number; vol: number; bright: number } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const [gestureAction, setGestureAction] = useState<
    | { type: 'volume'; value: number }
    | { type: 'brightness'; value: number }
    | { type: 'seek'; delta: number; targetTime: number }
    | { type: 'double-tap'; side: 'left' | 'right' | 'center' }
    | null
  >(null);

  const [showControls, setShowControls] = useState<boolean>(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-hide controls after 3.5s of inactivity during playback
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isPlaying && !isScreenLocked) {
      hideTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  }, [isPlaying, isScreenLocked]);

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    } else {
      resetHideTimer();
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isPlaying, resetHideTimer]);

  // Touch Handlers for Mobile Gestures
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      vol: volume,
      bright: videoSettings.brightness,
    };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current || isScreenLocked) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const rect = touchAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Distinguish vertical vs horizontal swipe
    const isHorizontal = Math.abs(dx) > Math.abs(dy) + 15;
    const isVertical = Math.abs(dy) > Math.abs(dx) + 15;

    if (isHorizontal && Math.abs(dx) > 20) {
      // Horizontal scrub: map screen drag to seek delta (-60s to +60s)
      const seekRatio = dx / rect.width;
      const delta = Math.round(seekRatio * 90);
      const targetTime = Math.max(0, Math.min(duration, currentTime + delta));
      setGestureAction({ type: 'seek', delta, targetTime });
    } else if (isVertical && Math.abs(dy) > 20) {
      const isLeftSide = touchStartRef.current.x < rect.left + rect.width / 2;
      const changeRatio = -dy / (rect.height * 0.7);

      if (isLeftSide) {
        // Adjust Brightness (0% to 200%)
        const newBright = Math.max(20, Math.min(200, Math.round(touchStartRef.current.bright + changeRatio * 150)));
        updateVideoSetting('brightness', newBright);
        setGestureAction({ type: 'brightness', value: newBright });
      } else {
        // Adjust Volume (0 to 2.0 / 200%)
        const newVol = Math.max(0, Math.min(2.0, parseFloat((touchStartRef.current.vol + changeRatio * 1.5).toFixed(2))));
        setVolume(newVol);
        setGestureAction({ type: 'volume', value: newVol });
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;
    const rect = touchAreaRef.current?.getBoundingClientRect();

    // If we were seeking via swipe
    if (gestureAction?.type === 'seek') {
      seekTo(gestureAction.targetTime);
      setGestureAction(null);
      touchStartRef.current = null;
      resetHideTimer();
      return;
    }

    setGestureAction(null);

    // If tap was short and didn't move much (click/tap)
    if (Math.abs(dx) < 15 && Math.abs(dy) < 15 && dt < 300 && rect) {
      const now = Date.now();
      const lastTap = lastTapRef.current;

      if (lastTap && now - lastTap.time < 320 && Math.abs(touch.clientX - lastTap.x) < 45) {
        // Double Tap Triggered!
        lastTapRef.current = null;
        if (isScreenLocked) return;

        const relX = touch.clientX - rect.left;
        if (relX < rect.width * 0.35) {
          // Double tap left: Skip -10s
          seekRelative(-10);
          setGestureAction({ type: 'double-tap', side: 'left' });
          setTimeout(() => setGestureAction(null), 650);
        } else if (relX > rect.width * 0.65) {
          // Double tap right: Skip +10s
          seekRelative(10);
          setGestureAction({ type: 'double-tap', side: 'right' });
          setTimeout(() => setGestureAction(null), 650);
        } else {
          // Double tap center: Toggle Play
          togglePlay();
          setGestureAction({ type: 'double-tap', side: 'center' });
          setTimeout(() => setGestureAction(null), 650);
        }
      } else {
        // Single Tap
        lastTapRef.current = { time: now, x: touch.clientX, y: touch.clientY };
        setTimeout(() => {
          if (lastTapRef.current?.time === now) {
            setShowControls((prev) => !prev);
            resetHideTimer();
          }
        }, 220);
      }
    }

    touchStartRef.current = null;
  };

  // Cycle aspect ratios (Auto -> 16:9 -> 4:3 -> Fill)
  const cycleAspectRatio = () => {
    const ratios: Array<'auto' | '16:9' | '4:3' | 'fill'> = ['auto', '16:9', '4:3', 'fill'];
    const currentIdx = ratios.indexOf(videoSettings.aspectRatio as any);
    const nextRatio = ratios[(currentIdx + 1) % ratios.length];
    updateVideoSetting('aspectRatio', nextRatio);
  };

  // Video Filter CSS computation
  const getVideoFilters = () => {
    const s = videoSettings;
    return `brightness(${s.brightness}%) contrast(${s.contrast}%) saturate(${s.saturation}%) hue-rotate(${s.hue}deg) invert(${s.invert ? '100%' : '0%'}) sepia(${s.sepia}%) blur(${s.blur}px)`;
  };

  // Video Transform CSS computation
  const getVideoTransform = () => {
    const s = videoSettings;
    return `rotate(${s.rotation}deg) scaleX(${s.flipH ? -1 : 1}) scaleY(${s.flipV ? -1 : 1})`;
  };

  // Helper time format
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const s = Math.floor(seconds);
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={touchAreaRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative flex-1 w-full bg-black overflow-hidden flex items-center justify-center select-none touch-none"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*,audio/*"
        className="hidden"
        onChange={(e) => e.target.files && addLocalFiles(e.target.files)}
      />

      {/* 1. Ambient Ambilight Glow (if enabled) */}
      {ambientSettings.enabled && currentTrack?.type === 'video' && (
        <div
          className="absolute inset-0 pointer-events-none blur-3xl opacity-40 scale-110 transition-opacity"
          style={{
            backgroundImage: `radial-gradient(circle at center, rgba(255, 136, 0, 0.4), transparent 70%)`,
          }}
        />
      )}

      {/* 2. Video Element Rendering */}
      {currentTrack?.type === 'video' && (
        <div className="relative w-full h-full flex items-center justify-center">
          <video
            ref={videoRef}
            src={currentTrack.src}
            playsInline
            className={`transition-all duration-150 ${
              videoSettings.aspectRatio === 'fill'
                ? 'w-full h-full object-cover'
                : videoSettings.aspectRatio === '16:9'
                ? 'w-full aspect-video object-contain'
                : videoSettings.aspectRatio === '4:3'
                ? 'w-full aspect-[4/3] object-contain'
                : 'max-w-full max-h-full object-contain'
            }`}
            style={{
              filter: getVideoFilters(),
              transform: getVideoTransform(),
            }}
          />

          {/* Subtitle Rendering */}
          {activeSubtitleText && (
            <div className="absolute bottom-12 inset-x-4 text-center pointer-events-none z-20">
              <span
                className={`inline-block px-3 py-1 font-semibold rounded-lg tracking-wide leading-tight shadow-2xl backdrop-blur-sm ${
                  syncSettings.subtitleSize === 'small'
                    ? 'text-xs'
                    : syncSettings.subtitleSize === 'large'
                    ? 'text-base'
                    : syncSettings.subtitleSize === 'extra-large'
                    ? 'text-lg'
                    : 'text-sm'
                } ${
                  syncSettings.subtitleBg === 'black'
                    ? 'bg-black/90'
                    : syncSettings.subtitleBg === 'semi-transparent'
                    ? 'bg-black/50'
                    : 'bg-transparent text-shadow'
                }`}
                style={{ color: syncSettings.subtitleColor }}
              >
                {activeSubtitleText}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 3. Audio Turntable & Waveform Mode */}
      {currentTrack?.type === 'audio' && (
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 py-6">
          <div className="relative flex flex-col items-center max-w-xs w-full">
            {/* Spinning Vinyl */}
            <div className="relative w-44 h-44 xs:w-52 xs:h-52 rounded-full p-2 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-950 shadow-2xl border-4 border-zinc-800 flex items-center justify-center">
              <div
                className={`w-full h-full rounded-full border-2 border-zinc-700/50 flex items-center justify-center shadow-inner ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '6s' }}
              >
                {/* Vinyl Grooves */}
                <div className="w-3/4 h-3/4 rounded-full border border-zinc-800 flex items-center justify-center">
                  <div className="w-1/2 h-1/2 rounded-full border border-zinc-800" />
                </div>

                {/* Center Label */}
                <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 border-2 border-amber-300 flex flex-col items-center justify-center text-zinc-950 shadow-lg">
                  <Music className="w-5 h-5 drop-shadow" />
                  <span className="text-[7px] font-bold tracking-widest uppercase">VLC HI-FI</span>
                </div>
              </div>
            </div>

            {/* Audio Metadata */}
            <div className="mt-4 w-full flex items-center justify-between gap-3 text-left">
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-white tracking-tight truncate">
                  {currentTrack.title}
                </h2>
                <p className="text-xs text-amber-400 font-medium truncate mt-0.5">
                  {currentTrack.artist || 'Unknown Artist'}
                </p>
                <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                  {currentTrack.album || 'Lossless'} &bull; {currentTrack.audioCodec || 'Stereo 48kHz'}
                </p>
              </div>

              <button
                onClick={() => toggleFavorite(currentTrack.id)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition text-zinc-300"
              >
                <Heart
                  className={`w-5 h-5 ${
                    currentTrack.isFavorite ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
              </button>
            </div>

            {/* Audio Visualizer compact card */}
            <div className="mt-3 w-full p-2 bg-zinc-900/60 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md">
              <AudioVisualizer className="w-full h-16" showModeSelector={false} />
            </div>
          </div>
        </div>
      )}

      {/* 4. Empty State / No Track Selected */}
      {!currentTrack && (
        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center max-w-sm">
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-white/10 shadow-2xl mb-4">
            <svg className="w-14 h-14 filter drop-shadow-md" viewBox="0 0 100 100">
              <polygon points="50,8 15,92 85,92" fill="#ff7700" />
              <polygon points="40,32 30,52 70,52 60,32" fill="#ffffff" />
              <polygon points="26,62 18,80 82,80 74,62" fill="#ffffff" />
              <ellipse cx="50" cy="92" rx="38" ry="6" fill="#d95e00" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">VLC Mobile Media Player</h2>
          <p className="text-xs text-zinc-400 mt-1 mb-5">
            Touch gestures, graphic equalizer, frame snapshots, and background audio playback.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg"
            >
              <FolderOpen className="w-4 h-4" /> Open Files
            </button>
            <button
              onClick={() => setActiveModal('network')}
              className="px-4 py-2.5 bg-zinc-900 border border-white/15 text-zinc-200 font-semibold rounded-xl text-xs flex items-center gap-2"
            >
              <Globe className="w-4 h-4 text-amber-400" /> Stream URL
            </button>
          </div>
        </div>
      )}

      {/* 5. Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none bg-black/40 backdrop-blur-[2px]">
          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-white/15 shadow-2xl flex items-center gap-2 text-amber-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xs font-semibold text-white">Buffering...</span>
          </div>
        </div>
      )}

      {/* 6. On-Screen Gesture Feedback HUDs */}
      {/* Volume HUD (Right Swipe) */}
      {gestureAction?.type === 'volume' && (
        <div className="absolute top-1/2 right-6 -translate-y-1/2 z-40 p-3 rounded-2xl bg-zinc-900/95 border border-white/20 shadow-2xl flex flex-col items-center gap-2 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
          <div className="text-amber-400">
            {gestureAction.value === 0 ? (
              <VolumeX className="w-5 h-5 text-red-400" />
            ) : gestureAction.value < 0.8 ? (
              <Volume1 className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </div>
          <div className="w-1.5 h-28 bg-zinc-800 rounded-full overflow-hidden flex flex-col justify-end">
            <div
              className={`w-full rounded-full ${
                gestureAction.value > 1.0 ? 'bg-amber-400' : 'bg-orange-500'
              }`}
              style={{ height: `${Math.min(100, (gestureAction.value / 2.0) * 100)}%` }}
            />
          </div>
          <span className="font-mono text-[11px] font-bold text-white">
            {Math.round(gestureAction.value * 100)}%
          </span>
        </div>
      )}

      {/* Brightness HUD (Left Swipe) */}
      {gestureAction?.type === 'brightness' && (
        <div className="absolute top-1/2 left-6 -translate-y-1/2 z-40 p-3 rounded-2xl bg-zinc-900/95 border border-white/20 shadow-2xl flex flex-col items-center gap-2 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
          <Sun className="w-5 h-5 text-amber-400" />
          <div className="w-1.5 h-28 bg-zinc-800 rounded-full overflow-hidden flex flex-col justify-end">
            <div
              className="w-full bg-amber-400 rounded-full"
              style={{ height: `${Math.min(100, (gestureAction.value / 200) * 100)}%` }}
            />
          </div>
          <span className="font-mono text-[11px] font-bold text-white">
            {gestureAction.value}%
          </span>
        </div>
      )}

      {/* Horizontal Seek HUD */}
      {gestureAction?.type === 'seek' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 px-4 py-2.5 rounded-2xl bg-zinc-900/95 border border-white/20 shadow-2xl flex items-center gap-2.5 pointer-events-none animate-in fade-in zoom-in-95 duration-100 font-mono">
          {gestureAction.delta > 0 ? (
            <RotateCw className="w-5 h-5 text-amber-400" />
          ) : (
            <RotateCcw className="w-5 h-5 text-amber-400" />
          )}
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white">
              {gestureAction.delta > 0 ? `+${gestureAction.delta}s` : `${gestureAction.delta}s`}
            </span>
            <span className="text-[10px] text-zinc-400">
              {formatTime(gestureAction.targetTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      )}

      {/* Double Tap Skip Ripple HUD */}
      {gestureAction?.type === 'double-tap' && (
        <div
          className={`absolute top-1/2 -translate-y-1/2 z-40 pointer-events-none flex flex-col items-center justify-center p-4 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-sm animate-ping ${
            gestureAction.side === 'left'
              ? 'left-8'
              : gestureAction.side === 'right'
              ? 'right-8'
              : 'left-1/2 -translate-x-1/2'
          }`}
        >
          {gestureAction.side === 'left' && (
            <>
              <RotateCcw className="w-6 h-6" />
              <span className="text-xs font-bold font-mono">-10s</span>
            </>
          )}
          {gestureAction.side === 'right' && (
            <>
              <RotateCw className="w-6 h-6" />
              <span className="text-xs font-bold font-mono">+10s</span>
            </>
          )}
          {gestureAction.side === 'center' && (
            isPlaying ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />
          )}
        </div>
      )}

      {/* Screen Locked Badge Indicator when user taps while locked */}
      {isScreenLocked && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            toggleScreenLock();
          }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rounded-full bg-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-xl cursor-pointer active:scale-95 transition"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Screen Locked · Tap to Unlock</span>
        </div>
      )}

      {/* 7. Floating On-Screen Quick HUD (Visible when showControls is true & not locked) */}
      {!isScreenLocked && showControls && currentTrack && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 inset-x-3 flex items-center justify-between z-30 pointer-events-auto transition-opacity duration-200"
        >
          {/* Track title badge */}
          <div className="px-2.5 py-1 rounded-full bg-zinc-900/80 backdrop-blur-md border border-white/10 flex items-center gap-1.5 max-w-[200px] truncate">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-medium text-zinc-200 truncate">
              {currentTrack.title}
            </span>
          </div>

          {/* Quick HUD controls */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-zinc-900/80 backdrop-blur-md border border-white/10 shadow-lg">
            {/* Aspect ratio cycle button (for videos) */}
            {currentTrack.type === 'video' && (
              <button
                onClick={cycleAspectRatio}
                title={`Aspect Ratio: ${videoSettings.aspectRatio}`}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-white/10 text-zinc-300 active:scale-95 transition text-[10px] font-mono font-bold"
              >
                {videoSettings.aspectRatio === 'auto'
                  ? 'FIT'
                  : videoSettings.aspectRatio === '16:9'
                  ? '16:9'
                  : videoSettings.aspectRatio === '4:3'
                  ? '4:3'
                  : 'FILL'}
              </button>
            )}

            {/* Frame Snapshot */}
            {currentTrack.type === 'video' && (
              <button
                onClick={() => captureSnapshot()}
                title="Capture Snapshot"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-white/10 text-zinc-300 active:scale-95 transition"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}

            {/* Quick Bookmark Pin */}
            <button
              onClick={() => addBookmark()}
              title="Add Bookmark"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-white/10 text-zinc-300 active:scale-95 transition"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-white/10 text-zinc-300 active:scale-95 transition"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
