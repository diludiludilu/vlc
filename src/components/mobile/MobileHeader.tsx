import React, { useRef } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import {
  Lock,
  Unlock,
  Monitor,
  FolderOpen,
  Globe,
  Palette,
  Moon,
  Tv,
} from 'lucide-react';
import { ThemeMode } from '../../types/player';

export const MobileHeader: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isScreenLocked,
    toggleScreenLock,
    setIsMobileView,
    theme,
    setTheme,
    addLocalFiles,
    setActiveModal,
    sleepTimerRemaining,
    isTheaterMode,
    toggleTheaterMode,
  } = usePlayer();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addLocalFiles(e.target.files);
      e.target.value = '';
    }
  };

  const cycleTheme = () => {
    const themes: ThemeMode[] = ['vlc-classic', 'dark-slate', 'cinema-black'];
    const nextIdx = (themes.indexOf(theme) + 1) % themes.length;
    setTheme(themes[nextIdx]);
  };

  return (
    <header
      className={`h-13 shrink-0 px-3 border-b flex items-center justify-between z-30 select-none transition-colors backdrop-blur-md ${
        theme === 'vlc-classic'
          ? 'bg-zinc-900/95 border-zinc-700/80 text-zinc-100'
          : theme === 'dark-slate'
          ? 'bg-slate-900/95 border-slate-800 text-slate-100'
          : 'bg-zinc-950/95 border-zinc-800 text-white'
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

      {/* Left: Brand Icon + Title */}
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <div
          onClick={() => setActiveModal('about')}
          className="flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
        >
          <svg className="w-6 h-6 filter drop-shadow flex-shrink-0" viewBox="0 0 100 100">
            <polygon points="50,8 15,92 85,92" fill="#ff7700" />
            <polygon points="40,32 30,52 70,52 60,32" fill="#ffffff" />
            <polygon points="26,62 18,80 82,80 74,62" fill="#ffffff" />
            <ellipse cx="50" cy="92" rx="38" ry="6" fill="#d95e00" />
          </svg>
          <div className="flex flex-col">
            <span className="font-extrabold text-xs tracking-tight text-white leading-none">
              VLC <span className="text-amber-400 font-semibold">Mobile</span>
            </span>
          </div>
        </div>

        {/* Current Track Pill */}
        {currentTrack && (
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 max-w-[140px] truncate">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isPlaying ? 'bg-amber-400 animate-pulse' : 'bg-zinc-500'
              }`}
            />
            <span className="text-[11px] text-zinc-300 truncate">{currentTrack.title}</span>
          </div>
        )}
      </div>

      {/* Right: Quick Mobile Actions */}
      <div className="flex items-center gap-1">
        {/* Screen Lock Toggle Button */}
        <button
          onClick={toggleScreenLock}
          title={isScreenLocked ? 'Screen Locked. Tap to unlock' : 'Lock screen controls'}
          className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition ${
            isScreenLocked
              ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
              : 'hover:bg-white/10 text-zinc-300'
          }`}
        >
          {isScreenLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </button>

        {/* Quick Add Local Files */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Open Media File"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-white/10 text-zinc-300 transition"
        >
          <FolderOpen className="w-4 h-4" />
        </button>

        {/* Network Stream Modal */}
        <button
          onClick={() => setActiveModal('network')}
          title="Open Network Stream"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-white/10 text-zinc-300 transition"
        >
          <Globe className="w-4 h-4" />
        </button>

        {/* Sleep Timer Indicator if active */}
        {sleepTimerRemaining !== null && (
          <button
            onClick={() => setActiveModal('sleep-timer')}
            title="Sleep Timer Active"
            className="min-h-[44px] px-2 flex items-center gap-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono"
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>{Math.floor(sleepTimerRemaining / 60)}m</span>
          </button>
        )}

        {/* Theme Cycle */}
        <button
          onClick={cycleTheme}
          title={`Theme: ${theme}`}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-white/10 text-zinc-300 transition"
        >
          <Palette className="w-4 h-4" />
        </button>

        {/* Switch to Desktop UI */}
        <button
          onClick={() => setIsMobileView(false)}
          title="Switch to Desktop UI layout"
          className="min-h-[44px] px-2.5 flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-medium transition"
        >
          <Monitor className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xs:inline text-[11px]">Desktop</span>
        </button>
      </div>
    </header>
  );
};
