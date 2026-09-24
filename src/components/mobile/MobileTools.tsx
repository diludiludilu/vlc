import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import {
  Moon,
  Bookmark,
  Camera,
  Sun,
  Palette,
  Sliders,
  Clock,
  Info,
  HelpCircle,
  Keyboard,
  Monitor,
  Check,
  Tv,
} from 'lucide-react';
import { ThemeMode } from '../../types/player';

export const MobileTools: React.FC = () => {
  const {
    sleepTimerMinutes,
    sleepTimerRemaining,
    setSleepTimer,
    bookmarks,
    snapshots,
    setActiveModal,
    ambientSettings,
    updateAmbientSettings,
    videoSettings,
    updateVideoSetting,
    resetVideoSettings,
    syncSettings,
    updateSyncSetting,
    theme,
    setTheme,
    setIsMobileView,
    currentTrack,
  } = usePlayer();

  const formatTimerBadge = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`flex-1 flex flex-col h-full overflow-y-auto p-4 select-none ${
        theme === 'vlc-classic'
          ? 'bg-zinc-900 text-zinc-100'
          : theme === 'dark-slate'
          ? 'bg-slate-900 text-slate-100'
          : 'bg-zinc-950 text-white'
      }`}
    >
      <div className="pb-3 border-b border-white/10 shrink-0">
        <h2 className="text-base font-bold text-white tracking-tight">Tools & Settings</h2>
        <p className="text-[11px] text-zinc-400">VLC media tools, video adjustments & themes</p>
      </div>

      <div className="mt-4 space-y-4 pb-6">
        {/* 1. Sleep Timer Card */}
        <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white">Sleep Timer</span>
            </div>
            {sleepTimerRemaining !== null && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-bold">
                {formatTimerBadge(sleepTimerRemaining)} remaining
              </span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[null, 15, 30, 45, 60, 90, 120].map((mins) => {
              const isSelected = sleepTimerMinutes === mins;
              return (
                <button
                  key={mins ?? 'off'}
                  onClick={() => setSleepTimer(mins)}
                  className={`min-h-[40px] rounded-xl text-xs font-semibold font-mono transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                  }`}
                >
                  {mins === null ? 'Off' : `${mins}m`}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Media Features & Modals Shortcuts */}
        <div className="grid grid-cols-2 gap-2">
          {/* Bookmarks */}
          <button
            onClick={() => setActiveModal('bookmarks')}
            className="p-3 bg-zinc-900/80 hover:bg-zinc-800/80 border border-white/10 rounded-2xl flex flex-col items-start gap-1 transition text-left active:scale-[0.98]"
          >
            <div className="flex items-center justify-between w-full">
              <Bookmark className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-mono text-zinc-400">
                {bookmarks.length} saved
              </span>
            </div>
            <span className="text-xs font-bold text-white mt-1">Bookmarks</span>
            <span className="text-[10px] text-zinc-400">Chapter markers & notes</span>
          </button>

          {/* Snapshots Gallery */}
          <button
            onClick={() => setActiveModal('snapshots')}
            className="p-3 bg-zinc-900/80 hover:bg-zinc-800/80 border border-white/10 rounded-2xl flex flex-col items-start gap-1 transition text-left active:scale-[0.98]"
          >
            <div className="flex items-center justify-between w-full">
              <Camera className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-mono text-zinc-400">
                {snapshots.length} frames
              </span>
            </div>
            <span className="text-xs font-bold text-white mt-1">Snapshots</span>
            <span className="text-[10px] text-zinc-400">Captured frame gallery</span>
          </button>
        </div>

        {/* 3. Ambilight Ambient Glow (Ambilight) */}
        <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Ambilight Ambient Glow</span>
            </div>
            <button
              onClick={() =>
                updateAmbientSettings('enabled', !ambientSettings.enabled)
              }
              className={`min-h-[36px] px-3 rounded-lg text-xs font-bold transition ${
                ambientSettings.enabled
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-white/10 text-zinc-400'
              }`}
            >
              {ambientSettings.enabled ? 'ON' : 'OFF'}
            </button>
          </div>
          {ambientSettings.enabled && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Glow Blur:</span>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={ambientSettings.blur}
                  onChange={(e) =>
                    updateAmbientSettings('blur', parseInt(e.target.value))
                  }
                  className="w-36 h-1.5 accent-amber-500 rounded bg-zinc-800"
                />
                <span className="font-mono text-white text-xs w-8 text-right">
                  {ambientSettings.blur}px
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Video Image Adjustments */}
        {currentTrack?.type === 'video' && (
          <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-2xl shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Video Color & Adjustments</span>
              <button
                onClick={resetVideoSettings}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Reset
              </button>
            </div>

            {/* Brightness */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-zinc-400 w-20">Brightness</span>
              <input
                type="range"
                min="0"
                max="200"
                value={videoSettings.brightness}
                onChange={(e) => updateVideoSetting('brightness', parseInt(e.target.value))}
                className="flex-1 h-1.5 accent-amber-500 rounded bg-zinc-800"
              />
              <span className="font-mono text-zinc-300 w-10 text-right">
                {videoSettings.brightness}%
              </span>
            </div>

            {/* Contrast */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-zinc-400 w-20">Contrast</span>
              <input
                type="range"
                min="0"
                max="200"
                value={videoSettings.contrast}
                onChange={(e) => updateVideoSetting('contrast', parseInt(e.target.value))}
                className="flex-1 h-1.5 accent-amber-500 rounded bg-zinc-800"
              />
              <span className="font-mono text-zinc-300 w-10 text-right">
                {videoSettings.contrast}%
              </span>
            </div>

            {/* Saturation */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-zinc-400 w-20">Saturation</span>
              <input
                type="range"
                min="0"
                max="200"
                value={videoSettings.saturation}
                onChange={(e) => updateVideoSetting('saturation', parseInt(e.target.value))}
                className="flex-1 h-1.5 accent-amber-500 rounded bg-zinc-800"
              />
              <span className="font-mono text-zinc-300 w-10 text-right">
                {videoSettings.saturation}%
              </span>
            </div>
          </div>
        )}

        {/* 5. Audio / Subtitle Delay Sync */}
        <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-2xl shadow-xl space-y-3">
          <span className="text-xs font-bold text-white block">Synchronization Delay</span>

          {/* Audio Delay */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-zinc-400 w-24">Audio Delay</span>
            <input
              type="range"
              min="-2000"
              max="2000"
              step="50"
              value={syncSettings.audioDelayMs}
              onChange={(e) => updateSyncSetting('audioDelayMs', parseInt(e.target.value))}
              className="flex-1 h-1.5 accent-amber-500 rounded bg-zinc-800"
            />
            <span className="font-mono text-zinc-300 w-14 text-right">
              {syncSettings.audioDelayMs}ms
            </span>
          </div>

          {/* Subtitle Delay */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-zinc-400 w-24">Subtitle Delay</span>
            <input
              type="range"
              min="-3000"
              max="3000"
              step="100"
              value={syncSettings.subtitleDelayMs}
              onChange={(e) => updateSyncSetting('subtitleDelayMs', parseInt(e.target.value))}
              className="flex-1 h-1.5 accent-amber-500 rounded bg-zinc-800"
            />
            <span className="font-mono text-zinc-300 w-14 text-right">
              {syncSettings.subtitleDelayMs}ms
            </span>
          </div>
        </div>

        {/* 6. Theme Mode Selector */}
        <div className="p-3.5 bg-zinc-900/80 border border-white/10 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Palette className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white">Application Theme</span>
          </div>

          <div className="space-y-1.5">
            {[
              { id: 'vlc-classic' as ThemeMode, name: 'VLC Classic Orange', desc: 'Original VLC signature accent' },
              { id: 'dark-slate' as ThemeMode, name: 'Dark Slate Modern', desc: 'Sleek dark slate studio tone' },
              { id: 'cinema-black' as ThemeMode, name: 'Cinema Pure Black', desc: 'True OLED pitch black' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-left flex items-center justify-between transition ${
                  theme === t.id
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-200'
                }`}
              >
                <div>
                  <span className="text-xs block">{t.name}</span>
                  <span className="text-[10px] text-zinc-400">{t.desc}</span>
                </div>
                {theme === t.id && <Check className="w-4 h-4 text-amber-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* 7. Information & Desktop Switcher */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => setIsMobileView(false)}
            className="w-full min-h-[44px] px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 active:scale-[0.99] transition"
          >
            <Monitor className="w-4 h-4 text-amber-400" />
            <span>Switch to Desktop View</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveModal('media-info')}
              className="min-h-[40px] px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Media Info</span>
            </button>
            <button
              onClick={() => setActiveModal('about')}
              className="min-h-[40px] px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>About VLC</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
