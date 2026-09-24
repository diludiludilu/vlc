import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { X, Heart, CheckCircle2 } from 'lucide-react';

export const AboutModal: React.FC = () => {
  const { activeModal, setActiveModal, theme } = usePlayer();

  if (activeModal !== 'about') return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm select-none">
      <div
        className={`w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden flex flex-col text-xs ${
          theme === 'vlc-classic'
            ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
            : theme === 'dark-slate'
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-zinc-950 border-zinc-800 text-white'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.02]">
          <h2 className="font-semibold text-sm">About VLC Web Media Player</h2>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center space-y-4 max-h-[70vh] overflow-y-auto">
          {/* VLC Cone Logo */}
          <div className="p-3 bg-zinc-800/80 rounded-2xl border border-white/10 shadow-2xl">
            <svg className="w-16 h-16 filter drop-shadow-md" viewBox="0 0 100 100">
              <polygon points="50,8 15,92 85,92" fill="#ff7700" />
              <polygon points="40,32 30,52 70,52 60,32" fill="#ffffff" />
              <polygon points="26,62 18,80 82,80 74,62" fill="#ffffff" />
              <ellipse cx="50" cy="92" rx="38" ry="6" fill="#d95e00" />
            </svg>
          </div>

          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">VLC Web Media Player</h1>
            <p className="text-xs text-amber-400 font-mono mt-0.5">Version 4.2.0 Studio Modern Edition</p>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed max-w-sm">
            Hardware-accelerated web media engine inspired by VideoLAN VLC. Plays local video and audio files, network streams, and provides studio-grade sound and display processing.
          </p>

          <div className="w-full bg-zinc-950/60 p-4 rounded-xl border border-white/10 text-left space-y-2.5">
            <span className="font-semibold text-amber-400 text-xs block">Modern Features Suite:</span>
            <div className="grid grid-cols-2 gap-2 text-zinc-300 text-[11px]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>10-Band EQ & Presets</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Dynamic Bass Boost & Speech</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Ambilight Ambient Glow</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Timeline Bookmarks & Notes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Snapshot Gallery & Copy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Smart Sleep Timer</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>4-Mode Audio Visualizers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>200% Volume Boost & Overdrive</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center justify-center gap-1 pt-1">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-red-500 fill-current inline" />
            <span>open-source spirit inspired by VideoLAN.</span>
          </div>
        </div>

        <div className="px-5 py-3 bg-white/[0.02] border-t border-white/10 flex justify-end">
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
