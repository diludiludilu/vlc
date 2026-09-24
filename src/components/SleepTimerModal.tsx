import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Moon, Clock, X, Check, AlertCircle } from 'lucide-react';

export const SleepTimerModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    sleepTimerMinutes,
    sleepTimerRemaining,
    setSleepTimer,
    theme,
  } = usePlayer();

  const [customMinutes, setCustomMinutes] = useState<string>('');

  if (activeModal !== 'sleep-timer') return null;

  const presets = [15, 30, 45, 60, 90, 120];

  const formatRemaining = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customMinutes, 10);
    if (!isNaN(val) && val > 0 && val <= 720) {
      setSleepTimer(val);
      setActiveModal(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className={`w-full max-w-md rounded-xl border shadow-2xl overflow-hidden flex flex-col ${
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
            <div className="p-1.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Moon className="w-4 h-4 fill-indigo-400/40" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide">Sleep Timer</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Automatically stop playback after duration
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

        {/* Content */}
        <div className="p-5 space-y-4">
          {sleepTimerRemaining !== null && sleepTimerRemaining > 0 && (
            <div className="p-3.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-indigo-400 animate-pulse" />
                <div>
                  <div className="text-xs text-indigo-300 font-medium">Timer Active</div>
                  <div className="text-lg font-mono font-bold text-white tracking-wide">
                    {formatRemaining(sleepTimerRemaining)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSleepTimer(null)}
                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold rounded-md transition"
              >
                Turn Off
              </button>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-zinc-300 mb-2 block">
              Quick Timer Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((min) => {
                const isCurrent = sleepTimerMinutes === min && sleepTimerRemaining !== null;
                return (
                  <button
                    key={min}
                    onClick={() => {
                      setSleepTimer(min);
                      setActiveModal(null);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                      isCurrent
                        ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-lg font-bold'
                        : 'bg-zinc-800/60 hover:bg-zinc-800 border-white/5 text-zinc-200 hover:border-white/20'
                    }`}
                  >
                    {isCurrent && <Check className="w-3.5 h-3.5" />}
                    <span>{min} Minutes</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Minutes Input */}
          <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-white/10">
            <label className="text-xs font-medium text-zinc-300 mb-2 block">
              Custom Minutes (1 - 720 min)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="720"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                placeholder="e.g. 25"
                className="flex-1 bg-zinc-950/80 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!customMinutes}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg border border-white/10 transition"
              >
                Set Timer
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 bg-white/[0.02]">
          <div className="flex items-center gap-1.5 text-[11px]">
            <AlertCircle className="w-3.5 h-3.5 text-zinc-500" />
            <span>Pauses playback smoothly when time expires</span>
          </div>
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
