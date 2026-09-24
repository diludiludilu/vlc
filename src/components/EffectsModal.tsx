import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { EQUALIZER_FREQUENCIES, EQUALIZER_PRESETS } from '../data/defaultTracks';
import { AudioVisualizer } from './AudioVisualizer';
import {
  X,
  Sliders,
  Tv,
  Clock,
  RotateCcw,
  Sparkles,
  Volume2,
  Zap,
  Mic,
  Sun,
} from 'lucide-react';

export const EffectsModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    equalizerSettings,
    setEqualizerBand,
    setEqualizerPreamp,
    setEqualizerPreset,
    toggleEqualizer,
    resetEqualizer,
    audioEnhancements,
    updateAudioEnhancement,
    ambientSettings,
    updateAmbientSettings,
    videoSettings,
    updateVideoSetting,
    resetVideoSettings,
    syncSettings,
    updateSyncSetting,
    theme,
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<'audio' | 'video' | 'sync'>('audio');

  if (activeModal !== 'effects') return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-sm select-none">
      <div
        className={`w-full max-w-2xl rounded-xl border shadow-2xl overflow-hidden flex flex-col text-xs animate-in fade-in zoom-in-95 duration-150 ${
          theme === 'vlc-classic'
            ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
            : theme === 'dark-slate'
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-zinc-950 border-zinc-800 text-white'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Studio Audio & Video Effects</h2>
              <p className="text-[11px] text-zinc-400">10-band equalizer, DSP enhancements & display filters</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-black/30 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('audio')}
            className={`px-3.5 py-2 rounded-t-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === 'audio'
                ? 'bg-zinc-800 text-amber-400 border-b-2 border-amber-500 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" /> Audio & Equalizer
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-3.5 py-2 rounded-t-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === 'video'
                ? 'bg-zinc-800 text-amber-400 border-b-2 border-amber-500 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <Tv className="w-3.5 h-3.5" /> Video & Ambilight
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-3.5 py-2 rounded-t-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === 'sync'
                ? 'bg-zinc-800 text-amber-400 border-b-2 border-amber-500 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Synchronization
          </button>
        </div>

        {/* Tab 1: Audio Effects */}
        {activeTab === 'audio' && (
          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-800/40 p-2.5 rounded-lg border border-white/10">
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={equalizerSettings.enabled}
                  onChange={(e) => toggleEqualizer(e.target.checked)}
                  className="rounded border-zinc-600 accent-amber-500"
                />
                <span>Enable 10-Band Graphic Equalizer</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Preset:</span>
                <select
                  value={equalizerSettings.preset}
                  onChange={(e) => setEqualizerPreset(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 text-zinc-100 rounded px-2.5 py-1 focus:outline-none focus:border-amber-500"
                >
                  <option value="Custom" disabled>
                    Custom
                  </option>
                  {Object.keys(EQUALIZER_PRESETS).map((preset) => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                </select>
                <button
                  onClick={resetEqualizer}
                  title="Reset to Flat"
                  className="px-2.5 py-1 bg-zinc-700/60 hover:bg-zinc-700 rounded text-zinc-300 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
            </div>

            {/* DSP Audio Enhancements Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Bass Boost */}
              <div className="p-3 rounded-xl bg-zinc-800/30 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className={`w-4 h-4 ${audioEnhancements.bassBoost ? 'text-amber-400' : 'text-zinc-500'}`} />
                    <span className="font-semibold text-zinc-200">Dynamic Bass Boost</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={audioEnhancements.bassBoost}
                      onChange={(e) => updateAudioEnhancement('bassBoost', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="0.5"
                    disabled={!audioEnhancements.bassBoost}
                    value={audioEnhancements.bassBoostGain}
                    onChange={(e) => updateAudioEnhancement('bassBoostGain', parseFloat(e.target.value))}
                    className="flex-1 accent-amber-500 disabled:opacity-40"
                  />
                  <span className="font-mono text-zinc-400 w-12 text-right">
                    +{audioEnhancements.bassBoostGain} dB
                  </span>
                </div>
              </div>

              {/* Vocal Clarity */}
              <div className="p-3 rounded-xl bg-zinc-800/30 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Mic className={`w-4 h-4 ${audioEnhancements.vocalClarity ? 'text-amber-400' : 'text-zinc-500'}`} />
                    <span className="font-semibold text-zinc-200">Speech & Vocal Clarity</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">Boosts dialogues & vocals above background mix</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={audioEnhancements.vocalClarity}
                    onChange={(e) => updateAudioEnhancement('vocalClarity', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>

            {/* 10-Band Graphic Equalizer Sliders */}
            <div className="bg-zinc-950/70 p-4 rounded-xl border border-white/10">
              <div className="flex justify-between items-end gap-1.5 h-44">
                {/* Preamp Slider */}
                <div className="flex flex-col items-center justify-between h-full pr-3 border-r border-zinc-800 w-12">
                  <span className="text-[10px] font-mono text-amber-400">
                    {equalizerSettings.preamp > 0 ? `+${equalizerSettings.preamp}` : equalizerSettings.preamp} dB
                  </span>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    step="0.5"
                    value={equalizerSettings.preamp}
                    onChange={(e) => setEqualizerPreamp(parseFloat(e.target.value))}
                    disabled={!equalizerSettings.enabled}
                    className="h-28 -rotate-90 appearance-none bg-zinc-800 accent-amber-500 cursor-pointer disabled:opacity-40"
                  />
                  <span className="text-[10px] font-semibold text-zinc-300">Preamp</span>
                </div>

                {/* 10 Frequency Bands */}
                <div className="flex-1 flex justify-between items-end h-full pl-2">
                  {EQUALIZER_FREQUENCIES.map((freq, idx) => {
                    const val = equalizerSettings.bands[idx] || 0;
                    const freqLabel = freq >= 1000 ? `${freq / 1000}K` : `${freq}`;

                    return (
                      <div
                        key={freq}
                        className="flex flex-col items-center justify-between h-full flex-1 min-w-[28px]"
                      >
                        <span className="text-[10px] font-mono text-zinc-400">
                          {val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1)}
                        </span>
                        <input
                          type="range"
                          min="-20"
                          max="20"
                          step="0.5"
                          value={val}
                          onChange={(e) => setEqualizerBand(idx, parseFloat(e.target.value))}
                          disabled={!equalizerSettings.enabled}
                          className="h-28 -rotate-90 appearance-none bg-zinc-800 accent-amber-500 cursor-pointer disabled:opacity-40"
                        />
                        <span className="text-[10px] text-zinc-400 font-mono">{freqLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Live Spectrum Visualizer Preview */}
            <div className="bg-zinc-950/60 p-3 rounded-lg border border-white/10 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <Sparkles className="w-3 h-3" /> Live Audio Spectrum Output
                </span>
                <span>Web Audio Biquad Processing Chain</span>
              </div>
              <AudioVisualizer mode="bars" className="w-full h-16" showModeSelector />
            </div>
          </div>
        )}

        {/* Tab 2: Video Effects & Ambilight */}
        {activeTab === 'video' && (
          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Ambient Lighting (Ambilight) Settings */}
            <div className="bg-zinc-950/60 p-4 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-semibold text-zinc-100">Ambient Lighting (Ambilight)</span>
                    <p className="text-[11px] text-zinc-400">Projects dynamic real-time room glow around the video player</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ambientSettings.enabled}
                    onChange={(e) => updateAmbientSettings('enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {ambientSettings.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-300">
                      <span>Glow Blur Radius</span>
                      <span className="font-mono text-zinc-400">{ambientSettings.blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="70"
                      value={ambientSettings.blur}
                      onChange={(e) => updateAmbientSettings('blur', parseInt(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-300">
                      <span>Glow Opacity</span>
                      <span className="font-mono text-zinc-400">{Math.round(ambientSettings.opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="1.0"
                      step="0.05"
                      value={ambientSettings.opacity}
                      onChange={(e) => updateAmbientSettings('opacity', parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Color Adjustments */}
            <div className="bg-zinc-950/50 p-4 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="font-semibold text-amber-400">Color & Lighting Adjustments</span>
                <button
                  onClick={resetVideoSettings}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1 text-[11px]"
                >
                  <RotateCcw className="w-3 h-3" /> Reset All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Brightness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-300">
                    <span>Brightness</span>
                    <span className="font-mono text-zinc-400">{videoSettings.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={videoSettings.brightness}
                    onChange={(e) => updateVideoSetting('brightness', parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-300">
                    <span>Contrast</span>
                    <span className="font-mono text-zinc-400">{videoSettings.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={videoSettings.contrast}
                    onChange={(e) => updateVideoSetting('contrast', parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Saturation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-300">
                    <span>Saturation</span>
                    <span className="font-mono text-zinc-400">{videoSettings.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={videoSettings.saturation}
                    onChange={(e) => updateVideoSetting('saturation', parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Hue Rotate */}
                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-300">
                    <span>Hue</span>
                    <span className="font-mono text-zinc-400">{videoSettings.hue}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={videoSettings.hue}
                    onChange={(e) => updateVideoSetting('hue', parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Sepia */}
                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-300">
                    <span>Sepia Filter</span>
                    <span className="font-mono text-zinc-400">{videoSettings.sepia}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={videoSettings.sepia}
                    onChange={(e) => updateVideoSetting('sepia', parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Blur */}
                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-300">
                    <span>Blur</span>
                    <span className="font-mono text-zinc-400">{videoSettings.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={videoSettings.blur}
                    onChange={(e) => updateVideoSetting('blur', parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Invert toggle */}
              <div className="pt-2 border-t border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={videoSettings.invert}
                    onChange={(e) => updateVideoSetting('invert', e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>Invert Colors</span>
                </label>
              </div>
            </div>

            {/* Geometry & Aspect Ratio */}
            <div className="bg-zinc-950/50 p-4 rounded-xl border border-white/10 space-y-3">
              <span className="font-semibold text-amber-400">Geometry & Transformation</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 mb-1">Aspect Ratio</label>
                  <select
                    value={videoSettings.aspectRatio}
                    onChange={(e) => updateVideoSetting('aspectRatio', e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                  >
                    <option value="auto">Default (Auto)</option>
                    <option value="16:9">16:9 Widescreen</option>
                    <option value="4:3">4:3 Standard</option>
                    <option value="21:9">21:9 Ultrawide Cinema</option>
                    <option value="1:1">1:1 Square</option>
                    <option value="fill">Fill Entire Window</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1">Rotation</label>
                  <div className="flex gap-1.5">
                    {[0, 90, 180, 270].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => updateVideoSetting('rotation', deg as any)}
                        className={`flex-1 py-1.5 rounded font-mono ${
                          videoSettings.rotation === deg
                            ? 'bg-amber-500 text-zinc-950 font-bold'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2 border-t border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={videoSettings.flipH}
                    onChange={(e) => updateVideoSetting('flipH', e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>Flip Horizontally</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={videoSettings.flipV}
                    onChange={(e) => updateVideoSetting('flipV', e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>Flip Vertically</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Synchronization */}
        {activeTab === 'sync' && (
          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Audio Track Synchronization */}
            <div className="bg-zinc-950/50 p-4 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="font-semibold text-amber-400">Audio Track Synchronization</span>
                <span className="font-mono text-zinc-400">
                  {syncSettings.audioDelayMs > 0
                    ? `+${syncSettings.audioDelayMs} ms`
                    : `${syncSettings.audioDelayMs} ms`}
                </span>
              </div>
              <p className="text-zinc-400 text-[11px]">
                Adjust audio timing relative to video to fix lip-sync issues (+ delays audio, - advances audio).
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateSyncSetting('audioDelayMs', syncSettings.audioDelayMs - 100)}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                >
                  -100 ms
                </button>
                <button
                  onClick={() => updateSyncSetting('audioDelayMs', syncSettings.audioDelayMs - 50)}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                >
                  -50 ms
                </button>
                <input
                  type="range"
                  min="-3000"
                  max="3000"
                  step="25"
                  value={syncSettings.audioDelayMs}
                  onChange={(e) => updateSyncSetting('audioDelayMs', parseInt(e.target.value))}
                  className="flex-1 accent-amber-500 cursor-pointer"
                />
                <button
                  onClick={() => updateSyncSetting('audioDelayMs', syncSettings.audioDelayMs + 50)}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                >
                  +50 ms
                </button>
                <button
                  onClick={() => updateSyncSetting('audioDelayMs', syncSettings.audioDelayMs + 100)}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                >
                  +100 ms
                </button>
                <button
                  onClick={() => updateSyncSetting('audioDelayMs', 0)}
                  className="px-2.5 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Subtitle Track Synchronization */}
            <div className="bg-zinc-950/50 p-4 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="font-semibold text-amber-400">Subtitle Synchronization & Appearance</span>
                <span className="font-mono text-zinc-400">
                  {syncSettings.subtitleDelayMs > 0
                    ? `+${syncSettings.subtitleDelayMs} ms`
                    : `${syncSettings.subtitleDelayMs} ms`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="-5000"
                  max="5000"
                  step="50"
                  value={syncSettings.subtitleDelayMs}
                  onChange={(e) => updateSyncSetting('subtitleDelayMs', parseInt(e.target.value))}
                  className="flex-1 accent-amber-500 cursor-pointer"
                />
                <button
                  onClick={() => updateSyncSetting('subtitleDelayMs', 0)}
                  className="px-2.5 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
                >
                  Reset
                </button>
              </div>

              {/* Subtitle Appearance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-zinc-300 mb-1">Text Size</label>
                  <select
                    value={syncSettings.subtitleSize}
                    onChange={(e) => updateSyncSetting('subtitleSize', e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded px-2.5 py-1 focus:outline-none focus:border-amber-500"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Normal (Default)</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra Large</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1">Font Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={syncSettings.subtitleColor}
                      onChange={(e) => updateSyncSetting('subtitleColor', e.target.value)}
                      className="w-8 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
                    />
                    <span className="font-mono text-zinc-400">{syncSettings.subtitleColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1">Background</label>
                  <select
                    value={syncSettings.subtitleBg}
                    onChange={(e) => updateSyncSetting('subtitleBg', e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded px-2.5 py-1 focus:outline-none focus:border-amber-500"
                  >
                    <option value="semi-transparent">Translucent Box</option>
                    <option value="black">Opaque Black Box</option>
                    <option value="none">No Background (Shadow only)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-white/10 bg-white/[0.02]">
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
