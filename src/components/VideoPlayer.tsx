import React, { useState, useRef, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { AudioVisualizer } from './AudioVisualizer';
import {
  Play,
  Pause,
  Music,
  FolderOpen,
  Globe,
  Repeat,
  Loader2,
  Sparkles,
  Camera,
  Bookmark,
  Sun,
  Maximize,
  Minimize,
  Tv,
  Heart,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const VideoPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    togglePlay,
    toggleFullscreen,
    isFullscreen,
    videoRef,
    videoSettings,
    ambientSettings,
    syncSettings,
    activeSubtitleText,
    osdMessage,
    isAbActive,
    abPointA,
    abPointB,
    addLocalFiles,
    setActiveModal,
    captureSnapshot,
    addBookmark,
    bookmarks,
    jumpToBookmark,
    toggleFavorite,
    isTheaterMode,
    toggleTheaterMode,
    togglePiP,
    toggleMute,
    isMuted,
    currentTime,
    duration,
    updateAmbientSettings,
  } = usePlayer();

  const [showCenterIcon, setShowCenterIcon] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ambientCanvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto-hide overlay controls after 2.5s of no mouse move
  const handleMouseMove = () => {
    setIsHovered(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    hideControlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setIsHovered(false);
      }
    }, 2500);
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setIsHovered(false);
    }
  };

  // Real-time Ambilight canvas rendering
  useEffect(() => {
    if (!ambientSettings.enabled) return;

    const ambientCanvas = ambientCanvasRef.current;
    if (!ambientCanvas) return;
    const ctx = ambientCanvas.getContext('2d');
    if (!ctx) return;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
      offscreenCanvasRef.current.width = 64;
      offscreenCanvasRef.current.height = 36;
    }
    const offscreen = offscreenCanvasRef.current;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });

    let animId: number;
    let lastTime = 0;

    const renderAmbilight = (time: number) => {
      // Throttle to ~18 fps for performance
      if (time - lastTime > 55) {
        lastTime = time;
        const video = videoRef.current;
        if (video && !video.paused && !video.ended && video.readyState >= 2 && currentTrack?.type === 'video') {
          try {
            if (offCtx) {
              offCtx.drawImage(video, 0, 0, offscreen.width, offscreen.height);
              ctx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);
              ctx.drawImage(offscreen, 0, 0, ambientCanvas.width, ambientCanvas.height);
            }
          } catch {
            // CORS protected video frame ignore
          }
        }
      }
      animId = requestAnimationFrame(renderAmbilight);
    };

    animId = requestAnimationFrame(renderAmbilight);
    return () => cancelAnimationFrame(animId);
  }, [ambientSettings.enabled, currentTrack, isPlaying]);

  const handleVideoClick = (e: React.MouseEvent) => {
    // Only toggle if clicked directly on media area
    setShowCenterIcon(true);
    setTimeout(() => setShowCenterIcon(false), 500);
    togglePlay();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFullscreen();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addLocalFiles(e.dataTransfer.files);
    }
  };

  // Video filter CSS
  const filterStyle = {
    filter: `brightness(${videoSettings.brightness}%) contrast(${videoSettings.contrast}%) saturate(${videoSettings.saturation}%) hue-rotate(${videoSettings.hue}deg) invert(${
      videoSettings.invert ? 100 : 0
    }%) sepia(${videoSettings.sepia}%) blur(${videoSettings.blur}px)`,
    transform: `rotate(${videoSettings.rotation}deg) scaleX(${
      videoSettings.flipH ? -1 : 1
    }) scaleY(${videoSettings.flipV ? -1 : 1})`,
    transition: 'filter 0.15s ease-out, transform 0.2s ease-out',
  };

  // Aspect Ratio class
  const getAspectRatioClass = () => {
    switch (videoSettings.aspectRatio) {
      case '16:9':
        return 'aspect-video object-contain';
      case '4:3':
        return 'aspect-[4/3] object-contain';
      case '21:9':
        return 'aspect-[21/9] object-contain';
      case '1:1':
        return 'aspect-square object-contain';
      case 'fill':
        return 'w-full h-full object-fill';
      case 'auto':
      default:
        return 'w-full h-full object-contain';
    }
  };

  // Subtitle font size class
  const getSubtitleSizeClass = () => {
    switch (syncSettings.subtitleSize) {
      case 'small':
        return 'text-sm md:text-base';
      case 'large':
        return 'text-xl md:text-2xl';
      case 'extra-large':
        return 'text-2xl md:text-3xl';
      case 'medium':
      default:
        return 'text-base md:text-xl';
    }
  };

  const getSubtitleBgClass = () => {
    switch (syncSettings.subtitleBg) {
      case 'black':
        return 'bg-black px-4 py-1.5 rounded-sm';
      case 'none':
        return 'bg-transparent text-shadow-md';
      case 'semi-transparent':
      default:
        return 'bg-black/75 px-3 py-1 rounded backdrop-blur-[2px]';
    }
  };

  // Filter bookmarks for current media
  const currentBookmarks = currentTrack
    ? bookmarks.filter((b) => b.mediaId === currentTrack.id)
    : [];

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex-1 w-full h-full bg-zinc-950 flex items-center justify-center overflow-hidden cursor-pointer select-none group ${
        isDragging ? 'ring-4 ring-amber-500 ring-inset bg-amber-950/20' : ''
      }`}
      onClick={handleVideoClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Dynamic Ambient Glow (Ambilight) Canvas behind the video */}
      {ambientSettings.enabled && currentTrack?.type === 'video' && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden transition-opacity duration-700"
          style={{
            opacity: ambientSettings.opacity,
            filter: `blur(${ambientSettings.blur}px) saturate(1.8)`,
            transform: 'scale(1.15)',
          }}
        >
          <canvas
            ref={ambientCanvasRef}
            width={320}
            height={180}
            className="w-full h-full object-cover opacity-80"
          />
        </div>
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        src={currentTrack?.src}
        playsInline
        crossOrigin="anonymous"
        style={filterStyle}
        className={`relative z-10 max-w-full max-h-full transition-all ${getAspectRatioClass()} ${
          currentTrack?.type === 'video' ? 'block' : 'hidden'
        }`}
      />

      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-40 bg-zinc-950/90 flex flex-col items-center justify-center pointer-events-none border-2 border-dashed border-amber-500 m-4 rounded-2xl">
          <div className="p-4 bg-amber-500/20 rounded-full text-amber-400 mb-3 animate-bounce">
            <FolderOpen className="w-10 h-10" />
          </div>
          <p className="text-xl font-bold text-white">Drop media files to play</p>
          <p className="text-sm text-zinc-400 mt-1">Supports MP4, WebM, MKV, MP3, WAV, FLAC, AAC</p>
        </div>
      )}

      {/* Modern High-End Turntable & Audio Player Studio View */}
      {currentTrack?.type === 'audio' && (
        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center max-w-2xl w-full">
          {/* Turntable / Vinyl Record Deck */}
          <div className="relative mb-6 p-6 rounded-3xl bg-zinc-900/60 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col items-center">
            {/* Ambient turntable glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-amber-500/20 blur-xl opacity-50 -z-10" />

            <div className="relative flex items-center justify-center">
              {/* Spinning Vinyl Record */}
              <div
                className={`w-48 h-48 md:w-56 md:h-56 rounded-full bg-zinc-950 border-[6px] border-zinc-800 shadow-2xl flex items-center justify-center relative overflow-hidden transition-transform duration-700 ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '8s' }}
              >
                {/* Vinyl Grooves */}
                <div className="absolute inset-3 rounded-full border border-white/[0.04]" />
                <div className="absolute inset-6 rounded-full border border-white/[0.06]" />
                <div className="absolute inset-10 rounded-full border border-white/[0.04]" />
                <div className="absolute inset-14 rounded-full border border-white/[0.06]" />
                <div className="absolute inset-18 rounded-full border border-white/[0.04]" />

                {/* Center Vinyl Label */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 border-2 border-white/30 flex flex-col items-center justify-center shadow-inner text-white">
                  <Music className="w-6 h-6 drop-shadow" />
                  <span className="text-[8px] font-bold tracking-widest uppercase mt-0.5 opacity-90">VLC HI-FI</span>
                </div>
              </div>

              {/* Tonearm */}
              <div
                className={`absolute top-0 -right-6 md:-right-8 w-24 md:w-28 h-3 origin-top-left transition-transform duration-700 pointer-events-none ${
                  isPlaying ? 'rotate-[25deg]' : 'rotate-[-10deg]'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-zinc-600 border border-zinc-400 shadow-md" />
                <div className="w-full h-1 bg-gradient-to-r from-zinc-500 to-zinc-300 rounded shadow" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-2.5 bg-amber-500 rounded-sm shadow" />
              </div>
            </div>

            {/* Track Info & Like button */}
            <div className="mt-5 w-full flex items-center justify-between gap-4 px-2">
              <div className="text-left flex-1 min-w-0">
                <h2 className="text-lg md:text-xl font-bold text-white tracking-tight truncate">
                  {currentTrack.title}
                </h2>
                <p className="text-xs md:text-sm text-amber-400 font-medium truncate mt-0.5">
                  {currentTrack.artist || 'Unknown Artist'}
                </p>
                <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                  {currentTrack.album || 'Lossless Audio'} &bull; {currentTrack.audioCodec || 'Stereo 48kHz'}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(currentTrack.id);
                }}
                title={currentTrack.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition"
              >
                <Heart
                  className={`w-5 h-5 ${
                    currentTrack.isFavorite ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Integrated Multi-Mode Audio Visualizer Card */}
          <div className="w-full max-w-lg p-3 bg-zinc-900/60 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md">
            <AudioVisualizer className="w-full h-24" showModeSelector />
          </div>
        </div>
      )}

      {/* Empty State / Welcome Screen */}
      {!currentTrack && (
        <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center max-w-md">
          <div className="relative mb-5 group-hover:scale-105 transition-transform duration-300">
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full blur-2xl opacity-60" />
            <div className="relative p-5 rounded-2xl bg-zinc-900/80 border border-white/10 shadow-2xl">
              <svg className="w-16 h-16 filter drop-shadow-lg" viewBox="0 0 100 100">
                <polygon points="50,8 15,92 85,92" fill="#ff7700" />
                <polygon points="40,32 30,52 70,52 60,32" fill="#ffffff" />
                <polygon points="26,62 18,80 82,80 74,62" fill="#ffffff" />
                <ellipse cx="50" cy="92" rx="38" ry="6" fill="#d95e00" />
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">VLC Media Player Studio</h2>
          <p className="text-xs text-zinc-400 mt-1 mb-6 leading-relaxed">
            Hardware-accelerated media engine with 10-band graphic equalizer, Ambilight glow, instant frame snapshots, and real-time audio visualizers.
          </p>

          <div className="flex flex-wrap gap-2.5 justify-center">
            <label className="cursor-pointer px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-semibold rounded-lg text-xs flex items-center gap-2 shadow-lg transition transform active:scale-95">
              <FolderOpen className="w-4 h-4" /> Open Media Files
              <input
                type="file"
                multiple
                accept="video/*,audio/*"
                className="hidden"
                onChange={(e) => e.target.files && addLocalFiles(e.target.files)}
              />
            </label>
            <button
              onClick={() => setActiveModal('network')}
              className="px-4 py-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-white/10 rounded-lg text-xs font-semibold flex items-center gap-2 transition"
            >
              <Globe className="w-4 h-4 text-amber-400" /> Network Stream
            </button>
          </div>
        </div>
      )}

      {/* Modern Floating Top Quick Actions Bar (Visible on hover or pause) */}
      {currentTrack && (isHovered || !isPlaying) && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-4 inset-x-4 flex items-center justify-between z-30 pointer-events-auto animate-in fade-in duration-200"
        >
          {/* Left: Media Title Pill */}
          <div className="px-3 py-1.5 rounded-full bg-zinc-900/80 backdrop-blur-md border border-white/10 flex items-center gap-2 max-w-sm">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-medium text-zinc-200 truncate">
              {currentTrack.title}
            </span>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-zinc-900/80 backdrop-blur-md border border-white/10 shadow-xl">
            {currentTrack.type === 'video' && (
              <button
                onClick={() => captureSnapshot()}
                title="Capture Pristine Frame Snapshot (Shift+S)"
                className="p-1.5 rounded-full text-zinc-300 hover:text-amber-400 hover:bg-white/10 transition"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => addBookmark()}
              title="Add Bookmark at current position (B)"
              className="p-1.5 rounded-full text-zinc-300 hover:text-amber-400 hover:bg-white/10 transition"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            {currentTrack.type === 'video' && (
              <button
                onClick={() => updateAmbientSettings('enabled', !ambientSettings.enabled)}
                title={ambientSettings.enabled ? 'Disable Ambient Glow' : 'Enable Ambient Glow (Ambilight)'}
                className={`p-1.5 rounded-full transition ${
                  ambientSettings.enabled
                    ? 'text-amber-400 bg-amber-500/20'
                    : 'text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sun className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => toggleTheaterMode()}
              title="Toggle Theater Mode (T)"
              className={`p-1.5 rounded-full transition ${
                isTheaterMode
                  ? 'text-amber-400 bg-amber-500/20'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Tv className="w-4 h-4" />
            </button>

            <button
              onClick={() => toggleFullscreen()}
              title="Toggle Fullscreen (F)"
              className="p-1.5 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Subtitles Overlay */}
      {currentTrack?.type === 'video' && activeSubtitleText && (
        <div
          className="absolute bottom-16 inset-x-4 flex justify-center pointer-events-none z-20"
          style={{ transition: 'bottom 0.2s' }}
        >
          <div
            className={`${getSubtitleSizeClass()} ${getSubtitleBgClass()} font-semibold text-center leading-snug drop-shadow-lg`}
            style={{ color: syncSettings.subtitleColor }}
          >
            {activeSubtitleText.split('\n').map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        </div>
      )}

      {/* A-B Loop Tag */}
      {isAbActive && abPointA !== null && abPointB !== null && (
        <div className="absolute top-16 left-4 z-30 bg-amber-500/90 text-zinc-950 text-[11px] font-bold px-2.5 py-1 rounded shadow flex items-center gap-1.5 backdrop-blur-sm pointer-events-none animate-pulse">
          <Repeat className="w-3.5 h-3.5" />
          <span>
            A-B Loop: {Math.floor(abPointA)}s - {Math.floor(abPointB)}s
          </span>
        </div>
      )}

      {/* On-Screen Display (OSD) feedback badge */}
      {osdMessage && (
        <div className="absolute top-16 right-4 z-40 bg-zinc-950/90 border border-amber-500/40 text-amber-400 font-mono text-xs px-3.5 py-1.5 rounded-lg shadow-2xl backdrop-blur-md pointer-events-none animate-fade-in flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{osdMessage}</span>
        </div>
      )}

      {/* Center Feedback Animation on Play/Pause */}
      {showCenterIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="p-4 bg-zinc-900/90 rounded-full border border-white/20 text-amber-400 shadow-2xl scale-125 animate-ping opacity-85">
            {isPlaying ? <Play className="w-8 h-8 fill-current" /> : <Pause className="w-8 h-8" />}
          </div>
        </div>
      )}

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-30 pointer-events-none">
          <div className="p-3 bg-zinc-900/90 rounded-xl border border-white/10 flex items-center gap-2 text-amber-400 text-xs font-semibold shadow-2xl">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Buffering...</span>
          </div>
        </div>
      )}
    </div>
  );
};
