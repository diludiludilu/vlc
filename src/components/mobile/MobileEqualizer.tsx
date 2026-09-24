import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { AudioVisualizer } from '../AudioVisualizer';
import {
  Sliders,
  RotateCcw,
  Zap,
  Mic,
  Headphones,
  Check,
  Activity,
} from 'lucide-react';
import { EQUALIZER_FREQUENCIES, EQUALIZER_PRESETS } from '../../data/defaultTracks';

export const MobileEqualizer: React.FC = () => {
  const {
    equalizerSettings,
    setEqualizerBand,
    setEqualizerPreamp,
    setEqualizerPreset,
    toggleEqualizer,
    resetEqualizer,
    audioEnhancements,
    updateAudioEnhancement,
    visualizerMode,
    setVisualizerMode,
    theme,
  } = usePlayer();

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
      {/* 1. Header with Master Power Toggle */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Audio & Equalizer</span>
          </h2>
          <p className="text-[11px] text-zinc-400">10-band hardware graphic equalizer & DSP</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => resetEqualizer()}
            title="Reset to Flat"
            className="min-h-[40px] px-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-xs font-medium hover:text-white flex items-center gap-1 active:scale-95 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={() => toggleEqualizer()}
            className={`min-h-[40px] px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow ${
              equalizerSettings.enabled
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-white/10 text-zinc-400'
            }`}
          >
            <span>{equalizerSettings.enabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* 2. Visualizer Card */}
      <div className="mt-4 p-3 bg-zinc-900/80 border border-white/10 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" /> Audio Visualizer
          </span>
          <div className="flex items-center gap-1 text-[10px] font-mono">
            {(['bars', 'waveform', 'radial', 'vu-meter'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setVisualizerMode(mode)}
                className={`px-2 py-0.5 rounded-md transition ${
                  visualizerMode === mode
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-white bg-white/5'
                }`}
              >
                {mode === 'vu-meter' ? 'VU' : mode}
              </button>
            ))}
          </div>
        </div>
        <AudioVisualizer className="w-full h-20" showModeSelector={false} />
      </div>

      {/* 3. Preset Scrollable Selector */}
      <div className="mt-4">
        <label className="text-xs font-bold text-zinc-300 block mb-2">Equalizer Presets</label>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {Object.keys(EQUALIZER_PRESETS).map((presetKey) => {
            const isSelected = equalizerSettings.preset === presetKey;
            return (
              <button
                key={presetKey}
                onClick={() => setEqualizerPreset(presetKey)}
                className={`min-h-[36px] px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {presetKey}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Preamp & 10-Band Sliders Container */}
      <div className="mt-4 p-3.5 bg-zinc-900/80 border border-white/10 rounded-2xl shadow-xl space-y-4">
        {/* Preamp Slider */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white">Preamp Gain</span>
            <span className="text-[10px] text-zinc-400">Master signal trim</span>
          </div>
          <div className="flex items-center gap-2 flex-1 max-w-[180px]">
            <input
              type="range"
              min="-20"
              max="20"
              step="0.5"
              value={equalizerSettings.preamp}
              onChange={(e) => setEqualizerPreamp(parseFloat(e.target.value))}
              disabled={!equalizerSettings.enabled}
              className="w-full h-1.5 accent-amber-500 rounded bg-zinc-800 disabled:opacity-40"
            />
            <span className="font-mono text-[11px] w-12 text-right text-amber-400 font-bold">
              {equalizerSettings.preamp > 0 ? `+${equalizerSettings.preamp}` : equalizerSettings.preamp}dB
            </span>
          </div>
        </div>

        {/* 10 Vertical Band Sliders */}
        <div className="flex items-end justify-between gap-1 pt-2 overflow-x-auto pb-1 no-scrollbar">
          {EQUALIZER_FREQUENCIES.map((freq, idx) => {
            const gain = equalizerSettings.bands[idx] || 0;
            return (
              <div key={freq} className="flex flex-col items-center min-w-[28px]">
                {/* Gain value badge */}
                <span className="text-[9px] font-mono text-zinc-400 mb-2 h-3">
                  {gain > 0 ? `+${gain.toFixed(0)}` : gain.toFixed(0)}
                </span>

                {/* Vertical Slider */}
                <div className="h-28 flex items-center justify-center">
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    step="0.5"
                    value={gain}
                    disabled={!equalizerSettings.enabled}
                    onChange={(e) => setEqualizerBand(idx, parseFloat(e.target.value))}
                    className="w-24 h-1.5 accent-amber-500 bg-zinc-800 rounded -rotate-90 origin-center cursor-pointer disabled:opacity-40"
                  />
                </div>

                {/* Frequency Label */}
                <span className="text-[9px] font-mono text-zinc-300 font-semibold mt-2">
                  {freq}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. DSP Audio Enhancements */}
      <div className="mt-4 p-3.5 bg-zinc-900/80 border border-white/10 rounded-2xl shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
          DSP Audio Enhancements
        </h3>

        {/* Dynamic Bass Boost */}
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Dynamic Bass Boost</span>
              <span className="text-[10px] text-zinc-400">
                Low-shelf acoustic sub-bass boost
              </span>
            </div>
          </div>
          <button
            onClick={() =>
              updateAudioEnhancement('bassBoost', !audioEnhancements.bassBoost)
            }
            className={`min-h-[36px] px-3 rounded-lg text-xs font-bold transition ${
              audioEnhancements.bassBoost
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-white/10 text-zinc-400'
            }`}
          >
            {audioEnhancements.bassBoost ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Bass Boost Gain Slider if enabled */}
        {audioEnhancements.bassBoost && (
          <div className="px-2 pt-1 pb-2 flex items-center justify-between gap-3 text-xs">
            <span className="text-zinc-400 text-[11px]">Boost Gain:</span>
            <input
              type="range"
              min="1"
              max="12"
              step="0.5"
              value={audioEnhancements.bassBoostGain}
              onChange={(e) =>
                updateAudioEnhancement('bassBoostGain', parseFloat(e.target.value))
              }
              className="flex-1 h-1.5 accent-amber-500 rounded bg-zinc-800"
            />
            <span className="font-mono text-amber-400 font-bold text-xs w-10 text-right">
              +{audioEnhancements.bassBoostGain}dB
            </span>
          </div>
        )}

        {/* Vocal Clarity Dialogue Enhancement */}
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Vocal Clarity</span>
              <span className="text-[10px] text-zinc-400">
                Boost speech clarity & film dialogue
              </span>
            </div>
          </div>
          <button
            onClick={() =>
              updateAudioEnhancement('vocalClarity', !audioEnhancements.vocalClarity)
            }
            className={`min-h-[36px] px-3 rounded-lg text-xs font-bold transition ${
              audioEnhancements.vocalClarity
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-white/10 text-zinc-400'
            }`}
          >
            {audioEnhancements.vocalClarity ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Spatial Audio Simulation */}
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Spatial Audio</span>
              <span className="text-[10px] text-zinc-400">
                Expanded stereo soundstage
              </span>
            </div>
          </div>
          <button
            onClick={() =>
              updateAudioEnhancement('spatialAudio', !audioEnhancements.spatialAudio)
            }
            className={`min-h-[36px] px-3 rounded-lg text-xs font-bold transition ${
              audioEnhancements.spatialAudio
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-white/10 text-zinc-400'
            }`}
          >
            {audioEnhancements.spatialAudio ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
};
